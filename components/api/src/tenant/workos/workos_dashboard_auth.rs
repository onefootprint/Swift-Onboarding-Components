use crate::auth::AuthError;
use crate::{errors::ApiError, State};
use actix_web::{web, FromRequest};
use db::models::session_data::{SessionState, TenantDashboardSessionData};
use db::models::tenants::Tenant;
use futures_util::Future;
use paperclip::actix::Apiv2Security;
use std::pin::Pin;

#[derive(Debug, Clone, Apiv2Security)]
#[openapi(
    apiKey,
    in = "header",
    name = "X-Fp-Dashbaord-Authorization",
    description = "Footprint user auth token, issued by /identify/verify"
)]
/// Logged in session context sets encrypted state that authenticates the client as a user.
pub struct DashboardSessionContext {
    tenant: Tenant,
    _metadata: TenantDashboardSessionData,
    pub auth_token: String,
}

impl DashboardSessionContext {
    pub fn tenant(&self) -> &Tenant {
        &self.tenant
    }
}

pub const HEADER_NAME: &str = "X-Fp-Dashboard-Authorization";

impl FromRequest for DashboardSessionContext {
    type Error = ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(
        req: &actix_web::HttpRequest,
        _payload: &mut actix_web::dev::Payload,
    ) -> Self::Future {
        let static_req = req.clone();
        Box::pin(async move { from_request_inner(&static_req).await })
    }
}

pub async fn from_request_inner(
    req: &actix_web::HttpRequest,
) -> Result<DashboardSessionContext, ApiError> {
    let pool = req.app_data::<web::Data<State>>().unwrap().db_pool.clone();

    let auth_token = req
        .headers()
        .get(HEADER_NAME)
        .and_then(|hv| hv.to_str().map(|s| s.to_string()).ok())
        .ok_or(AuthError::MissingFpuserAuthHeader)?;

    let session = db::session::get_by_session_id(&pool, auth_token.clone())
        .await?
        .ok_or(AuthError::NoSessionFound)?;
    // Actually verify that the session is the correct type

    let metadata = match session.session_data.clone() {
        SessionState::TenantDashboardSession(metadata) => Ok(metadata),
        _ => Err(AuthError::SessionTypeError),
    }?;

    let tenant = db::tenant::get_by_workos_id(&pool, metadata.workos_id.clone()).await?;

    Ok(DashboardSessionContext {
        tenant,
        _metadata: metadata,
        auth_token,
    })
}
