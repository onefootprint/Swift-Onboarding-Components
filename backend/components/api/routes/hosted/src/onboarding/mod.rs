use std::sync::Arc;

use crate::utils::vault_wrapper::{Business, Person, VaultWrapper, VwArgs};
use api_core::{
    auth::user::CheckedUserObAuthContext,
    errors::{business::BusinessError, ApiResult},
    State,
};
use db::{
    models::{
        document_request::{DocRequestIdentifier, DocumentRequest},
        identity_document::IdentityDocument,
        liveness_event::LivenessEvent,
        ob_configuration::ObConfiguration,
        onboarding::Onboarding,
        user_consent::UserConsent,
        workflow::Workflow,
    },
    PgConn,
};
use either::Either;
use feature_flag::{BoolFlag, FeatureFlagClient};
use itertools::Itertools;
use newtypes::{AuthorizeFields, IdentityDocumentStatus, OnboardingRequirement, OnboardingRequirementKind};
use newtypes::{
    CollectedDataOption, DataIdentifierDiscriminant as DID, Declaration, DocumentKind,
    InvestorProfileKind as IPK, ModernIdDocKind, PiiString, ScopedVaultId,
};
use paperclip::actix::web;
use strum::IntoEnumIterator;

mod authorize;
mod d2p;
mod fingerprint_visit;
mod index;
pub use index::get_or_start_onboarding;
mod pat;
mod process;
mod skip_liveness;
mod socure_device;
mod status;
mod stytch;
mod validate;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(index::post)
        .service(authorize::post)
        .service(status::get)
        .service(skip_liveness::post)
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
    pub onboarding: Onboarding,
    pub workflow: Option<Workflow>,
    pub sb_id: Option<ScopedVaultId>,
}

impl GetRequirementsArgs {
    fn from(value: &CheckedUserObAuthContext) -> ApiResult<Self> {
        Ok(Self {
            ob_config: value.ob_config()?.clone(),
            onboarding: value.onboarding()?.clone(),
            workflow: value.workflow().cloned(),
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
    let su_id = args.onboarding.scoped_vault_id.clone();
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
    let (populated_attributes, missing_attributes) = ob_config
        .must_collect_data
        .iter()
        .filter(|cdo| cdo.parent().data_identifier_kind() == di_kind)
        .cloned()
        .partition_map(|cdo| {
            let has_all_dis = cdo
                .required_data_identifiers()
                .into_iter()
                .all(|di| vw.has_field(di));
            match has_all_dis {
                true => Either::Left(cdo),
                false => Either::Right(cdo),
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
    let relevant_requirement_kinds = args
        .workflow
        .as_ref()
        .map(|wf| wf.state.relevant_requirements())
        .unwrap_or_else(|| OnboardingRequirementKind::iter().collect());

    // For each requirement kind that might be shown by this workflow, generate a requirement if
    // necessary
    let requirements = relevant_requirement_kinds
        .into_iter()
        .map(|k| get_requirement_inner(k, conn, &uvw, &args, declarations.as_ref(), only_us_dl))
        .collect::<ApiResult<Vec<_>>>()?
        .into_iter()
        .flatten()
        .collect();

    tracing::info!(onboarding_id=%args.onboarding.id, requirements=%format!("{:?}", requirements), scoped_user_id=%args.onboarding.scoped_vault_id, "get_requirements result");

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
        // TODO the below requirements we will never include when met, kind of confusing
        OnboardingRequirementKind::Liveness => {
            // TODO: force liveness checks to be re-done and not shared across tenants
            // RELATED: FP-1802 and FP-1800
            let liveness_events = LivenessEvent::get_by_user_vault_id(conn, &uvw.vault.id)?;
            liveness_events
                .is_empty()
                .then_some(OnboardingRequirement::Liveness)
        }
        OnboardingRequirementKind::CollectDocument => {
            let user_consent = UserConsent::latest_for_onboarding(conn, &args.onboarding.id)?;
            let identifier = DocRequestIdentifier {
                sv_id: &args.onboarding.scoped_vault_id,
                wf_id: args.workflow.as_ref().map(|wf| &wf.id),
            };
            if let Some(dr) = DocumentRequest::get(conn, identifier)? {
                let id_doc = IdentityDocument::list_by_request_id(conn, &dr.id)?;
                // Show a CollectDocument requirement if there's no id_document or the existing
                // id_document is still Pending
                let should_render = id_doc.is_empty()
                    || id_doc
                        .into_iter()
                        .any(|d| d.status == IdentityDocumentStatus::Pending);
                should_render.then_some(OnboardingRequirement::CollectDocument {
                    document_request_id: dr.id,
                    should_collect_selfie: dr.should_collect_selfie,
                    should_collect_consent: dr.should_collect_selfie && user_consent.is_none(),
                    // TODO remove only_us_dl feature flag when all of flexcar is migrated.
                    // For now, regardless of what's on the DR for flexcar, restrict to US
                    only_us_supported: dr.only_us || only_us_dl,
                    supported_document_types: if let Some(doc_types) = dr.doc_type_restriction {
                        doc_types
                    } else if only_us_dl {
                        vec![ModernIdDocKind::DriversLicense]
                    } else {
                        ModernIdDocKind::iter().collect()
                    },
                })
            } else {
                None
            }
        }
        OnboardingRequirementKind::Authorize => {
            if args.onboarding.authorized_at.is_none() {
                let document_types = if ob_config.can_access_document() {
                    // Note: since we might have collected multiple documents in a given onboarding, and we'd like to authorize all of them
                    let id_docs = IdentityDocument::list(conn, &args.onboarding.scoped_vault_id)?;
                    id_docs.iter().map(|id| id.document_type).unique().collect()
                } else {
                    vec![]
                };

                let fields_to_authorize = AuthorizeFields {
                    collected_data: ob_config.can_access_data.clone(),
                    document_types,
                };
                Some(OnboardingRequirement::Authorize { fields_to_authorize })
            } else {
                None
            }
        }
        OnboardingRequirementKind::Process => {
            if args.workflow.as_ref().map(|wf| wf.state.requires_user_input()) == Some(true) {
                // If the worfklow is in a state that requires user input, make a Process requirement
                Some(OnboardingRequirement::Process)
            } else {
                None
            }
        }
    };
    Ok(req)
}
