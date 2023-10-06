use newtypes::VaultId;
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
    SignUp,
    // We don't currently issue a token with this - was for my1fp
    BasicProfile,
    SensitiveProfile,
    Handoff,

    /// This scope should never be issued to a token - it is used to gate certain actions that
    /// should never be done by a user
    Never,
}

/// A helper trait to extract a user vault id on combined types
pub trait UserAuth {
    fn user_vault_id(&self) -> &VaultId;
}

#[cfg(test)]
mod test {
    use super::UserAuthScope;

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
}
