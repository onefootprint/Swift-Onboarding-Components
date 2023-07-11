use crate::CollectedDataOption;
use diesel::{AsExpression, FromSqlRow};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use strum::{AsRefStr, EnumDiscriminants};

#[derive(
    Debug,
    Clone,
    Eq,
    PartialEq,
    AsRefStr,
    EnumDiscriminants,
    Apiv2Schema,
    JsonSchema,
    serde::Serialize,
    serde::Deserialize,
    AsJsonb,
)]
#[strum_discriminants(derive(strum_macros::EnumString), strum(serialize_all = "snake_case"))]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind")]
/// Represents a scope that is granted to TenantUsers in a specific TenantRole
pub enum TenantScope {
    /// Every token that exists must have minimum this Read scope. This allows basic access to most
    /// GET endpoints
    Read,
    /// A special scope that gives permission to perform all actions.
    Admin,
    //
    //
    // CAREFUL: The below scopes allow WRITE access to various related endpoints.
    //
    //
    /// Allows adding and editing onboarding configurations
    OnboardingConfiguration,
    /// Allows adding, editing, and decrypting tenant API keys
    ApiKeys,
    /// Allows updating org settings, roles, and users
    OrgSettings,
    /// Allows updating and creating vault proxy configuration
    VaultProxy,
    /// Allows performing manual review actions on users, like making a new decision or adding an annotation
    ManualReview,
    /// Allows creating new users and updating existing entities' data
    WriteEntities,

    /// Allows decrypting data attributes belonging to the listed CollectedDataOption
    /// TODO: Should probably also add a DecryptAll here
    Decrypt { data: CollectedDataOption },
    /// Allows decrypting all custom attributes. TODO more fine-grained decryption controls
    DecryptCustom,
    #[strum(to_string = "decrypt.document")]
    #[strum_discriminants(strum(to_string = "decrypt.document"))]
    /// Allows decrypting all document data
    DecryptDocument,
    #[strum(to_string = "decrypt.document_and_selfie")]
    #[strum_discriminants(strum(to_string = "decrypt.document_and_selfie"))]
    /// Allows decrypting all document data and selfies
    DecryptDocumentAndSelfie,
    /// Allows decrypting all data
    DecryptAll,

    /// Allows decrypting relevant identity data for forwarding to a CIP integration
    CipIntegration,

    /// Allows manually triggering KYC for a user via API
    TriggerKyc,
}

#[cfg(test)]
mod tests {
    use super::*;
    use test_case::test_case;

    #[test_case(TenantScope::Decrypt{data: CollectedDataOption::FullAddress} => "{\"kind\":\"decrypt\",\"data\":\"full_address\"}")]
    #[test_case(TenantScope::Decrypt{data: CollectedDataOption::Ssn4} => "{\"kind\":\"decrypt\",\"data\":\"ssn4\"}")]
    #[test_case(TenantScope::DecryptDocumentAndSelfie => "{\"kind\":\"decrypt_document_and_selfie\"}")]
    #[test_case(TenantScope::Read => "{\"kind\":\"read\"}")]
    #[test_case(TenantScope::Admin => "{\"kind\":\"admin\"}")]
    #[test_case(TenantScope::OnboardingConfiguration => "{\"kind\":\"onboarding_configuration\"}")]
    #[test_case(TenantScope::ApiKeys => "{\"kind\":\"api_keys\"}")]
    #[test_case(TenantScope::OrgSettings => "{\"kind\":\"org_settings\"}")]
    #[test_case(TenantScope::DecryptCustom => "{\"kind\":\"decrypt_custom\"}")]
    #[test_case(TenantScope::ManualReview => "{\"kind\":\"manual_review\"}")]
    fn test_to_string(identifier: TenantScope) -> String {
        serde_json::ser::to_string(&identifier).unwrap()
    }

    #[test_case("{\"kind\": \"decrypt\", \"data\": \"full_address\"}" => TenantScope::Decrypt{data: CollectedDataOption::FullAddress})]
    #[test_case("{\"kind\": \"decrypt\", \"data\": \"ssn4\"}" => TenantScope::Decrypt{data: CollectedDataOption::Ssn4})]
    #[test_case("{\"kind\": \"decrypt_document_and_selfie\"}" => TenantScope::DecryptDocumentAndSelfie)]
    #[test_case("{\"kind\": \"read\"}" => TenantScope::Read)]
    #[test_case("{\"kind\": \"admin\"}" => TenantScope::Admin)]
    #[test_case("{\"kind\": \"onboarding_configuration\"}" => TenantScope::OnboardingConfiguration)]
    #[test_case("{\"kind\": \"api_keys\"}" => TenantScope::ApiKeys)]
    #[test_case("{\"kind\": \"org_settings\"}" => TenantScope::OrgSettings)]
    #[test_case("{\"kind\": \"decrypt_custom\"}" => TenantScope::DecryptCustom)]
    #[test_case("{\"kind\": \"manual_review\"}" => TenantScope::ManualReview)]
    fn test_from_str(input: &str) -> TenantScope {
        serde_json::de::from_str(input).unwrap()
    }
}
