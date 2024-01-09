use std::str::FromStr;

use crate::utils::vault_wrapper::{VaultWrapper, VwArgs};
use crate::{
    auth::user::CheckUserWfAuthContext, errors::ApiResult, utils::vault_wrapper::DecryptUncheckedResult,
    State,
};
use db::models::workflow::WorkflowIdentifier;
use db::{
    models::{
        document_request::DocumentRequest, identity_document::IdentityDocument,
        liveness_event::LivenessEvent, ob_configuration::ObConfiguration, user_consent::UserConsent,
        webauthn_credential::WebauthnCredential, workflow::Workflow,
    },
    PgConn,
};
use itertools::Itertools;
use newtypes::{
    AlpacaKycState, AuthorizeFields, DocumentCdoInfo, DocumentRequestKind, IdentityDocumentStatus,
    Iso3166TwoDigitCountryCode, KycState, LivenessSource, OnboardingRequirement, OnboardingRequirementKind,
    Selfie, UsLegalStatus, VaultId, WorkflowState,
};
use newtypes::{
    CollectedDataOption, DataIdentifierDiscriminant as DID, Declaration, DocumentKind,
    IdentityDataKind as IDK, InvestorProfileKind as IPK, ScopedVaultId,
};

use super::vault_wrapper::Any;

#[derive(Clone)]
pub struct GetRequirementsArgs {
    pub person_obc: ObConfiguration,
    pub person_workflow: Workflow,
    pub person_vault_id: VaultId,
    pub business_sv: Option<ScopedVaultId>,
}

impl GetRequirementsArgs {
    pub fn from(value: &CheckUserWfAuthContext) -> ApiResult<Self> {
        Ok(Self {
            person_obc: value.ob_config()?.clone(),
            person_workflow: value.workflow().clone(),
            person_vault_id: value.user().id.clone(),
            business_sv: value.scoped_business_id(),
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
    ) -> ApiResult<DecryptUncheckedResultForReqs> {
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

#[tracing::instrument(skip_all)]
/// Gets a list of requirements for the Person Vault for the onboarding.
/// If the Person Vault is the Primary BO of some ongoing Business onboarding, then this also includes the requirements of that Business Vault
/// NOTE: this returns a list of both met and unmet requirements - you should check.
/// TODO: for now, this is guaranteed to return all unmet requirements, but will only return some
/// met requirements
pub async fn get_requirements_for_person_and_maybe_business(
    state: &State,
    args: GetRequirementsArgs,
) -> ApiResult<Vec<OnboardingRequirement>> {
    // Fetch the UVW and use it to decrypt IPK::Declarations, if they exist
    let GetRequirementsArgs {
        person_obc,
        person_workflow,
        person_vault_id,
        business_sv,
    } = args;

    let su_id = person_workflow.scoped_vault_id.clone();
    let sb_id = business_sv.clone();
    let (uvw, bvw_wf) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let uvw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&su_id))?;
            let bvw = if let Some(sb_id) = sb_id {
                let bvw = VaultWrapper::<Any>::build(conn, VwArgs::Tenant(&sb_id))?;
                let (business_workflow, _) = Workflow::get_all(
                    conn,
                    WorkflowIdentifier::ScopedBusinessId {
                        sb_id: &sb_id,
                        vault_id: &person_vault_id,
                    },
                )?;
                Some((bvw, business_workflow))
            } else {
                None
            };
            Ok((uvw, bvw))
        })
        .await??;
    let person_decrypted_values = GetRequirementsArgs::get_decrypted_values(state, &uvw).await?;
    // technically not needed, but safer mb
    let bvw_wf_decrypted_values = if let Some((bvw, biz_wf)) = bvw_wf {
        let business_decrypted_values = GetRequirementsArgs::get_decrypted_values(state, &bvw).await?;
        Some((bvw, biz_wf, business_decrypted_values))
    } else {
        None
    };

    let requirements = state
        .db_pool
        .db_query(move |conn| -> ApiResult<Vec<_>> {
            let person_requirements =
                get_requirements_inner(conn, uvw, &person_obc, &person_workflow, person_decrypted_values)?;

            let business_requirements =
                if let Some((bvw, business_workflow, business_decrypted_values)) = bvw_wf_decrypted_values {
                    // Technically for this case, the business's OBC should be the same as the person's and it'd be a bit more clear to see business_obc here. But they should be same and this is the existing logic so may as well keep as is
                    get_requirements_inner(
                        conn,
                        bvw,
                        &person_obc,
                        &business_workflow,
                        business_decrypted_values,
                    )?
                } else {
                    vec![]
                };

            Ok(business_requirements
                .into_iter()
                .chain(person_requirements.into_iter())
                .collect())
        })
        .await??;
    Ok(requirements)
}

pub struct RequirementProgress {
    pub populated_attributes: Vec<CollectedDataOption>,
    pub missing_attributes: Vec<CollectedDataOption>,
}

/// Returns if the provided CDO is met by the data in the VW. Some CDOs have conditional
/// requirements that are a function of data in the vault - you must pass in the pre-decrypted
/// values as well
fn is_cdo_met<Type>(
    vw: &VaultWrapper<Type>,
    cdo: &CollectedDataOption,
    decrypted_values: &DecryptUncheckedResultForReqs,
) -> bool {
    if should_skip_us_only_cdos(cdo, decrypted_values) {
        return true;
    }

    let mut required_dis = cdo.required_data_identifiers();
    // Also check if optional DIs (based on selected values) are met
    match cdo {
        CollectedDataOption::UsLegalStatus => {
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
        CollectedDataOption::FullAddress => {
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

    required_dis.into_iter().all(|di| vw.has_field(di))
}

// these are CDOs only applicable to US
pub(crate) fn should_skip_us_only_cdos(
    cdo: &CollectedDataOption,
    decrypted_values: &DecryptUncheckedResultForReqs,
) -> bool {
    match cdo {
        CollectedDataOption::Ssn4 | CollectedDataOption::Ssn9 | CollectedDataOption::UsLegalStatus => {
            let country = decrypted_values
                .get(&IDK::Country.into())
                .and_then(|a| a.parse_into::<Iso3166TwoDigitCountryCode>().ok());
            // skip if !us
            country.map(|c| !c.is_us_including_territories()).unwrap_or(false)
        }
        _ => false,
    }
}

pub fn get_data_collection_progress<Type>(
    vw: &VaultWrapper<Type>,
    ob_config: &ObConfiguration,
    di_kind: DID,
    decrypted_values: &DecryptUncheckedResultForReqs,
) -> RequirementProgress {
    let mut populated_attributes = Vec::new();
    let mut missing_attributes = Vec::new();

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
            }
        });

    RequirementProgress {
        populated_attributes,
        missing_attributes,
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
) -> ApiResult<Vec<OnboardingRequirement>> {
    // Depending on the workflow that we are running, we only want to show a subset of requirements
    let relevant_requirement_kinds = wf.state.relevant_requirements();

    // For each requirement kind that might be shown by this workflow, generate a requirement if
    // necessary
    let requirements = relevant_requirement_kinds
        .into_iter()
        .map(|k| get_requirement_inner(k, conn, &vw, obc, wf, &decrypted_values))
        .collect::<ApiResult<Vec<_>>>()?
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
        .sorted_by_key(|r| OnboardingRequirementKind::from(r).priority(obc.is_doc_first))
        .collect();

    tracing::info!(workflow_id=%wf.id, requirements=%format!("{:?}", requirements), scoped_user_id=%wf.scoped_vault_id, "get_requirements result");

    Ok(requirements)
}

/// Generates a requirement of the given kind `k`, if one exists.
fn get_requirement_inner(
    k: OnboardingRequirementKind,
    conn: &mut PgConn,
    vw: &VaultWrapper<Any>,
    obc: &ObConfiguration,
    wf: &Workflow,
    decrypted_values: &DecryptUncheckedResultForReqs,
) -> ApiResult<Option<OnboardingRequirement>> {
    let req = match k {
        OnboardingRequirementKind::CollectData => {
            obc.must_collect(DID::Id).then(|| {
                let RequirementProgress {
                    populated_attributes,
                    missing_attributes,
                } = get_data_collection_progress(vw, obc, DID::Id, decrypted_values);
                // if ob config needs to collect id data
                OnboardingRequirement::CollectData {
                    missing_attributes,
                    optional_attributes: obc.optional_data.clone(),
                    populated_attributes,
                }
            })
        }
        OnboardingRequirementKind::CollectInvestorProfile => {
            obc.must_collect(DID::InvestorProfile)
                .then(|| -> ApiResult<_> {
                    let RequirementProgress {
                        populated_attributes,
                        missing_attributes,
                    } = get_data_collection_progress(vw, obc, DID::InvestorProfile, decrypted_values);
                    let declarations = decrypted_values.get_di(IPK::Declarations).ok();
                    let missing_document = if let Some(declarations) = declarations {
                        let declarations: Vec<Declaration> = declarations.deserialize()?;
                        // The finra compliance doc is missing if any of the declarations require a doc and we don't
                        // yet have one on file
                        declarations.iter().any(|d| d.requires_finra_compliance_doc())
                            && !vw.has_field(DocumentKind::FinraComplianceLetter)
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
        }
        OnboardingRequirementKind::CollectBusinessData => obc
            .must_collect(DID::Business)
            .then(|| -> ApiResult<_> {
                let RequirementProgress {
                    populated_attributes,
                    missing_attributes,
                } = get_data_collection_progress(vw, obc, DID::Business, decrypted_values);
                Ok(OnboardingRequirement::CollectBusinessData {
                    missing_attributes,
                    populated_attributes,
                })
            })
            .transpose()?,
        // The below requirements we will never include when met
        // (kind of confusing in that we are checking in real-time if they've been satisifed)
        OnboardingRequirementKind::RegisterPasskey => {
            // skip passkey registration on no-phone flows
            if obc.is_no_phone_flow {
                None
            } else {
                let credentials = WebauthnCredential::list(conn, &vw.vault().id)?;

                // Note: we should probably represent this another way, but for now we can determine if we want to skip passkey reg
                // by checking for this liveness event on the scoped_vault
                let liveness_skip_events = LivenessEvent::get_by_scoped_vault_id(conn, &wf.scoped_vault_id)?
                    .into_iter()
                    .filter(|evt| matches!(evt.liveness_source, LivenessSource::Skipped))
                    .collect_vec();

                (liveness_skip_events.is_empty() && credentials.is_empty())
                    .then_some(OnboardingRequirement::RegisterPasskey)
            }
        }
        OnboardingRequirementKind::CollectDocument => {
            let dr = DocumentRequest::get(conn, &wf.id, DocumentRequestKind::Identity)?;
            if let Some(dr) = dr {
                let user_consent = UserConsent::get_for_workflow(conn, &wf.id)?;
                let id_doc = IdentityDocument::list_by_request_id(conn, &dr.id)?;
                let country = decrypted_values
                    .get(&IDK::Country.into())
                    .and_then(|a| Iso3166TwoDigitCountryCode::from_str(a.leak()).ok());

                // Show a CollectDocument requirement if there's no id_document or the existing
                // id_document is still Pending
                let should_render = id_doc.is_empty()
                    || id_doc
                        .into_iter()
                        .any(|d| d.status == IdentityDocumentStatus::Pending);
                let supported_country_and_doc_types = obc.supported_country_mapping_for_document(country);

                should_render.then_some(OnboardingRequirement::CollectDocument {
                    document_request_id: dr.id,
                    should_collect_selfie: dr.should_collect_selfie,
                    should_collect_consent: user_consent.is_none(),
                    supported_country_and_doc_types: supported_country_and_doc_types.0,
                })
            } else {
                None
            }
        }
        OnboardingRequirementKind::CollectProofOfSsn => {
            let dr = DocumentRequest::get(conn, &wf.id, DocumentRequestKind::ProofOfSsn)?;
            if let Some(dr) = dr {
                let id_doc = IdentityDocument::list_by_request_id(conn, &dr.id)?;
                // Show a CollectDocument requirement if there's no id_document or the existing
                // id_document is still Pending
                let should_render = id_doc.is_empty()
                    || id_doc
                        .into_iter()
                        .any(|d| d.status == IdentityDocumentStatus::Pending);

                should_render.then_some(OnboardingRequirement::CollectDocument {
                    document_request_id: dr.id,
                    should_collect_selfie: false,
                    should_collect_consent: false,
                    supported_country_and_doc_types: obc
                        .supported_countries_and_doc_types_for_proof_of_ssn()
                        .0,
                })
            } else {
                None
            }
        }
        OnboardingRequirementKind::Authorize => {
            let (document_types, skipped_selfie) = if obc.can_access_document() {
                // Note: since we might have collected multiple documents in a given onboarding, and we'd like to authorize all of them
                let id_docs = IdentityDocument::list_by_wf_id(conn, &wf.id)?;
                let doc_types = id_docs
                        .iter()
                        // check we've actually completed the document, it's not just an empty id doc
                        // TODO: maybe we should revisit this empty ID doc shell design?
                        .filter(|i| i.completed_seqno.is_some())
                        .map(|id| id.document_type)
                        .unique()
                        .collect();
                // unless all were skipped, we need to authorize since we may have collected it
                let selfie_skipped = id_docs.iter().all(|id| id.should_skip_selfie());
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
                        cdo.required_data_identifiers()
                            .into_iter()
                            .all(|di| vw.has_field(di))
                    } else {
                        true
                    }
                })
                .filter(|cdo| {
                    !(matches!(
                        cdo,
                        CollectedDataOption::Document(DocumentCdoInfo(_, _, Selfie::RequireSelfie))
                    ) && skipped_selfie)
                })
                .filter(|cdo| !should_skip_us_only_cdos(cdo, decrypted_values))
                .cloned()
                .collect();

            let fields_to_authorize = AuthorizeFields {
                collected_data,
                document_types,
            };
            Some(OnboardingRequirement::Authorize {
                fields_to_authorize,
                authorized_at: wf.authorized_at,
            })
        }
        OnboardingRequirementKind::Process => {
            if wf.state.requires_user_input() {
                // If the worfklow is in a state that requires user input, make a Process requirement
                Some(OnboardingRequirement::Process)
            } else {
                None
            }
        }
    };
    Ok(req)
}
