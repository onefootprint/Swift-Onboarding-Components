use crate::utils::vault_wrapper::{Business, Person, VaultWrapper, VwArgs};
use api_core::{
    auth::user::{CheckedUserObAuthContext, UserObSession},
    errors::{business::BusinessError, ApiResult},
    State,
};
use api_wire_types::hosted::onboarding_requirement::{AuthorizeFields, OnboardingRequirement};
use db::{
    models::{
        document_request::DocumentRequest, identity_document::IdentityDocument,
        liveness_event::LivenessEvent, ob_configuration::ObConfiguration, user_consent::UserConsent,
    },
    PgConn,
};
use either::Either;
use itertools::Itertools;
use newtypes::{
    CollectedDataOption, DataIdentifierDiscriminant, Declaration, DocumentKind, InvestorProfileKind as IPK,
    PiiString, ScopedVaultId,
};
use paperclip::actix::web;

mod authorize;
mod d2p;
mod fingerprint_visit;
mod index;
mod pat;
mod skip_liveness;
mod socure_device;
mod status;
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
        .service(validate::post);

    d2p::routes(config);
}

#[tracing::instrument(skip_all)]
pub async fn get_requirements(
    state: &State,
    user_auth: CheckedUserObAuthContext,
) -> ApiResult<(Vec<OnboardingRequirement>, CheckedUserObAuthContext)> {
    // Fetch the UVW and use it to decrypt IPK::Declarations, if they exist
    let su_id = user_auth.scoped_user.id.clone();
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

    let (requirements, user_auth) = state
        .db_pool
        .db_query(|conn| -> ApiResult<_> {
            let scoped_business_id = user_auth.scoped_business_id();
            let requirements =
                get_requirements_inner(conn, uvw, &user_auth, scoped_business_id, declarations)?;
            Ok((requirements, user_auth))
        })
        .await??;
    Ok((requirements, user_auth))
}

struct RequirementProgress {
    populated_attributes: Vec<CollectedDataOption>,
    missing_attributes: Vec<CollectedDataOption>,
}

fn get_progress<Type>(
    vw: &VaultWrapper<Type>,
    ob_config: &ObConfiguration,
    di_kind: DataIdentifierDiscriminant,
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
fn get_requirements_inner(
    conn: &mut PgConn,
    uvw: VaultWrapper<Person>,
    ob_info: &UserObSession,
    scoped_business_id: Option<ScopedVaultId>,
    declarations: Option<PiiString>,
) -> ApiResult<Vec<OnboardingRequirement>> {
    let ob_config = ob_info.ob_config()?;
    let id_req = {
        let RequirementProgress {
            populated_attributes,
            missing_attributes,
        } = get_progress(&uvw, ob_config, DataIdentifierDiscriminant::Id);
        (!missing_attributes.is_empty()).then_some(OnboardingRequirement::CollectData {
            missing_attributes,
            populated_attributes,
        })
    };
    let ip_req = {
        let RequirementProgress {
            populated_attributes,
            missing_attributes,
        } = get_progress(&uvw, ob_config, DataIdentifierDiscriminant::InvestorProfile);
        let missing_document = if let Some(declarations) = declarations {
            let declarations: Vec<Declaration> = declarations.deserialize()?;
            // The finra compliance doc is missing if any of the declarations require a doc and we don't
            // yet have one on file
            declarations.iter().any(|d| d.requires_finra_compliance_doc())
                && !uvw.has_field(DocumentKind::FinraComplianceLetter)
        } else {
            false
        };
        (!missing_attributes.is_empty() || missing_document).then_some(
            OnboardingRequirement::CollectInvestorProfile {
                missing_attributes,
                populated_attributes,
                missing_document,
            },
        )
    };
    let biz_req = if ob_config.must_collect_business() {
        // Use the bvw to determine which fields still need to be collected
        let scoped_business_id = scoped_business_id.ok_or(BusinessError::NotAllowedWithoutBusiness)?;
        let bvw = VaultWrapper::<Business>::build(conn, VwArgs::Tenant(&scoped_business_id))?;
        let RequirementProgress {
            populated_attributes,
            missing_attributes,
        } = get_progress(&bvw, ob_config, DataIdentifierDiscriminant::Business);

        (!missing_attributes.is_empty()).then_some(OnboardingRequirement::CollectBusinessData {
            missing_attributes,
            populated_attributes,
        })
    } else {
        None
    };
    let liveness_req = {
        // TODO: force liveness checks to be re-done and not shared across tenants
        // RELATED: FP-1802 and FP-1800
        let liveness_events = LivenessEvent::get_by_user_vault_id(conn, &uvw.vault.id)?;
        liveness_events
            .is_empty()
            .then_some(OnboardingRequirement::Liveness)
    };
    let doc_req = {
        // Document requirements are determined by the presence of DocumentRequest database objects.
        // In various places in the codebase, we will determine if a DocumentRequest should be created
        //    -For example, when IDology cannot verify a user using just inputted data, they may ask for a document. In that instance
        //      we will create a DocumentRequest row.
        let user_consent = UserConsent::latest_for_onboarding(conn, &ob_info.onboarding()?.id)?;
        let doc_request = DocumentRequest::get_active(conn, &ob_info.scoped_user.id)?;
        doc_request.map(|dr| OnboardingRequirement::CollectDocument {
            document_request_id: dr.id,
            should_collect_selfie: dr.should_collect_selfie,
            should_collect_consent: dr.should_collect_selfie && user_consent.is_none(),
        })
    };
    let authorize_req = if ob_info.onboarding()?.authorized_at.is_none() {
        let identity_document_types = if ob_config.can_access_document() {
            // Note: since we might have collected multiple documents in a given onboarding, and we'd like to authorize all of them
            let id_docs = IdentityDocument::get_for_scoped_vault_id(conn, &ob_info.scoped_user.id)?;
            id_docs.iter().map(|id| id.document_type).unique().collect()
        } else {
            vec![]
        };

        let fields_to_authorize = AuthorizeFields {
            collected_data: ob_config.can_access_data.clone(),
            identity_document_types,
        };
        Some(OnboardingRequirement::Authorize { fields_to_authorize })
    } else {
        None
    };

    let requirements = vec![id_req, ip_req, biz_req, liveness_req, doc_req, authorize_req]
        .into_iter()
        .flatten()
        .collect();

    tracing::info!(onboarding_id=%ob_info.onboarding()?.id, requirements=%format!("{:?}", requirements), scoped_user_id=%ob_info.scoped_user.id, "get_requirements result");

    Ok(requirements)
}
