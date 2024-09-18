use crate::BiometricChallengeState;
use crate::ChallengeData;
use crate::ChallengeState;
use crate::FpResult;
use crate::PhoneEmailChallengeState;
use api_core::errors::ValidationError;
use api_core::utils::challenge::Challenge;
use api_core::utils::email::send_email_challenge_non_blocking;
use api_core::utils::identify::AuthMethod;
use api_core::utils::identify::AuthMethodInfo;
use api_core::utils::passkey::WebauthnConfig;
use api_core::utils::sms::rx_background_error;
use api_core::utils::sms::send_sms_challenge_non_blocking;
use api_core::State;
use api_wire_types::IdentifyChallengeResponse;
use api_wire_types::UserChallengeData;
use db::models::passkey::Passkey;
use db::models::tenant::Tenant;
use db::models::vault::Vault;
use itertools::Itertools;
use newtypes::SessionAuthToken;
use webauthn_rs_core::proto::Base64UrlSafeData;
use webauthn_rs_core::proto::Credential;
use webauthn_rs_core::proto::ParsedAttestation;
use webauthn_rs_core::proto::ParsedAttestationData;
use webauthn_rs_proto::RegisteredExtensions;
use webauthn_rs_proto::UserVerificationPolicy;

pub(crate) async fn initiate_challenge(
    state: &State,
    auth_method: AuthMethod,
    vault: Vault,
    tenant: Option<&Tenant>,
    token: SessionAuthToken,
) -> FpResult<IdentifyChallengeResponse> {
    let sandbox_id = vault.sandbox_id.clone();

    let kind = auth_method.kind();
    let (rx, challenge_data, time_before_retry_s, biometric_challenge_json) = match auth_method.info {
        AuthMethodInfo::Passkey { passkeys } => {
            let challenge = initiate_passkey_login_challenge(state, passkeys)?;
            let challenge_data = ChallengeData::Passkey(challenge.state);
            (None, challenge_data, 0, Some(challenge.challenge_json))
        }
        AuthMethodInfo::Phone { phone, lifetime_id } => {
            let contact_info = phone.e164();
            let (rx, h_code) =
                send_sms_challenge_non_blocking(state, tenant, phone, sandbox_id, Some(vault.id)).await?;
            let data = PhoneEmailChallengeState {
                h_code,
                contact_info,
                lifetime_id,
            };
            let challenge_data = ChallengeData::Sms(data);
            let time_before_retry = state.config.time_s_between_challenges;
            (Some(rx), challenge_data, time_before_retry, None)
        }
        AuthMethodInfo::Email { email, lifetime_id } => {
            let tenant = tenant.ok_or(ValidationError(
                "Tenant not present when initiating an email challenge",
            ))?;
            let (rx, h_code) = send_email_challenge_non_blocking(state, &email, tenant, sandbox_id)?;
            let data = PhoneEmailChallengeState {
                h_code,
                contact_info: email.email,
                lifetime_id,
            };
            let challenge_data = ChallengeData::Email(data);
            let time_before_retry = state.config.time_s_between_challenges;
            (Some(rx), challenge_data, time_before_retry, None)
        }
    };

    let err = if let Some(rx) = rx {
        rx_background_error(rx, 3).await.err()
    } else {
        None
    };

    let data = ChallengeState { data: challenge_data };
    let challenge_token = Challenge::new(data).seal(&state.challenge_sealing_key)?;
    let challenge_data = UserChallengeData {
        token,
        challenge_kind: kind.into(),
        challenge_token,
        biometric_challenge_json,
        time_before_retry_s,
    };
    let response = IdentifyChallengeResponse {
        challenge_data,
        error: err.map(|e| e.to_string()),
    };
    Ok(response)
}

struct BiometricChallenge {
    state: BiometricChallengeState,
    challenge_json: String,
}

fn initiate_passkey_login_challenge(state: &State, creds: Vec<Passkey>) -> FpResult<BiometricChallenge> {
    if creds.is_empty() {
        return ValidationError("No passkey available for login challenge").into();
    }

    // convert these creds to webauthn rs type
    let creds = creds
        .into_iter()
        .map(|cred| {
            let pub_key = serde_cbor::from_slice(&cred.public_key).map_err(crypto::Error::from)?;
            Ok((cred, pub_key))
        })
        .map_ok(|(cred, public_key)| Credential {
            counter: 0,
            cred_id: Base64UrlSafeData(cred.credential_id),
            registration_policy: UserVerificationPolicy::Required,
            user_verified: true,
            cred: public_key,
            backup_eligible: cred.backup_eligible,
            backup_state: false, // ignore
            extensions: RegisteredExtensions::none(),
            transports: None,
            // These don't matter for now
            attestation: ParsedAttestation {
                data: ParsedAttestationData::None,
                metadata: webauthn_rs_core::proto::AttestationMetadata::None,
            },
            attestation_format: webauthn_rs_core::AttestationFormat::None,
        })
        .collect::<Result<Vec<Credential>, crypto::Error>>()?;

    // generate the challenge and return it
    let webauthn = WebauthnConfig::new(&state.config);
    let (challenge, auth_state) = webauthn.webauthn().generate_challenge_authenticate(creds, None)?;

    Ok(BiometricChallenge {
        state: BiometricChallengeState { state: auth_state },
        challenge_json: serde_json::to_string(&challenge)?,
    })
}
