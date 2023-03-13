use crate::{
    auth::session::AuthSessionData,
    auth::user::{AuthedOnboardingInfo, ValidateUserToken},
    errors::{user::UserError, ApiResult},
    utils::{
        self,
        session::AuthSession,
        vault_wrapper::{VaultWrapper, VwArgs},
    },
};
use api_wire_types::hosted::onboarding_requirement::{AuthorizeFields, OnboardingRequirement};
use chrono::Duration;
use crypto::aead::ScopedSealingKey;
use db::{
    models::{
        document_request::DocumentRequest, identity_document::IdentityDocument,
        liveness_event::LivenessEvent, ob_configuration::ObConfiguration, onboarding::Onboarding,
        user_consent::UserConsent,
    },
    DbError, PgConn,
};
use itertools::Itertools;
use newtypes::{OnboardingId, ScopedVaultId, SessionAuthToken, VaultId};
use paperclip::actix::web;

pub mod authorize;
pub mod d2p;
pub mod fingerprint_visit;
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
        .service(skip_liveness::post)
        .service(fingerprint_visit::post)
        .service(pat::get)
        .service(socure_device::post);

    d2p::routes(config);
}

fn create_onboarding_validation_token(
    conn: &mut PgConn,
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

#[tracing::instrument(skip_all)]
pub fn get_requirements(
    conn: &mut PgConn,
    ob_info: &AuthedOnboardingInfo,
    scoped_business_id: Option<ScopedVaultId>,
) -> ApiResult<(Vec<OnboardingRequirement>, Onboarding)> {
    let ob_config_id = &ob_info.ob_config.id;
    let scoped_user_id = &ob_info.scoped_user.id;

    let uvw = VaultWrapper::build(conn, VwArgs::Tenant(scoped_user_id))?;
    let (onboarding, _, _, _) = Onboarding::get(conn, (&uvw.vault.id, ob_config_id))?;
    let missing_id_fields = uvw.missing_identity_fields(&ob_info.ob_config);

    // Fetch missing business fields
    let missing_business_fields = if ob_info.ob_config.must_collect_business() {
        let scoped_business_id = scoped_business_id.ok_or(UserError::NotAllowedWithoutBusiness)?;
        let bvw = VaultWrapper::build(conn, VwArgs::Tenant(&scoped_business_id))?;
        bvw.missing_business_fields(&ob_info.ob_config)
    } else {
        vec![]
    };

    // Document requirements are determined by the presence of DocumentRequest database objects.
    // In various places in the codebase, we will determine if a DocumentRequest should be created
    //    -For example, when IDology cannot verify a user using just inputted data, they may ask for a document. In that instance
    //      we will create a DocumentRequest row.
    let user_consent = UserConsent::latest_for_onboarding(conn, &ob_info.onboarding.id)?;

    let doc_request_result = DocumentRequest::get_active(conn, scoped_user_id);
    // Handle not finding an active request differently than other db errors
    let document_request_requirements = match doc_request_result {
        Err(e) => {
            if e.is_not_found() {
                Ok(vec![])
            } else {
                Err(e)
            }
        }
        Ok(doc_request) => Ok(vec![OnboardingRequirement::CollectDocument {
            document_request_id: doc_request.id,
            should_collect_selfie: doc_request.should_collect_selfie,
            should_collect_consent: doc_request.should_collect_selfie && user_consent.is_none(),
        }]),
    }?;

    // TODO: force liveness checks to be re-done and not shared across tenants
    // RELATED: FP-1802 and FP-1800
    let liveness_events = LivenessEvent::get_by_user_vault_id(conn, &uvw.vault.id)?;

    let requirements = vec![
        (!missing_id_fields.is_empty()).then_some(OnboardingRequirement::CollectData {
            missing_attributes: missing_id_fields,
        }),
        (!missing_business_fields.is_empty()).then_some(OnboardingRequirement::CollectBusinessData {
            missing_attributes: missing_business_fields,
        }),
        // check if we have liveness events
        liveness_events
            .is_empty()
            .then_some(OnboardingRequirement::Liveness),
    ]
    .into_iter()
    .flatten()
    .chain(document_request_requirements)
    .collect();

    tracing::info!(onboarding_id=%onboarding.id, requirements=%format!("{:?}", requirements), scoped_user_id=%scoped_user_id, "get_requirements result");

    Ok((requirements, onboarding))
}

/// This function gets all the fields the User needs to authorize the Tenant having access to.
/// Since we don't know the type of the document until the User selects it and we process it, we
/// need to check the IdentityDocument table for documents gathered during the onboarding
pub fn get_fields_to_authorize(
    conn: &mut PgConn,
    user_vault_id: &VaultId,
    ob_config: &ObConfiguration,
) -> ApiResult<AuthorizeFields> {
    let (onboarding, _, _, _) = Onboarding::get(conn, (user_vault_id, &ob_config.id))?;

    let mut identity_document_types: Vec<_> = vec![];
    let mut selfie_collected = false;
    if ob_config.can_access_document() {
        // Note: since we might have collected multiple documents in a given onboarding, and we'd like to authorize all of them
        let identity_documents = IdentityDocument::get_for_scoped_user_id(conn, &onboarding.scoped_user_id)?;

        identity_document_types = identity_documents
            .iter()
            .map(|id| id.document_type)
            .unique()
            .collect();

        if ob_config.can_access_selfie() {
            selfie_collected = identity_documents
                .iter()
                .any(utils::identity_document::id_doc_collected_selfie);
        }
    }

    let res = AuthorizeFields {
        collected_data: ob_config.can_access_data.clone(),
        identity_document_types,
        selfie_collected,
    };

    Ok(res)
}
