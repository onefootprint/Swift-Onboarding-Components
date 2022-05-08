use crate::auth::identify_session::IdentifySessionContext;
use crate::errors::ApiError;
use crate::identify::{clean_phone_number, send_challenge};
use crate::response::success::ApiResponseData;
use crate::State;
use actix_session::Session;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct ChallengeRequest {
    phone_number: String,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct ChallengeResponse {
    phone_number_last_two: String,
}

#[api_v2_operation]
#[post("/challenge")]
/// Issues a text message challenge to a given phone_number. In order to call this endpoint, you must have
/// already attempted to identify by email address via a call to /identify. The call to /identify
/// sets relavent state for issuing the challenge (see IdentifySessionState)
pub async fn handler(
    request: Json<ChallengeRequest>,
    session: Session,
    session_context: IdentifySessionContext,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<ChallengeResponse>>, ApiError> {
    // clean phone number
    let req = request.into_inner();
    let phone_number = clean_phone_number(&state, &req.phone_number).await?;

    // send challenge & set state
    let (identity_session_state, last_two) = send_challenge(
        &state,
        phone_number.clone(),
        session_context.state.tenant_id.clone(),
        session_context.state.email.clone(),
    )
    .await?;
    identity_session_state.set(&session)?;

    Ok(Json(ApiResponseData {
        data: ChallengeResponse {
            phone_number_last_two: last_two,
        },
    }))
}
