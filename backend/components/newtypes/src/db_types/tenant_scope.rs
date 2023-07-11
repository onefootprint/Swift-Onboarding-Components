use std::str::FromStr;

use crate::util::impl_enum_string_diesel;
use crate::{CollectedDataOption, EnumDotNotationError};
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use itertools::Itertools;
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use strum::{AsRefStr, EnumDiscriminants};

#[derive(
    Debug,
    Clone,
    Eq,
    PartialEq,
    AsExpression,
    FromSqlRow,
    AsRefStr,
    EnumDiscriminants,
    Apiv2Schema,
    JsonSchema,
    serde::Serialize,
    serde::Deserialize,
)]
#[strum_discriminants(derive(strum_macros::EnumString), strum(serialize_all = "snake_case"))]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind")]
#[diesel(sql_type = Text)]
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

// TODO get rid of this when we migrate the serialization in the DB
impl_enum_string_diesel!(TenantScope);

/// A custom implementation to make the appearance of serialized TenantScopes much more reasonable.
/// We serialize scopes as `prefix.suffix`, or just `prefix` if the variant doesn't have any nested data
/// TODO share this implementation (and the below impls) with DataIdentifier
impl std::fmt::Display for TenantScope {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        let prefix = self.as_ref();
        let suffix = match self {
            Self::Decrypt { data } => Some(data.to_string()),
            _ => None,
        };
        if let Some(suffix) = suffix {
            write!(f, "{}.{}", prefix, suffix)
        } else {
            write!(f, "{}", prefix)
        }
    }
}

/// A custom implementation to make the appearance of serialized TenantScopes much more reasonable.
/// We serialize scopes as `prefix.suffix`, or just `prefix` if the variant doesn't have any nested data
impl FromStr for TenantScope {
    type Err = EnumDotNotationError;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let res = match TenantScopeDiscriminants::from_str(s) {
            Ok(scope_kind) => {
                Self::try_from(scope_kind).map_err(|_| EnumDotNotationError::CannotParse(s.into()))?
            }
            Err(_) => {
                let parts = s.split('.').collect_vec();
                let suffix = parts
                    .get(1)
                    .ok_or_else(|| EnumDotNotationError::CannotParse(s.into()))?;
                // Decrypt is the only complex option
                let cdo = CollectedDataOption::from_str(suffix)
                    .map_err(|_| EnumDotNotationError::CannotParseSuffix((*suffix).into()))?;
                if matches!(cdo, CollectedDataOption::Document(_)) {
                    // We should have parsed this as a Discriminant above
                    return Err(EnumDotNotationError::CannotParsePrefix(s.into()));
                }
                Self::Decrypt { data: cdo }
            }
        };
        Ok(res)
    }
}

impl TryFrom<TenantScopeDiscriminants> for TenantScope {
    type Error = crate::Error;
    fn try_from(value: TenantScopeDiscriminants) -> Result<Self, Self::Error> {
        let v = match value {
            TenantScopeDiscriminants::Read => Self::Read,
            TenantScopeDiscriminants::Admin => Self::Admin,
            TenantScopeDiscriminants::WriteEntities => Self::WriteEntities,
            TenantScopeDiscriminants::OnboardingConfiguration => Self::OnboardingConfiguration,
            TenantScopeDiscriminants::ApiKeys => Self::ApiKeys,
            TenantScopeDiscriminants::OrgSettings => Self::OrgSettings,
            TenantScopeDiscriminants::DecryptCustom => Self::DecryptCustom,
            TenantScopeDiscriminants::ManualReview => Self::ManualReview,
            TenantScopeDiscriminants::VaultProxy => Self::VaultProxy,
            TenantScopeDiscriminants::CipIntegration => Self::CipIntegration,
            TenantScopeDiscriminants::DecryptAll => Self::DecryptAll,
            TenantScopeDiscriminants::DecryptDocument => Self::DecryptDocument,
            TenantScopeDiscriminants::DecryptDocumentAndSelfie => Self::DecryptDocumentAndSelfie,
            TenantScopeDiscriminants::Decrypt => {
                return Err(crate::Error::Custom("Cannot convert TenantScope".to_owned()))
            }
            TenantScopeDiscriminants::TriggerKyc => Self::TriggerKyc,
        };
        Ok(v)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use test_case::test_case;

    #[test_case(TenantScope::Decrypt{data: CollectedDataOption::FullAddress} => "decrypt.full_address")]
    #[test_case(TenantScope::Decrypt{data: CollectedDataOption::Ssn4} => "decrypt.ssn4")]
    #[test_case(TenantScope::DecryptDocumentAndSelfie => "decrypt.document_and_selfie")]
    #[test_case(TenantScope::Read => "read")]
    #[test_case(TenantScope::Admin => "admin")]
    #[test_case(TenantScope::OnboardingConfiguration => "onboarding_configuration")]
    #[test_case(TenantScope::ApiKeys => "api_keys")]
    #[test_case(TenantScope::OrgSettings => "org_settings")]
    #[test_case(TenantScope::DecryptCustom => "decrypt_custom")]
    #[test_case(TenantScope::ManualReview => "manual_review")]
    fn test_to_string(identifier: TenantScope) -> String {
        identifier.to_string()
    }

    #[test_case("decrypt.full_address" => TenantScope::Decrypt{data: CollectedDataOption::FullAddress})]
    #[test_case("decrypt.ssn4" => TenantScope::Decrypt{data: CollectedDataOption::Ssn4})]
    #[test_case("decrypt.document_and_selfie" => TenantScope::DecryptDocumentAndSelfie)]
    #[test_case("read" => TenantScope::Read)]
    #[test_case("admin" => TenantScope::Admin)]
    #[test_case("onboarding_configuration" => TenantScope::OnboardingConfiguration)]
    #[test_case("api_keys" => TenantScope::ApiKeys)]
    #[test_case("org_settings" => TenantScope::OrgSettings)]
    #[test_case("decrypt_custom" => TenantScope::DecryptCustom)]
    #[test_case("manual_review" => TenantScope::ManualReview)]
    fn test_from_str(input: &str) -> TenantScope {
        TenantScope::from_str(input).unwrap()
    }
}
