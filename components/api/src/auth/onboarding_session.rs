use super::{AuthError, UserVaultPermissions};
use crate::{errors::ApiError, State};
use actix_web::{web, FromRequest};
use db::models::session_data::onboarding::{OnboardingSessionData, OnboardingSessionKind};
use db::models::session_data::SessionState;
use db::models::user_vaults::UserVault;
use futures_util::Future;
use paperclip::actix::Apiv2Security;
use std::pin::Pin;

const HEADER_NAME: &str = "X-Fpuser-Authorization";

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    in = "header",
    name = "X-Fpuser-Authorization",
    description = "Footprint user auth token, issued by /identify/verify"
)]
/// Logged in session context sets encrypted state that authenticates the client as a user.
pub struct OnboardingSessionContext {
    user_vault: UserVault,
    session_data: OnboardingSessionData,
    pub auth_token: String,
}

impl OnboardingSessionContext {
    pub fn user_vault(&self) -> &UserVault {
        &self.user_vault
    }

    pub fn session_data(&self) -> &OnboardingSessionData {
        &self.session_data
    }
}

impl FromRequest for OnboardingSessionContext {
    type Error = ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        let pool = req.app_data::<web::Data<State>>().unwrap().db_pool.clone();

        let auth_token = req
            .headers()
            .get(HEADER_NAME)
            .and_then(|hv| hv.to_str().map(|s| s.to_string()).ok())
            .ok_or(AuthError::MissingFpuserAuthHeader);

        Box::pin(async move {
            let auth_token = auth_token?;

            let session = db::session::get_by_session_id(&pool, auth_token.clone())
                .await?
                .ok_or(AuthError::NoSessionFound)?;
            // Actually verify that the session is the correct type
            let session_data =
                if let SessionState::OnboardingSession(session_data) = session.session_data.clone() {
                    Ok(session_data)
                } else {
                    Err(AuthError::SessionTypeError)
                }?;
            let user_vault = db::user_vault::get_by_onboarding_session(&pool, auth_token.clone()).await?;

            Ok(Self {
                user_vault,
                session_data,
                auth_token,
            })
        })
    }
}

impl UserVaultPermissions for OnboardingSessionContext {
    fn can_decrypt(&self, _data_kinds: Vec<newtypes::DataKind>) -> bool {
        false
    }

    // TODO -- scope based off of what types the tenant is authorized for
    fn can_modify(&self, _data_kinds: Vec<newtypes::DataKind>) -> bool {
        match self.session_data().kind {
            OnboardingSessionKind::Normal => true,
            OnboardingSessionKind::D2pSession(_) => false,
        }
    }
}
