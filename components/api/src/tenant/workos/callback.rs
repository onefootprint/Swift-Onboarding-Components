use crate::auth::session_data::tenant::workos::WorkOsSession;
use crate::auth::session_data::{ServerSession, SessionData};
use crate::errors::workos_login::WorkOsLoginError;
use crate::State;
use crate::{errors::ApiError, types::success::ApiResponseData};
use actix_session::Session;
use chrono::Duration;
use db::tenant::get_opt_by_workos_id;
use newtypes::SessionAuthToken;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, get, web, web::Json};
use workos::sso::{
    AuthorizationCode, ClientId, GetProfileAndToken, GetProfileAndTokenParams, GetProfileAndTokenResponse,
};

#[derive(serde::Deserialize, Apiv2Schema)]
struct Code {
    code: String,
}

#[derive(serde::Serialize, Apiv2Schema)]
struct DashboardAuthorizationResponse {
    email: String,
    auth: SessionAuthToken,
    first_name: Option<String>,
    last_name: Option<String>,
}

#[api_v2_operation(tags(Private, WorkOS))]
#[get("/login")]
/// Called from the front-end with the WorkOS code. Returns
/// the authorization token needed for future requests as well as user information
fn handler(
    state: web::Data<State>,
    _session: Session,
    code: web::Query<Code>,
) -> actix_web::Result<Json<ApiResponseData<DashboardAuthorizationResponse>>, ApiError> {
    let code = &code.code;

    let GetProfileAndTokenResponse { profile, .. } = &state
        .workos_client
        .sso()
        .get_profile_and_token(&GetProfileAndTokenParams {
            client_id: &ClientId::from(state.config.workos_client_id.as_str()),
            code: &AuthorizationCode::from(code.to_owned()),
        })
        .await?;

    // Magic link auth isn't actually associated with an org, so manually
    // set it to Footprint org identifier doesn't exist for now
    // TODO: when we have real tenants, map their email domains to different orgs
    let org_id = profile
        .clone()
        .organization_id
        .map(|org_id| org_id.to_string())
        .unwrap_or_else(|| state.config.workos_default_org.clone());

    let tenant = get_opt_by_workos_id(&state.db_pool, org_id)
        .await?
        .ok_or(WorkOsLoginError::ProfileInvalid)?;

    // Save tenant login in session data into the DB
    let session_data = SessionData::WorkOs(WorkOsSession {
        email: profile.email.clone(),
        first_name: profile.first_name.clone(),
        last_name: profile.last_name.clone(),
        tenant_id: tenant.id,
    });
    let auth_token = ServerSession::create(&state, session_data, Duration::minutes(60)).await?;

    Ok(Json(ApiResponseData {
        data: DashboardAuthorizationResponse {
            email: profile.email.clone(),
            auth: auth_token,
            first_name: profile.first_name.clone(),
            last_name: profile.last_name.clone(),
        },
    }))
}
