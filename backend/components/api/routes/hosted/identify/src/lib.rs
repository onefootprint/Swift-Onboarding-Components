#![recursion_limit = "256"]

use api_core::auth::ob_config::ObConfigAuth;
use api_core::auth::session::user::ContactInfoVerifySessionData;
use api_core::auth::session::AuthSessionData;
use api_core::auth::user::CheckedUserAuthContext;
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
use db::models::scoped_vault::ScopedVault;
use db::models::tenant::Tenant;
use db::models::vault::LocatedVault;
use newtypes::output::Csv;
use newtypes::AuthEventId;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeId;
use newtypes::PiiString;
use newtypes::SandboxId;
use newtypes::SessionAuthToken;
use paperclip::actix::web;
use strum::EnumDiscriminants;
use webauthn_rs_core::proto::AuthenticationState;

mod contact_info_verify;
#[allow(clippy::module_inception)]
pub mod identify;
mod identify_lite;
mod kba;
pub mod login_challenge;
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

pub struct GetIdentifyChallengeArgs {
    pub user_auth: Option<CheckedUserAuthContext>,
    pub identifiers: Vec<IdentifyId>,
    pub sandbox_id: Option<SandboxId>,
    pub obc: Option<ObConfigAuth>,
    pub root_span: RootSpan,
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
async fn get_identify_challenge_context(
    state: &State,
    args: GetIdentifyChallengeArgs,
) -> FpResult<Option<IdentifyChallengeContext>> {
    let GetIdentifyChallengeArgs {
        user_auth,
        identifiers,
        sandbox_id,
        obc,
        root_span,
    } = args;
    tracing::info!(identifiers=?Csv(identifiers.iter().map(IdentifyIdKind::from).collect()), has_user_auth=%user_auth.is_some(), has_ob_context=%obc.is_some(), has_sandbox_id=%sandbox_id.is_some(), "Getting identify challenge context");

    // Get the Playbook from either user auth or obc auth, preferring to extract from the auth token
    let playbook = (user_auth.as_ref().and_then(|ua| ua.playbook.as_ref()))
        .or(obc.as_ref().map(|ob| ob.playbook()))
        .cloned();
    let t_id = playbook.as_ref().map(|playbook| &playbook.tenant_id);
    // Look up existing user vault by identifier
    let (existing_user_id, sv_id, matching_fps) = match (user_auth.as_ref(), identifiers) {
        // Identified via phone or email
        (None, ids) if !ids.is_empty() => {
            let Some((existing, sv_id)) = state.find_vault(ids, sandbox_id, t_id).await? else {
                return Ok(None);
            };
            let LocatedVault { vault, matching_fps } = existing;
            (vault.id, sv_id, matching_fps)
        }
        // Identified via auth token
        (Some(auth), ids) if ids.is_empty() => (auth.user.clone().id, auth.su_id.clone(), vec![]),
        // Require one of user_auth or identifier
        (_, _) => return Err(ErrorWithCode::OnlyOneIdentifier.into()),
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
    let ctx = get_user_auth_methods(state, identifier, user_auth).await?;
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
