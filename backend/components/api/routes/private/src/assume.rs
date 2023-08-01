use std::str::FromStr;

use crate::auth::session::{AuthSessionData, UpdateSession};
use crate::auth::tenant::{GetFirmEmployee, TenantSessionAuth};
use crate::auth::AuthError;
use crate::errors::ApiResult;
use crate::types::{JsonApiResponse, ResponseData};
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::auth::session::tenant::FirmEmployeeSession;
use db::models::tenant::Tenant;
use newtypes::{OrgMemberEmail, TenantId, INTEGRATION_TEST_USER_EMAIL};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, post, web, web::Json};

#[derive(Debug, serde::Deserialize, Apiv2Schema)]
struct AssumeRequest {
    pub tenant_id: TenantId,
}

#[api_v2_operation(
    description = "Private endpoint to assume the read-only role a given tenant.",
    tags(Private)
)]
#[post("/private/assume")]
async fn post(
    state: web::Data<State>,
    auth: TenantSessionAuth,
    request: Json<AssumeRequest>,
) -> JsonApiResponse<api_wire_types::Organization> {
    let auth_method = auth.auth_method();
    let firm_employee = auth.firm_employee_user()?;
    let session_sealing_key = state.session_sealing_key.clone();
    let tenant_id = request.into_inner().tenant_id;

    // We have this custom logic for the integration testing user to limit who they can impersonate.
    // We don't want the integration testing user to be able to have unlimited read access to all tenants.
    let integration_test_email = OrgMemberEmail::from_str(INTEGRATION_TEST_USER_EMAIL)?;
    if firm_employee.email == integration_test_email && !tenant_id.is_integration_test_tenant() {
        return Err(AuthError::NotFirmEmployee.into());
    }

    let tenant = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            // Verify the tenant_id is real
            let tenant = Tenant::get(conn, &tenant_id)?;

            let session = FirmEmployeeSession {
                tenant_user_id: firm_employee.id,
                tenant_id,
                auth_method,
            };
            auth.update_session(conn, &session_sealing_key, AuthSessionData::FirmEmployee(session))?;
            Ok(tenant)
        })
        .await??;

    Ok(Json(ResponseData::ok(api_wire_types::Organization::from_db(
        tenant,
    ))))
}
