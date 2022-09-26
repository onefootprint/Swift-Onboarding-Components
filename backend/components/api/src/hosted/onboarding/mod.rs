use chrono::Duration;
use crypto::aead::ScopedSealingKey;
use db::{DbError, PgConnection};
use newtypes::{OnboardingId, SessionAuthToken};
use paperclip::actix::web;

use crate::{
    auth::session_data::{validate_user::ValidateUserToken, AuthSessionData},
    utils::session::AuthSession,
};

pub mod complete;
pub mod d2p;
pub mod kyc;
pub mod post;
pub mod skip_liveness;
pub mod status;

pub fn routes() -> web::Scope {
    web::scope("/onboarding")
        .service(web::resource("").route(web::post().to(post::handler)))
        .service(complete::handler)
        .service(status::handler)
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
