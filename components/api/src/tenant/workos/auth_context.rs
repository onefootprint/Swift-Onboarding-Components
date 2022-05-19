use std::pin::Pin;

use actix_session::Session;
use actix_web::{web, FromRequest};
use db::models::tenants::Tenant;
use futures_util::Future;
use paperclip::actix::Apiv2Security;
use serde::{Deserialize, Serialize};

use crate::{errors::ApiError, State};

use crate::auth::AuthError;

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    in = "header",
    name = "Cookie",
    description = "Session state cookie"
)]
pub struct WorkOSAuthContext {
    _tenant: Tenant,
    pub metadata: WorkOSAuthMetadata,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkOSAuthMetadata {
    pub email: String,
    pub org_id: String,
}

impl WorkOSAuthMetadata {
    pub const COOKIE_NAME: &'static str = "workos_session";

    pub fn get(session: &Session) -> Result<Self, AuthError> {
        session
            .get(Self::COOKIE_NAME)
            .map_err(AuthError::InvalidSessionJson)?
            .ok_or(AuthError::MissingCookie)
    }

    pub fn set(self, session: &Session) -> Result<(), AuthError> {
        session
            .insert(Self::COOKIE_NAME, self)
            .map_err(AuthError::InvalidSessionJson)
    }
}

impl FromRequest for WorkOSAuthContext {
    type Error = ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(
        req: &actix_web::HttpRequest,
        _payload: &mut actix_web::dev::Payload,
    ) -> Self::Future {
        let session = Session::extract(req);
        let pool = req.app_data::<web::Data<State>>().unwrap().db_pool.clone();

        Box::pin(async move {
            let session = session.await.map_err(AuthError::SessionError)?;
            let metadata = WorkOSAuthMetadata::get(&session)?;

            let tenant = db::tenant::get_by_workos_id(&pool, metadata.org_id.clone()).await?;

            Ok(Self {
                _tenant: tenant,
                metadata,
            })
        })
    }
}
