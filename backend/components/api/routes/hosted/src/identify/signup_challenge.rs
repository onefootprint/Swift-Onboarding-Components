use super::{ChallengeKind, UserChallengeData};
use crate::identify::{self, ChallengeData};
use crate::types::response::ResponseData;
use crate::utils::challenge::Challenge;
use crate::State;
use crate::{errors::ApiError, identify::ChallengeState};
use api_core::auth::ob_config::ObConfigAuth;
use api_core::errors::challenge::ChallengeError;
use api_core::errors::{ApiResult, AssertionError};
use api_core::telemetry::RootSpan;
use api_core::types::JsonApiResponse;
use api_core::utils::headers::{SandboxId, TelemetryHeaders};
use api_core::utils::sms::rx_background_error;
use api_core::utils::vault_wrapper::{InitialVaultData, VaultContext, VaultWrapper};
use itertools::Itertools;
use newtypes::email::Email;
use newtypes::fingerprinter::GlobalFingerprintKind;
use newtypes::{DataIdentifier, Fingerprinter, IdentityDataKind as IDK, PhoneNumber, PiiString};
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct SignupChallengeRequest {
    phone_number: Option<PhoneNumber>,
    email: Option<Email>,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct SignupChallengeResponse {
    challenge_data: UserChallengeData,
    error: Option<String>,
}

#[api_v2_operation(
    tags(Hosted, Bifrost),
    description = "Sends a challenge to a phone number or email and returns an HTTP 200. When the \
    challenge is completed through the identify/verify endpoint, the client can begin onboarding the user."
)]
#[actix::post("/hosted/identify/signup_challenge")]
pub async fn post(
    request: Json<SignupChallengeRequest>,
    state: web::Data<State>,
    ob_context: ObConfigAuth,
    // When provided, creates a sandbox user with the given suffix
    sandbox_id: SandboxId,
    telemetry_headers: TelemetryHeaders,
    root_span: RootSpan,
) -> JsonApiResponse<SignupChallengeResponse> {
    let SignupChallengeRequest { phone_number, email } = request.into_inner();

    let initial_data = vec![
        email
            .as_ref()
            .map(|e| (false, IDK::Email.into(), e.to_piistring())),
        phone_number
            .as_ref()
            .map(|p| (false, IDK::PhoneNumber.into(), p.e164())),
    ]
    .into_iter()
    .flatten()
    .collect();
    let sandbox_id = sandbox_id.0;
    let ctx = make_vault_context(&state, Some(&ob_context), initial_data, sandbox_id.clone()).await?;
    let uv = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let (uv, _, _) = VaultWrapper::create_unverified(conn, ctx, root_span)?;
            Ok(uv.into_inner())
        })
        .await?;

    let (rx, challenge_data) = match (phone_number, email) {
        (Some(phone_number), _) => {
            let tenant = ob_context.tenant();
            let s_id = telemetry_headers.session_id;
            let (rx, challenge_state_data, time_before_retry_s) = state
                .sms_client
                .send_challenge_non_blocking(&state, Some(tenant), &phone_number, uv.id, sandbox_id, s_id)
                .await?;

            let challenge_state = ChallengeState {
                data: ChallengeData::Sms(challenge_state_data),
            };

            let challenge_token = Challenge {
                expires_at: challenge_state.expires_at(),
                data: challenge_state,
            }
            .seal(&state.challenge_sealing_key)?;
            let data = UserChallengeData {
                challenge_kind: ChallengeKind::Sms,
                challenge_token,
                scrubbed_phone_number: Some(phone_number.last_two()),
                biometric_challenge_json: None,
                time_before_retry_s: time_before_retry_s.num_seconds(),
            };
            (Some(rx), data)
        }
        (None, Some(email)) => {
            let obc = ob_context.ob_config();
            let tenant = ob_context.tenant();

            if !obc.is_no_phone_flow {
                return Err(ApiError::from(ChallengeError::ChallengeKindNotAllowed(
                    "email".to_string(),
                )));
            };

            let challenge_data =
                identify::send_email_challenge_non_blocking(&state, &email, uv.id, tenant, sandbox_id)?;

            let challenge_state = ChallengeState { data: challenge_data };

            let challenge_token = Challenge {
                expires_at: challenge_state.expires_at(),
                data: challenge_state,
            }
            .seal(&state.challenge_sealing_key)?;

            let data = UserChallengeData {
                challenge_kind: ChallengeKind::Email,
                challenge_token,
                scrubbed_phone_number: None,
                biometric_challenge_json: None,
                time_before_retry_s: state.config.time_s_between_sms_challenges,
            };
            (None, data)
        }
        (None, None) => return Err(ChallengeError::NoIdentifier.into()),
    };

    let err = if let Some(rx) = rx {
        rx_background_error(rx, 2).await.err()
    } else {
        None
    };

    let response = SignupChallengeResponse {
        challenge_data,
        error: err.map(|e| e.to_string()),
    };
    ResponseData::ok(response).json()
}

type IsVerified = bool;

async fn make_vault_context(
    state: &State,
    ob_pk_auth: Option<&ObConfigAuth>,
    initial_data: Vec<(IsVerified, DataIdentifier, PiiString)>,
    sandbox_id: Option<newtypes::SandboxId>,
) -> ApiResult<VaultContext> {
    // TODO this keypair won't always be used... but helps to generate this proactively.
    let keypair = state.enclave_client.generate_sealed_keypair().await?;

    let global_sh_data = initial_data
        .iter()
        .map(|(_, di, v)| -> ApiResult<_> {
            Ok((di.clone(), GlobalFingerprintKind::try_from(di.clone())?, v))
        })
        .collect::<ApiResult<Vec<_>>>()?;
    let global_sh = state.compute_fingerprints(global_sh_data).await?;

    let tenant_sh = if let Some(ob_pk_auth) = ob_pk_auth.as_ref() {
        let tenant_sh_data = initial_data
            .iter()
            .map(|(_, di, v)| (di.clone(), (di, &ob_pk_auth.tenant().id), v))
            .collect_vec();
        // If we are in identify for a specific tenant, also compute tenant-scoped FP
        state.compute_fingerprints(tenant_sh_data).await?
    } else {
        vec![]
    };

    let data = initial_data
        .into_iter()
        .map(|(is_verified, di, value)| -> ApiResult<_> {
            Ok(InitialVaultData {
                global_sh: global_sh
                    .iter()
                    .filter_map(|(x, fp)| (x == &di).then_some(fp.clone()))
                    .next()
                    .ok_or(AssertionError("No global fingerprint"))?,
                tenant_sh: tenant_sh
                    .iter()
                    .filter_map(|(x, fp)| (x == &di).then_some(fp.clone()))
                    .next(),
                is_verified,
                di,
                value,
            })
        })
        .collect::<ApiResult<Vec<_>>>()?;
    Ok(VaultContext {
        data,
        keypair,
        sandbox_id,
        obc: ob_pk_auth.map(|obc| obc.ob_config().clone()),
    })
}
