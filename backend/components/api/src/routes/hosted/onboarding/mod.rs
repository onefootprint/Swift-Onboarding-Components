use chrono::Duration;
use crypto::aead::ScopedSealingKey;
use db::{
    models::{
        document_request::DocumentRequest, identity_document::IdentityDocument,
        liveness_event::LivenessEvent, ob_configuration::ObConfiguration, onboarding::Onboarding,
    },
    DbError, PgConnection,
};
use newtypes::{CollectedDataOption, OnboardingId, SessionAuthToken, UserVaultId};
use paperclip::actix::web;

use crate::{
    auth::session::AuthSessionData,
    auth::user::{AuthedOnboardingInfo, ValidateUserToken},
    errors::ApiResult,
    types::onboarding_requirement::OnboardingRequirement,
    utils::{session::AuthSession, user_vault_wrapper::UserVaultWrapper},
};
use itertools::Itertools;
use paperclip::actix::Apiv2Schema;

pub mod authorize;
pub mod d2p;
pub mod index;
pub mod kyc;
pub mod pat;
pub mod skip_liveness;
pub mod socure_device;
pub mod status;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(index::post)
        .service(authorize::post)
        .service(status::get)
        .service(kyc::get)
        .service(kyc::post)
        .service(skip_liveness::post)
        .service(pat::get)
        .service(socure_device::post);
    d2p::routes(config);
}

fn create_onboarding_validation_token(
    conn: &mut PgConnection,
    session_sealing_key: &ScopedSealingKey,
    ob_id: OnboardingId,
) -> Result<SessionAuthToken, DbError> {
    let validation_token = AuthSession::create_sync(
        conn,
        session_sealing_key,
        AuthSessionData::ValidateUserToken(ValidateUserToken { ob_id }),
        Duration::minutes(15),
    )?;
    Ok(validation_token)
}

pub fn get_requirements(
    conn: &mut PgConnection,
    ob_info: &AuthedOnboardingInfo,
) -> ApiResult<(Vec<OnboardingRequirement>, Onboarding)> {
    let ob_config_id = &ob_info.ob_config.id;
    let scoped_user_id = &ob_info.scoped_user.id;

    let uvw = UserVaultWrapper::build_for_onboarding(conn, scoped_user_id)?;
    let (onboarding, _, _, _) = Onboarding::get(conn, (&uvw.user_vault.id, ob_config_id))?;
    let missing_attributes = uvw.missing_fields(&ob_info.ob_config);
    // Document requirements are determined by the presence of DocumentRequest database objects.
    // In various places in the codebase, we will determine if a DocumentRequest should be created
    //    -For example, when IDology cannot verify a user using just inputted data, they may ask for a document. In that instance
    //      we will create a DocumentRequest row.
    let document_request_requirements = DocumentRequest::get_active_requests(conn, scoped_user_id)?
        .into_iter()
        .map(|request| OnboardingRequirement::CollectDocument {
            document_request_id: request.id,
        });

    // TODO: force liveness checks to be re-done and not shared across tenants
    // RELATED: FP-1802 and FP-1800
    let liveness_events = LivenessEvent::get_by_user_vault_id(conn, &uvw.user_vault.id)?;

    // See if we need to run identity checks and ultimately produce a decision. We do this in 2 scenarios:
    //   1. we have not done it at all (!idv_reqs_initiated)
    //   2. we need to re-run the decision engine to produce a decision after a step up (!has_final_decision)\
    //
    // TODO this is slightly overloaded and maybe we need another requirement?
    let identity_check_required = !(onboarding.idv_reqs_initiated && onboarding.has_final_decision);

    let requirements = vec![
        (!missing_attributes.is_empty()).then_some(OnboardingRequirement::CollectData { missing_attributes }),
        // check if we have liveness events
        liveness_events
            .is_empty()
            .then_some(OnboardingRequirement::Liveness),
        (identity_check_required).then_some(OnboardingRequirement::IdentityCheck),
    ]
    .into_iter()
    .flatten()
    .chain(document_request_requirements)
    .collect();

    Ok((requirements, onboarding))
}

/// This function gets all the fields the User needs to authorize the Tenant having access to.
/// Since we don't know the type of the document until the User selects it and we process it, we
/// need to check the IdentityDocument table for documents gathered during the onboarding
#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct AuthorizeFields {
    collected_data: Vec<CollectedDataOption>,
    identity_document_types: Vec<String>,
}
pub fn get_fields_to_authorize(
    conn: &mut PgConnection,
    user_vault_id: &UserVaultId,
    ob_config: &ObConfiguration,
) -> ApiResult<AuthorizeFields> {
    let (onboarding, _, _, _) = Onboarding::get(conn, (user_vault_id, &ob_config.id))?;

    let mut identity_documents: Vec<String> = vec![];
    if ob_config.can_access_identity_document_images {
        // Note: since we might have collected multiple documents in a given onboarding, and we'd like to authorize all of them
        identity_documents = IdentityDocument::get_for_scoped_user_id(conn, &onboarding.scoped_user_id)?
            .into_iter()
            .map(|id| id.document_type)
            .unique()
            .collect()
    }

    let res = AuthorizeFields {
        collected_data: ob_config.can_access_data.clone(),
        identity_document_types: identity_documents,
    };

    Ok(res)
}
