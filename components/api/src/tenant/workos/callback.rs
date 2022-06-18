use crate::tenant::workos::WorkOSProfile;
use crate::State;
use crate::{errors::ApiError, types::success::ApiResponseData};
use actix_session::Session;
use chrono::{Duration, Utc};
use db::models::sessions::Session as DbSession;
use db::tenant::get_opt_by_workos_id;
use newtypes::tenant::workos::WorkOsSession;
use newtypes::ServerSession;
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

    let profile = &state.workos_client.get_profile(code.to_owned()).await?;

    // Magic link auth isn't actually associated with an org, so manually
    // set it to Footprint org identifier doesn't exist for now
    // TODO: when we have real tenants, map their email domains to different orgs
    let org_id = profile
        .clone()
        .organization_id
        .unwrap_or_else(|| state.workos_client.default_org.clone());

    // TODO change error
    let tenant = get_opt_by_workos_id(&state.db_pool, org_id.clone())
        .await?
        .ok_or(ApiError::WorkOsProfileInvalid)?;

    // Save tenant login in session data into the DB
    let login_expires_at = Utc::now().naive_utc() + Duration::minutes(60);
    let session_data = ServerSession::WorkOs(WorkOsSession {
        email: profile.email.clone(),
        first_name: profile.first_name.clone(),
        last_name: profile.last_name.clone(),
        tenant_id: tenant.id,
    });
    let (_, auth_token) = DbSession::create(&state.db_pool, session_data, login_expires_at).await?;

    Ok(Json(ApiResponseData {
        data: DashboardAuthorizationResponse {
            email: profile.email.clone(),
            auth: auth_token,
            first_name: profile.first_name.clone(),
            last_name: profile.last_name.clone(),
        },
    }))
}
