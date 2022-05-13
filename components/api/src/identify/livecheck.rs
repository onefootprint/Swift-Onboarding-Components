use crate::auth::client_public_key::PublicTenantAuthContext;
use crate::auth::get_onboarding_for_tenant;
use crate::auth::logged_in_session::LoggedInSessionContext;
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::State;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct LivecheckResponse {
    session_id: String,
}

/// Challenge via biometrics + liveness
#[api_v2_operation]
#[post("/livecheck")]
pub async fn handler(
    user_auth: LoggedInSessionContext,
    tenant_auth: PublicTenantAuthContext,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<LivecheckResponse>>, ApiError> {
    get_onboarding_for_tenant(&state.db_pool, &user_auth, &tenant_auth).await?;
    Ok(Json(ApiResponseData {
        data: LivecheckResponse {
            session_id: user_auth.session_id,
        },
    }))
}
