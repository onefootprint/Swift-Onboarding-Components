use std::pin::Pin;

use actix_web::{web, FromRequest};
use db::models::users::User;
use futures_util::Future;

use crate::State;

use super::AuthError;

#[derive(Debug, Clone)]
pub struct TenantUserTokenContext {
    // Can also store the TempTenantUserToken here if we need to access tenant info
    user: User,
}

impl TenantUserTokenContext {
    pub fn user(&self) -> &User {
        &self.user
    }
}

const HEADER_NAME: &str = "X-Tenant-User-Token";

impl FromRequest for TenantUserTokenContext {
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
            .ok_or(AuthError::MissingTenantUserTokenAuthHeader);

        let pool = req.app_data::<web::Data<State>>().unwrap().db_pool.clone();

        Box::pin(async move {
            let (user, _) = db::user::get_by_token(&pool, auth_token?)
                .await?;
            Ok(Self { user })
        })
    }
}
