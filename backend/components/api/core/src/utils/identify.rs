use crate::errors::ApiResult;
use crate::utils::vault_wrapper::{VaultWrapper, VwArgs};
use crate::State;
use db::models::contact_info::ContactInfo;
use db::models::webauthn_credential::WebauthnCredential;
use itertools::Itertools;
use newtypes::{AuthMethodKind, VaultId};
use newtypes::{ChallengeKind, ScopedVaultId};
use newtypes::{ContactInfoKind, DataIdentifier as DI};

use super::vault_wrapper::Person;

pub struct UserChallengeContext {
    pub vw: VaultWrapper<Person>,
    pub webauthn_creds: Vec<WebauthnCredential>,
    pub auth_methods: Vec<AuthMethod>,
    pub available_challenge_kinds: Vec<ChallengeKind>,
    pub is_vault_unverified: bool,
}

pub struct AuthMethod {
    pub kind: AuthMethodKind,
    pub is_verified: bool,
}

/// Determine what challenge kinds are available for the given user
pub async fn get_user_challenge_context(
    state: &State,
    v_id: VaultId,
    sv_id: Option<ScopedVaultId>,
) -> ApiResult<UserChallengeContext> {
    let (uvw, creds, cis) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let args = if let Some(sv_id) = sv_id.as_ref() {
                // If we have already identified a specific SV, create a UVW that sees all
                // speculative data for the tenant in order to see a speculative phone number
                // that was added by this tenant.
                VwArgs::Tenant(sv_id)
            } else {
                // Otherwise, create a UVW that only sees portable data
                VwArgs::Vault(&v_id)
            };
            let uvw = VaultWrapper::build(conn, args)?;

            let creds = WebauthnCredential::list(conn, &uvw.vault.id)?;

            let ci = vec![ContactInfoKind::Phone, ContactInfoKind::Email]
                .into_iter()
                .filter_map(|ci| uvw.get_lifetime(DI::from(ci)).map(|d| (ci, d.clone())))
                .collect_vec();

            let cis = ci
                .into_iter()
                .map(|(ci, dl)| -> ApiResult<_> { Ok((ci, ContactInfo::get(conn, &dl.id)?, dl)) })
                .collect::<ApiResult<Vec<_>>>()?;

            Ok((uvw, creds, cis))
        })
        .await??;

    let mut auth_methods = cis
        .iter()
        .map(|(cik, ci, _)| AuthMethod {
            kind: (*cik).into(),
            is_verified: ci.is_otp_verified,
        })
        .collect_vec();
    if !creds.is_empty() {
        auth_methods.push(AuthMethod {
            kind: AuthMethodKind::Passkey,
            is_verified: true,
        });
    }

    let is_all_ci_unverified = cis.iter().all(|(_, ci, _)| !ci.is_otp_verified);
    let is_vault_unverified = is_all_ci_unverified && uvw.vault.is_created_via_api;
    let auth_methods = if is_vault_unverified {
        // If this is a non-portable vault with a phone, allow initiating a challenge to the phone
        // even though it is unverified.
        // In theory, we could allow them to sign up with an email, but we'd prefer for them to
        // verify their phone number now
        auth_methods
            .into_iter()
            .filter(|m| m.kind == AuthMethodKind::Phone)
            .collect_vec()
    } else {
        auth_methods
    };
    let available_challenge_kinds = auth_methods
        .iter()
        // If the whole vault is unverified and made via API, allow logging in with unverified
        // auth methods
        .filter(|m| m.is_verified || is_vault_unverified)
        .map(|m| m.kind.into())
        .collect_vec();

    let ctx = UserChallengeContext {
        vw: uvw,
        webauthn_creds: creds,
        auth_methods,
        available_challenge_kinds,
        is_vault_unverified,
    };
    Ok(ctx)
}
