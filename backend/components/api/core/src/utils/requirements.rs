use super::vault_wrapper::Any;
use crate::auth::session::user::AssociatedAuthEvent;
use crate::auth::user::load_auth_events;
use crate::auth::user::CheckUserWfAuthContext;
use crate::auth::user::UserIdentifier;
use crate::utils::identify::get_user_auth_methods;
use crate::utils::vault_wrapper::DecryptUncheckedResult;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::vault_wrapper::VwArgs;
use crate::FpResult;
use crate::State;
use db::models::business_owner::BusinessOwner;
use db::models::document::Document;
use db::models::document_request::DocumentRequest;
use db::models::liveness_event::LivenessEvent;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::user_consent::UserConsent;
use db::models::webauthn_credential::WebauthnCredential;
use db::models::workflow::Workflow;
use db::PgConn;
use feature_flag::BoolFlag;
use itertools::chain;
use itertools::Itertools;
use newtypes::AlpacaKycState;
use newtypes::AuthEventKind;
use newtypes::AuthorizeFields;
use newtypes::BusinessOwnerSource;
use newtypes::CollectDocumentConfig;
use newtypes::CollectedDataOption as CDO;
use newtypes::DataIdentifierDiscriminant as DID;
use newtypes::Declaration;
use newtypes::DocumentCdoInfo;
use newtypes::DocumentDiKind;
use newtypes::DocumentRequestConfig;
use newtypes::DocumentRequestKind;
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
}

impl GetRequirementsArgs {
    pub fn from(value: &CheckUserWfAuthContext) -> FpResult<Self> {
        Ok(Self {
            person_obc: value.ob_config().clone(),
            person_workflow: value.workflow().clone(),
            business_sv: value.scoped_business_id(),
            biz_wf_id: value.business_workflow_id(),
            auth_events: value.user_session.auth_events.clone(),
        })
    }
}

/// Wrapper type around DecryptUncheckedResult that is guaranteed to have all the IDKs we need for
/// requirement checking
#[derive(derive_more::Deref)]
pub struct DecryptUncheckedResultForReqs(#[deref] DecryptUncheckedResult);

impl GetRequirementsArgs {
    /// Fetch various values from the vault that may conditionally affect requirements
    pub async fn get_decrypted_values(
        state: &State,
        vw: &VaultWrapper<Any>,
    ) -> FpResult<DecryptUncheckedResultForReqs> {
        let values = vec![
            IPK::Declarations.into(),
            IDK::UsLegalStatus.into(),
            IDK::Country.into(),
        ];
        let decrypted_values = vw.decrypt_unchecked(&state.enclave_client, &values).await?;
        Ok(DecryptUncheckedResultForReqs(decrypted_values))
    }
}

impl DecryptUncheckedResultForReqs {
    /// Auth playbooks don't require complex checking of what's populated
    pub fn for_auth() -> Self {
        Self(DecryptUncheckedResult::default())
    }
}

#[derive(Default)]
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
    } = args;

    let su_id = person_workflow.scoped_vault_id.clone();
    let sb_id = business_sv.clone();
    let (uvw, bvw_wf) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let uvw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&su_id))?;
            let bvw = if let Some((sb_id, biz_wf_id)) = sb_id.zip(biz_wf_id) {
                let bvw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&sb_id))?;
                let (business_workflow, _) = Workflow::get_all(conn, &biz_wf_id)?;
                Some((bvw, business_workflow))
            } else {
                None
            };
            Ok((uvw, bvw))
        })
        .await?;
    let person_decrypted_values = GetRequirementsArgs::get_decrypted_values(state, &uvw).await?;
    // technically not needed, but safer mb
    let bvw_wf_decrypted_values = if let Some((bvw, biz_wf)) = bvw_wf {
        let business_decrypted_values = GetRequirementsArgs::get_decrypted_values(state, &bvw).await?;
        Some((bvw, biz_wf, business_decrypted_values))
    } else {
        None
    };

    let require_capture_on_stepup = state
        .ff_client
        .flag(BoolFlag::RequireCaptureOnStepUp(&person_obc.key));
    let person_requirement_opts = RequirementOpts {
        require_capture_on_stepup: Some(require_capture_on_stepup),
    };

    let requirements = state
        .db_pool
        .db_query(move |conn| -> FpResult<Vec<_>> {
            let person_requirements = get_requirements_inner(
                conn,
                uvw,
                &person_obc,
                &person_workflow,
                person_decrypted_values,
                person_requirement_opts,
                &auth_events,
            )?;


            let business_requirements =
                if let Some((bvw, business_workflow, business_decrypted_values)) = bvw_wf_decrypted_values {
                    // Technically for this case, the business's OBC should be the same as the person's and
                    // it'd be a bit more clear to see business_obc here. But they should be same and this is
                    // the existing logic so may as well keep as is
                    get_requirements_inner(
                        conn,
                        bvw,
                        &person_obc,
                        &business_workflow,
                        business_decrypted_values,
                        RequirementOpts::default(),
                        &[],
                    )?
                } else {
                    vec![]
                };

            Ok(chain!(business_requirements, person_requirements).collect())
        })
        .await?;
    Ok(requirements)
}

struct RequirementProgress {
    populated_attributes: Vec<CDO>,
    missing_attributes: Vec<CDO>,
    optional_attributes: Vec<CDO>,
}

/// Returns if the provided CDO is met by the data in the VW. Some CDOs have conditional
/// requirements that are a function of data in the vault - you must pass in the pre-decrypted
/// values as well
fn is_cdo_met<Type>(
    vw: &VaultWrapper<Type>,
    cdo: &CDO,
    decrypted_values: &DecryptUncheckedResultForReqs,
) -> bool {
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
pub(crate) fn should_skip_us_only_cdos(cdo: &CDO, decrypted_values: &DecryptUncheckedResultForReqs) -> bool {
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
    ob_config: &ObConfiguration,
    di_kind: DID,
    decrypted_values: &DecryptUncheckedResultForReqs,
) -> RequirementProgress {
    let mut populated_attributes = Vec::new();
    let mut missing_attributes = Vec::new();
    let mut optional_attributes = Vec::new();

    ob_config
        .must_collect_data
        .iter()
        .map(|cdo| (cdo, true))
        .chain(ob_config.optional_data.iter().map(|cdo| (cdo, false)))
        .filter(|(cdo, _)| cdo.parent().data_identifier_kind() == di_kind)
        .for_each(|(cdo, must_collect)| {
            let has_all_dis = is_cdo_met(vw, cdo, decrypted_values);
            if has_all_dis {
                populated_attributes.push(cdo.clone());
            } else if must_collect {
                missing_attributes.push(cdo.clone());
            } else {
                optional_attributes.push(cdo.clone());
            }
        });

    RequirementProgress {
        populated_attributes,
        missing_attributes,
        optional_attributes,
    }
}

// gets oustanding requirements for a Vault with respect to a specific OBC/WF
#[tracing::instrument(skip_all)]
pub fn get_requirements_inner(
    conn: &mut PgConn,
    vw: VaultWrapper<Any>,
    obc: &ObConfiguration,
    wf: &Workflow,
    decrypted_values: DecryptUncheckedResultForReqs,
    opts: RequirementOpts,
    aes: &[AssociatedAuthEvent],
) -> FpResult<Vec<OnboardingRequirement>> {
    // Depending on the workflow that we are running, we only want to show a subset of requirements
    let relevant_requirement_kinds = wf.state.relevant_requirements();

    // For each requirement kind that might be shown by this workflow, generate a requirement if
    // necessary
    let requirements = relevant_requirement_kinds
        .into_iter()
        .map(|k| get_requirement_inner(k, conn, &vw, obc, wf, &decrypted_values, &opts, aes))
        .collect::<FpResult<Vec<_>>>()?
        .into_iter()
        .flatten()
        .filter(|r| {
            let is_data_collection_step = matches!(
                OnboardingRequirementKind::from(r),
                OnboardingRequirementKind::CollectData
                    | OnboardingRequirementKind::CollectInvestorProfile
                    | OnboardingRequirementKind::CollectBusinessData
            );
            let is_stepup = matches!(
                wf.state,
                WorkflowState::Kyc(KycState::DocCollection)
                    | WorkflowState::AlpacaKyc(AlpacaKycState::DocCollection)
            );
            if is_data_collection_step {
                if wf.completed_at.is_some() {
                    // Omit the confirm screen when the workflow is entirely completed
                    return false;
                }
                if r.is_met() {
                    if is_stepup {
                        // Omit the confirm screen when an alpaca user is in step up
                        return false;
                    }
                    if obc.skip_confirm {
                        // Omit the confirm screen when the obc prefers it
                        return false;
                    }
                }
            }
            true
        })
        .sorted_by_key(|r| r.priority(obc.is_doc_first))
        .collect();

    tracing::info!(workflow_id=%wf.id, requirements=%format!("{:?}", requirements), scoped_user_id=%wf.scoped_vault_id, "get_requirements result");

    Ok(requirements)
}

pub fn get_register_auth_method_requirements(
    conn: &mut PgConn,
    obc: &ObConfiguration,
    sv_id: &ScopedVaultId,
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

    let identifier = UserIdentifier::ScopedVault(sv_id.clone());
    let ctx = get_user_auth_methods(conn, identifier, None)?;
    let verified_auth_methods = ctx
        .auth_methods
        .into_iter()
        .filter(|am| am.is_verified)
        .map(|am| am.kind)
        .collect_vec();
    let required_auth_methods = obc.required_auth_methods.iter().flatten().copied();
    let requirements = required_auth_methods
        .filter(|amk| !verified_auth_methods.contains(amk))
        .map(|auth_method_kind| OnboardingRequirement::RegisterAuthMethod { auth_method_kind })
        .collect();
    Ok(requirements)
}

/// Generates a requirement of the given kind `k`, if one exists.
#[allow(clippy::too_many_arguments)]
fn get_requirement_inner(
    k: OnboardingRequirementKind,
    conn: &mut PgConn,
    vw: &VaultWrapper<Any>,
    obc: &ObConfiguration,
    wf: &Workflow,
    decrypted_values: &DecryptUncheckedResultForReqs,
    opts: &RequirementOpts,
    auth_events: &[AssociatedAuthEvent],
) -> FpResult<Vec<OnboardingRequirement>> {
    let req = match k {
        OnboardingRequirementKind::RegisterAuthMethod => {
            get_register_auth_method_requirements(conn, obc, &wf.scoped_vault_id, auth_events)?
        }
        OnboardingRequirementKind::CollectData => {
            obc.must_collect(DID::Id)
                .then(|| {
                    let RequirementProgress {
                        populated_attributes,
                        missing_attributes,
                        optional_attributes,
                    } = get_data_collection_progress(vw, obc, DID::Id, decrypted_values);
                    // if ob config needs to collect id data
                    OnboardingRequirement::CollectData {
                        missing_attributes,
                        optional_attributes,
                        populated_attributes,
                    }
                })
                .into_iter()
                .collect()
        }
        OnboardingRequirementKind::CollectInvestorProfile => {
            obc.must_collect(DID::InvestorProfile)
                .then(|| -> FpResult<_> {
                    let RequirementProgress {
                        populated_attributes,
                        optional_attributes: _,
                        missing_attributes,
                    } = get_data_collection_progress(vw, obc, DID::InvestorProfile, decrypted_values);
                    let declarations = decrypted_values.get_di(IPK::Declarations).ok();
                    let missing_document = if let Some(declarations) = declarations {
                        let declarations: Vec<Declaration> = declarations.deserialize()?;
                        // The finra compliance doc is missing if any of the declarations require a doc and we
                        // don't yet have one on file
                        declarations.iter().any(|d| d.requires_finra_compliance_doc())
                            && !vw.has_field(&DocumentDiKind::FinraComplianceLetter.into())
                    } else {
                        false
                    };
                    Ok(OnboardingRequirement::CollectInvestorProfile {
                        missing_attributes,
                        populated_attributes,
                        missing_document,
                    })
                })
                .transpose()?
                .into_iter()
                .collect()
        }
        OnboardingRequirementKind::CollectBusinessData => obc
            .must_collect(DID::Business)
            .then(|| -> FpResult<_> {
                let RequirementProgress {
                    mut populated_attributes,
                    optional_attributes: _,
                    mut missing_attributes,
                } = get_data_collection_progress(vw, obc, DID::Business, decrypted_values);
                let sv = ScopedVault::get(conn, &wf.scoped_vault_id)?;
                let bos = BusinessOwner::list_all(conn, &vw.vault.id, &sv.tenant_id)?;
                let has_tenant_linked_bos = bos.iter().any(|bo| bo.0.source == BusinessOwnerSource::Tenant);
                if has_tenant_linked_bos && missing_attributes.contains(&CDO::BusinessBeneficialOwners) {
                    // BOs linked manually via API meet the CDO::BeneficialOwners requirement
                    missing_attributes.retain(|cdo| cdo != &CDO::BusinessBeneficialOwners);
                    populated_attributes.push(CDO::BusinessBeneficialOwners);
                }
                Ok(OnboardingRequirement::CollectBusinessData {
                    missing_attributes,
                    populated_attributes,
                })
            })
            .transpose()?
            .into_iter()
            .collect(),
        // The below requirements we will never include when met
        // (kind of confusing in that we are checking in real-time if they've been satisifed)
        OnboardingRequirementKind::RegisterPasskey => {
            // skip passkey registration on no-phone flows
            if !obc.prompt_for_passkey {
                return Ok(vec![]);
            }
            let credentials = WebauthnCredential::list(conn, &vw.vault().id)?;

            // Note: we should probably represent this another way, but for now we can determine if we
            // want to skip passkey reg by checking for this liveness event on the
            // scoped_vault
            let liveness_skip_events = LivenessEvent::get_by_scoped_vault_id(conn, &wf.scoped_vault_id)?
                .into_iter()
                .filter(|evt| matches!(evt.liveness_source, LivenessSource::Skipped))
                .collect_vec();

            (liveness_skip_events.is_empty() && credentials.is_empty())
                .then_some(OnboardingRequirement::RegisterPasskey)
                .into_iter()
                .collect()
        }
        OnboardingRequirementKind::CollectDocument => {
            let document_requests = DocumentRequest::get_all(conn, &wf.id)?;
            document_requests
                .into_iter()
                .map(|dr| -> FpResult<_> {
                    let id_doc = Document::list_by_request_id(conn, &dr.id)?;
                    let should_render =
                        id_doc.is_empty() || id_doc.into_iter().any(|d| d.status == DocumentStatus::Pending);
                    if !should_render {
                        return Ok(None);
                    }

                    let country = decrypted_values
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
                        DocumentRequestConfig::ProofOfAddress { .. } => {
                            CollectDocumentConfig::ProofOfAddress {}
                        }
                        DocumentRequestConfig::ProofOfSsn { .. } => CollectDocumentConfig::ProofOfSsn {},
                        DocumentRequestConfig::Custom(info) => CollectDocumentConfig::Custom(info),
                    };

                    let upload_settings = match dr.kind {
                        DocumentRequestKind::Identity => {
                            if opts.require_capture_on_stepup.unwrap_or(false) {
                                // Only for coba
                                DocumentUploadSettings::CaptureOnlyOnMobile
                            } else {
                                DocumentUploadSettings::PreferCapture
                            }
                        }
                        DocumentRequestKind::ProofOfSsn => DocumentUploadSettings::PreferCapture,
                        DocumentRequestKind::ProofOfAddress => DocumentUploadSettings::PreferUpload,
                        // TODO support configuring this
                        DocumentRequestKind::Custom => DocumentUploadSettings::PreferUpload,
                    };

                    let req = OnboardingRequirement::CollectDocument {
                        document_request_id: dr.id.clone(),
                        upload_settings,
                        upload_mode: upload_settings.into(),
                        config,
                    };

                    Ok(Some(req))
                })
                .collect::<FpResult<Vec<Option<_>>>>()?
                .into_iter()
                .flatten()
                .collect()
        }
        OnboardingRequirementKind::Authorize => {
            let (document_types, skipped_selfie) = if obc.can_access_document() {
                // Note: since we might have collected multiple documents in a given onboarding, and we'd like
                // to authorize all of them
                let docs = Document::list_by_wf_id(conn, &wf.id)?;
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
                        cdo.required_data_identifiers().iter().all(|di| vw.has_field(di))
                    } else {
                        true
                    }
                })
                .filter(|cdo| {
                    !matches!(cdo, CDO::Document(DocumentCdoInfo(_, _, Selfie::RequireSelfie)))
                        || !skipped_selfie
                })
                .filter(|cdo| !should_skip_us_only_cdos(cdo, decrypted_values))
                .cloned()
                .collect();

            let fields_to_authorize = AuthorizeFields {
                collected_data,
                document_types,
            };
            vec![OnboardingRequirement::Authorize {
                fields_to_authorize,
                authorized_at: wf.authorized_at,
            }]
        }
        OnboardingRequirementKind::Process => {
            if wf.state.requires_user_input() {
                // If the worfklow is in a state that requires user input, make a Process requirement
                vec![OnboardingRequirement::Process]
            } else {
                vec![]
            }
        }
    };
    Ok(req)
}
