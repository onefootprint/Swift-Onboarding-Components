use super::vault_wrapper::Any;
use super::vault_wrapper::Business;
use super::vault_wrapper::BusinessOwnerInfo;
use super::vault_wrapper::TenantVw;
use crate::auth::session::user::AssociatedAuthEvent;
use crate::auth::user::load_auth_events;
use crate::auth::user::CheckUserWfAuthContext;
use crate::utils::vault_wrapper::DecryptUncheckedResult;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpResult;
use crate::State;
use db::models::contact_info::ContactInfo;
use db::models::document::Document;
use db::models::document_request::DocumentRequest;
use db::models::liveness_event::LivenessEvent;
use db::models::ob_configuration::ObConfiguration;
use db::models::passkey::Passkey;
use db::models::user_consent::UserConsent;
use db::models::workflow::Workflow;
use db::PgConn;
use feature_flag::BoolFlag;
use itertools::chain;
use itertools::Itertools;
use newtypes::AlpacaKycState;
use newtypes::AuthEventKind;
use newtypes::AuthMethodKind;
use newtypes::AuthorizeFields;
use newtypes::BusinessOwnerSource;
use newtypes::CollectDocumentConfig;
use newtypes::CollectedData;
use newtypes::CollectedDataOption as CDO;
use newtypes::ContactInfoKind;
use newtypes::DataIdentifierDiscriminant as DID;
use newtypes::Declaration;
use newtypes::DocumentCdoInfo;
use newtypes::DocumentDiKind;
use newtypes::DocumentRequestConfig;
use newtypes::DocumentStatus;
use newtypes::DocumentUploadSettings;
use newtypes::IdentityDataKind as IDK;
use newtypes::InvestorProfileKind as IPK;
use newtypes::Iso3166TwoDigitCountryCode;
use newtypes::KycState;
use newtypes::LivenessSource;
use newtypes::OnboardingRequirement;
use newtypes::OnboardingRequirementKind;
use newtypes::ScopedVaultId;
use newtypes::Selfie;
use newtypes::UsLegalStatus;
use newtypes::WorkflowId;
use newtypes::WorkflowState;
use std::str::FromStr;

#[derive(Clone)]
pub struct GetRequirementsArgs {
    pub person_obc: ObConfiguration,
    pub person_workflow: Workflow,
    pub business_sv: Option<ScopedVaultId>,
    pub biz_wf_id: Option<WorkflowId>,
    pub auth_events: Vec<AssociatedAuthEvent>,
    pub is_secondary_bo: bool,
}

impl GetRequirementsArgs {
    pub fn from(value: &CheckUserWfAuthContext) -> FpResult<Self> {
        Ok(Self {
            person_obc: value.ob_config.clone(),
            person_workflow: value.workflow.clone(),
            business_sv: value.sb_id.clone(),
            biz_wf_id: value.biz_wf_id.clone(),
            auth_events: value.user_session.auth_events.clone(),
            is_secondary_bo: value.user_session.is_secondary_bo(),
        })
    }
}

/// Wrapper type around DecryptUncheckedResult that is guaranteed to have all the IDKs we need for
/// requirement checking
#[derive(derive_more::Deref)]
pub struct UserDecryptResultForReqs(#[deref] DecryptUncheckedResult);

impl GetRequirementsArgs {
    /// Fetch various values from the vault that may conditionally affect requirements
    pub async fn get_decrypted_values(
        state: &State,
        vw: &VaultWrapper<Any>,
    ) -> FpResult<UserDecryptResultForReqs> {
        let values = vec![
            IPK::Declarations.into(),
            IDK::UsLegalStatus.into(),
            IDK::Country.into(),
        ];
        let decrypted_values = vw.decrypt_unchecked(&state.enclave_client, &values).await?;
        Ok(UserDecryptResultForReqs(decrypted_values))
    }
}

impl UserDecryptResultForReqs {
    /// Auth playbooks don't require complex checking of what's populated
    pub fn empty() -> Self {
        Self(DecryptUncheckedResult::default())
    }
}

#[derive(Default, Clone, Copy)]
pub struct RequirementOpts {
    pub require_capture_on_stepup: Option<bool>,
}

#[tracing::instrument(skip_all)]
/// Gets a list of requirements for the Person Vault for the onboarding.
/// If the Person Vault is the Primary BO of some ongoing Business onboarding, then this also
/// includes the requirements of that Business Vault NOTE: this returns a list of both met and unmet
/// requirements - you should check. TODO: for now, this is guaranteed to return all unmet
/// requirements, but will only return some met requirements
pub async fn get_requirements_for_person_and_maybe_business(
    state: &State,
    args: GetRequirementsArgs,
) -> FpResult<Vec<OnboardingRequirement>> {
    // Fetch the UVW and use it to decrypt IPK::Declarations, if they exist
    let GetRequirementsArgs {
        person_obc,
        person_workflow,
        business_sv,
        biz_wf_id,
        auth_events,
        is_secondary_bo,
    } = args;

    let su_id = person_workflow.scoped_vault_id.clone();
    let sb_id = business_sv.clone();
    let (uvw, biz_info) = state
        .db_query(move |conn| -> FpResult<_> {
            let uvw = VaultWrapper::<Any>::build_for_tenant(conn, &su_id)?;
            let biz_info = if let Some((sb_id, biz_wf_id)) = sb_id.zip(biz_wf_id) {
                let bvw = VaultWrapper::<Business>::build_for_tenant(conn, &sb_id)?;
                let (biz_wf, _) = Workflow::get_all(conn, &biz_wf_id)?;
                Some((bvw, biz_wf))
            } else {
                None
            };
            Ok((uvw, biz_info))
        })
        .await?;
    let user_values = GetRequirementsArgs::get_decrypted_values(state, &uvw).await?;
    let biz_info = if let Some((bvw, biz_wf)) = biz_info {
        let dbos = bvw.decrypt_business_owners(state).await?;
        Some((bvw, biz_wf, dbos))
    } else {
        None
    };

    let require_capture_on_stepup = state
        .ff_client
        .flag(BoolFlag::RequireCaptureOnStepUp(&person_obc.key));
    let requirement_opts = RequirementOpts {
        require_capture_on_stepup: Some(require_capture_on_stepup),
    };

    let requirements = state
        .db_query(move |conn| -> FpResult<_> {
            let entity = EntityInfo {
                vw: &uvw,
                wf: &person_workflow,
                user_values: &user_values,
                business_owners: &[],
                auth_events: &auth_events,
                is_secondary_bo,
            };
            let person_requirements = get_requirements_inner(conn, entity, &person_obc, requirement_opts)?;

            let business_requirements = if let Some((bvw, biz_wf, dbos)) = biz_info {
                let entity = EntityInfo {
                    vw: &bvw,
                    wf: &biz_wf,
                    user_values: &user_values,
                    business_owners: &dbos,
                    auth_events: &[],
                    is_secondary_bo,
                };
                // Technically for this case, the business's OBC should be the same as the person's and
                // it'd be a bit more clear to see business_obc here. But they should be same and this is
                // the existing logic so may as well keep as is
                get_requirements_inner(conn, entity, &person_obc, requirement_opts)?
            } else {
                vec![]
            };

            Ok(chain!(business_requirements, person_requirements).collect_vec())
        })
        .await?;

    Ok(requirements)
}

// gets oustanding requirements for a Vault with respect to a specific OBC/WF
#[tracing::instrument(skip_all)]
pub fn get_requirements_inner<'a, T: Copy>(
    conn: &'a mut PgConn,
    entity_info: EntityInfo<'a, T>,
    obc: &'a ObConfiguration,
    opts: RequirementOpts,
) -> FpResult<Vec<OnboardingRequirement>> {
    let wf = &entity_info.wf;
    // Depending on the workflow that we are running, we only want to show a subset of requirements
    let relevant_requirement_kinds = wf.state.relevant_requirements();

    // For each requirement kind that might be shown by this workflow, generate a requirement if
    // necessary
    let requirements = relevant_requirement_kinds
        .into_iter()
        .map(|k| get_requirement_inner(k, conn, entity_info, obc, opts))
        .collect::<FpResult<Vec<_>>>()?;
    let requirements = requirements.into_iter().flatten().collect();

    tracing::info!(workflow_id=%wf.id, requirements=%format!("{:?}", requirements), scoped_user_id=%wf.scoped_vault_id, "get_requirements result");

    Ok(requirements)
}

/// Omit the confirm screen for met requirements IF the workflow is already completed or the user is
/// an alpaca user in step up returning to an incomplete onboarding
fn omit_confirm_if_necessary(req: OnboardingRequirement, wf: &Workflow) -> Option<OnboardingRequirement> {
    if !req.is_met() {
        return Some(req);
    }
    let is_stepup = matches!(
        wf.state,
        WorkflowState::Kyc(KycState::DocCollection) | WorkflowState::AlpacaKyc(AlpacaKycState::DocCollection)
    );
    (wf.completed_at.is_none() && !is_stepup).then_some(req)
}

struct RequirementProgress {
    populated_attributes: Vec<CDO>,
    missing_attributes: Vec<CDO>,
    optional_attributes: Vec<CDO>,
    recollect_attributes: Vec<CDO>,
}

/// Returns if the provided CDO is met by the data in the VW. Some CDOs have conditional
/// requirements that are a function of data in the vault - you must pass in the pre-decrypted
/// values as well
fn is_cdo_met<Type>(vw: &VaultWrapper<Type>, cdo: &CDO, decrypted_values: &UserDecryptResultForReqs) -> bool {
    if should_skip_us_only_cdos(cdo, decrypted_values) {
        return true;
    }

    let mut required_dis = cdo.required_data_identifiers();
    // Also check if optional DIs (based on selected values) are met
    match cdo {
        CDO::UsLegalStatus => {
            let legal_status = decrypted_values
                .get(&IDK::UsLegalStatus.into())
                .and_then(|a| a.parse_into::<UsLegalStatus>().ok());
            match legal_status {
                Some(UsLegalStatus::Citizen) => (),
                Some(UsLegalStatus::PermanentResident) => {
                    required_dis.extend([IDK::Nationality.into(), IDK::Citizenships.into()]);
                }
                Some(UsLegalStatus::Visa) => {
                    let addl_dis = [
                        IDK::Nationality.into(),
                        IDK::Citizenships.into(),
                        IDK::VisaKind.into(),
                        IDK::VisaExpirationDate.into(),
                    ];
                    required_dis.extend(addl_dis);
                }
                None => (),
            }
        }
        CDO::FullAddress => {
            let country = decrypted_values
                .get(&IDK::Country.into())
                .and_then(|a| a.parse_into::<Iso3166TwoDigitCountryCode>().ok());
            if country.map(|c| c.is_us_territory()).unwrap_or(false) {
                // Territory addresses always require City and Zip
                let addl_dis = [IDK::City.into(), IDK::Zip.into()];
                required_dis.extend(addl_dis);
            }
            if country.map(|c| c.is_us()).unwrap_or(false) {
                // US addresses always require City, State, and Zip
                let addl_dis = [IDK::City.into(), IDK::State.into(), IDK::Zip.into()];
                required_dis.extend(addl_dis);
            }
            // Non-US addresses will have the full address in AddressLine1 and as many other
            // fields extracted as possible
        }
        _ => (),
    }

    required_dis.iter().all(|di| vw.has_field(di))
}

// these are CDOs only applicable to US
pub(crate) fn should_skip_us_only_cdos(cdo: &CDO, decrypted_values: &UserDecryptResultForReqs) -> bool {
    match cdo {
        CDO::Ssn4 | CDO::Ssn9 | CDO::UsLegalStatus => {
            let country = decrypted_values
                .get(&IDK::Country.into())
                .and_then(|a| a.parse_into::<Iso3166TwoDigitCountryCode>().ok());
            // skip if !us
            country.map(|c| !c.is_us_including_territories()).unwrap_or(false)
        }
        _ => false,
    }
}

fn get_data_collection_progress<Type>(
    vw: &VaultWrapper<Type>,
    wf: &Workflow,
    ob_config: &ObConfiguration,
    di_kind: DID,
    decrypted_values: &UserDecryptResultForReqs,
) -> Option<RequirementProgress> {
    if !ob_config.must_collect_data.iter().any(|cdo| cdo.matches(di_kind)) {
        return None;
    }
    let relevant_attrs = |cdos: Vec<CDO>| cdos.into_iter().filter(move |cdo| cdo.matches(di_kind));

    // Kind of unintuitive: optional_data is not a subset of must_collect_data
    let all_attrs = chain!(
        ob_config.must_collect_data.clone(),
        ob_config.optional_data.clone()
    )
    .collect();
    let populated_attributes = relevant_attrs(all_attrs)
        .filter(|cdo| is_cdo_met(vw, cdo, decrypted_values))
        .collect_vec();
    let missing_required_attributes = relevant_attrs(ob_config.must_collect_data.clone())
        .filter(|cdo| !is_cdo_met(vw, cdo, decrypted_values))
        .collect_vec();
    let missing_optional_attributes = relevant_attrs(ob_config.optional_data.clone())
        .filter(|cdo| !is_cdo_met(vw, cdo, decrypted_values))
        .collect_vec();
    let recollect_attributes = relevant_attrs(wf.config.recollect_attributes().to_vec()).collect_vec();

    let progress = RequirementProgress {
        populated_attributes,
        missing_attributes: missing_required_attributes,
        optional_attributes: missing_optional_attributes,
        recollect_attributes,
    };
    Some(progress)
}

pub fn get_register_auth_method_requirements<T>(
    conn: &mut PgConn,
    obc: &ObConfiguration,
    vw: &TenantVw<T>,
    auth_events: &[AssociatedAuthEvent],
) -> FpResult<Vec<OnboardingRequirement>> {
    let auth_events = load_auth_events(conn, auth_events)?;
    if auth_events
        .iter()
        .any(|(ae, _)| ae.kind == AuthEventKind::ThirdParty)
    {
        // Third-party auth won't register an auth method, so we should waive the requirement that
        // the playbook's auth methods are met.
        // Perhaps when we start having more proper use of 3p auth from apiture we should actually
        // mark the phone as verified
        return Ok(vec![]);
    }

    let verified_cis = vec![ContactInfoKind::Phone, ContactInfoKind::Email]
        .into_iter()
        .filter_map(|ci| vw.get_lifetime(&ci.di()).map(|d| (ci, d.clone())))
        .map(|(cik, dl)| ContactInfo::get(conn, &dl.id).map(|ci| (cik, ci)))
        .filter_ok(|(_, ci)| ci.is_otp_verified())
        .map_ok(|(cik, _)| AuthMethodKind::from(cik))
        .collect::<Result<Vec<_>, _>>()?;
    let passkeys = Passkey::list(conn, &vw.scoped_vault.id)?;
    let verified_auth_methods = chain!(
        verified_cis,
        (!passkeys.is_empty()).then_some(AuthMethodKind::Passkey)
    )
    .collect_vec();

    let required_auth_methods = obc.required_auth_methods.iter().flatten().copied();
    let requirements = required_auth_methods
        .filter(|amk| !verified_auth_methods.contains(amk))
        .map(|auth_method_kind| OnboardingRequirement::RegisterAuthMethod { auth_method_kind })
        .collect();
    Ok(requirements)
}

#[derive(Clone, Copy)]
pub struct EntityInfo<'a, T> {
    pub vw: &'a TenantVw<T>,
    pub wf: &'a Workflow,
    pub user_values: &'a UserDecryptResultForReqs,
    pub business_owners: &'a [BusinessOwnerInfo],
    pub auth_events: &'a [AssociatedAuthEvent],
    pub is_secondary_bo: bool,
}

fn get_collect_kyc_data_requirement<T>(
    uvw: &VaultWrapper<T>,
    user_wf: &Workflow,
    obc: &ObConfiguration,
    user_values: &UserDecryptResultForReqs,
) -> FpResult<Vec<OnboardingRequirement>> {
    let Some(RequirementProgress {
        populated_attributes,
        missing_attributes,
        optional_attributes,
        recollect_attributes,
    }) = get_data_collection_progress(uvw, user_wf, obc, DID::Id, user_values)
    else {
        return Ok(vec![]);
    };
    // if ob config needs to collect id data
    let req = OnboardingRequirement::CollectData {
        missing_attributes,
        optional_attributes,
        populated_attributes,
        recollect_attributes,
    };
    let req = omit_confirm_if_necessary(req, user_wf);
    Ok(req.into_iter().collect())
}

fn get_collect_investor_profile_requirement<T>(
    uvw: &VaultWrapper<T>,
    user_wf: &Workflow,
    obc: &ObConfiguration,
    user_values: &UserDecryptResultForReqs,
) -> FpResult<Vec<OnboardingRequirement>> {
    let Some(RequirementProgress {
        populated_attributes,
        missing_attributes,
        ..
    }) = get_data_collection_progress(uvw, user_wf, obc, DID::InvestorProfile, user_values)
    else {
        return Ok(vec![]);
    };
    let declarations = user_values.get_di(IPK::Declarations).ok();
    let missing_document = if let Some(declarations) = declarations {
        let declarations: Vec<Declaration> = declarations.deserialize()?;
        // The finra compliance doc is missing if any of the declarations require a doc and we
        // don't yet have one on file
        declarations.iter().any(|d| d.requires_finra_compliance_doc())
            && !uvw.has_field(&DocumentDiKind::FinraComplianceLetter.into())
    } else {
        false
    };
    let req = OnboardingRequirement::CollectInvestorProfile {
        missing_attributes,
        populated_attributes,
        missing_document,
    };
    let req = omit_confirm_if_necessary(req, user_wf);
    Ok(req.into_iter().collect())
}

fn get_collect_kyb_data_requirement<T>(
    bvw: &VaultWrapper<T>,
    biz_wf: &Workflow,
    obc: &ObConfiguration,
    is_secondary_bo: bool,
    business_owners: &[BusinessOwnerInfo],
) -> FpResult<Vec<OnboardingRequirement>> {
    let user_values = UserDecryptResultForReqs::empty();
    let Some(RequirementProgress {
        mut populated_attributes,
        optional_attributes: _,
        mut missing_attributes,
        recollect_attributes,
    }) = get_data_collection_progress(bvw, biz_wf, obc, DID::Business, &user_values)
    else {
        return Ok(vec![]);
    };

    if is_secondary_bo {
        // Omit collecting any new business data and showing the business confirm screen
        // when the user filling out the form is not the primary BO
        return Ok(vec![]);
    }

    let has_linked_bos = business_owners
        .iter()
        .any(|bo| bo.bo.source == BusinessOwnerSource::Tenant);
    let are_all_bos_complete = {
        let is_not_empty = !business_owners.is_empty();
        let are_bos_populated = business_owners.iter().all(|bo| {
            // Maybe don't require phone and email for primary
            let vd_exists =
                (BusinessOwnerInfo::USER_DIS.iter()).all(|i| bo.data.iter().any(|(di, _)| di == i));
            let ownership_stake_exists = bo.bo.ownership_stake.is_some();
            if bo.has_linked_user() {
                // Once there's a user linked, this BO's data will be collected by a CollectData
                // requirement. We just have to make sure the ownership stake is set
                ownership_stake_exists
            } else {
                // If we haven't yet linked a user, we need phone / email to send a link to the BO
                ownership_stake_exists && vd_exists
            }
        });
        is_not_empty && are_bos_populated
    };

    let bo_cdo =
        (obc.must_collect_data.iter()).find(|cdo| cdo.parent() == CollectedData::BusinessBeneficialOwners);
    if let Some(bo_cdo) = bo_cdo {
        let is_missing_bo = missing_attributes.contains(bo_cdo);
        if !is_missing_bo && !are_all_bos_complete {
            // This should never happen, just spot checking this logic before we stop writing
            // KycedBos
            tracing::info!("All BOs not complete, but CDO is satisfied");
        }
        if (has_linked_bos || are_all_bos_complete) && is_missing_bo {
            // BOs linked manually via API meet the BeneficialOwners requirement
            missing_attributes.retain(|missing_cdo| missing_cdo != bo_cdo);
            populated_attributes.push(bo_cdo.clone());
        }
    }
    let req = OnboardingRequirement::CollectBusinessData {
        missing_attributes,
        populated_attributes,
        has_linked_bos,
        recollect_attributes,
    };
    let req = omit_confirm_if_necessary(req, biz_wf);
    Ok(req.into_iter().collect())
}

fn get_register_passkey_requirement(
    conn: &mut PgConn,
    user_wf: &Workflow,
    obc: &ObConfiguration,
) -> FpResult<Vec<OnboardingRequirement>> {
    // skip passkey registration on no-phone flows
    if !obc.prompt_for_passkey {
        return Ok(vec![]);
    }
    let credentials = Passkey::list(conn, &user_wf.scoped_vault_id)?;

    // Note: we should probably represent this another way, but for now we can determine if we
    // want to skip passkey reg by checking for this liveness event on the
    // scoped_vault
    let liveness_skip_events = LivenessEvent::get_by_scoped_vault_id(conn, &user_wf.scoped_vault_id)?
        .into_iter()
        .filter(|evt| matches!(evt.liveness_source, LivenessSource::Skipped))
        .collect_vec();

    let reqs = (liveness_skip_events.is_empty() && credentials.is_empty())
        .then_some(OnboardingRequirement::RegisterPasskey)
        .into_iter()
        .collect();
    Ok(reqs)
}

fn get_collect_document_requirement(
    conn: &mut PgConn,
    wf: &Workflow,
    obc: &ObConfiguration,
    opts: RequirementOpts,
    user_values: &UserDecryptResultForReqs,
) -> FpResult<Vec<OnboardingRequirement>> {
    let RequirementOpts {
        require_capture_on_stepup,
    } = opts;
    let document_requests = DocumentRequest::get_all(conn, &wf.id)?;
    let reqs = document_requests
        .into_iter()
        .map(|dr| -> FpResult<_> {
            let id_doc = Document::list_by_request_id(conn, &dr.id)?;
            let should_render =
                id_doc.is_empty() || id_doc.into_iter().any(|d| d.status == DocumentStatus::Pending);
            if !should_render {
                return Ok(None);
            }

            let upload_settings = match &dr.config {
                DocumentRequestConfig::Identity { .. } => {
                    if require_capture_on_stepup.unwrap_or(false) {
                        // Only for coba
                        DocumentUploadSettings::CaptureOnlyOnMobile
                    } else {
                        DocumentUploadSettings::PreferCapture
                    }
                }
                DocumentRequestConfig::ProofOfSsn { .. } => DocumentUploadSettings::PreferCapture,
                DocumentRequestConfig::ProofOfAddress { .. } => DocumentUploadSettings::PreferUpload,
                DocumentRequestConfig::Custom(c) => c.upload_settings,
            };

            let country = user_values
                .get(&IDK::Country.into())
                .and_then(|a| Iso3166TwoDigitCountryCode::from_str(a.leak()).ok());
            let config = match dr.config {
                DocumentRequestConfig::Identity { collect_selfie } => {
                    let user_consent = UserConsent::get_for_workflow(conn, &wf.id)?;
                    let supported_country_and_doc_types =
                        obc.supported_country_mapping_for_document(country).0;
                    CollectDocumentConfig::Identity {
                        should_collect_selfie: collect_selfie,
                        should_collect_consent: user_consent.is_none(),
                        supported_country_and_doc_types,
                    }
                }
                DocumentRequestConfig::ProofOfAddress { .. } => CollectDocumentConfig::ProofOfAddress {},
                DocumentRequestConfig::ProofOfSsn { .. } => CollectDocumentConfig::ProofOfSsn {},
                DocumentRequestConfig::Custom(info) => CollectDocumentConfig::Custom(info),
            };

            let req = OnboardingRequirement::CollectDocument {
                document_request_id: dr.id.clone(),
                upload_settings,
                config,
            };

            Ok(Some(req))
        })
        .collect::<FpResult<Vec<Option<_>>>>()?
        .into_iter()
        .flatten()
        .collect();
    Ok(reqs)
}


fn get_authorize_requirement<T>(
    conn: &mut PgConn,
    uvw: &TenantVw<T>,
    user_wf: &Workflow,
    obc: &ObConfiguration,
    user_values: &UserDecryptResultForReqs,
) -> FpResult<Vec<OnboardingRequirement>> {
    let (document_types, skipped_selfie) = if obc.can_access_document() {
        // Note: since we might have collected multiple documents in a given onboarding, and we'd like
        // to authorize all of them
        let docs = Document::list_by_wf_id(conn, &user_wf.id)?;
        let doc_types = docs
            .iter()
            // check we've actually completed the document, it's not just an empty id doc
            // TODO: maybe we should revisit this empty ID doc shell design?
            .filter_map(|(id, _)| id.completed_seqno.and(id.vaulted_document_type))
            .unique()
            .collect();
        // unless all were skipped, we need to authorize since we may have collected it
        let selfie_skipped = docs.iter().all(|(id, _)| id.should_skip_selfie());
        (doc_types, selfie_skipped)
    } else {
        (vec![], false)
    };

    let collected_data = obc
        .can_access_data
        .iter()
        .filter(|cdo| {
            // Only include CDO's from optional_data if they were collected
            if obc.optional_data.contains(cdo) {
                cdo.required_data_identifiers().iter().all(|di| uvw.has_field(di))
            } else {
                true
            }
        })
        .filter(|cdo| {
            !matches!(cdo, CDO::Document(DocumentCdoInfo(_, _, Selfie::RequireSelfie))) || !skipped_selfie
        })
        .filter(|cdo| !should_skip_us_only_cdos(cdo, user_values))
        .cloned()
        .collect();

    let fields_to_authorize = AuthorizeFields {
        collected_data,
        document_types,
    };
    Ok(vec![OnboardingRequirement::Authorize {
        fields_to_authorize,
        authorized_at: user_wf.authorized_at,
    }])
}

/// Generates a requirement of the given kind `k`, if one exists.
#[allow(clippy::too_many_arguments)]
#[tracing::instrument("get_requirement_inner", skip_all, fields(kind = ?k))]
fn get_requirement_inner<T>(
    k: OnboardingRequirementKind,
    conn: &mut PgConn,
    entity_info: EntityInfo<T>,
    obc: &ObConfiguration,
    opts: RequirementOpts,
) -> FpResult<Vec<OnboardingRequirement>> {
    let EntityInfo {
        vw,
        wf,
        user_values,
        business_owners,
        auth_events,
        is_secondary_bo,
    } = entity_info;
    let reqs = match k {
        OnboardingRequirementKind::RegisterAuthMethod => {
            get_register_auth_method_requirements(conn, obc, vw, auth_events)?
        }
        OnboardingRequirementKind::CollectData => get_collect_kyc_data_requirement(vw, wf, obc, user_values)?,
        OnboardingRequirementKind::CollectInvestorProfile => {
            get_collect_investor_profile_requirement(vw, wf, obc, user_values)?
        }
        OnboardingRequirementKind::CollectBusinessData => {
            get_collect_kyb_data_requirement(vw, wf, obc, is_secondary_bo, business_owners)?
        }
        // The below requirements we will never include when met
        // (kind of confusing in that we are checking in real-time if they've been satisifed)
        OnboardingRequirementKind::RegisterPasskey => get_register_passkey_requirement(conn, wf, obc)?,
        OnboardingRequirementKind::CollectDocument => {
            get_collect_document_requirement(conn, wf, obc, opts, user_values)?
        }
        OnboardingRequirementKind::Authorize => get_authorize_requirement(conn, vw, wf, obc, user_values)?,
        OnboardingRequirementKind::Process => {
            if wf.state.requires_user_input() {
                // If the worfklow is in a state that requires user input, make a Process requirement
                vec![OnboardingRequirement::Process]
            } else {
                vec![]
            }
        }
    };
    Ok(reqs)
}
