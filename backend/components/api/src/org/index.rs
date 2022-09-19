use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::session_data::workos::WorkOs;
use crate::auth::{Either, SessionContext, TenantAuth};
use crate::errors::ApiError;
use crate::types::response::ApiResponseData;
use crate::types::tenant::ApiTenant;
use paperclip::actix::{api_v2_operation, web::Json};

#[api_v2_operation(
    summary = "/org",
    operation_id = "org",
    tags(PublicApi),
    description = "Returns basic info about the authed tenant"
)]
pub async fn get(
    auth: Either<SessionContext<WorkOs>, SecretTenantAuthContext>,
) -> actix_web::Result<Json<ApiResponseData<ApiTenant>>, ApiError> {
    let tenant = auth.tenant().clone();

    Ok(Json(ApiResponseData::ok(ApiTenant::from(tenant))))
}
