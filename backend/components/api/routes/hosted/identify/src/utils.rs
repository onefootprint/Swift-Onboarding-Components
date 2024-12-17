use crate::BiometricChallengeState;
use crate::ChallengeData;
use crate::ChallengeState;
use crate::FpResult;
use crate::PhoneEmailChallengeState;
use crate::SmsLinkChallengeState;
use api_core::auth::session::user::ContactInfoVerifySessionData;
use api_core::config::LinkKind;
use api_core::errors::error_with_code::ErrorWithCode;
use api_core::utils::challenge::Challenge;
use api_core::utils::email::send_email_challenge_non_blocking;
use api_core::utils::headers::InsightHeaders;
use api_core::utils::identify::AuthMethodInfo;
use api_core::utils::identify::UserAuthMethodsContext;
use api_core::utils::passkey::WebauthnConfig;
use api_core::utils::session::AuthSession;
use api_core::utils::sms::rx_background_error;
use api_core::utils::sms::send_sms_challenge_non_blocking;
use api_core::utils::sms::send_sms_link_challenge_non_blocking;
use api_core::State;
use api_errors::BadRequest;
use api_errors::BadRequestInto;
use api_wire_types::IdentifyChallengeResponse;
use api_wire_types::UserChallengeData;
use db::models::insight_event::CreateInsightEvent;
use db::models::passkey::Passkey;
use db::models::tenant::Tenant;
use itertools::Itertools;
use newtypes::AuthMethodKind;
use newtypes::ChallengeKind;
use newtypes::PreviewApi;
use newtypes::SessionAuthToken;
use webauthn_rs_core::proto::Base64UrlSafeData;
use webauthn_rs_core::proto::Credential;
use webauthn_rs_core::proto::ParsedAttestation;
use webauthn_rs_core::proto::ParsedAttestationData;
use webauthn_rs_proto::RegisteredExtensions;
use webauthn_rs_proto::UserVerificationPolicy;

pub(crate) struct InitiateChallengeArgs<'a> {
    pub challenge_kind: ChallengeKind,
    pub tenant: Option<&'a Tenant>,
    pub user_token: Option<SessionAuthToken>,
    pub user_session: Option<AuthSession>,
    pub insight_headers: InsightHeaders,
}

pub(crate) async fn initiate_challenge<'a>(
    state: &State,
    ctx: UserAuthMethodsContext,
    args: InitiateChallengeArgs<'a>,
) -> FpResult<IdentifyChallengeResponse> {
    let InitiateChallengeArgs {
        challenge_kind,
        tenant,
        user_token,
        user_session,
        insight_headers,
    } = args;
    let vault = ctx.vw.vault;
    let sandbox_id = vault.sandbox_id.clone();
    let Some(auth_method) = (ctx.auth_methods)
        .into_iter()
        .find(|am| AuthMethodKind::from(challenge_kind) == am.kind())
    else {
        return Err(ErrorWithCode::UnsupportedChallengeKind(challenge_kind.to_string()).into());
    };
    let (rx, challenge_data, time_before_retry_s, biometric_challenge_json) = match auth_method.info {
        AuthMethodInfo::Passkey { passkeys } => {
            let challenge = initiate_passkey_login_challenge(state, passkeys)?;
            let challenge_data = ChallengeData::Passkey(challenge.state);
            (None, challenge_data, 0, Some(challenge.challenge_json))
        }
        AuthMethodInfo::Phone { phone, lifetime_id } if challenge_kind == ChallengeKind::SmsLink => {
            let t = tenant.ok_or(BadRequest(
                "Tenant not present when initiating an SMS link challenge",
            ))?;
            if !t.can_access_preview(&PreviewApi::SmsLinkAuthentication) {
                return BadRequestInto("Organization not approved to initiate SMS link challenges");
            }
            let e164 = phone.e164();
            let session_id = insight_headers.session_id.clone();
            let session_key = state.session_sealing_key.clone();
            let uv_id = vault.id.clone();
            let tenant_id = t.id.clone();
            let session = user_session.ok_or(BadRequest(
                "Cannot initiate sms_link challenge without user auth session",
            ))?;
            let ci_token = state
                .db_query(move |conn| {
                    let insight_event = CreateInsightEvent::from(insight_headers).insert_with_conn(conn)?;
                    let session_data = ContactInfoVerifySessionData {
                        uv_id,
                        su_id: ctx.vw.sv_id,
                        tenant_id,
                        insight_event_id: insight_event.id,
                        auth_event_id: None,
                    };
                    let (ci_token, _) =
                        session.create_derived(conn, &session_key, session_data.into(), None)?;
                    Ok(ci_token)
                })
                .await?;
            let url = (state.config.service_config).generate_link(LinkKind::ContactInfoVerify, &ci_token);
            let v_id = Some(vault.id.clone());
            let rx = send_sms_link_challenge_non_blocking(state, t, phone, sandbox_id, v_id, session_id, url)
                .await?;
            let data = SmsLinkChallengeState {
                e164,
                lifetime_id,
                token: ci_token,
            };
            let challenge_data = ChallengeData::SmsLink(data);
            let time_before_retry = state.config.time_s_between_challenges;
            (Some(rx), challenge_data, time_before_retry, None)
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
            let tenant = tenant.ok_or(BadRequest(
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
        token: user_token,
        challenge_kind,
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
        return BadRequestInto("No passkey available for login challenge");
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
