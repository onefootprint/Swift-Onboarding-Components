use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::{CheckTenantPermissions, WorkOsAuthContext};
use crate::auth::Either;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::types::tenant::FpTenant;
use paperclip::actix::{api_v2_operation, web::Json};

#[api_v2_operation(
    summary = "/org",
    operation_id = "org",
    tags(PublicApi),
    description = "Returns basic info about the authed tenant"
)]
pub async fn get(
    auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
) -> actix_web::Result<Json<ResponseData<FpTenant>>, ApiError> {
    let auth = auth.check_permissions(vec![])?; // No permissions needed to access this endpoint
    let tenant = auth.tenant().clone();

    Ok(Json(ResponseData::ok(FpTenant::from(tenant))))
}
