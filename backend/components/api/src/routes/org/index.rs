use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::{CheckTenantPermissions, WorkOsAuthContext};
use crate::auth::Either;
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::utils::db2api::DbToApi;
use paperclip::actix::{self, api_v2_operation, web::Json};

#[api_v2_operation(
    tags(Organization, PublicApi),
    description = "Returns basic info about the authed tenant"
)]
#[actix::get("/org")]
pub async fn get(
    auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
) -> JsonApiResponse<api_wire_types::Organization> {
    let auth = auth.check_permissions(vec![])?; // No permissions needed to access this endpoint
    let tenant = auth.tenant().clone();

    Ok(Json(ResponseData::ok(api_wire_types::Organization::from_db(
        tenant,
    ))))
}
