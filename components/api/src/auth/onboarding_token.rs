use std::pin::Pin;

use actix_web::{web, FromRequest};
use db::models::{onboardings::Onboarding, user_vaults::UserVault};
use futures_util::Future;
use paperclip::actix::Apiv2Security;

use crate::State;

use super::AuthError;

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    in = "header",
    name = "X-Onboarding-Session-Token",
    description = "Session token that grants temporary access to onboard a user"
)]
pub struct OnboardingSessionTokenContext {
    // Can also store the TempTenantUserToken here if we need to access tenant info
    user_vault: UserVault,
    onboarding: Onboarding,
}

impl OnboardingSessionTokenContext {
    pub fn user_vault(&self) -> &UserVault {
        &self.user_vault
    }
    pub fn onboarding(&self) -> &Onboarding {
        &self.onboarding
    }
}

const HEADER_NAME: &str = "X-Onboarding-Session-Token";

impl FromRequest for OnboardingSessionTokenContext {
    type Error = crate::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(
        req: &actix_web::HttpRequest,
        _payload: &mut actix_web::dev::Payload,
    ) -> Self::Future {
        // get the token from the header
        let auth_token = req
            .headers()
            .get(HEADER_NAME)
            .and_then(|hv| hv.to_str().map(|s| s.to_string()).ok())
            .ok_or(AuthError::MissingOnboardingSessionToken);


        let pool = req.app_data::<web::Data<State>>().unwrap().db_pool.clone();

        Box::pin(async move {
            let (user_vault, auth_token) = db::user_vault::get_by_token(&pool, auth_token?)
                .await?;
            let onboarding = db::onboarding::get_onboarding_by_token(&pool, auth_token.h_token).await?;
            Ok(Self { 
                user_vault: user_vault,
                onboarding: onboarding 
            })
        })
    }
}