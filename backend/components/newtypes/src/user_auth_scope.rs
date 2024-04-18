use paperclip::actix::Apiv2Schema;
use strum_macros::EnumDiscriminants;

#[derive(
    PartialEq,
    Eq,
    Hash,
    Debug,
    Clone,
    Apiv2Schema,
    EnumDiscriminants,
    strum_macros::Display,
    strum_macros::EnumString,
    serde_with::SerializeDisplay,
    serde_with::DeserializeFromStr,
    macros::SerdeAttr,
)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
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
    use crate::UserAuthScope;

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
    }
}
