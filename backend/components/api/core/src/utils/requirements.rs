use super::vault_wrapper::Any;
use super::vault_wrapper::TenantVw;
use crate::auth::session::user::AssociatedAuthEvent;
use crate::auth::user::load_auth_events;
use crate::auth::user::CheckUserWfAuthContext;
use crate::decision::biz_risk::KybBoFeatures;
use crate::utils::vault_wrapper::DecryptUncheckedResult;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpResult;
use crate::State;
use api_errors::ServerErrInto;
use db::models::contact_info::ContactInfo;
use db::models::document::Document;
use db::models::document_request::DocumentRequest;
use db::models::liveness_event::LivenessEvent;
use db::models::ob_configuration::ObConfiguration;
use db::models::passkey::Passkey;
use db::models::playbook::Playbook;
use db::models::user_consent::UserConsent;
use db::models::workflow::Workflow;
use db::PgConn;
use feature_flag::BoolFlag;
use itertools::chain;
use itertools::Itertools;
use newtypes::AuthEventKind;
use newtypes::AuthMethodKind;
use newtypes::AuthorizeFields;
use newtypes::BusinessDataKind as BDK;
use newtypes::CollectDocumentConfig;
use newtypes::CollectedDataOption as CDO;
use newtypes::ContactInfoKind;
use newtypes::DataIdentifier;
use newtypes::DataIdentifierDiscriminant as DID;
use newtypes::DocumentCdoInfo;
use newtypes::DocumentConfig;
use newtypes::DocumentDiKind;
use newtypes::DocumentRequestConfig;
use newtypes::DocumentStatus;
use newtypes::DocumentUploadSettings;
use newtypes::IdentityDataKind as IDK;
use newtypes::InvestorProfileDeclaration;
use newtypes::InvestorProfileKind as IPK;
use newtypes::Iso3166TwoDigitCountryCode;
use newtypes::KybState;
use newtypes::LivenessSource;
use newtypes::OnboardingRequirement;
use newtypes::Selfie;
use newtypes::UsLegalStatus;
use newtypes::WorkflowConfig;
use newtypes::WorkflowKind;
use newtypes::WorkflowState;
use std::str::FromStr;

/// Wrapper type around DecryptUncheckedResult that is guaranteed to have all the IDKs we need for
/// requirement checking
#[derive(derive_more::Deref)]
pub struct UserDecryptResultForReqs(#[deref] DecryptUncheckedResult);

impl UserDecryptResultForReqs {
    /// Fetch various values from the vault that may conditionally affect requirements
    pub async fn get_decrypted_values(state: &State, vw: &VaultWrapper<Any>) -> FpResult<Self> {
        let values = vec![
            IPK::Declarations.into(),
            IDK::UsLegalStatus.into(),
            IDK::Country.into(),
        ];
        let decrypted_values = vw.decrypt_unchecked(&state.enclave_client, &values).await?;
        Ok(Self(decrypted_values))
    }

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
    user_auth: &CheckUserWfAuthContext,
) -> FpResult<Vec<OnboardingRequirement>> {
    // Fetch the UVW and use it to decrypt IPK::Declarations, if they exist
    let playbook = user_auth.playbook.clone();
    let person_obc = user_auth.ob_config.clone();
    let su_id = user_auth.scoped_user.id.clone();
    let uvw = state
        .db_query(move |conn| VaultWrapper::<Any>::build_for_tenant(conn, &su_id))
        .await?;
    let user_values = UserDecryptResultForReqs::get_decrypted_values(state, &uvw).await?;

    let (kyb_bo_features, biz_wf_info) = if let Some(biz_wf_id) = user_auth.biz_wf_id.as_ref() {
        let (kyb_bo_features, bvw, biz_wf) = KybBoFeatures::build(state, biz_wf_id).await?;
        (kyb_bo_features, Some((bvw, biz_wf)))
    } else {
        (Default::default(), None)
    };

    let require_capture_on_stepup = state
        .ff_client
        .flag(BoolFlag::RequireCaptureOnStepUp(&playbook.key));
    let requirement_opts = RequirementOpts {
        require_capture_on_stepup: Some(require_capture_on_stepup),
    };

    let has_sb_id = user_auth.sb_id.is_some();
    let is_secondary_bo = user_auth.user_session.is_secondary_bo();
    let auth_events = user_auth.user_session.auth_events.clone();
    let person_workflow = user_auth.workflow.clone();
    let has_business_external_id = user_auth.metadata.business_external_id.is_some();
    let requirements = state
        .db_query(move |conn| {
            let ctx = RequirementContext {
                user_values: &user_values,
                kyb_bo_features: &kyb_bo_features,
                auth_events: &auth_events,
                is_secondary_bo,
                opts: requirement_opts,
                playbook: &playbook,
                // Technically for business reqs, the business's OBC should be the same as the person's.
                // But they should be same and this is the existing logic so may as well keep as is
                obc: &person_obc,
            };

            let mut requirements = get_requirements_for_wf(conn, ctx, &person_workflow, &uvw)?;

            if requires_biz_workflow(&person_workflow, &person_obc)? {
                if let Some((bvw, biz_wf)) = biz_wf_info {
                    requirements.extend(get_requirements_for_wf(conn, ctx, &biz_wf, &bvw)?);
                } else {
                    // If there's no business workflow, add requirement to create one
                    let req = OnboardingRequirement::CreateBusinessOnboarding {
                        requires_business_selection: !has_sb_id && !has_business_external_id,
                    };
                    requirements.push(req);
                }
            }

            tracing::info!(workflow_id=%person_workflow.id, requirements=%format!("{:?}", requirements), scoped_user_id=%person_workflow.scoped_vault_id, "get_requirements result");

            Ok(requirements)
        })
        .await?;

    Ok(requirements)
}

/// Returns if the person workflow and playbook require the presence of a business workflow
pub fn requires_biz_workflow(person_wf: &Workflow, person_obc: &ObConfiguration) -> FpResult<bool> {
    let requires_biz_workflow = match &person_wf.config {
        WorkflowConfig::Kyc(_) | WorkflowConfig::AlpacaKyc(_) => person_obc.kind.is_kyb(),
        WorkflowConfig::Document(DocumentConfig { business_configs, .. }) => !business_configs.is_empty(),
        WorkflowConfig::Kyb(_) => return ServerErrInto("Person workflow cannot have kind KYB"),
    };
    Ok(requires_biz_workflow)
}

#[derive(Clone, Copy)]
pub struct RequirementContext<'a> {
    pub user_values: &'a UserDecryptResultForReqs,
    pub kyb_bo_features: &'a KybBoFeatures,
    pub auth_events: &'a [AssociatedAuthEvent],
    pub is_secondary_bo: bool,
    pub playbook: &'a Playbook,
    pub obc: &'a ObConfiguration,
    pub opts: RequirementOpts,
}

/// Omit the confirm screen for met requirements IF the workflow has already moved on to a state
/// that doesn't allow data input
fn omit_confirm_if_necessary(req: OnboardingRequirement, wf: &Workflow) -> Option<OnboardingRequirement> {
    if !req.is_met() {
        return Some(req);
    }
    (wf.state.requires_user_input() && !wf.state.is_step_up()).then_some(req)
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
fn is_cdo_met<Type>(ctx: RequirementContext, vw: &VaultWrapper<Type>, cdo: &CDO) -> bool {
    if should_skip_us_only_cdos(cdo, ctx.user_values) {
        return true;
    }

    let mut required_dis = cdo.required_data_identifiers();
    // Also check if optional DIs (based on selected values) are met
    match cdo {
        CDO::UsLegalStatus => {
            let legal_status = (ctx.user_values)
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
            let country = (ctx.user_values)
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
        CDO::BusinessKycedBeneficialOwners => {
            let is_not_empty = !ctx.kyb_bo_features.bos.is_empty();
            let are_bos_populated = ctx.kyb_bo_features.bos.iter().all(|bo| {
                let vd_exists = (BDK::BO_USER_DIS.iter()).all(|i| bo.data.iter().any(|(di, _)| di == i));
                let stake_di = DataIdentifier::Business(BDK::BeneficialOwnerStake(bo.bo.link_id.clone()));
                let ownership_stake_exists = vw.has_field(&stake_di);

                if bo.has_linked_user() {
                    // Once there's a user linked, this BO's data will be collected by a CollectData
                    // requirement. We just have to make sure the ownership stake is set
                    ownership_stake_exists
                } else {
                    // If we haven't yet linked a user, we need phone / email to send a link to the BO
                    ownership_stake_exists && vd_exists
                }
            });
            return is_not_empty && are_bos_populated;
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
    ctx: RequirementContext,
    vw: &VaultWrapper<Type>,
    wf: &Workflow,
    di_kind: DID,
) -> Option<RequirementProgress> {
    if !(ctx.obc.must_collect_data.iter()).any(|cdo| cdo.matches(di_kind)) {
        return None;
    }

    let relevant_attrs = |cdos: Vec<CDO>| cdos.into_iter().filter(move |cdo| cdo.matches(di_kind));

    // Kind of unintuitive: optional_data is not a subset of must_collect_data
    let all_attrs = chain!(ctx.obc.must_collect_data.clone(), ctx.obc.optional_data.clone()).collect();
    let populated_attributes = relevant_attrs(all_attrs)
        .filter(|cdo| is_cdo_met(ctx, vw, cdo))
        .collect_vec();
    let missing_required_attributes = relevant_attrs(ctx.obc.must_collect_data.clone())
        .filter(|cdo| !is_cdo_met(ctx, vw, cdo))
        .collect_vec();
    let missing_optional_attributes = relevant_attrs(ctx.obc.optional_data.clone())
        .filter(|cdo| !is_cdo_met(ctx, vw, cdo))
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
    auth_events: &[AssociatedAuthEvent],
    vw: &TenantVw<T>,
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

fn get_collect_kyc_data_requirement<T>(
    ctx: RequirementContext,
    uvw: &VaultWrapper<T>,
    user_wf: &Workflow,
) -> FpResult<Option<OnboardingRequirement>> {
    let Some(RequirementProgress {
        populated_attributes,
        missing_attributes,
        optional_attributes,
        recollect_attributes,
    }) = get_data_collection_progress(ctx, uvw, user_wf, DID::Id)
    else {
        return Ok(None);
    };
    // if ob config needs to collect id data
    let req = OnboardingRequirement::CollectData {
        missing_attributes,
        optional_attributes,
        populated_attributes,
        recollect_attributes,
    };
    let req = omit_confirm_if_necessary(req, user_wf);
    Ok(req)
}

fn get_collect_investor_profile_requirement<T>(
    ctx: RequirementContext,
    uvw: &VaultWrapper<T>,
    user_wf: &Workflow,
) -> FpResult<Option<OnboardingRequirement>> {
    let Some(RequirementProgress {
        populated_attributes,
        missing_attributes,
        ..
    }) = get_data_collection_progress(ctx, uvw, user_wf, DID::InvestorProfile)
    else {
        return Ok(None);
    };
    let declarations = ctx.user_values.get_di(IPK::Declarations).ok();
    let missing_document = if let Some(declarations) = declarations {
        let declarations: Vec<InvestorProfileDeclaration> = declarations.deserialize()?;
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
    Ok(req)
}

fn get_collect_kyb_data_requirement<T>(
    ctx: RequirementContext,
    bvw: &VaultWrapper<T>,
    biz_wf: &Workflow,
) -> FpResult<Option<OnboardingRequirement>> {
    let Some(RequirementProgress {
        populated_attributes,
        optional_attributes: _,
        missing_attributes,
        recollect_attributes,
    }) = get_data_collection_progress(ctx, bvw, biz_wf, DID::Business)
    else {
        return Ok(None);
    };

    if ctx.is_secondary_bo {
        // Omit collecting any new business data and showing the business confirm screen
        // when the user filling out the form is not the primary BO
        return Ok(None);
    }

    let req = OnboardingRequirement::CollectBusinessData {
        missing_attributes,
        populated_attributes,
        recollect_attributes,
    };
    let req = omit_confirm_if_necessary(req, biz_wf);
    Ok(req)
}

fn get_register_passkey_requirement(
    conn: &mut PgConn,
    ctx: RequirementContext,
    user_wf: &Workflow,
) -> FpResult<Option<OnboardingRequirement>> {
    // skip passkey registration on no-phone flows
    if !ctx.obc.prompt_for_passkey {
        return Ok(None);
    }
    let credentials = Passkey::list(conn, &user_wf.scoped_vault_id)?;

    // Note: we should probably represent this another way, but for now we can determine if we
    // want to skip passkey reg by checking for this liveness event on the
    // scoped_vault
    let liveness_skip_events = LivenessEvent::get_by_scoped_vault_id(conn, &user_wf.scoped_vault_id)?
        .into_iter()
        .filter(|evt| matches!(evt.liveness_source, LivenessSource::Skipped))
        .collect_vec();

    let req = (liveness_skip_events.is_empty() && credentials.is_empty())
        .then_some(OnboardingRequirement::RegisterPasskey);
    Ok(req)
}

fn get_collect_document_requirements(
    conn: &mut PgConn,
    ctx: RequirementContext,
    wf: &Workflow,
) -> FpResult<Vec<OnboardingRequirement>> {
    let RequirementOpts {
        require_capture_on_stepup,
    } = ctx.opts;
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

            let country = (ctx.user_values)
                .get(&IDK::Country.into())
                .and_then(|a| Iso3166TwoDigitCountryCode::from_str(a.leak()).ok());
            let config = match dr.config {
                DocumentRequestConfig::Identity { collect_selfie, .. } => {
                    let user_consent = UserConsent::get_for_workflow(conn, &wf.id)?;
                    let supported_country_and_doc_types = ctx
                        .obc
                        .supported_country_mapping_for_document(&ctx.playbook.tenant_id, country)
                        .0;
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
    ctx: RequirementContext,
    uvw: &TenantVw<T>,
    user_wf: &Workflow,
) -> FpResult<Option<OnboardingRequirement>> {
    let (document_types, skipped_selfie) = if ctx.obc.can_access_document() {
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

    let collected_data = (ctx.obc.can_access_data)
        .iter()
        .filter(|cdo| {
            // Only include CDO's from optional_data if they were collected
            if ctx.obc.optional_data.contains(cdo) {
                cdo.required_data_identifiers().iter().all(|di| uvw.has_field(di))
            } else {
                true
            }
        })
        .filter(|cdo| {
            !matches!(cdo, CDO::Document(DocumentCdoInfo(_, _, Selfie::RequireSelfie))) || !skipped_selfie
        })
        .filter(|cdo| !should_skip_us_only_cdos(cdo, ctx.user_values))
        .cloned()
        .collect();

    let fields_to_authorize = AuthorizeFields {
        collected_data,
        document_types,
    };
    Ok(Some(OnboardingRequirement::Authorize {
        fields_to_authorize,
        authorized_at: user_wf.authorized_at,
    }))
}

fn get_process_requirement(ctx: RequirementContext, wf: &Workflow) -> Option<OnboardingRequirement> {
    // We really need to serialize a process requirement just when a workflow is "proceed-able." But
    // that's evidently a little bit difficult
    if wf.state.requires_user_input() {
        Some(OnboardingRequirement::Process)
    } else if matches!(wf.state, WorkflowState::Kyb(KybState::AwaitingBoKyc)) {
        let is_ready = ctx.kyb_bo_features.all_bos_have_kyc_results();
        is_ready.then_some(OnboardingRequirement::Process)
    } else {
        None
    }
}

// gets oustanding requirements for a Vault with respect to a specific OBC/WF
#[tracing::instrument(skip_all)]
pub fn get_requirements_for_wf<T>(
    conn: &mut PgConn,
    ctx: RequirementContext,
    wf: &Workflow,
    vw: &TenantVw<T>,
) -> FpResult<Vec<OnboardingRequirement>> {
    let requirements = match wf.kind {
        WorkflowKind::AlpacaKyc | WorkflowKind::Kyc => chain!(
            get_register_auth_method_requirements(conn, ctx.obc, ctx.auth_events, vw)?,
            get_collect_kyc_data_requirement(ctx, vw, wf)?,
            get_collect_investor_profile_requirement(ctx, vw, wf)?,
            get_register_passkey_requirement(conn, ctx, wf)?,
            get_collect_document_requirements(conn, ctx, wf)?,
            get_authorize_requirement(conn, ctx, vw, wf)?,
            get_process_requirement(ctx, wf),
        )
        .collect_vec(),
        WorkflowKind::Kyb => chain!(
            get_collect_kyb_data_requirement(ctx, vw, wf)?,
            get_collect_document_requirements(conn, ctx, wf)?,
            get_process_requirement(ctx, wf),
        )
        .collect_vec(),
        WorkflowKind::Document => chain!(
            get_collect_document_requirements(conn, ctx, wf)?,
            get_process_requirement(ctx, wf),
        )
        .collect_vec(),
    };
    Ok(requirements)
}
