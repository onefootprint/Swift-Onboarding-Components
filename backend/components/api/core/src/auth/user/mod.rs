use newtypes::AuthEventKind;
use newtypes::RequestedTokenScope;
pub use newtypes::UserAuthScope;
use newtypes::VaultId;
use std::collections::HashSet;

mod session;
pub use session::*;
mod guard;
mod user_wf;
pub use user_wf::*;
mod it_user;
pub use it_user::*;

/// A helper trait to extract a user vault id on combined types
pub trait UserAuth {
    fn user_vault_id(&self) -> &VaultId;
}

/// Computes the list of scopes to be granted to an auth token for a user.
/// - `auth_events`: the auths that this user has performed
/// - `scope`: the requested IdentifyScope
/// - `is_explicit_auth`: whether the auth events at this tenant were performed explicitly and not
///   implicitly inherited.
/// The result is the intersection of the scopes requested and the scopes allowed by the auth
/// methods
pub fn allowed_user_scopes(
    auth_events: Vec<AuthEventKind>,
    scope: RequestedTokenScope,
    is_explicit_auth: bool,
) -> Vec<UserAuthScope> {
    let requested_scopes = match scope {
        RequestedTokenScope::Auth => vec![UserAuthScope::Auth],
        RequestedTokenScope::OnboardingComponents => vec![UserAuthScope::VaultData],
        RequestedTokenScope::Onboarding => vec![
            UserAuthScope::SignUp,
            UserAuthScope::VaultData,
            UserAuthScope::SensitiveProfile,
        ],
        RequestedTokenScope::My1fp => vec![UserAuthScope::BasicProfile, UserAuthScope::SensitiveProfile],
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
            UserAuthScope::VaultData,
            UserAuthScope::Handoff,
        ],
        AuthEventKind::Passkey | AuthEventKind::ThirdParty => vec![
            UserAuthScope::SignUp,
            UserAuthScope::Auth,
            UserAuthScope::BasicProfile,
            UserAuthScope::VaultData,
            UserAuthScope::SensitiveProfile,
            UserAuthScope::Handoff,
        ],
    }
}

#[cfg(test)]
mod test {
    use super::RequestedTokenScope;
    use super::UserAuthScope;
    use newtypes::AuthEventKind;
    use test_case::test_case;

    #[test]
    fn test_serialize() {
        let expected_parsed = vec![
            UserAuthScope::SignUp,
            UserAuthScope::BasicProfile,
            UserAuthScope::Handoff,
        ];

        let modern_value_str = "[\"sign_up\",\"basic_profile\",\"handoff\"]";
        let modern_value: Vec<UserAuthScope> = serde_json::de::from_str(modern_value_str).unwrap();
        assert_eq!(modern_value, expected_parsed);

        let serialized = serde_json::ser::to_string(&modern_value).unwrap();
        assert_eq!(serialized, modern_value_str)
    }

    #[test_case(vec![AuthEventKind::Sms], RequestedTokenScope::My1fp, true => vec![UserAuthScope::BasicProfile, UserAuthScope::ExplicitAuth])]
    #[test_case(vec![AuthEventKind::Email], RequestedTokenScope::My1fp, true => vec![UserAuthScope::BasicProfile, UserAuthScope::ExplicitAuth])]
    #[test_case(vec![AuthEventKind::Passkey], RequestedTokenScope::My1fp, true => vec![UserAuthScope::BasicProfile, UserAuthScope::SensitiveProfile, UserAuthScope::ExplicitAuth])]
    #[test_case(vec![AuthEventKind::Sms, AuthEventKind::Passkey], RequestedTokenScope::My1fp, true => vec![UserAuthScope::BasicProfile, UserAuthScope::SensitiveProfile, UserAuthScope::ExplicitAuth])]
    #[test_case(vec![AuthEventKind::Sms], RequestedTokenScope::Auth, true => vec![UserAuthScope::Auth, UserAuthScope::ExplicitAuth])]
    #[test_case(vec![AuthEventKind::Email], RequestedTokenScope::Auth, true => vec![UserAuthScope::Auth, UserAuthScope::ExplicitAuth])]
    #[test_case(vec![AuthEventKind::Passkey], RequestedTokenScope::Auth, true => vec![UserAuthScope::Auth, UserAuthScope::ExplicitAuth])]
    #[test_case(vec![AuthEventKind::Sms, AuthEventKind::Passkey], RequestedTokenScope::Auth, true => vec![UserAuthScope::Auth, UserAuthScope::ExplicitAuth])]
    #[test_case(vec![AuthEventKind::Sms], RequestedTokenScope::Onboarding, true => vec![UserAuthScope::SignUp, UserAuthScope::VaultData, UserAuthScope::ExplicitAuth])]
    #[test_case(vec![AuthEventKind::Email], RequestedTokenScope::Onboarding, true => vec![UserAuthScope::SignUp, UserAuthScope::VaultData, UserAuthScope::ExplicitAuth])]
    #[test_case(vec![AuthEventKind::Passkey], RequestedTokenScope::Onboarding, true => vec![UserAuthScope::SignUp, UserAuthScope::VaultData, UserAuthScope::SensitiveProfile, UserAuthScope::ExplicitAuth])]
    #[test_case(vec![AuthEventKind::Passkey], RequestedTokenScope::OnboardingComponents, true => vec![UserAuthScope::VaultData, UserAuthScope::ExplicitAuth])]
    #[test_case(vec![AuthEventKind::Sms, AuthEventKind::Passkey], RequestedTokenScope::Onboarding, true => vec![UserAuthScope::SignUp, UserAuthScope::VaultData, UserAuthScope::SensitiveProfile, UserAuthScope::ExplicitAuth])]
    // Even with passkey auth, if auth is inherited, can't get sensitive profile
    #[test_case(vec![AuthEventKind::Sms, AuthEventKind::Passkey], RequestedTokenScope::Onboarding, false => vec![UserAuthScope::SignUp, UserAuthScope::VaultData])]
    fn test_allowed_scopes(
        kinds: Vec<AuthEventKind>,
        scope: RequestedTokenScope,
        is_explicit_auth: bool,
    ) -> Vec<UserAuthScope> {
        super::allowed_user_scopes(kinds, scope, is_explicit_auth)
    }
}
