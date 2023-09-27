use std::{str::FromStr, sync::Arc};

use crate::utils::vault_wrapper::{Business, Person, VaultWrapper, VwArgs};
use api_core::{
    auth::user::CheckUserWfAuthContext,
    errors::{business::BusinessError, ApiResult},
    utils::vault_wrapper::DecryptUncheckedResult,
    State,
};
use db::{
    models::{
        document_request::DocumentRequest, identity_document::IdentityDocument,
        liveness_event::LivenessEvent, ob_configuration::ObConfiguration, user_consent::UserConsent,
        webauthn_credential::WebauthnCredential, workflow::Workflow,
    },
    PgConn,
};
use feature_flag::{BoolFlag, FeatureFlagClient};
use itertools::Itertools;
use newtypes::{
    AuthorizeFields, DocumentCdoInfo, IdentityDocumentStatus, Iso3166TwoDigitCountryCode, LivenessSource,
    OnboardingRequirement, OnboardingRequirementKind, Selfie, UsLegalStatus,
};
use newtypes::{
    CollectedDataOption, DataIdentifierDiscriminant as DID, Declaration, DocumentKind, IdDocKind,
    IdentityDataKind as IDK, InvestorProfileKind as IPK, ScopedVaultId,
};
use paperclip::actix::web;

mod authorize;
mod config;
mod d2p;
mod fingerprint_visit;
mod index;
mod pat;
mod process;
mod skip_passkey_register;
mod socure_device;
mod status;
mod stytch;
mod validate;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(index::post)
        .service(authorize::post)
        .service(status::get)
        .service(skip_passkey_register::post)
        .service(fingerprint_visit::post)
        .service(pat::get)
        .service(socure_device::post)
        .service(process::post)
        .service(validate::post)
        .service(stytch::post)
        .service(config::get);

    config::configure_get_aliases(config);
    d2p::routes(config);
}

pub struct GetRequirementsArgs {
    pub ob_config: ObConfiguration,
    pub workflow: Workflow,
    pub sb_id: Option<ScopedVaultId>,
}

impl GetRequirementsArgs {
    fn from(value: &CheckUserWfAuthContext) -> ApiResult<Self> {
        Ok(Self {
            ob_config: value.ob_config()?.clone(),
            workflow: value.workflow().clone(),
            sb_id: value.scoped_business_id(),
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
        uvw: &VaultWrapper<Person>,
    ) -> ApiResult<DecryptUncheckedResultForReqs> {
        let values = vec![
            IPK::Declarations.into(),
            IDK::UsLegalStatus.into(),
            IDK::Country.into(),
        ];
        let decrypted_values = uvw.decrypt_unchecked(&state.enclave_client, &values).await?;
        Ok(DecryptUncheckedResultForReqs(decrypted_values))
    }
}

#[tracing::instrument(skip_all)]
/// Gets a list of requirements to onboard onto this ob config.
/// NOTE: this returns a list of both met and unmet requirements - you should check.
/// TODO: for now, this is guaranteed to return all unmet requirements, but will only return some
/// met requirements
pub async fn get_requirements(
    state: &State,
    args: GetRequirementsArgs,
) -> ApiResult<Vec<OnboardingRequirement>> {
    // Fetch the UVW and use it to decrypt IPK::Declarations, if they exist
    let su_id = args.workflow.scoped_vault_id.clone();
    let uvw = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let uvw = VaultWrapper::<Person>::build(conn, VwArgs::Tenant(&su_id))?;
            Ok(uvw)
        })
        .await??;
    let decrypted_values = GetRequirementsArgs::get_decrypted_values(state, &uvw).await?;

    let ff_client = state.feature_flag_client.clone();
    let requirements = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let requirements = get_requirements_inner(conn, uvw, args, decrypted_values, ff_client)?;
            Ok(requirements)
        })
        .await??;
    Ok(requirements)
}

struct RequirementProgress {
    populated_attributes: Vec<CollectedDataOption>,
    missing_attributes: Vec<CollectedDataOption>,
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
                    required_dis.extend([IDK::Nationality.into(), IDK::Citizenships.into()].into_iter());
                }
                Some(UsLegalStatus::Visa) => {
                    let addl_dis = [
                        IDK::Nationality.into(),
                        IDK::Citizenships.into(),
                        IDK::VisaKind.into(),
                        IDK::VisaExpirationDate.into(),
                    ];
                    required_dis.extend(addl_dis.into_iter());
                }
                None => (),
            }
        }
        CollectedDataOption::FullAddress => {
            let country = decrypted_values
                .get(&IDK::Country.into())
                .and_then(|a| a.parse_into::<Iso3166TwoDigitCountryCode>().ok());
            if country.map(|c| c.is_us_including_territories()).unwrap_or(false) {
                // US addresses always require City, State, and Zip
                let addl_dis = [IDK::City.into(), IDK::State.into(), IDK::Zip.into()];
                required_dis.extend(addl_dis.into_iter());
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

fn get_progress<Type>(
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

#[tracing::instrument(skip_all)]
pub fn get_requirements_inner(
    conn: &mut PgConn,
    uvw: VaultWrapper<Person>,
    args: GetRequirementsArgs,
    decrypted_values: DecryptUncheckedResultForReqs,
    ff_client: Arc<dyn FeatureFlagClient>,
) -> ApiResult<Vec<OnboardingRequirement>> {
    let only_us_dl = ff_client.flag(BoolFlag::RestrictToUsDriversLicense(&args.ob_config.tenant_id));

    // Depending on the workflow that we are running, we only want to show a subset of requirements
    let relevant_requirement_kinds = args.workflow.state.relevant_requirements();

    // For each requirement kind that might be shown by this workflow, generate a requirement if
    // necessary
    let requirements = relevant_requirement_kinds
        .into_iter()
        .map(|k| get_requirement_inner(k, conn, &uvw, &args, &decrypted_values, only_us_dl))
        .collect::<ApiResult<Vec<_>>>()?
        .into_iter()
        .flatten()
        .sorted_by_key(|r| OnboardingRequirementKind::from(r).priority(args.ob_config.is_doc_first))
        .collect();

    tracing::info!(workflow_id=%args.workflow.id, requirements=%format!("{:?}", requirements), scoped_user_id=%args.workflow.scoped_vault_id, "get_requirements result");

    Ok(requirements)
}

/// Generates a requirement of the given kind `k`, if one exists.
fn get_requirement_inner(
    k: OnboardingRequirementKind,
    conn: &mut PgConn,
    uvw: &VaultWrapper<Person>,
    args: &GetRequirementsArgs,
    decrypted_values: &DecryptUncheckedResultForReqs,
    only_us_dl: bool,
) -> ApiResult<Option<OnboardingRequirement>> {
    let ob_config = &args.ob_config;
    let req = match k {
        OnboardingRequirementKind::CollectData => {
            ob_config.must_collect(DID::Id).then(|| {
                let RequirementProgress {
                    populated_attributes,
                    missing_attributes,
                } = get_progress(uvw, ob_config, DID::Id, decrypted_values);
                // if ob config needs to collect id data
                OnboardingRequirement::CollectData {
                    missing_attributes,
                    optional_attributes: ob_config.optional_data.clone(),
                    populated_attributes,
                }
            })
        }
        OnboardingRequirementKind::CollectInvestorProfile => {
            ob_config
                .must_collect(DID::InvestorProfile)
                .then(|| -> ApiResult<_> {
                    let RequirementProgress {
                        populated_attributes,
                        missing_attributes,
                    } = get_progress(uvw, ob_config, DID::InvestorProfile, decrypted_values);
                    let declarations = decrypted_values.get_di(IPK::Declarations).ok();
                    let missing_document = if let Some(declarations) = declarations {
                        let declarations: Vec<Declaration> = declarations.deserialize()?;
                        // The finra compliance doc is missing if any of the declarations require a doc and we don't
                        // yet have one on file
                        declarations.iter().any(|d| d.requires_finra_compliance_doc())
                            && !uvw.has_field(DocumentKind::FinraComplianceLetter)
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
        OnboardingRequirementKind::CollectBusinessData => {
            ob_config
                .must_collect(DID::Business)
                .then(|| -> ApiResult<_> {
                    // Use the bvw to determine which fields still need to be collected
                    let sb_id = args
                        .sb_id
                        .clone()
                        .ok_or(BusinessError::NotAllowedWithoutBusiness)?;
                    let bvw = VaultWrapper::<Business>::build(conn, VwArgs::Tenant(&sb_id))?;
                    let RequirementProgress {
                        populated_attributes,
                        missing_attributes,
                    } = get_progress(&bvw, ob_config, DID::Business, decrypted_values);
                    Ok(OnboardingRequirement::CollectBusinessData {
                        missing_attributes,
                        populated_attributes,
                    })
                })
                .transpose()?
        }
        // The below requirements we will never include when met
        // (kind of confusing in that we are checking in real-time if they've been satisifed)
        OnboardingRequirementKind::RegisterPasskey => {
            // skip passkey registration on no-phone flows
            if ob_config.is_no_phone_flow {
                None
            } else {
                let credentials = WebauthnCredential::list(conn, &uvw.vault().id)?;

                // Note: we should probably represent this another way, but for now we can determine if we want to skip passkey reg
                // by checking for this liveness event on the scoped_vault
                let liveness_skip_events =
                    LivenessEvent::get_by_scoped_vault_id(conn, &args.workflow.scoped_vault_id)?
                        .into_iter()
                        .filter(|evt| matches!(evt.liveness_source, LivenessSource::Skipped))
                        .collect_vec();

                (liveness_skip_events.is_empty() && credentials.is_empty())
                    .then_some(OnboardingRequirement::RegisterPasskey)
            }
        }
        OnboardingRequirementKind::CollectDocument => {
            let dr = DocumentRequest::get(conn, &args.workflow.id)?;
            if let Some(dr) = dr {
                let user_consent = UserConsent::get_for_workflow(conn, &args.workflow.id)?;
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
                let supported_countries = get_collect_document_supported_countries(ob_config);
                // TODO remove only_us_obc once the frontend is reading supported_countries
                let only_us_obc = supported_countries == vec![Iso3166TwoDigitCountryCode::US];
                let supported_country_and_doc_types =
                    ob_config.supported_country_mapping_for_document(country);

                should_render.then_some(OnboardingRequirement::CollectDocument {
                    document_request_id: dr.id,
                    should_collect_selfie: dr.should_collect_selfie,
                    should_collect_consent: user_consent.is_none(),
                    // TODO remove only_us_dl feature flag when all of flexcar is migrated.
                    // For now, regardless of what's on the DR for flexcar, restrict to US
                    only_us_supported: only_us_obc || only_us_dl,
                    supported_document_types: if only_us_dl {
                        vec![IdDocKind::DriversLicense]
                    } else {
                        get_collect_document_supported_doc_types(country, ob_config)
                    },
                    supported_countries,
                    supported_country_and_doc_types: supported_country_and_doc_types.0,
                })
            } else {
                None
            }
        }
        OnboardingRequirementKind::Authorize => {
            let (document_types, skipped_selfie) = if ob_config.can_access_document() {
                // Note: since we might have collected multiple documents in a given onboarding, and we'd like to authorize all of them
                let id_docs = IdentityDocument::list_by_wf_id(conn, &args.workflow.id)?;
                let doc_types = id_docs
                        .iter() // check we've actually completed the document, it's not just an empty id doc
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

            let collected_data = ob_config
                .can_access_data
                .iter()
                .filter(|cdo| {
                    // Only include CDO's from optional_data if they were collected
                    if ob_config.optional_data.contains(cdo) {
                        cdo.required_data_identifiers()
                            .into_iter()
                            .all(|di| uvw.has_field(di))
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
                authorized_at: args.workflow.authorized_at,
            })
        }
        OnboardingRequirementKind::Process => {
            if args.workflow.state.requires_user_input() {
                // If the worfklow is in a state that requires user input, make a Process requirement
                Some(OnboardingRequirement::Process)
            } else {
                None
            }
        }
    };
    Ok(req)
}

fn get_collect_document_supported_countries(obc: &ObConfiguration) -> Vec<Iso3166TwoDigitCountryCode> {
    obc.supported_country_mapping_for_document(None)
        .keys()
        .cloned()
        .collect()
}

fn get_collect_document_supported_doc_types(
    country: Option<Iso3166TwoDigitCountryCode>,
    obc: &ObConfiguration,
) -> Vec<IdDocKind> {
    obc.supported_country_mapping_for_document(country)
        .iter()
        .flat_map(|(_, id_doc_kinds)| id_doc_kinds)
        .cloned()
        .unique()
        .collect()
}
