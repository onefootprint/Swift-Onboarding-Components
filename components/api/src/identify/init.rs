use crate::identify::clean_email;
use crate::response::success::ApiResponseData;
use crate::State;
use crate::{
    auth::client_public_key::PublicTenantAuthContext, auth::identify_session::IdentifySessionState,
    errors::ApiError,
};
use actix_session::Session;
use paperclip::actix::{api_v2_operation, web, web::Json, Apiv2Schema};

use super::{phone_number_last_two, send_phone_challenge_to_user};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct IdentifyRequest {
    email: String,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub enum IdentifyResponse {
    PhoneNumberLastTwo(String),
    UserNotFound,
}

#[api_v2_operation]
/// Identify a user by email address. If identification is successful, this endpoint issues a text
/// challenge to the user's phone number & returns HTTP 200 with an IdentifyResponse of the last
/// two digits of the user's phone #. If the user is not found, returns IdentifyResponse of user_not_found
pub async fn handler(
    request: Json<IdentifyRequest>,
    session: Session,
    pub_tenant_auth: PublicTenantAuthContext,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<IdentifyResponse>>, ApiError> {
    // clean email & look up existing user vault
    let req = request.into_inner();
    let cleaned_email = clean_email(req.email);
    let sh_email = super::hash(cleaned_email.clone());
    let existing_user_vault = db::user_vault::get_by_email(&state.db_pool, sh_email).await?;

    // see if user vault has an associated phone number. if not, set session state to info we currently have &
    // return user not found
    let (challenge_state, response) = match existing_user_vault {
        Some(vault) => {
            let challenge_state = send_phone_challenge_to_user(&state, vault).await?;
            (
                Some(challenge_state.clone()),
                IdentifyResponse::PhoneNumberLastTwo(phone_number_last_two(
                    challenge_state.phone_number,
                )),
            )
        }
        None => (None, IdentifyResponse::UserNotFound),
    };
    IdentifySessionState {
        tenant_id: pub_tenant_auth.tenant().id.clone(),
        email: cleaned_email.clone(),
        challenge_state,
    }
    .set(&session)?;

    Ok(Json(ApiResponseData { data: response }))
}
