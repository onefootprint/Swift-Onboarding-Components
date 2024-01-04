#![recursion_limit = "256"]

use api_core::auth::ob_config::ObConfigAuth;
use api_core::auth::user::CheckedUserAuthContext;
use api_core::errors::ApiResult;
use api_core::telemetry::RootSpan;
use api_core::utils::challenge::{ChallengeKind, ChallengeToken};
use api_core::utils::sms::PhoneEmailChallengeState;
use api_core::utils::vault_wrapper::{Person, VaultWrapper, VwArgs};
use api_core::State;
use api_wire_types::IdentifyId;
use db::errors::OptionalExtension;
use db::models::contact_info::ContactInfo;
use db::models::scoped_vault::ScopedVault;
use db::models::tenant::Tenant;
use db::models::webauthn_credential::WebauthnCredential;
use itertools::Itertools;
use newtypes::ContactInfoKind;
use newtypes::IdentityDataKind as IDK;
use newtypes::PiiString;
use newtypes::SandboxId;
use newtypes::VaultId;
use paperclip::actix::{web, Apiv2Schema};
use strum::EnumDiscriminants;
use webauthn_rs_core::proto::{AuthenticationState, Base64UrlSafeData};

#[allow(clippy::module_inception)]
pub mod identify;
pub mod login_challenge;
pub mod signup_challenge;
pub mod verify;

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub(crate) enum CreateChallengeRequest {
    Email(String),
    PhoneNumber(String),
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
#[serde(rename_all = "snake_case")]
pub struct UserChallengeData {
    challenge_kind: ChallengeKind,
    challenge_token: ChallengeToken,
    /// For login challenges, provide some context on where the challenge was sent
    scrubbed_phone_number: Option<PiiString>,
    biometric_challenge_json: Option<String>,
    time_before_retry_s: i64,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct BiometricChallengeState {
    pub state: AuthenticationState,
    pub user_vault_id: VaultId,
    #[serde(default)]
    pub non_synced_cred_ids: Vec<Base64UrlSafeData>,
}

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(identify::post)
        .service(login_challenge::post)
        .service(signup_challenge::post)
        .service(verify::post);
}

// TODO unnecessary wrapper
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ChallengeState {
    data: ChallengeData,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, EnumDiscriminants)]
pub enum ChallengeData {
    Sms(PhoneEmailChallengeState),
    #[serde(alias = "Biometric")] // TODO: drop this alias after challenges expire
    Passkey(BiometricChallengeState),
    Email(PhoneEmailChallengeState),
}

#[allow(clippy::large_enum_variant)]
#[derive(Debug)]
pub enum VaultIdentifier {
    IdentifyId(IdentifyId, Option<SandboxId>),
    AuthenticatedId(CheckedUserAuthContext),
}
pub struct UserChallengeContext {
    vw: VaultWrapper<Person>,
    webauthn_creds: Vec<WebauthnCredential>,
    challenge_kinds: Vec<ChallengeKind>,
    is_unverified: bool,
    tenant: Option<Tenant>,
}

#[allow(clippy::type_complexity)]
#[tracing::instrument(skip(state, root_span))]
async fn get_user_challenge_context(
    state: &web::Data<State>,
    identifier: VaultIdentifier,
    obc: Option<ObConfigAuth>,
    root_span: RootSpan,
) -> ApiResult<Option<UserChallengeContext>> {
    // Look up existing user vault by identifier
    let t_id = obc.as_ref().map(|obc| &obc.tenant().id);
    let (existing_user_id, sv_id) = match identifier {
        VaultIdentifier::IdentifyId(id, sandbox_id) => {
            let Some(existing) = state.find_vault(id, sandbox_id, t_id).await? else {
                return Ok(None);
            };
            existing
        }
        VaultIdentifier::AuthenticatedId(auth) => (auth.user.clone().id, auth.scoped_user_id()),
    };

    // Record some properties on the root span
    root_span.record("vault_id", existing_user_id.to_string());

    let (uvw, creds, tenant) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            // Add some log fields to the root span. Prefer info from the sv_id, otherwise look
            // through the obc
            let tenant = if let Some(sv_id) = sv_id.as_ref() {
                let sv = ScopedVault::get(conn, sv_id)?;
                root_span.record("tenant_id", sv.tenant_id.to_string());
                root_span.record("is_live", sv.is_live);
                root_span.record("fp_id", sv.fp_id.to_string());
                let tenant = Tenant::get(conn, &sv.tenant_id)?;
                Some(tenant)
            } else if let Some(obc) = obc {
                root_span.record("tenant_id", obc.tenant().id.to_string());
                root_span.record("is_live", obc.ob_config().is_live);
                let t_id = &obc.tenant().id;
                // If there's already a SV for this (user, tenant) pair, log the fp_id
                if let Some(sv) = ScopedVault::get(conn, (&existing_user_id, t_id)).optional()? {
                    root_span.record("fp_id", sv.fp_id.to_string());
                }
                let tenant = Tenant::get(conn, t_id)?;
                Some(tenant)
            } else {
                None
            };

            let args = if let Some(sv_id) = sv_id.as_ref() {
                // If we have already identified a specific SV, create a UVW that sees all
                // speculative data for the tenant in order to see a speculative phone number
                // that was added by this tenant.
                VwArgs::Tenant(sv_id)
            } else {
                // Otherwise, create a UVW that only sees portable data
                VwArgs::Vault(&existing_user_id)
            };
            let uvw = VaultWrapper::build(conn, args)?;

            let creds = WebauthnCredential::list(conn, &uvw.vault.id)?;
            Ok((uvw, creds, tenant))
        })
        .await??;

    let ci = vec![ContactInfoKind::Phone, ContactInfoKind::Email]
        .into_iter()
        .filter_map(|ci| uvw.get(IDK::from(ci)).map(|d| (ci, d.lifetime_id().clone())))
        .collect_vec();
    let cis = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            ci.into_iter()
                .map(|(ci, id)| -> ApiResult<_> { Ok((ci, ContactInfo::get(conn, &id)?)) })
                .collect::<ApiResult<Vec<_>>>()
        })
        .await??;

    let mut kinds = cis
        .iter()
        .filter(|(_, ci)| ci.is_otp_verified)
        .map(|(kind, _)| ChallengeKind::from(*kind))
        .collect_vec();
    if !creds.is_empty() {
        kinds.push(ChallengeKind::Passkey);
    }
    let is_unverified = kinds.is_empty()
        && uvw.vault.is_created_via_api
        && cis.iter().any(|(k, _)| *k == ContactInfoKind::Phone);
    let kinds = if is_unverified {
        // If this is a non-portable vault with a phone, allow initiating a challenge to the phone
        // even though it is unverified
        vec![ContactInfoKind::Phone.into()]
    } else {
        kinds
    };

    let ctx = UserChallengeContext {
        vw: uvw,
        webauthn_creds: creds,
        challenge_kinds: kinds,
        is_unverified,
        tenant,
    };
    Ok(Some(ctx))
}
