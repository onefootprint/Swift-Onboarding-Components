use super::vault_wrapper::Person;
use crate::auth::user::CheckedUserAuthContext;
use crate::auth::user::UserIdentifier;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::vault_wrapper::VwArgs;
use crate::FpResult;
use db::models::contact_info::ContactInfo;
use db::models::webauthn_credential::WebauthnCredential;
use db::PgConn;
use itertools::Itertools;
use newtypes::AuthMethodKind;
use newtypes::ChallengeKind;
use newtypes::ContactInfoKind;
use newtypes::DataIdentifier as DI;
use newtypes::IdentityDataKind as IDK;

pub struct UserAuthMethodsContext {
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

/// Determine what challenge kinds are available for the given user.
/// We don't store any strong association of what constitutes a registered auth method in the
/// database. So we have to assemble it from a combination of vault data, ContactInfo, and
/// WebauthnCredentials. Eventually, we should create a table of registered AuthMethods in the
/// database.
///
/// NOTE: this method needs to service two contexts: user-specific contexts (like my1fp or logging
/// into an existing vault in order to onboard onto a new tenant) AND scoped-user-specific contexts.
#[tracing::instrument(skip_all, fields(identifier))]
pub fn get_user_auth_methods(
    conn: &mut PgConn,
    identifier: UserIdentifier,
    user_auth: Option<CheckedUserAuthContext>,
) -> FpResult<UserAuthMethodsContext> {
    // TODO make this closer to the source of truth - challenges should be initiated from this returned
    // list of what's available, and these should include the phone / email
    let args = VwArgs::from(&identifier);
    let uvw = VaultWrapper::build(conn, args)?;

    let passkeys = match identifier {
        UserIdentifier::Vault(v_id) => WebauthnCredential::list(conn, &v_id)?,
        UserIdentifier::ScopedVault(sv_id) => WebauthnCredential::list(conn, &sv_id)?,
    };

    let ci = vec![ContactInfoKind::Phone, ContactInfoKind::Email]
        .into_iter()
        // TODO eventually only decrypt ci.verified_di()
        .filter_map(|ci| uvw.get_lifetime(&ci.di()).map(|d| (ci, d.clone())))
        .collect_vec();

    let cis = ci
        .into_iter()
        .map(|(ci, dl)| -> FpResult<_> { Ok((ci, ContactInfo::get(conn, &dl.id)?, dl)) })
        .collect::<FpResult<Vec<_>>>()?;

    let is_all_ci_unverified = cis.iter().all(|(_, ci, _)| !ci.is_otp_verified());
    let mut allowed_unverified_methods = user_auth
        .iter()
        .flat_map(|ua| &ua.data.kba)
        .flat_map(allowed_unverified_methods_for_kba)
        .collect_vec();
    let is_vault_unverified = is_all_ci_unverified && uvw.vault.is_created_via_api;
    if is_vault_unverified {
        // If this is a non-portable vault, allow initiating a challenge to the phone and email
        // even though they are unverified.
        allowed_unverified_methods.append(&mut vec![AuthMethodKind::Phone, AuthMethodKind::Email]);
    }

    let auth_methods = cis
        .iter()
        // TODO one day, don't allow logging in via data added via bootstrap?
        .map(|(cik, ci, _)| AuthMethod {
            kind: AuthMethodKind::from(*cik),
            is_verified: ci.is_otp_verified(),
            can_initiate_challenge: ci.is_otp_verified(),
        })
        .chain((!passkeys.is_empty()).then_some(AuthMethod {
            kind: AuthMethodKind::Passkey,
            is_verified: true,
            can_initiate_challenge: true,
        }))
        .map(|m| AuthMethod {
            kind: m.kind,
            is_verified: m.is_verified,
            // Allow initiating challenges to unverified methods that are either permitted by
            // KBA or because the vault is "not yet" portable
            can_initiate_challenge: m.can_initiate_challenge || allowed_unverified_methods.contains(&m.kind),
        })
        .collect_vec();

    let available_challenge_kinds = auth_methods
        .iter()
        .filter(|m| m.can_initiate_challenge)
        .map(|m| m.kind.into())
        .collect_vec();

    let ctx = UserAuthMethodsContext {
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
