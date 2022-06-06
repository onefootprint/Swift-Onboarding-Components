use std::pin::Pin;

use actix_web::FromRequest;
use db::models::tenants::Tenant;
use futures_util::Future;
use paperclip::actix::{web, Apiv2Schema};

use crate::{
    auth::{
        client_secret_key::{self, SecretTenantAuthContext},
        AuthError, UserVaultPermissions,
    },
    errors::ApiError,
};

use self::workos::workos_dashboard_auth::{self, DashboardSessionContext};

pub mod access_events;
pub mod decrypt;
pub mod onboardings;
pub mod required_data;
pub mod workos;

#[derive(Debug, Clone, Apiv2Schema)]
pub enum AuthContext {
    UserSessionContext(DashboardSessionContext),
    ApiSessionContext(SecretTenantAuthContext),
}

impl AuthContext {
    pub fn tenant(&self) -> &Tenant {
        match self {
            AuthContext::UserSessionContext(context) => context.tenant(),
            AuthContext::ApiSessionContext(context) => context.tenant(),
        }
    }
}

impl FromRequest for AuthContext {
    type Error = ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(
        req: &actix_web::HttpRequest,
        _payload: &mut actix_web::dev::Payload,
    ) -> Self::Future {
        let static_req = req.clone();
        if req
            .headers()
            .contains_key(workos_dashboard_auth::HEADER_NAME)
        {
            Box::pin(async move {
                Ok(AuthContext::UserSessionContext(
                    workos_dashboard_auth::from_request_inner(&static_req).await?,
                ))
            })
        } else if req.headers().contains_key(client_secret_key::HEADER_NAME) {
            Box::pin(async move {
                Ok(AuthContext::ApiSessionContext(
                    client_secret_key::from_request_inner(&static_req).await?,
                ))
            })
        } else {
            Box::pin(async move { Err(ApiError::from(AuthError::UnknownClient)) })
        }
    }
}

impl UserVaultPermissions for AuthContext {
    fn can_decrypt(&self, _data_kinds: Vec<newtypes::DataKind>) -> bool {
        true
    }

    fn can_modify(&self, _data_kinds: Vec<newtypes::DataKind>) -> bool {
        true
    }
}

pub fn routes() -> web::Scope {
    web::scope("/org")
        .service(access_events::handler)
        .service(decrypt::handler)
        .service(onboardings::handler)
        .service(required_data::set)
        .service(required_data::get)
}
