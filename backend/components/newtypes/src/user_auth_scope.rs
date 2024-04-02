use paperclip::actix::Apiv2Schema;
use strum_macros::EnumDiscriminants;

#[derive(
    serde::Serialize, serde::Deserialize, PartialEq, Eq, Hash, Debug, Clone, Apiv2Schema, EnumDiscriminants,
)]
#[strum_discriminants(name(UserAuthGuard))]
#[strum_discriminants(derive(
    Apiv2Schema,
    serde_with::SerializeDisplay,
    strum_macros::Display,
    Hash,
    macros::SerdeAttr
))]
#[strum_discriminants(vis(pub))]
#[strum_discriminants(strum(serialize_all = "snake_case"))]
#[strum_discriminants(serde(rename_all = "snake_case"))]
#[serde(rename_all = "snake_case")]
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
    /// Only for vaulting data
    VaultData,

    /// Granted when the auth token was generated using explicit (not implicit) auth
    ExplicitAuth,
}


#[cfg(test)]
mod test {
    use crate::{UserAuthGuard, UserAuthScope};

    #[test]
    fn test_user_auth_scope_backcompat() {
        let expected_scopes = vec![
            UserAuthScope::SignUp,
            UserAuthScope::Auth,
            UserAuthScope::BasicProfile,
            UserAuthScope::SensitiveProfile,
            UserAuthScope::Handoff,
            UserAuthScope::VaultData,
            UserAuthScope::ExplicitAuth,
        ];

        let modern_value = r#"["sign_up","auth","basic_profile","sensitive_profile","handoff","vault_data","explicit_auth"]"#;
        let deserialized = serde_json::de::from_str::<Vec<UserAuthScope>>(modern_value).unwrap();
        assert_eq!(expected_scopes, deserialized);

        // Make sure we serialize the scopes as snake case
        let scopes_str = serde_json::ser::to_string(&expected_scopes).unwrap();
        assert_eq!(scopes_str, modern_value);

        // And then another weird one: we're going to replace UserAuthGuard with UserAuthScope once
        // their serializations are the same.
        // Let's check that they are the same
        let guards = vec![
            UserAuthGuard::SignUp,
            UserAuthGuard::Auth,
            UserAuthGuard::BasicProfile,
            UserAuthGuard::SensitiveProfile,
            UserAuthGuard::Handoff,
            UserAuthGuard::VaultData,
            UserAuthGuard::ExplicitAuth,
        ];
        let guards_str = serde_json::ser::to_string(&guards).unwrap();
        assert_eq!(guards_str, scopes_str);
    }
}
