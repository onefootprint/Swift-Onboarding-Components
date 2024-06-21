use actix_web::post;
use actix_web::web;
use actix_web::web::Json;
use api_core::auth::session::tenant::FirmEmployeeSession;
use api_core::auth::session::AuthSessionData;
use api_core::auth::session::GetSessionForUpdate;
use api_core::auth::tenant::FirmEmployeeAuthContext;
use api_core::auth::tenant::FirmEmployeeGuard;
use api_core::auth::AuthError;
use api_core::types::ApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::utils::session::AuthSession;
use api_core::FpResult;
use api_core::State;
use db::models::tenant::Tenant;
use newtypes::SessionAuthToken;
use newtypes::TenantId;

#[derive(Debug, serde::Deserialize)]
struct AssumeRequest {
    tenant_id: TenantId,
}

#[derive(Debug, serde::Serialize, macros::JsonResponder)]
struct AssumeResponse {
    tenant: api_wire_types::Organization,
    token: SessionAuthToken,
}

#[post("/private/assume")]
async fn post(
    state: web::Data<State>,
    auth: FirmEmployeeAuthContext,
    request: Json<AssumeRequest>,
) -> ApiResponse<AssumeResponse> {
    let auth = auth.check_guard(FirmEmployeeGuard::Any)?;
    let auth_method = auth.auth_method;
    let firm_employee = auth.tenant_user.clone();
    let session_sealing_key = state.session_sealing_key.clone();
    let tenant_id = request.into_inner().tenant_id;

    // We have this custom logic for the integration testing user to limit who they can impersonate.
    // We don't want the integration testing user to be able to have unlimited read access to all
    // tenants.
    if firm_employee.email.is_integration_test_email() && !tenant_id.is_integration_test_tenant() {
        return Err(AuthError::NotAllowedForIntegrationTestUser.into());
    }

    let expires_at = auth.session().expires_at;
    let (tenant, token) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            // Verify the tenant_id is real
            let tenant = Tenant::get(conn, &tenant_id)?;

            let session = FirmEmployeeSession {
                tenant_user_id: firm_employee.id,
                tenant_id,
                auth_method,
            };
            let session = AuthSessionData::FirmEmployee(session);
            // The new token will expire at the same time as the existing token to prevent allowing
            // perpetually re-creating a new token for yourself
            let (token, _) = AuthSession::create_sync(conn, &session_sealing_key, session, expires_at)?;
            Ok((tenant, token))
        })
        .await?;

    let tenant = api_wire_types::Organization::from_db(tenant);
    let result = AssumeResponse { tenant, token };
    Ok(result)
}
