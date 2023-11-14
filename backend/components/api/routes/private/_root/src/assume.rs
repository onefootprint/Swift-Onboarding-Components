use std::str::FromStr;

use actix_web::{post, web, web::Json};
use api_core::auth::session::tenant::FirmEmployeeSession;
use api_core::auth::session::{AuthSessionData, UpdateSession};
use api_core::auth::tenant::{FirmEmployeeAuthContext, FirmEmployeeGuard};
use api_core::auth::AuthError;
use api_core::errors::ApiResult;
use api_core::types::{JsonApiResponse, ResponseData};
use api_core::utils::db2api::DbToApi;
use api_core::State;
use db::models::tenant::Tenant;
use newtypes::{OrgMemberEmail, TenantId};

#[derive(Debug, serde::Deserialize)]
struct AssumeRequest {
    pub tenant_id: TenantId,
}

#[post("/private/assume")]
async fn post(
    state: web::Data<State>,
    auth: FirmEmployeeAuthContext,
    request: Json<AssumeRequest>,
) -> JsonApiResponse<api_wire_types::Organization> {
    let auth = auth.check_guard(FirmEmployeeGuard::Any)?;
    let auth_method = auth.auth_method;
    let firm_employee = auth.tenant_user.clone();
    let session_sealing_key = state.session_sealing_key.clone();
    let tenant_id = request.into_inner().tenant_id;

    // We have this custom logic for the integration testing user to limit who they can impersonate.
    // We don't want the integration testing user to be able to have unlimited read access to all tenants.
    let integration_test_email = OrgMemberEmail::from_str(OrgMemberEmail::INTEGRATION_TEST_USER_EMAIL)?;
    let ro_integration_test_email = OrgMemberEmail::from_str(OrgMemberEmail::INTEGRATION_TEST_RO_USER_EMAIL)?;
    let is_it_email =
        firm_employee.email == integration_test_email || firm_employee.email == ro_integration_test_email;
    if is_it_email && !tenant_id.is_integration_test_tenant() {
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
