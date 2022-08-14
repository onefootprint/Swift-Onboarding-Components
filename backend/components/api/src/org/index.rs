use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::session_data::workos::WorkOsSession;
use crate::auth::{Either, HasTenant, SessionContext};
use crate::errors::ApiError;
use crate::types::response::ApiResponseData;
use crate::types::tenant::ApiTenant;
use crate::State;
use paperclip::actix::{api_v2_operation, web, web::Json};

/// Return basic info about the authed tenant
#[api_v2_operation(tags(PublicApi))]
pub async fn get(
    state: web::Data<State>,
    auth: Either<SessionContext<WorkOsSession>, SecretTenantAuthContext>,
) -> actix_web::Result<Json<ApiResponseData<ApiTenant>>, ApiError> {
    let tenant = auth.tenant(&state.db_pool).await?;

    Ok(Json(ApiResponseData::ok(ApiTenant::from(tenant))))
}
