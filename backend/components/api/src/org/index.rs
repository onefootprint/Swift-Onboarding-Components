use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::{CheckTenantPermissions, WorkOsAuthContext};
use crate::auth::Either;
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::utils::db2api::DbToApi;
use db::models::tenant::Tenant;
use paperclip::actix::{api_v2_operation, web::Json};

#[api_v2_operation(
    summary = "/org",
    operation_id = "org",
    tags(PublicApi),
    description = "Returns basic info about the authed tenant"
)]
pub async fn get(
    auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
) -> JsonApiResponse<api_types::Organization> {
    let auth = auth.check_permissions(vec![])?; // No permissions needed to access this endpoint
    let tenant = auth.tenant().clone();

    Ok(Json(ResponseData::ok(api_types::Organization::from_db(tenant))))
}

impl DbToApi<Tenant> for api_types::Organization {
    fn from_db(t: Tenant) -> Self {
        let Tenant {
            name,
            logo_url,
            sandbox_restricted,
            ..
        } = t;
        Self {
            name,
            logo_url,
            is_sandbox_restricted: sandbox_restricted,
        }
    }
}
