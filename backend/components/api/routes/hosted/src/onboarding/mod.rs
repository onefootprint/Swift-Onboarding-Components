use std::sync::Arc;

use crate::utils::vault_wrapper::{Business, Person, VaultWrapper, VwArgs};
use api_core::{
    auth::user::CheckedUserObAuthContext,
    errors::{business::BusinessError, ApiResult},
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
    AuthorizeFields, DocumentCdoInfo, IdentityDocumentStatus, LivenessSource, OnboardingRequirement,
    OnboardingRequirementKind, Selfie,
};
use newtypes::{
    CollectedDataOption, DataIdentifierDiscriminant as DID, Declaration, DocumentKind, IdDocKind,
    InvestorProfileKind as IPK, PiiString, ScopedVaultId,
};
use paperclip::actix::web;
use strum::IntoEnumIterator;

mod authorize;
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
        .service(stytch::post);

    d2p::routes(config);
}

pub struct GetRequirementsArgs {
    pub ob_config: ObConfiguration,
    pub workflow: Workflow,
    pub sb_id: Option<ScopedVaultId>,
}

impl GetRequirementsArgs {
    fn from(value: &CheckedUserObAuthContext) -> ApiResult<Self> {
        Ok(Self {
            ob_config: value.ob_config()?.clone(),
            workflow: value.workflow()?.clone(),
            sb_id: value.scoped_business_id(),
        })
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
    let declarations = uvw
        .decrypt_unchecked_single(&state.enclave_client, IPK::Declarations.into())
        .await?;

    let ff_client = state.feature_flag_client.clone();
    let requirements = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let requirements = get_requirements_inner(conn, uvw, args, declarations, ff_client)?;
            Ok(requirements)
        })
        .await??;
    Ok(requirements)
}

struct RequirementProgress {
    populated_attributes: Vec<CollectedDataOption>,
    missing_attributes: Vec<CollectedDataOption>,
}

fn get_progress<Type>(
    vw: &VaultWrapper<Type>,
    ob_config: &ObConfiguration,
    di_kind: DID,
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
            let has_all_dis = cdo
                .required_data_identifiers()
                .into_iter()
                .all(|di| vw.has_field(di));

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
    declarations: Option<PiiString>,
    ff_client: Arc<dyn FeatureFlagClient>,
) -> ApiResult<Vec<OnboardingRequirement>> {
    let only_us_dl = ff_client.flag(BoolFlag::RestrictToUsDriversLicense(&args.ob_config.tenant_id));

    // Depending on the workflow that we are running, we only want to show a subset of requirements
    let relevant_requirement_kinds = args.workflow.state.relevant_requirements();

    // For each requirement kind that might be shown by this workflow, generate a requirement if
    // necessary
    let requirements = relevant_requirement_kinds
        .into_iter()
        .map(|k| get_requirement_inner(k, conn, &uvw, &args, declarations.as_ref(), only_us_dl))
        .collect::<ApiResult<Vec<_>>>()?
        .into_iter()
        .flatten()
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
    declarations: Option<&PiiString>,
    only_us_dl: bool,
) -> ApiResult<Option<OnboardingRequirement>> {
    let ob_config = &args.ob_config;
    let req = match k {
        OnboardingRequirementKind::CollectData => {
            ob_config.must_collect(DID::Id).then(|| {
                let RequirementProgress {
                    populated_attributes,
                    missing_attributes,
                } = get_progress(uvw, ob_config, DID::Id);
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
                    } = get_progress(uvw, ob_config, DID::InvestorProfile);
                    let missing_document = if let Some(declarations) = declarations.as_ref() {
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
                    } = get_progress(&bvw, ob_config, DID::Business);
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
                let credentials = WebauthnCredential::get_for_user_vault(conn, &uvw.vault().id)?;

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
                // Show a CollectDocument requirement if there's no id_document or the existing
                // id_document is still Pending
                let should_render = id_doc.is_empty()
                    || id_doc
                        .into_iter()
                        .any(|d| d.status == IdentityDocumentStatus::Pending);
                let only_us_dr = dr.only_us();
                should_render.then_some(OnboardingRequirement::CollectDocument {
                    document_request_id: dr.id,
                    should_collect_selfie: dr.should_collect_selfie,
                    should_collect_consent: user_consent.is_none(),
                    // TODO remove only_us_dl feature flag when all of flexcar is migrated.
                    // For now, regardless of what's on the DR for flexcar, restrict to US
                    only_us_supported: only_us_dr || only_us_dl,
                    supported_document_types: if let Some(doc_types) = dr.global_doc_types_accepted {
                        doc_types
                    } else if only_us_dl {
                        vec![IdDocKind::DriversLicense]
                    } else {
                        IdDocKind::iter().collect()
                    },
                })
            } else {
                None
            }
        }
        OnboardingRequirementKind::Authorize => {
            if args.workflow.authorized_at.is_none() {
                let (document_types, skipped_selfie) = if ob_config.can_access_document() {
                    // Note: since we might have collected multiple documents in a given onboarding, and we'd like to authorize all of them
                    let id_docs = IdentityDocument::list_by_wf_id(conn, &args.workflow.id)?;
                    let doc_types = id_docs.iter().map(|id| id.document_type).unique().collect();
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
                    .cloned()
                    .collect();

                let fields_to_authorize = AuthorizeFields {
                    collected_data,
                    document_types,
                };
                Some(OnboardingRequirement::Authorize { fields_to_authorize })
            } else {
                None
            }
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
