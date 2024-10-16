use super::RegisterChallengeData;
use crate::challenge::RegisterChallenge;
use crate::State;
use api_core::auth::session::user::AssociatedAuthEventKind;
use api_core::auth::session::user::TokenCreationPurpose;
use api_core::auth::user::load_auth_events;
use api_core::auth::user::UserAuthContext;
use api_core::auth::user::UserAuthScope;
use api_core::auth::IsGuardMet;
use api_core::errors::AssertionError;
use api_core::errors::ValidationError;
use api_core::types::ApiResponse;
use api_core::utils::challenge::Challenge;
use api_core::utils::email::send_email_challenge_non_blocking;
use api_core::utils::passkey::WebauthnConfig;
use api_core::utils::sms::rx_background_error;
use api_core::utils::sms::send_sms_challenge_non_blocking;
use api_wire_types::UserChallengeRequest;
use api_wire_types::UserChallengeResponse;
use itertools::Itertools;
use newtypes::ActionKind;
use newtypes::AuthEventKind;
use newtypes::AuthMethodKind;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    tags(Challenge, Hosted),
    description = "Sends a challenge of the requested kind"
)]
#[actix::post("/hosted/user/challenge")]
pub async fn post(
    request: Json<UserChallengeRequest>,
    state: web::Data<State>,
    user_auth: UserAuthContext,
) -> ApiResponse<UserChallengeResponse> {
    let user_auth = user_auth
        .check_guard(UserAuthScope::ExplicitAuth.and(UserAuthScope::Auth.or(UserAuthScope::SignUp)))?;
    let UserChallengeRequest {
        phone_number,
        email,
        kind,
        action_kind,
    } = request.into_inner();
    if action_kind == ActionKind::Replace && !user_auth.data.is_from_api() {
        return ValidationError("Can only replace auth methods using auth issued via API").into();
    }

    let auth_events = user_auth.auth_events.clone();
    let auth_events = state
        .db_query(move |conn| load_auth_events(conn, &auth_events))
        .await?;
    let allowed_challenge_kinds = auth_events
        .iter()
        .flat_map(|(ae, kind)| allowed_challenge_kinds(action_kind, ae.kind, *kind))
        .unique()
        .collect_vec();
    if !allowed_challenge_kinds.contains(&kind) {
        return ValidationError(&format!("Cannot initiate challenge of kind {}", kind)).into();
    }
    let limit_auth_methods = user_auth
        .data
        .purposes
        .iter()
        .filter_map(|p| match p {
            TokenCreationPurpose::ApiUpdateAuthMethods { limit_auth_methods } => limit_auth_methods.clone(),
            _ => None,
        })
        .reduce(|a, b| a.into_iter().filter(|i| b.contains(i)).collect_vec());
    if limit_auth_methods.is_some_and(|l| !l.contains(&kind)) {
        return ValidationError(&format!("Token cannot initiate challenge of kind {}", kind)).into();
    }

    let tenant = user_auth.tenant();
    let uv = user_auth.user.clone();

    let (rx, data, time_before_retry_s, biometric_challenge_json) = match kind {
        AuthMethodKind::Phone => {
            // Expect a phone number and initiate an SMS challenge
            let parsed_phone = phone_number.ok_or(ValidationError(
                "Phone number required to initiate sign up challenge",
            ))?;
            let phone_number = parsed_phone.e164();
            let (rx, h_code) =
                send_sms_challenge_non_blocking(&state, tenant, parsed_phone, uv.sandbox_id, Some(uv.id))
                    .await?;

            let challenge_data = RegisterChallengeData::Sms { h_code, phone_number };
            let time_between_challenges = state.config.time_s_between_challenges;
            (Some(rx), challenge_data, time_between_challenges, None)
        }
        AuthMethodKind::Email => {
            let email = email.ok_or(ValidationError(
                "Email must be provided for no-phone signup challenges",
            ))?;
            let tenant = tenant.ok_or(AssertionError("Need tenant to initiate email challenge for now"))?;

            let (rx, h_code) = send_email_challenge_non_blocking(&state, &email, tenant, uv.sandbox_id)?;
            let email = email.email;
            let challenge_data = RegisterChallengeData::Email { h_code, email };
            let time_between_challenges = state.config.time_s_between_challenges;
            (Some(rx), challenge_data, time_between_challenges, None)
        }
        AuthMethodKind::Passkey => {
            let webauthn = WebauthnConfig::new(&state.config);
            let (challenge, reg_state) = webauthn.initiate_challenge(uv.id)?;
            let challenge_json = serde_json::to_string(&challenge)?;
            let challenge_data = RegisterChallengeData::Passkey { reg_state };
            (None, challenge_data, 0, Some(challenge_json))
        }
    };
    let challenge = RegisterChallenge {
        data,
        action_kind,
        is_register_challenge: true,
    };
    let challenge_token = Challenge::new(challenge).seal(&state.challenge_sealing_key)?;

    // TODO the client isn't currently set up to both display an error and receive the
    // challenge_token as we do in the identify APIs.
    // We should do this eventually to support cases where twilio still reports the message is
    // unsent but the message actually makes it to the user, perhaps a few seconds later
    if let Some(rx) = rx {
        rx_background_error(rx, 5).await?;
    }

    let response = UserChallengeResponse {
        biometric_challenge_json,
        challenge_token,
        time_before_retry_s,
    };
    Ok(response)
}

/// Given the requested action_kind and the kind of the explicit AuthEvents associated with this
/// token, returns what kind of ChallengeKinds are allowed to be initiated
fn allowed_challenge_kinds(
    action_kind: ActionKind,
    auth_factor: AuthEventKind,
    ae_kind: AssociatedAuthEventKind,
) -> Vec<AuthMethodKind> {
    if ae_kind != AssociatedAuthEventKind::Explicit {
        // Only Explicit AuthEvents allow updating/replacing auth methods
        return vec![];
    }
    if auth_factor == AuthEventKind::ThirdParty {
        // Third-party auth (attested by the tenant) should not allow editing contact info.
        // Third-party auth is also always implicit, so we'll hit the case above. But just being extra safe.
        return vec![];
    }
    match (action_kind, auth_factor) {
        // If this is the first time this auth method is added, it's allowed
        // TODO this would also allow adding a passkey with a SIM-swapped phone if there's no passkey yet
        (ActionKind::AddPrimary, _) => vec![
            AuthMethodKind::Email,
            AuthMethodKind::Phone,
            AuthMethodKind::Passkey,
        ],
        (ActionKind::Replace, AuthEventKind::Email | AuthEventKind::Sms) => {
            vec![AuthMethodKind::Email, AuthMethodKind::Phone]
        }
        (ActionKind::Replace, AuthEventKind::Passkey) => {
            // Authing with a passkey allows editing any form of contact info
            vec![
                AuthMethodKind::Email,
                AuthMethodKind::Phone,
                AuthMethodKind::Passkey,
            ]
        }
        (_, AuthEventKind::ThirdParty) => vec![],
    }
}

#[cfg(test)]
mod test {
    use super::allowed_challenge_kinds;
    use crate::challenge::ActionKind;
    use api_core::auth::session::user::AssociatedAuthEventKind;
    use newtypes::AuthEventKind;
    use newtypes::AuthMethodKind;
    use test_case::test_case;

    #[test_case(ActionKind::AddPrimary, AuthEventKind::Passkey, AssociatedAuthEventKind::Implicit => Vec::<AuthMethodKind>::new(); "no-challenges-allowed-for-implicit")]
    #[test_case(ActionKind::Replace, AuthEventKind::ThirdParty, AssociatedAuthEventKind::Explicit => Vec::<AuthMethodKind>::new(); "no-challenges-allowed-for-3p")] // This isn't realistic since 3p auth is only ever implicit, but just testing in case
    #[test_case(ActionKind::AddPrimary, AuthEventKind::Email, AssociatedAuthEventKind::Explicit => vec![AuthMethodKind::Email, AuthMethodKind::Phone, AuthMethodKind::Passkey]; "any-auth-factor-allows-adding-first")]
    #[test_case(ActionKind::Replace, AuthEventKind::Email, AssociatedAuthEventKind::Explicit => vec![AuthMethodKind::Email, AuthMethodKind::Phone]; "email-only-allows-replacing-phone-email")]
    #[test_case(ActionKind::Replace, AuthEventKind::Sms, AssociatedAuthEventKind::Explicit => vec![AuthMethodKind::Email, AuthMethodKind::Phone]; "sms-only-allows-replacing-phone-email")]
    #[test_case(ActionKind::Replace, AuthEventKind::Passkey, AssociatedAuthEventKind::Explicit => vec![AuthMethodKind::Email, AuthMethodKind::Phone, AuthMethodKind::Passkey]; "passkey-allows-replacing-all")]
    fn test_allowed_challenge_kinds(
        action_kind: ActionKind,
        auth_factor: AuthEventKind,
        ae_kind: AssociatedAuthEventKind,
    ) -> Vec<AuthMethodKind> {
        allowed_challenge_kinds(action_kind, auth_factor, ae_kind)
    }
}
