use std::collections::HashSet;

use newtypes::{AuthEventKind, IdentifyScope, VaultId};
use paperclip::actix::Apiv2Schema;

mod session;
pub use session::*;
use strum::EnumDiscriminants;
mod guard;
mod user_wf;
pub use user_wf::*;

#[derive(
    serde::Serialize, serde::Deserialize, PartialEq, Eq, Hash, Debug, Clone, Apiv2Schema, EnumDiscriminants,
)]
#[strum_discriminants(name(UserAuthGuard))]
#[strum_discriminants(derive(Apiv2Schema, serde_with::SerializeDisplay, strum_macros::Display, Hash))]
#[strum_discriminants(vis(pub))]
#[strum_discriminants(strum(serialize_all = "snake_case"))]
#[serde(rename = "snake_case")]
// WARNING: changing this could break existing user auth sessions
pub enum UserAuthScope {
    /// For adding new data in bifrost
    SignUp,
    /// For adding auth data
    Auth,
    // We don't currently issue a token with this - was for my1fp
    BasicProfile,
    SensitiveProfile,
    Handoff,

    /// Granted when the auth token was generated using explicit (not implicit) auth
    ExplicitAuth,

    /// This scope should never be issued to a token - it is used to gate certain actions that
    /// should never be done by a user
    Never,
}

/// A helper trait to extract a user vault id on combined types
pub trait UserAuth {
    fn user_vault_id(&self) -> &VaultId;
}

/// Computes the list of scopes to be granted to an auth token for a user.
/// - `auth_events`: the auths that this user has performed
/// - `scope`: the requested IdentifyScope
/// - `is_implied_auth`: whether the auth events at this tenant were inherited virtually rather than physically
/// The result is the intersection of the scopes requested and the scopes allowed by the auth methods
pub fn allowed_user_scopes(
    auth_events: Vec<AuthEventKind>,
    scope: IdentifyScope,
    is_explicit_auth: bool,
) -> Vec<UserAuthScope> {
    let requested_scopes = match scope {
        IdentifyScope::Auth => vec![UserAuthScope::Auth],
        IdentifyScope::Onboarding => vec![UserAuthScope::SignUp, UserAuthScope::SensitiveProfile],
        IdentifyScope::My1fp => vec![UserAuthScope::BasicProfile, UserAuthScope::SensitiveProfile],
    };
    let allowed_scopes: HashSet<_> = auth_events
        .iter()
        .flat_map(auth_event_to_scopes)
        // Don't allow implicit auth to get sensitive profile
        .filter(|s| is_explicit_auth || *s != UserAuthScope::SensitiveProfile)
        .collect();
    // Filter the requested scopes to what is allowed by the provided auth_events
    requested_scopes
        .into_iter()
        .filter(|f| allowed_scopes.contains(f))
        // Regardless of requested scopes, add explicit auth scope if warranted
        .chain(is_explicit_auth.then_some(UserAuthScope::ExplicitAuth))
        .collect()
}

/// Returns the list of UserAuthScopes that are allowed to be granted for the auth method provided
fn auth_event_to_scopes(k: &AuthEventKind) -> Vec<UserAuthScope> {
    match k {
        AuthEventKind::Sms | AuthEventKind::Email => vec![
            UserAuthScope::SignUp,
            UserAuthScope::Auth,
            UserAuthScope::BasicProfile,
            UserAuthScope::Handoff,
        ],
        AuthEventKind::Passkey | AuthEventKind::ThirdParty => vec![
            UserAuthScope::SignUp,
            UserAuthScope::Auth,
            UserAuthScope::BasicProfile,
            UserAuthScope::SensitiveProfile,
            UserAuthScope::Handoff,
        ],
    }
}

#[cfg(test)]
mod test {
    use super::UserAuthScope;
    use newtypes::{AuthEventKind, IdentifyScope};
    use test_case::test_case;

    #[test]
    fn test_serialize() {
        let expected_parsed = vec![
            UserAuthScope::SignUp,
            UserAuthScope::BasicProfile,
            UserAuthScope::Handoff,
        ];

        // Obviously should be able to deserialize OrgOnboarding into OrgOnboarding
        let modern_value_str = "[\"SignUp\",\"BasicProfile\",\"Handoff\"]";
        let modern_value: Vec<UserAuthScope> = serde_json::de::from_str(modern_value_str).unwrap();
        assert_eq!(modern_value, expected_parsed);

        let serialized = serde_json::ser::to_string(&modern_value).unwrap();
        assert_eq!(serialized, modern_value_str)
    }

    #[test_case(vec![AuthEventKind::Sms], IdentifyScope::My1fp, true => vec![UserAuthScope::BasicProfile, UserAuthScope::ExplicitAuth])]
    #[test_case(vec![AuthEventKind::Email], IdentifyScope::My1fp, true => vec![UserAuthScope::BasicProfile, UserAuthScope::ExplicitAuth])]
    #[test_case(vec![AuthEventKind::Passkey], IdentifyScope::My1fp, true => vec![UserAuthScope::BasicProfile, UserAuthScope::SensitiveProfile, UserAuthScope::ExplicitAuth])]
    #[test_case(vec![AuthEventKind::Sms, AuthEventKind::Passkey], IdentifyScope::My1fp, true => vec![UserAuthScope::BasicProfile, UserAuthScope::SensitiveProfile, UserAuthScope::ExplicitAuth])]
    #[test_case(vec![AuthEventKind::Sms], IdentifyScope::Auth, true => vec![UserAuthScope::Auth, UserAuthScope::ExplicitAuth])]
    #[test_case(vec![AuthEventKind::Email], IdentifyScope::Auth, true => vec![UserAuthScope::Auth, UserAuthScope::ExplicitAuth])]
    #[test_case(vec![AuthEventKind::Passkey], IdentifyScope::Auth, true => vec![UserAuthScope::Auth, UserAuthScope::ExplicitAuth])]
    #[test_case(vec![AuthEventKind::Sms, AuthEventKind::Passkey], IdentifyScope::Auth, true => vec![UserAuthScope::Auth, UserAuthScope::ExplicitAuth])]
    #[test_case(vec![AuthEventKind::Sms], IdentifyScope::Onboarding, true => vec![UserAuthScope::SignUp, UserAuthScope::ExplicitAuth])]
    #[test_case(vec![AuthEventKind::Email], IdentifyScope::Onboarding, true => vec![UserAuthScope::SignUp, UserAuthScope::ExplicitAuth])]
    #[test_case(vec![AuthEventKind::Passkey], IdentifyScope::Onboarding, true => vec![UserAuthScope::SignUp, UserAuthScope::SensitiveProfile, UserAuthScope::ExplicitAuth])]
    #[test_case(vec![AuthEventKind::Sms, AuthEventKind::Passkey], IdentifyScope::Onboarding, true => vec![UserAuthScope::SignUp, UserAuthScope::SensitiveProfile, UserAuthScope::ExplicitAuth])]
    // Even with passkey auth, if auth is inherited, can't get sensitive profile
    #[test_case(vec![AuthEventKind::Sms, AuthEventKind::Passkey], IdentifyScope::Onboarding, false => vec![UserAuthScope::SignUp])]
    fn test_allowed_scopes(
        kinds: Vec<AuthEventKind>,
        scope: IdentifyScope,
        is_explicit_auth: bool,
    ) -> Vec<UserAuthScope> {
        super::allowed_user_scopes(kinds, scope, is_explicit_auth)
    }
}
