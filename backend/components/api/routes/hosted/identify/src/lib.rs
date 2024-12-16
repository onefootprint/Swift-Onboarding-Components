#![recursion_limit = "256"]

use api_core::auth::session::user::ContactInfoVerifySessionData;
use api_core::auth::session::AuthSessionData;
use api_core::auth::user::UserIdentifier;
use api_core::errors::error_with_code::ErrorWithCode;
use api_core::telemetry::RootSpan;
use api_core::utils::identify::get_user_auth_methods;
use api_core::utils::identify::UserAuthMethodsContext;
use api_core::utils::session::AuthSession;
use api_core::FpResult;
use api_core::State;
use api_errors::FpDbOptionalExtension;
use api_wire_types::IdentifyId;
use api_wire_types::IdentifyIdKind;
use crypto::sha256;
use db::models::playbook::Playbook;
use db::models::scoped_vault::ScopedVault;
use db::models::tenant::Tenant;
use db::models::vault::LocatedVault;
use newtypes::output::Csv;
use newtypes::AuthEventId;
use newtypes::DataIdentifier as DI;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeId;
use newtypes::PiiString;
use newtypes::SandboxId;
use newtypes::ScopedVaultId;
use newtypes::SessionAuthToken;
use newtypes::VaultId;
use paperclip::actix::web;
use strum::EnumDiscriminants;
use webauthn_rs_core::proto::AuthenticationState;

mod contact_info_verify;
#[allow(clippy::module_inception)]
pub mod identify;
mod identify_lite;
mod kba;
pub mod login_challenge;
mod session;
pub mod signup_challenge;
mod utils;
mod validation_token;
pub mod verify;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(identify::post)
        .service(identify_lite::post)
        .service(login_challenge::post)
        .service(signup_challenge::post)
        .service(kba::post)
        .service(verify::post)
        .service(contact_info_verify::post)
        .service(contact_info_verify::get)
        .service(validation_token::post);
    session::routes(config);
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
    SmsLink(SmsLinkChallengeState),
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SmsLinkChallengeState {
    pub e164: PiiString,
    pub lifetime_id: DataLifetimeId,
    pub token: SessionAuthToken,
}

impl SmsLinkChallengeState {
    pub async fn verify_response(&self, state: &State) -> FpResult<AuthEventId> {
        let token = self.token.clone();
        let sealing_key = state.session_sealing_key.clone();
        let session = state
            .db_query(move |conn| AuthSession::get(conn, &sealing_key, &token))
            .await?;
        let AuthSessionData::ContactInfoVerify(ContactInfoVerifySessionData {
            auth_event_id: Some(auth_event_id),
            ..
        }) = session.data
        else {
            return Err(ErrorWithCode::ContactInfoNotYetVerified.into());
        };
        Ok(auth_event_id)
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct BiometricChallengeState {
    pub state: AuthenticationState,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct PhoneEmailChallengeState {
    pub h_code: Vec<u8>,
    // Can we rm this?
    pub contact_info: PiiString,
    pub lifetime_id: DataLifetimeId,
}

impl PhoneEmailChallengeState {
    pub fn verify_response(&self, challenge_response: &str) -> FpResult<()> {
        let PhoneEmailChallengeState { h_code, .. } = self;
        if h_code != &sha256(challenge_response.as_bytes()).to_vec() {
            return Err(ErrorWithCode::IncorrectPin.into());
        };
        Ok(())
    }
}

pub enum IdentifyLookupId {
    /// The user has already been identified. We have an existing vault_id and optionally a
    /// scoped_vault_id, if the user already has an account at this tenant
    User(VaultId, Option<ScopedVaultId>),
    /// The user has not been identified yet. We have a list of PII to look up by fingerprint
    Pii(Vec<IdentifyId>),
}

pub struct GetIdentifyChallengeArgs<'a> {
    pub identifier: IdentifyLookupId,
    pub playbook: Option<Playbook>,
    pub sandbox_id: Option<SandboxId>,
    pub root_span: RootSpan,
    pub kba_dis: &'a [DI],
}

pub struct IdentifyChallengeContext {
    pub ctx: UserAuthMethodsContext,
    pub tenant: Option<Tenant>,
    pub sv: Option<ScopedVault>,
    /// When true, allowed to create a new user via a signup challenge even when there's already
    /// an existing user with this contact info.
    /// Generally, a user can make a new vault IF they're not in a context logging into a tenant
    /// that they've already onboarded onto
    pub can_initiate_signup_challenge: bool,
    /// The list of DIs whose fingerprints matched the vault
    pub matching_fps: Vec<DataIdentifier>,
}

#[tracing::instrument(skip_all)]
async fn get_identify_challenge_context<'a>(
    state: &State,
    args: GetIdentifyChallengeArgs<'a>,
) -> FpResult<Option<IdentifyChallengeContext>> {
    let GetIdentifyChallengeArgs {
        identifier,
        playbook,
        sandbox_id,
        root_span,
        kba_dis,
    } = args;

    let t_id = playbook.as_ref().map(|playbook| &playbook.tenant_id);
    // Look up existing user vault by identifier
    let (existing_user_id, sv_id, matching_fps) = match identifier {
        IdentifyLookupId::Pii(identifiers) => {
            tracing::info!(identifiers=?Csv(identifiers.iter().map(IdentifyIdKind::from).collect()), has_uv_id=%false, has_su_id=%false, has_playbook=%playbook.is_some(), has_sandbox_id=%sandbox_id.is_some(), "Getting identify challenge context");
            let Some((existing, sv_id)) = state.find_vault(identifiers, sandbox_id, t_id).await? else {
                return Ok(None);
            };
            let LocatedVault { vault, matching_fps } = existing;
            (vault.id, sv_id, matching_fps)
        }
        IdentifyLookupId::User(uv_id, su_id) => {
            tracing::info!(has_uv_id=%true, has_su_id=%su_id.is_some(), has_playbook=%playbook.is_some(), has_sandbox_id=%sandbox_id.is_some(), "Getting identify challenge context");
            (uv_id, su_id, vec![])
        }
    };

    // Record some properties on the root span
    root_span.record("vault_id", existing_user_id.to_string());
    let v_id = existing_user_id.clone();
    let (tenant, sv) = state
        .db_query(move |conn| {
            // Add some log fields to the root span. Prefer info from the sv_id, otherwise look
            // through the obc
            let (tenant, sv) = if let Some(sv_id) = sv_id.as_ref() {
                let sv = ScopedVault::get(conn, sv_id)?;
                root_span.record_su(&sv);
                let tenant = Tenant::get(conn, &sv.tenant_id)?;
                (Some(tenant), Some(sv))
            } else if let Some(obc) = playbook {
                root_span.record("tenant_id", obc.tenant_id.to_string());
                root_span.record("is_live", obc.is_live);
                let t_id = &obc.tenant_id;
                let tenant = Tenant::get(conn, t_id)?;
                // If there's already a SV for this (user, tenant) pair, log the fp_id
                let sv = ScopedVault::get(conn, (&v_id, t_id)).optional()?;
                if let Some(sv) = sv.as_ref() {
                    root_span.record_su(sv);
                }
                (Some(tenant), sv)
            } else {
                (None, None)
            };
            Ok((tenant, sv))
        })
        .await?;
    let identifier = if let Some(sv) = sv.as_ref() {
        UserIdentifier::ScopedVault(sv.id.clone())
    } else {
        // Will be missing a scoped vault for myf1p OR when logging into an existing user onboarding onto a
        // new tenant
        UserIdentifier::Vault(existing_user_id)
    };
    let ctx = get_user_auth_methods(state, identifier, kba_dis).await?;
    let can_initiate_signup_challenge = tenant.is_some() && sv.is_none();
    let ctx = IdentifyChallengeContext {
        ctx,
        tenant,
        sv,
        can_initiate_signup_challenge,
        matching_fps,
    };
    Ok(Some(ctx))
}
