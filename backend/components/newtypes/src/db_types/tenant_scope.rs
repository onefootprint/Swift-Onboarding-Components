use crate::{
    CollectedDataOption,
    InvokeVaultProxyPermission,
    TenantRoleKindDiscriminant,
};
use diesel::{
    AsExpression,
    FromSqlRow,
};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use strum::{
    AsRefStr,
    EnumDiscriminants,
};

#[derive(
    Debug,
    Clone,
    Eq,
    PartialEq,
    Hash,
    AsRefStr,
    EnumDiscriminants,
    Apiv2Schema,
    serde::Serialize,
    serde::Deserialize,
    AsJsonb,
)]
#[strum_discriminants(
    derive(strum_macros::EnumString, strum_macros::Display),
    strum(serialize_all = "snake_case")
)]
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
    // Dashboard-user-only scopes
    /// Add, edit, and decrypt secret API keys and their roles
    ApiKeys,
    /// Create and update vault proxy configurations
    ManageVaultProxy,
    /// Configure webhook endpoints
    ManageWebhooks,
    /// Perform review actions on users, like making a new decision, adding an annotation, or
    /// re-triggering KYC
    ManualReview,
    /// Create and update onboarding configurations
    OnboardingConfiguration,
    /// Edit lists and entries
    WriteLists,
    /// Update org settings, roles, and users
    OrgSettings,

    //
    // API-KEY-ONLY SCOPES
    /// Forward identity data to a CIP integration
    CipIntegration,
    /// Invoke the specified vault proxies
    InvokeVaultProxy {
        data: InvokeVaultProxyPermission,
    },
    /// Run KYB checks on a vaulted business
    TriggerKyb,
    /// Run KYC checks on a vaulted user
    TriggerKyc,
    /// Create an auth token that can be used to launch Footprint.js for a given user
    AuthToken,
    /// Perform actions related to onboarding users - create short-lived onboarding sessions and
    /// validate tokens returned from Footprint.js
    Onboarding,

    /// Allows decrypting data attributes belonging to the listed CollectedDataOption
    Decrypt {
        data: CollectedDataOption,
    },
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
    /// Create new vaults and update existing vaults' information
    WriteEntities,

    /// Create labels and tags
    LabelAndTag,

    /// Allows tenants to submit compliance documents and edit document assignment.
    ManageComplianceDocSubmission,

    //
    // Compliance Partner Dashboard Scopes
    CompliancePartnerRead,
    CompliancePartnerAdmin,
    CompliancePartnerManageTemplates,
    CompliancePartnerManageReviews,
}

impl TenantScope {
    pub fn role_kinds(&self) -> Vec<TenantRoleKindDiscriminant> {
        use TenantRoleKindDiscriminant::*;
        match self {
            Self::Read => vec![ApiKey, DashboardUser],
            Self::Admin => vec![ApiKey, DashboardUser],
            Self::Decrypt { .. } => vec![ApiKey, DashboardUser],
            Self::DecryptCustom => vec![ApiKey, DashboardUser],
            Self::DecryptDocument => vec![ApiKey, DashboardUser],
            Self::DecryptDocumentAndSelfie => vec![ApiKey, DashboardUser],
            Self::DecryptAll => vec![ApiKey, DashboardUser],
            Self::WriteEntities => vec![ApiKey, DashboardUser],

            Self::ApiKeys => vec![DashboardUser],
            Self::ManageVaultProxy => vec![DashboardUser],
            Self::ManageWebhooks => vec![DashboardUser],
            Self::ManualReview => vec![DashboardUser],
            Self::OnboardingConfiguration => vec![DashboardUser],
            Self::OrgSettings => vec![DashboardUser],
            Self::WriteLists => vec![DashboardUser],

            Self::CipIntegration => vec![ApiKey],
            Self::InvokeVaultProxy { .. } => vec![ApiKey],
            Self::TriggerKyb => vec![ApiKey],
            Self::TriggerKyc => vec![ApiKey],
            Self::AuthToken => vec![ApiKey],
            Self::Onboarding => vec![ApiKey],

            Self::LabelAndTag => vec![ApiKey, DashboardUser],

            Self::ManageComplianceDocSubmission => vec![DashboardUser],

            Self::CompliancePartnerRead => vec![CompliancePartnerDashboardUser],
            Self::CompliancePartnerAdmin => vec![CompliancePartnerDashboardUser],
            Self::CompliancePartnerManageTemplates => vec![CompliancePartnerDashboardUser],
            Self::CompliancePartnerManageReviews => vec![CompliancePartnerDashboardUser],
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ProxyConfigId;
    use test_case::test_case;

    #[test_case(TenantScope::Decrypt{data: CollectedDataOption::FullAddress} => "{\"kind\":\"decrypt\",\"data\":\"full_address\"}")]
    #[test_case(TenantScope::Decrypt{data: CollectedDataOption::Ssn4} => "{\"kind\":\"decrypt\",\"data\":\"ssn4\"}")]
    #[test_case(TenantScope::DecryptDocumentAndSelfie => "{\"kind\":\"decrypt_document_and_selfie\"}")]
    #[test_case(TenantScope::Read => "{\"kind\":\"read\"}")]
    #[test_case(TenantScope::Admin => "{\"kind\":\"admin\"}")]
    #[test_case(TenantScope::OnboardingConfiguration => "{\"kind\":\"onboarding_configuration\"}")]
    #[test_case(TenantScope::WriteLists => "{\"kind\":\"write_lists\"}")]
    #[test_case(TenantScope::ApiKeys => "{\"kind\":\"api_keys\"}")]
    #[test_case(TenantScope::OrgSettings => "{\"kind\":\"org_settings\"}")]
    #[test_case(TenantScope::DecryptCustom => "{\"kind\":\"decrypt_custom\"}")]
    #[test_case(TenantScope::ManualReview => "{\"kind\":\"manual_review\"}")]
    #[test_case(TenantScope::InvokeVaultProxy{data: InvokeVaultProxyPermission::Any} => "{\"kind\":\"invoke_vault_proxy\",\"data\":{\"kind\":\"any\"}}")]
    #[test_case(TenantScope::InvokeVaultProxy{data: InvokeVaultProxyPermission::Id{id: ProxyConfigId::from("abc".to_owned())}} => "{\"kind\":\"invoke_vault_proxy\",\"data\":{\"kind\":\"id\",\"id\":\"abc\"}}")]
    fn test_to_string(identifier: TenantScope) -> String {
        serde_json::ser::to_string(&identifier).unwrap()
    }

    #[test_case("{\"kind\": \"decrypt\", \"data\": \"full_address\"}" => TenantScope::Decrypt{data: CollectedDataOption::FullAddress})]
    #[test_case("{\"kind\": \"decrypt\", \"data\": \"ssn4\"}" => TenantScope::Decrypt{data: CollectedDataOption::Ssn4})]
    #[test_case("{\"kind\": \"decrypt_document_and_selfie\"}" => TenantScope::DecryptDocumentAndSelfie)]
    #[test_case("{\"kind\": \"read\"}" => TenantScope::Read)]
    #[test_case("{\"kind\": \"admin\"}" => TenantScope::Admin)]
    #[test_case("{\"kind\": \"onboarding_configuration\"}" => TenantScope::OnboardingConfiguration)]
    #[test_case("{\"kind\": \"write_lists\"}" => TenantScope::WriteLists)]
    #[test_case("{\"kind\": \"api_keys\"}" => TenantScope::ApiKeys)]
    #[test_case("{\"kind\": \"org_settings\"}" => TenantScope::OrgSettings)]
    #[test_case("{\"kind\": \"decrypt_custom\"}" => TenantScope::DecryptCustom)]
    #[test_case("{\"kind\": \"manual_review\"}" => TenantScope::ManualReview)]
    #[test_case("{\"kind\": \"invoke_vault_proxy\", \"data\": {\"kind\": \"any\"}}" => TenantScope::InvokeVaultProxy{data: InvokeVaultProxyPermission::Any})]
    #[test_case("{\"kind\": \"invoke_vault_proxy\", \"data\": {\"kind\": \"id\", \"id\": \"abc\"}}" => TenantScope::InvokeVaultProxy{data: InvokeVaultProxyPermission::Id{id: ProxyConfigId::from("abc".to_owned())}})]
    fn test_from_str(input: &str) -> TenantScope {
        serde_json::de::from_str(input).unwrap()
    }
}
