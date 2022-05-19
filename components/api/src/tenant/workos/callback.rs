use crate::tenant::workos::auth_context::WorkOSAuthMetadata;
use crate::tenant::workos::WorkOSProfile;
use crate::State;
use crate::{errors::ApiError, types::success::ApiResponseData};
use actix_session::Session;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, get, web, web::Json};

#[derive(serde::Deserialize, Apiv2Schema)]
struct Code {
    code: String,
}

#[api_v2_operation]
#[get("/callback")]
/// Callback function for WorkOS API
fn handler(
    state: web::Data<State>,
    session: Session,
    code: web::Query<Code>,
) -> actix_web::Result<Json<ApiResponseData<WorkOSProfile>>, ApiError> {
    let code = &code.code;

    let client = awc::Client::default();

    let profile = &state
        .workos_client
        .get_profile(&client, code.to_owned())
        .await?;

    // Magic link auth isn't actually associated with an org, so manually
    // set it to Footprint org identifier doesn't exist for now
    // TODO: when we have real tenants, map their email domains to different orgs
    let org_id = profile
        .clone()
        .organization_id
        .unwrap_or_else(|| state.workos_client.default_org.clone());

    // Set the session -- tenant info is extracted based on org
    WorkOSAuthMetadata {
        email: profile.clone().email,
        org_id,
    }
    .set(&session)?;

    // TODO: Redirect to the home page :)
    Ok(Json(ApiResponseData {
        data: profile.clone(),
    }))
}
