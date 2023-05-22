use newtypes::{ScopedVaultId, VaultId, WorkflowId};
use paperclip::actix::Apiv2Schema;

mod session;
pub use session::*;
use strum::EnumDiscriminants;
mod guard;
mod user_ob;
pub use user_ob::*;

#[derive(
    serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug, Clone, Apiv2Schema, EnumDiscriminants,
)]
#[strum_discriminants(name(UserAuthGuard))]
#[strum_discriminants(derive(Apiv2Schema, serde::Serialize, strum_macros::Display, Hash))]
#[strum_discriminants(vis(pub))]
#[serde(rename = "snake_case")]
// WARNING: changing this could break existing user auth sessions
pub enum UserAuthScope {
    SignUp,
    OrgOnboarding {
        id: ScopedVaultId,
    },
    Business(ScopedVaultId),
    // We don't currently issue a token with this - was for my1fp
    BasicProfile,
    SensitiveProfile,
    Handoff,

    /// This scope should never be issued to a token - it is used to gate certain actions that
    /// should never be done by a user
    Never,
    Workflow {
        wf_id: WorkflowId,
    },
}

/// A helper trait to extract a user vault id on combined types
pub trait UserAuth {
    fn user_vault_id(&self) -> &VaultId;
}

#[cfg(test)]
mod test {
    use newtypes::ScopedVaultId;

    use super::UserAuthScope;

    #[test]
    fn test_serialize() {
        let expected_parsed = vec![
            UserAuthScope::SignUp,
            UserAuthScope::OrgOnboarding {
                id: ScopedVaultId::test_data("FLERP".to_owned()),
            },
        ];

        // Obviously should be able to deserialize OrgOnboarding into OrgOnboarding
        let modern_value_str = "[\"SignUp\",{\"OrgOnboarding\":{\"id\":\"FLERP\"}}]";
        let modern_value: Vec<UserAuthScope> = serde_json::de::from_str(modern_value_str).unwrap();
        assert_eq!(modern_value, expected_parsed);

        // When serializing, should serialize into OrgOnboarding rather than OrgOnboardingInit
        let serialized = serde_json::ser::to_string(&modern_value).unwrap();
        assert_eq!(serialized, modern_value_str)
    }
}
