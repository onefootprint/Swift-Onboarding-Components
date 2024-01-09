use super::RegisterChallengeData;
use crate::challenge::RegisterChallenge;
use crate::State;
use api_core::auth::user::UserAuthContext;
use api_core::auth::user::UserAuthGuard;
use api_core::auth::IsGuardMet;
use api_core::errors::AssertionError;
use api_core::errors::JsonError;
use api_core::errors::ValidationError;
use api_core::types::response::ResponseData;
use api_core::types::JsonApiResponse;
use api_core::utils::challenge::Challenge;
use api_core::utils::email::send_email_challenge_non_blocking;
use api_core::utils::passkey::WebauthnConfig;
use api_core::utils::sms::rx_background_error;
use api_wire_types::ErrorChallengeResponse;
use api_wire_types::UserChallengeRequest;
use api_wire_types::UserChallengeResponse;
use newtypes::ChallengeKind;
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(
    tags(Challenge, Hosted),
    description = "Sends a challenge of the requested kind"
)]
#[actix::post("/hosted/user/challenge")]
pub async fn post(
    request: Json<UserChallengeRequest>,
    state: web::Data<State>,
    user_auth: UserAuthContext,
) -> JsonApiResponse<UserChallengeResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::ExplicitAuth.and(UserAuthGuard::Auth))?;
    if !user_auth.data.is_from_api {
        return ValidationError("Can only update auth methods using auth issued via API").into();
    }
    let UserChallengeRequest {
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
    let challenge = RegisterChallenge {
        data,
        action_kind,
        is_register_challenge: true,
    };
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
    let response = UserChallengeResponse {
        biometric_challenge_json,
        challenge_token,
        time_before_retry_s,
    };
    ResponseData::ok(response).json()
}
