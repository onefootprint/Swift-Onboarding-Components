use crate::errors::ApiError;
use crate::identify::clean_email;
use crate::types::success::ApiResponseData;
use crate::State;
use newtypes::DataKind;
use paperclip::actix::{api_v2_operation, web, web::Json, Apiv2Schema};

use super::{clean_phone_number, send_phone_challenge_to_user, ChallengeKind};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct IdentifyRequest {
    identifier: Identifier,
    preferred_challenge_kind: ChallengeKind,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Identifier {
    Email(String),
    PhoneNumber(String),
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub struct IdentifyResponse {
    user_found: bool,
    challenge_data: Option<UserChallengeData>,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub struct UserChallengeData {
    challenge_kind: ChallengeKind,
    challenge_token: String,
    phone_number_last_two: String,
    biometric_challenge_json: Option<String>,
}

#[api_v2_operation(tags(Identify))]
/// Tries to identify an existing user by either phone number or email. If the user is found,
/// initiates a challenge of the requested type and returns relevant challenge data.
pub async fn handler(
    request: Json<IdentifyRequest>,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<IdentifyResponse>>, ApiError> {
    let IdentifyRequest {
        identifier,
        preferred_challenge_kind,
    } = request.into_inner();

    // Look up existing user vault by identifier
    let (data_kind, data) = match identifier {
        Identifier::PhoneNumber(phone_number) => {
            let phone_number = clean_phone_number(&state, &phone_number).await?;
            (DataKind::PhoneNumber, phone_number)
        }
        Identifier::Email(email) => {
            let email = clean_email(email);
            (DataKind::Email, email)
        }
    };
    let sh_data = super::signed_hash(&state, data).await?;
    // TODO should we only look for verified emails?
    let existing_user =
        db::user_vault::get_by_fingerprint(&state.db_pool, data_kind, sh_data, false)
            .await?
            .map(|x| x.0);

    let existing_user = if let Some(existing_user) = existing_user {
        existing_user
    } else {
        // The user vault doesn't exist. Just return that the user wasn't found
        return Ok(Json(ApiResponseData {
            data: IdentifyResponse {
                user_found: false,
                challenge_data: None,
            },
        }));
    };

    // The user vault exists. Initiate the challenge of the requested type
    let (challenge_token, phone_number_last_two) = match preferred_challenge_kind {
        ChallengeKind::Biometric => return Err(ApiError::NotImplemented),
        ChallengeKind::Sms => {
            let challenge = send_phone_challenge_to_user(&state, existing_user).await?;
            (
                challenge.seal(&state.session_sealing_key)?,
                phone_number_last_two(challenge.data.phone_number.clone()),
            )
        }
    };

    Ok(Json(ApiResponseData {
        data: IdentifyResponse {
            user_found: true,
            challenge_data: Some(UserChallengeData {
                challenge_kind: preferred_challenge_kind,
                challenge_token,
                phone_number_last_two,
                biometric_challenge_json: None,
            }),
        },
    }))
}

fn phone_number_last_two(phone_number: String) -> String {
    let mut phone_number = phone_number;
    let len = phone_number.len();
    phone_number.drain((len - 2)..len).into_iter().collect()
}
