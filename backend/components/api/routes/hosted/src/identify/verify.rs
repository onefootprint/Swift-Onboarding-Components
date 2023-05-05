use super::{BiometricChallengeState, PhoneChallengeState};
use crate::auth::ob_config::ObConfigAuth;
use crate::auth::user::{UserAuthScope, UserSession};
use crate::errors::challenge::ChallengeError;
use crate::errors::{ApiError, ApiResult};
use crate::identify::{ChallengeData, ChallengeDataKind, ChallengeState};
use crate::types::response::ResponseData;
use crate::utils::challenge::{Challenge, ChallengeToken};
use crate::utils::liveness::LivenessWebauthnConfig;
use crate::utils::session::AuthSession;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::config::Config;
use api_core::errors::business::BusinessError;
use api_core::errors::onboarding::OnboardingError;
use chrono::Duration;
use crypto::sha256;
use db::models::business_owner::BusinessOwner;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use db::models::webauthn_credential::WebauthnCredential;
use db::TxnPgConn;
use itertools::Itertools;
use newtypes::fingerprinter::GlobalFingerprintKind;
use newtypes::{
    DataIdentifier, EncryptedVaultPrivateKey, Fingerprint, Fingerprinter, IdentityDataKind as IDK,
    SessionAuthToken, VaultId, VaultPublicKey,
};
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
pub struct VerifyRequest {
    /// Opaque challenge state token
    challenge_token: ChallengeToken,
    challenge_response: String,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub enum VerifyKind {
    UserCreated,
    UserInherited,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct VerifyResponse {
    kind: VerifyKind,
    auth_token: SessionAuthToken,
}

#[api_v2_operation(
    tags(Hosted, Bifrost),
    description = "Verifies the response to either an SMS or biometric challenge. When the \
    challenge response is verified, we will return an auth token for the user. If no user exists \
    (which may only happen after a phone challenge), we will create a new user with the provided \
    phone number"
)]
#[actix::post("/hosted/identify/verify")]
pub async fn post(
    state: web::Data<State>,
    request: Json<VerifyRequest>,
    ob_pk_auth: Option<ObConfigAuth>,
) -> actix_web::Result<Json<ResponseData<VerifyResponse>>, ApiError> {
    // Note: Challenge::unseal checks for challenge token expiry as well
    let VerifyRequest {
        challenge_token,
        challenge_response,
    } = request.into_inner();
    let challenge_state =
        Challenge::<ChallengeState>::unseal(&state.challenge_sealing_key, &challenge_token)?.data;

    // Generate fingerprints and keypairs async if needed
    let challenge_kind = ChallengeDataKind::from(&challenge_state.data);
    let challenge_data = match challenge_state.data {
        ChallengeData::Sms(challenge_state) => {
            // TODO this keypair won't always be used... but helps to generate this proactively.
            let keypair = state.enclave_client.generate_sealed_keypair().await?;
            let di = DataIdentifier::from(IDK::PhoneNumber);
            let phone_number = challenge_state.phone_number_e164_with_suffix.clone();
            let global_sh_phone_number = state
                .compute_fingerprint(GlobalFingerprintKind::PhoneNumber, &phone_number)
                .await?;
            let ob_info = if let Some(ob_pk_auth) = ob_pk_auth.as_ref() {
                let tenant_sh_phone_number = state
                    .compute_fingerprint((&di, &ob_pk_auth.tenant().id), &phone_number)
                    .await?;
                let obc = ob_pk_auth.ob_config().clone();
                Some(OnboardingInfo {
                    obc,
                    tenant_sh_phone_number,
                })
            } else {
                None
            };
            let legacy_sh_phone_number = state.compute_legacy_fingerprint(di, &phone_number).await?;
            let context = SmsContext {
                challenge_state,
                global_sh_phone_number,
                legacy_sh_phone_number,
                ob_info,
                keypair,
            };
            ChallengeData::Sms(context)
        }
        ChallengeData::Biometric(challenge_state) => ChallengeData::Biometric(challenge_state),
    };

    let config = state.config.clone();
    let session_key = state.session_sealing_key.clone();
    let (auth_token, user_kind) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let (uv_id, user_kind) = match challenge_data {
                ChallengeData::Sms(c_state) => validate_sms_challenge(conn, c_state, &challenge_response)?,
                ChallengeData::Biometric(c_state) => {
                    validate_biometric_challenge(conn, &config, c_state, &challenge_response)?
                }
            };

            // Determine scopes you get for authing
            let basic_scopes = vec![
                // Always get BasicProfile just for authing - go you!
                Some(UserAuthScope::BasicProfile),
                // If you authed with Biometric, you also get SensitiveProfile
                matches!(challenge_kind, ChallengeDataKind::Biometric)
                    .then_some(UserAuthScope::SensitiveProfile),
            ];

            // And scopes you get for onboarding
            let (ob_scopes, duration) = if let Some(ob_pk_auth) = ob_pk_auth {
                let scopes = onboarding_scopes(conn, ob_pk_auth, &uv_id)?.into_iter();
                let duration = Duration::minutes(30); // Onboarding is pretty short
                (scopes, duration)
            } else {
                let duration = Duration::hours(8); // Issue my1fp token for a long time
                (vec![].into_iter(), duration)
            };

            // Create the auth token for this user
            let scopes = basic_scopes.into_iter().chain(ob_scopes).flatten().collect();
            let data = UserSession::make(uv_id, scopes);
            let auth_token = AuthSession::create_sync(conn, &session_key, data, duration)?;
            Ok((auth_token, user_kind))
        })
        .await?;

    Ok(Json(ResponseData {
        data: VerifyResponse {
            kind: user_kind,
            auth_token,
        },
    }))
}

/// Determines the auth scopes to issue to allow a user to complete onboarding
fn onboarding_scopes(
    conn: &mut TxnPgConn,
    ob_pk_auth: ObConfigAuth,
    uv_id: &VaultId,
) -> ApiResult<Vec<Option<UserAuthScope>>> {
    let obc = ob_pk_auth.ob_config();
    // Since only some codepaths above will create a SU, we need to always get_or_create
    // a SU here
    let uv = Vault::lock(conn, uv_id)?;
    let su = ScopedVault::get_or_create(conn, &uv, obc.id.clone())?;

    // If we verified with a BoSessionAuth, update the corresponding BO
    let bo_scope = if let Some(bo) = ob_pk_auth.business_owner() {
        let bo = BusinessOwner::lock(conn, &bo.id)?.into_inner();
        let scoped_business = ScopedVault::get(conn, (&bo.business_vault_id, &obc.id))?;
        if let Some(existing_uv_id) = bo.user_vault_id.as_ref() {
            // If uv on the BO, make sure it is the same UV that was located in identify flow
            if existing_uv_id != &uv.id {
                return Err(BusinessError::BoAlreadyHasVault.into());
            }
        } else {
            // If no uv_id on the BO, add it
            bo.add_user_vault_id(conn, &uv.id)?;
        }
        // TODO this scope will give the secondary BO perms to update the business vault
        Some(UserAuthScope::Business(scoped_business.id))
    } else {
        None
    };

    Ok(vec![
        Some(UserAuthScope::SignUp),
        Some(UserAuthScope::OrgOnboarding { id: su.id }),
        // Business owner scope, if any
        bo_scope,
    ])
}

fn validate_biometric_challenge(
    conn: &mut TxnPgConn,
    config: &Config,
    challenge_state: BiometricChallengeState,
    challenge_response: &str,
) -> ApiResult<(VaultId, VerifyKind)> {
    // Decode and validate the response to the biometric challenge
    let webauthn = LivenessWebauthnConfig::new(config);
    let auth_resp = serde_json::from_str(challenge_response)?;

    let result = webauthn
        .webauthn()
        .authenticate_credential(&auth_resp, &challenge_state.state)?;

    // if the credential's backup state has changed:
    // update the backup state to learn that a credential is now portable across devices
    if result.backup_state && challenge_state.non_synced_cred_ids.contains(&result.cred_id) {
        let uv_id = challenge_state.user_vault_id.clone();
        WebauthnCredential::update_backup_state(conn, &uv_id, &result.cred_id.0)?;
    }

    Ok((challenge_state.user_vault_id, VerifyKind::UserInherited))
}

/// Info extracted when an onboarding config auth is provided that allows creating a new vault
struct OnboardingInfo {
    obc: ObConfiguration,
    tenant_sh_phone_number: Fingerprint,
}

struct SmsContext {
    challenge_state: PhoneChallengeState,
    global_sh_phone_number: Fingerprint,
    // TODO: remove this post fingerprint
    legacy_sh_phone_number: Fingerprint,
    // Only non-null when an ObConfigAuth was provided
    ob_info: Option<OnboardingInfo>,
    keypair: (VaultPublicKey, EncryptedVaultPrivateKey),
}

fn validate_sms_challenge(
    conn: &mut TxnPgConn,
    context: SmsContext,
    challenge_response: &str,
) -> Result<(VaultId, VerifyKind), ApiError> {
    if context.challenge_state.h_code != sha256(challenge_response.as_bytes()).to_vec() {
        return Err(ChallengeError::IncorrectPin.into());
    }
    let fps_to_search = vec![
        Some(context.global_sh_phone_number.clone()),
        Some(context.legacy_sh_phone_number),
        context.ob_info.as_ref().map(|i| i.tenant_sh_phone_number.clone()),
    ]
    .into_iter()
    .flatten()
    .collect_vec();
    let existing_user = Vault::find_portable(conn, &fps_to_search)?;
    let result = match existing_user {
        Some(uv) => (uv.id, VerifyKind::UserInherited),
        None => {
            // The user does not exist. Create a new user vault.
            // Must have ob_info to create a new user vault
            let OnboardingInfo {
                obc,
                tenant_sh_phone_number,
            } = context.ob_info.ok_or(OnboardingError::MissingObPkAuth)?;
            let (uv, _) = VaultWrapper::create_user_vault(
                conn,
                context.keypair,
                obc,
                context.challenge_state.phone_number_e164_with_suffix,
                context.global_sh_phone_number,
                tenant_sh_phone_number,
            )?;
            (uv.into_inner().id, VerifyKind::UserCreated)
        }
    };
    Ok(result)
}
