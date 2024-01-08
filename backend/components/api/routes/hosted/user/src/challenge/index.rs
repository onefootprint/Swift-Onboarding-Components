use super::ActionKind;
use super::RegisterChallengeData;
use crate::challenge::RegisterChallenge;
use crate::State;
use api_core::auth::user::UserAuthContext;
use api_core::auth::user::UserAuthGuard;
use api_core::errors::AssertionError;
use api_core::errors::JsonError;
use api_core::errors::ValidationError;
use api_core::types::response::ResponseData;
use api_core::types::JsonApiResponse;
use api_core::utils::challenge::Challenge;
use api_core::utils::challenge::ChallengeKind;
use api_core::utils::challenge::ChallengeToken;
use api_core::utils::email::send_email_challenge_non_blocking;
use api_core::utils::passkey::WebauthnConfig;
use api_core::utils::sms::rx_background_error;
use newtypes::email::Email;
use newtypes::PhoneNumber;
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Apiv2Schema, serde::Deserialize)]
pub struct ChallengeRequest {
    /// If the challenge kind is SMS, the phone number to send the challenge to
    phone_number: Option<PhoneNumber>,
    /// If the challenge kind is email, the email address to send the challenge to
    email: Option<Email>,
    /// The kind of challenge to initiate
    kind: ChallengeKind,
    /// Specifies whether to add the new auth method alongside existing auth methods or replace
    /// the existing method.
    action_kind: ActionKind,
}

#[derive(Apiv2Schema, serde::Serialize)]
pub struct ChallengeResponse {
    /// If the challenge kind is biometric, the challenge JSON for the browser
    biometric_challenge_json: Option<String>,
    /// Information saved client side and sent back with the challenge response
    challenge_token: ChallengeToken,
    /// The timeout until you're allowed to initiate another challenge
    time_before_retry_s: i64,
}

#[derive(serde::Serialize)]
pub struct ErrorChallengeResponse {
    error: String,
}

#[api_v2_operation(
    tags(Challenge, Hosted),
    description = "Sends a challenge of the requested kind"
)]
#[actix::post("/hosted/user/challenge")]
pub async fn post(
    request: Json<ChallengeRequest>,
    state: web::Data<State>,
    user_auth: UserAuthContext,
) -> JsonApiResponse<ChallengeResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::Auth)?;
    if !user_auth.data.is_from_api {
        return ValidationError("Can only update auth methods using auth issued via API").into();
    }
    if user_auth.data.is_implied_auth {
        return ValidationError("Cannot update auth method using implied auth").into();
    }
    let ChallengeRequest {
        phone_number,
        email,
        kind,
        action_kind,
    } = request.into_inner();

    let tenant = user_auth.tenant();
    let uv = user_auth.user.clone();

    let (rx, data, time_before_retry, biometric_challenge_json) = match kind {
        ChallengeKind::Sms => {
            // Expect a phone number and initiate an SMS challenge
            let phone_number = phone_number.ok_or(ValidationError(
                "Phone number required to initiate sign up challenge",
            ))?;
            let (rx, challenge_data, time_before_retry) = state
                .sms_client
                .send_challenge_non_blocking(&state, tenant, &phone_number, uv.id, uv.sandbox_id)
                .await?;

            let challenge_data = RegisterChallengeData::Sms {
                h_code: challenge_data.h_code,
                phone_number: phone_number.e164(),
            };
            (Some(rx), challenge_data, Some(time_before_retry), None)
        }
        ChallengeKind::Email => {
            let email = email.ok_or(ValidationError(
                "Email must be provided for no-phone signup challenges",
            ))?;
            let tenant = tenant.ok_or(AssertionError("Need tenant to initiate email challenge for now"))?;

            let challenge_data =
                send_email_challenge_non_blocking(&state, &email, uv.id, tenant, uv.sandbox_id)?;
            let challenge_data = RegisterChallengeData::Email {
                h_code: challenge_data.h_code,
                email: email.email,
            };
            (None, challenge_data, None, None)
        }
        ChallengeKind::Passkey => {
            let webauthn = WebauthnConfig::new(&state.config);
            let (challenge, reg_state) = webauthn.initiate_challenge(uv.id)?;
            let challenge_json = serde_json::to_string(&challenge)?;
            let challenge_data = RegisterChallengeData::Passkey { reg_state };
            (None, challenge_data, None, Some(challenge_json))
        }
    };
    let challenge = RegisterChallenge { data, action_kind };
    let challenge_token = Challenge::new(challenge).seal(&state.challenge_sealing_key)?;

    let err = if let Some(rx) = rx {
        rx_background_error(rx, 3).await.err()
    } else {
        None
    };
    if let Some(err) = err {
        let e = ErrorChallengeResponse {
            error: err.to_string(),
        };
        return Err(JsonError(e).into());
    }

    // TODO make sure we actually enforce this?
    let time_before_retry_s = time_before_retry
        .map(|d| d.num_seconds())
        .unwrap_or(state.config.time_s_between_sms_challenges);
    let response = ChallengeResponse {
        biometric_challenge_json,
        challenge_token,
        time_before_retry_s,
    };
    ResponseData::ok(response).json()
}
