use crate::tenant::workos::WorkOSProfile;
use crate::State;
use crate::{errors::ApiError, types::success::ApiResponseData};
use actix_session::Session;
use chrono::{Duration, Utc};
use db::models::session_data::dashboard::TenantDashboardSessionData;
use db::models::session_data::SessionState;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, get, web, web::Json};

#[derive(serde::Deserialize, Apiv2Schema)]
struct Code {
    code: String,
}

#[derive(serde::Serialize, Apiv2Schema)]
struct DashboardAuthorization {
    authorization: String,
    profile: WorkOSProfile,
}

#[derive(serde::Serialize, Apiv2Schema)]
struct DashboardAuthorizationResponse {
    email: String,
    auth: String,
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

    let client = awc::Client::default();

    let profile = &state.workos_client.get_profile(&client, code.to_owned()).await?;

    // Magic link auth isn't actually associated with an org, so manually
    // set it to Footprint org identifier doesn't exist for now
    // TODO: when we have real tenants, map their email domains to different orgs
    let org_id = profile
        .clone()
        .organization_id
        .unwrap_or_else(|| state.workos_client.default_org.clone());

    // Save tenant login in session data into the DB
    let login_expires_at = Utc::now().naive_utc() + Duration::minutes(60);
    let (_, auth_token) = SessionState::TenantDashboardSession(TenantDashboardSessionData {
        email: profile.email.clone(),
        first_name: profile.first_name.clone(),
        last_name: profile.last_name.clone(),
        workos_id: org_id.clone(),
    })
    .create(&state.db_pool, login_expires_at)
    .await?;

    Ok(Json(ApiResponseData {
        data: DashboardAuthorizationResponse {
            email: profile.email.clone(),
            auth: auth_token,
            first_name: profile.first_name.clone(),
            last_name: profile.last_name.clone(),
        },
    }))
}
