use crate::errors::ApiResult;
use crate::utils::vault_wrapper::{VaultWrapper, VwArgs};
use crate::State;
use db::models::contact_info::ContactInfo;
use db::models::webauthn_credential::WebauthnCredential;
use itertools::Itertools;
use newtypes::VaultId;
use newtypes::{ChallengeKind, ScopedVaultId};
use newtypes::{ContactInfoKind, DataIdentifier as DI};

use super::vault_wrapper::Person;

pub struct UserChallengeContext {
    pub vw: VaultWrapper<Person>,
    pub webauthn_creds: Vec<WebauthnCredential>,
    pub available_challenge_kinds: Vec<ChallengeKind>,
    pub is_vault_unverified: bool,
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

    let is_all_ci_unverified = cis.iter().all(|(_, ci, _)| !ci.is_otp_verified);
    let is_vault_unverified = is_all_ci_unverified && uvw.vault.is_created_via_api;
    let available_challenge_kinds = if is_vault_unverified {
        // If this is a non-portable vault with a phone, allow initiating a challenge to the phone
        // even though it is unverified.
        // In theory, we could allow them to sign up with an email, but we'd prefer for them to
        // verify their phone number now
        let includes_phone = cis.iter().any(|(k, _, _)| *k == ContactInfoKind::Phone);
        includes_phone
            .then_some(ContactInfoKind::Phone.into())
            .into_iter()
            .collect()
    } else {
        let mut kinds = cis
            .iter()
            .filter(|(_, ci, _)| ci.is_otp_verified)
            .map(|(kind, _, _)| ChallengeKind::from(*kind))
            .collect_vec();
        if !creds.is_empty() {
            kinds.push(ChallengeKind::Passkey);
        }
        kinds
    };

    let ctx = UserChallengeContext {
        vw: uvw,
        webauthn_creds: creds,
        available_challenge_kinds,
        is_vault_unverified,
    };
    Ok(ctx)
}
