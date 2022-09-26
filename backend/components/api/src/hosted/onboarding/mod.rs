use chrono::Duration;
use crypto::aead::ScopedSealingKey;
use db::{
    models::{
        ob_configuration::ObConfiguration, onboarding::Onboarding, webauthn_credential::WebauthnCredential,
    },
    DbError, PgConnection,
};
use newtypes::{
    onboarding_requirement::OnboardingRequirement, KycStatus, OnboardingId, SessionAuthToken, UserVaultId,
};
use paperclip::actix::web;

use crate::{
    auth::session_data::{validate_user::ValidateUserToken, AuthSessionData},
    errors::{onboarding::OnboardingError, ApiResult},
    utils::{session::AuthSession, user_vault_wrapper::UserVaultWrapper},
};

pub mod authorize;
pub mod d2p;
pub mod kyc;
pub mod post;
pub mod skip_liveness;
pub mod status;

pub fn routes() -> web::Scope {
    web::scope("/onboarding")
        .service(web::resource("").route(web::post().to(post::handler)))
        .service(authorize::post)
        .service(status::get)
        .service(kyc::get)
        .service(kyc::post)
        .service(skip_liveness::post)
        .service(d2p::routes())
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
    user_vault_id: &UserVaultId,
    ob_config: &ObConfiguration,
) -> ApiResult<(Vec<OnboardingRequirement>, Onboarding)> {
    let uvw = UserVaultWrapper::get(conn, user_vault_id)?;
    let onboarding = Onboarding::get_by_config(conn, user_vault_id, &ob_config.id)?
        .ok_or(OnboardingError::NoOnboarding)?;
    let creds = WebauthnCredential::get_for_user_vault(conn, user_vault_id)?;
    let missing_attributes = uvw.missing_fields(ob_config);
    let requirements = vec![
        (onboarding.kyc_status == KycStatus::New)
            .then_some(OnboardingRequirement::IdentityCheck { missing_attributes }),
        (creds.is_empty() && !onboarding.is_liveness_skipped).then_some(OnboardingRequirement::Liveness),
        // TODO generate CollectDocument requirement
    ]
    .into_iter()
    .flatten()
    .collect();
    Ok((requirements, onboarding))
}
