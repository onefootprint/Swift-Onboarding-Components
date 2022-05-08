use crate::identify::clean_email;
use crate::response::success::ApiResponseData;
use crate::State;
use crate::{
    auth::client_public_key::PublicTenantAuthContext, auth::identify_session::IdentifySessionState,
    errors::ApiError,
};
use actix_session::Session;
use paperclip::actix::{api_v2_operation, web, web::Json, Apiv2Schema};

use super::decrypt_and_send_challenge;

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
    let response: Result<IdentifyResponse, ApiError> = match existing_user_vault {
        Some(vault) => {
            let (identity_session_state, last_two_digits) = decrypt_and_send_challenge(
                &state,
                vault,
                pub_tenant_auth.tenant().id.clone(),
                cleaned_email,
            )
            .await?;
            identity_session_state.set(&session)?;
            Ok(IdentifyResponse::PhoneNumberLastTwo(last_two_digits))
        }
        None => {
            IdentifySessionState {
                tenant_id: pub_tenant_auth.tenant().id.clone(),
                email: cleaned_email.clone(),
                challenge_state: None,
            }
            .set(&session)?;
            Ok(IdentifyResponse::UserNotFound)
        }
    };

    Ok(Json(ApiResponseData { data: response? }))
}
