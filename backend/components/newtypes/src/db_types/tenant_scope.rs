use std::str::FromStr;

use crate::util::impl_enum_string_diesel;
use crate::{CollectedDataOption, EnumDotNotationError};
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde_with::{DeserializeFromStr, SerializeDisplay};
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
    SerializeDisplay,
    DeserializeFromStr,
)]
#[strum_discriminants(derive(strum_macros::EnumString), strum(serialize_all = "snake_case"))]
#[strum(serialize_all = "snake_case")]
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
    /// Allows performing manual review actions on users, like making a new decision or adding an annotation
    ManualReview,

    /// Allows decrypting identity data attributes belonging to the listed CollectedDataOptions
    Decrypt(CollectedDataOption),
    /// Allows decrypting all custom attributes. TODO more fine-grained decryption controls
    DecryptCustom,
    /// Allows decrypting identity documents
    DecryptDocuments,
    // Allows decrypting selfie images
    DecryptSelfie,
}

impl_enum_string_diesel!(TenantScope);

/// A custom implementation to make the appearance of serialized TenantScopes much more reasonable.
/// We serialize scopes as `prefix.suffix`, or just `prefix` if the variant doesn't have any nested data
/// TODO share this implementation (and the below impls) with DataIdentifier
impl std::fmt::Display for TenantScope {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        let prefix = self.as_ref();
        let suffix = match self {
            Self::Decrypt(s) => Some(s.to_string()),
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
        let (prefix, suffix) = if let Some(first_period_idx) = s.find('.') {
            let prefix = &s[..first_period_idx];
            let suffix = &s[(first_period_idx + 1)..];
            (prefix, suffix)
        } else {
            (s, "")
        };
        let prefix = TenantScopeDiscriminants::from_str(prefix)
            .map_err(|_| EnumDotNotationError::CannotParsePrefix(prefix.to_owned()))?;
        // Parse the suffix differently depending on the prefix
        let suffix_parse_error = EnumDotNotationError::CannotParseSuffix(suffix.to_owned());
        let result = match prefix {
            TenantScopeDiscriminants::Decrypt => {
                Self::Decrypt(CollectedDataOption::from_str(suffix).map_err(|_| suffix_parse_error)?)
            }
            TenantScopeDiscriminants::Read => Self::Read,
            TenantScopeDiscriminants::Admin => Self::Admin,
            TenantScopeDiscriminants::OnboardingConfiguration => Self::OnboardingConfiguration,
            TenantScopeDiscriminants::ApiKeys => Self::ApiKeys,
            TenantScopeDiscriminants::OrgSettings => Self::OrgSettings,
            TenantScopeDiscriminants::DecryptCustom => Self::DecryptCustom,
            TenantScopeDiscriminants::DecryptDocuments => Self::DecryptDocuments,
            TenantScopeDiscriminants::DecryptSelfie => Self::DecryptSelfie,
            TenantScopeDiscriminants::ManualReview => Self::ManualReview,
        };
        Ok(result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use test_case::test_case;

    #[test_case(TenantScope::Decrypt(CollectedDataOption::FullAddress) => "decrypt.full_address")]
    #[test_case(TenantScope::Decrypt(CollectedDataOption::Ssn4) => "decrypt.ssn4")]
    #[test_case(TenantScope::Read => "read")]
    #[test_case(TenantScope::Admin => "admin")]
    #[test_case(TenantScope::OnboardingConfiguration => "onboarding_configuration")]
    #[test_case(TenantScope::ApiKeys => "api_keys")]
    #[test_case(TenantScope::OrgSettings => "org_settings")]
    #[test_case(TenantScope::DecryptCustom => "decrypt_custom")]
    #[test_case(TenantScope::DecryptDocuments => "decrypt_documents")]
    #[test_case(TenantScope::DecryptSelfie => "decrypt_selfie")]
    #[test_case(TenantScope::ManualReview => "manual_review")]
    fn test_to_string(identifier: TenantScope) -> String {
        identifier.to_string()
    }

    #[test_case("decrypt.full_address" => TenantScope::Decrypt(CollectedDataOption::FullAddress))]
    #[test_case("decrypt.ssn4" => TenantScope::Decrypt(CollectedDataOption::Ssn4))]
    #[test_case("read" => TenantScope::Read)]
    #[test_case("admin" => TenantScope::Admin)]
    #[test_case("onboarding_configuration" => TenantScope::OnboardingConfiguration)]
    #[test_case("api_keys" => TenantScope::ApiKeys)]
    #[test_case("org_settings" => TenantScope::OrgSettings)]
    #[test_case("decrypt_custom" => TenantScope::DecryptCustom)]
    #[test_case("decrypt_documents" => TenantScope::DecryptDocuments)]
    #[test_case("decrypt_selfie" => TenantScope::DecryptSelfie)]
    #[test_case("manual_review" => TenantScope::ManualReview)]
    fn test_from_str(input: &str) -> TenantScope {
        TenantScope::from_str(input).unwrap()
    }
}
