use crate::{
    auth::user::CheckedUserAuthContext,
    errors::ApiResult,
    utils::vault_wrapper::{VaultWrapper, VwArgs},
    State,
};
use db::models::{contact_info::ContactInfo, webauthn_credential::WebauthnCredential};
use itertools::Itertools;
use newtypes::{
    AuthMethodKind, ChallengeKind, ContactInfoKind, DataIdentifier as DI, IdentityDataKind as IDK,
    ScopedVaultId, VaultId,
};

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
    /// When true, the auth method has been verified
    pub is_verified: bool,
    /// When true, this token can initiate a login challenge with this auth method
    pub can_initiate_challenge: bool,
}

/// Determine what challenge kinds are available for the given user
pub async fn get_user_challenge_context(
    state: &State,
    v_id: VaultId,
    sv_id: Option<ScopedVaultId>,
    user_auth: Option<CheckedUserAuthContext>,
) -> ApiResult<UserChallengeContext> {
    let (uvw, passkeys, cis) = state
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

            let passkeys = WebauthnCredential::list(conn, &uvw.vault.id)?;

            let ci = vec![ContactInfoKind::Phone, ContactInfoKind::Email]
                .into_iter()
                .filter_map(|ci| uvw.get_lifetime(DI::from(ci)).map(|d| (ci, d.clone())))
                .collect_vec();

            let cis = ci
                .into_iter()
                .map(|(ci, dl)| -> ApiResult<_> { Ok((ci, ContactInfo::get(conn, &dl.id)?, dl)) })
                .collect::<ApiResult<Vec<_>>>()?;

            Ok((uvw, passkeys, cis))
        })
        .await?;

    let is_all_ci_unverified = cis.iter().all(|(_, ci, _)| !ci.is_otp_verified);
    let is_vault_unverified = is_all_ci_unverified && uvw.vault.is_created_via_api;

    let auth_methods = if is_vault_unverified {
        // If this is a non-portable vault with a phone, allow initiating a challenge to the phone
        // even though it is unverified.
        // In theory, we could allow them to sign up with an email, but we'd prefer for them to
        // verify their phone number now
        let has_phone = cis.iter().any(|x| x.0 == ContactInfoKind::Phone);
        has_phone
            .then_some(AuthMethod {
                kind: AuthMethodKind::Phone,
                is_verified: false,
                can_initiate_challenge: true,
            })
            .into_iter()
            .collect_vec()
    } else {
        let allowed_unverified_methods = user_auth
            .iter()
            .flat_map(|ua| &ua.data.kba)
            .flat_map(allowed_unverified_methods_for_kba)
            .collect_vec();
        cis.iter()
            .map(|(cik, ci, _)| AuthMethod {
                kind: AuthMethodKind::from(*cik),
                is_verified: ci.is_otp_verified,
                can_initiate_challenge: ci.is_otp_verified,
            })
            .chain((!passkeys.is_empty()).then_some(AuthMethod {
                kind: AuthMethodKind::Passkey,
                is_verified: true,
                can_initiate_challenge: true,
            }))
            .map(|m| AuthMethod {
                kind: m.kind,
                is_verified: m.is_verified,
                // Allow initiating challenges to unverified methods that are permitted by KBA
                can_initiate_challenge: m.can_initiate_challenge
                    || allowed_unverified_methods.contains(&m.kind),
            })
            .collect_vec()
    };

    let available_challenge_kinds = auth_methods
        .iter()
        .filter(|m| m.can_initiate_challenge)
        .map(|m| m.kind.into())
        .collect_vec();

    let ctx = UserChallengeContext {
        vw: uvw,
        webauthn_creds: passkeys,
        auth_methods,
        available_challenge_kinds,
        is_vault_unverified,
    };
    Ok(ctx)
}

/// Given a DI that has been proven to be known via KBA, the list of AuthMethods that are allowed
/// to be challenged even when unverified.
fn allowed_unverified_methods_for_kba(di: &DI) -> Vec<AuthMethodKind> {
    match di {
        // If you prove knowledge of the phone number in the vault, you can sign in with an
        // unverified email
        DI::Id(IDK::PhoneNumber) => vec![AuthMethodKind::Email],
        _ => vec![],
    }
}
