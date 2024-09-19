use super::vault_wrapper::Person;
use crate::auth::user::CheckedUserAuthContext;
use crate::auth::user::UserIdentifier;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::vault_wrapper::VwArgs;
use crate::State;
use api_errors::AssertionError;
use api_errors::FpResult;
use db::models::contact_info::ContactInfo;
use db::models::passkey::Passkey;
use itertools::Itertools;
use newtypes::email::Email;
use newtypes::AuthMethodKind;
use newtypes::ContactInfoKind;
use newtypes::DataIdentifier as DI;
use newtypes::DataLifetimeId;
use newtypes::IdentityDataKind as IDK;
use newtypes::PhoneNumber;

pub struct UserAuthMethodsContext {
    pub vw: VaultWrapper<Person>,
    pub auth_methods: Vec<AuthMethod>,
    pub is_vault_unverified: bool,
}

#[derive(Debug)]
pub struct AuthMethod {
    pub info: AuthMethodInfo,
    /// When true, the auth method has been verified
    pub is_verified: bool,
    /// When true, this token can initiate a login challenge with this auth method
    pub can_initiate_login_challenge: bool,
}

#[derive(Debug)]
pub enum AuthMethodInfo {
    Passkey {
        passkeys: Vec<Passkey>,
    },
    Phone {
        phone: PhoneNumber,
        lifetime_id: DataLifetimeId,
    },
    Email {
        email: Email,
        lifetime_id: DataLifetimeId,
    },
}

impl AuthMethod {
    pub fn passkeys(&self) -> &[Passkey] {
        match &self.info {
            AuthMethodInfo::Passkey { passkeys } => passkeys,
            _ => &[],
        }
    }

    pub fn phone(&self) -> Option<&PhoneNumber> {
        match &self.info {
            AuthMethodInfo::Phone { phone, .. } => Some(phone),
            _ => None,
        }
    }

    pub fn email(&self) -> Option<&Email> {
        match &self.info {
            AuthMethodInfo::Email { email, .. } => Some(email),
            _ => None,
        }
    }

    pub fn kind(&self) -> AuthMethodKind {
        match &self.info {
            AuthMethodInfo::Email { .. } => AuthMethodKind::Email,
            AuthMethodInfo::Phone { .. } => AuthMethodKind::Phone,
            AuthMethodInfo::Passkey { .. } => AuthMethodKind::Passkey,
        }
    }
}

/// Determine what challenge kinds are available for the given user.
/// We don't store any strong association of what constitutes a registered auth method in the
/// database. So we have to assemble it from a combination of vault data, ContactInfo, and
/// Passkeys. Eventually, we should create a table of registered AuthMethods in the
/// database.
///
/// NOTE: this method needs to service two contexts: user-specific contexts (like my1fp or logging
/// into an existing vault in order to onboard onto a new tenant) AND scoped-user-specific contexts.
#[tracing::instrument(skip_all, fields(identifier))]
pub async fn get_user_auth_methods(
    state: &State,
    identifier: UserIdentifier,
    user_auth: Option<CheckedUserAuthContext>,
) -> FpResult<UserAuthMethodsContext> {
    let (uvw, cis, passkeys) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let uvw = VaultWrapper::build(conn, VwArgs::from(&identifier))?;
            let passkeys = match identifier {
                UserIdentifier::Vault(v_id) => Passkey::list(conn, &v_id)?,
                UserIdentifier::ScopedVault(sv_id) => Passkey::list(conn, &sv_id)?,
            };
            let cis = vec![ContactInfoKind::Phone, ContactInfoKind::Email]
                .into_iter()
                .filter_map(|cik| uvw.get_lifetime(&cik.di()).map(|dl| (cik, dl.id.clone())))
                .map(|(cik, dl_id)| ContactInfo::get(conn, &dl_id).map(|ci| (cik, ci, dl_id)))
                .collect::<Result<Vec<_>, _>>()?;
            Ok((uvw, cis, passkeys))
        })
        .await?;

    let is_all_ci_unverified = cis.iter().all(|(_, ci, _)| !ci.is_otp_verified());

    let mut auth_methods = vec![];
    for (cik, ci, lifetime_id) in cis {
        let info = match cik {
            ContactInfoKind::Phone => {
                let phone = uvw
                    .decrypt_unchecked_parse(state, IDK::PhoneNumber)
                    .await?
                    .ok_or(AssertionError("Missing phone number"))?;
                AuthMethodInfo::Phone { lifetime_id, phone }
            }
            ContactInfoKind::Email => {
                let email = uvw
                    .decrypt_unchecked_parse(state, IDK::Email)
                    .await?
                    .ok_or(AssertionError("Missing email"))?;
                AuthMethodInfo::Email { lifetime_id, email }
            }
        };
        auth_methods.push(AuthMethod {
            is_verified: ci.is_otp_verified(),
            info,
            // Allow initiating challenges to unverified methods that are either permitted by
            // KBA or because the vault is "not yet" portable
            can_initiate_login_challenge: ci.is_otp_verified(),
        })
    }

    if !passkeys.is_empty() {
        auth_methods.push(AuthMethod {
            is_verified: true,
            can_initiate_login_challenge: true,
            info: AuthMethodInfo::Passkey { passkeys },
        })
    }

    // Allow initiating challenges to unverified methods that are either permitted by
    // KBA or because the vault is "not yet" portable

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
    auth_methods.iter_mut().for_each(|m| {
        m.can_initiate_login_challenge =
            m.can_initiate_login_challenge || allowed_unverified_methods.contains(&m.kind())
    });

    let ctx = UserAuthMethodsContext {
        vw: uvw,
        auth_methods,
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
