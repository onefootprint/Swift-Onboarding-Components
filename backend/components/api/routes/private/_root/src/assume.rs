use actix_web::{post, web, web::Json};
use api_core::{
    auth::{
        session::{tenant::FirmEmployeeSession, AuthSessionData, GetSessionForUpdate, UpdateSession},
        tenant::{FirmEmployeeAuthContext, FirmEmployeeGuard},
        AuthError,
    },
    errors::ApiResult,
    types::{JsonApiResponse, ResponseData},
    utils::{db2api::DbToApi, session::AuthSession},
    State,
};
use db::models::tenant::Tenant;
use newtypes::{SessionAuthToken, TenantId};

#[derive(Debug, serde::Deserialize)]
struct AssumeRequest {
    tenant_id: TenantId,
}

#[derive(Debug, serde::Serialize)]
struct AssumeResponse {
    tenant: api_wire_types::Organization,
    token: SessionAuthToken,
}

#[post("/private/assume")]
async fn post(
    state: web::Data<State>,
    auth: FirmEmployeeAuthContext,
    request: Json<AssumeRequest>,
) -> JsonApiResponse<AssumeResponse> {
    let auth = auth.check_guard(FirmEmployeeGuard::Any)?;
    let auth_method = auth.auth_method;
    let firm_employee = auth.tenant_user.clone();
    let session_sealing_key = state.session_sealing_key.clone();
    let tenant_id = request.into_inner().tenant_id;

    // We have this custom logic for the integration testing user to limit who they can impersonate.
    // We don't want the integration testing user to be able to have unlimited read access to all tenants.
    if firm_employee.email.is_integration_test_email() && !tenant_id.is_integration_test_tenant() {
        return Err(AuthError::NotAllowedForIntegrationTestUser.into());
    }

    let expires_at = auth.clone().session().expires_at;
    let (tenant, token) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            // Verify the tenant_id is real
            let tenant = Tenant::get(conn, &tenant_id)?;

            let session = FirmEmployeeSession {
                tenant_user_id: firm_employee.id,
                tenant_id,
                auth_method,
            };
            let session = AuthSessionData::FirmEmployee(session);
            // TODO stop updating in place once the client starts using the new token
            auth.update_session(conn, &session_sealing_key, session.clone())?;
            // The new token will expire at the same time as the existing token to prevent allowing
            // perpetually re-creating a new token for yourself
            let (token, _) = AuthSession::create_sync(conn, &session_sealing_key, session, expires_at)?;
            Ok((tenant, token))
        })
        .await?;

    let tenant = api_wire_types::Organization::from_db(tenant);
    let result = AssumeResponse { tenant, token };
    ResponseData::ok(result).json()
}
