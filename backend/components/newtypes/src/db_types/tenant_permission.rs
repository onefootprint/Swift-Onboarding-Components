use std::str::FromStr;

pub use derive_more::Display;
use diesel::{pg::Pg, sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use regex::Regex;
use strum::{EnumDiscriminants, EnumString};

use crate::{util::impl_enum_string_diesel, CollectedDataOption, Error};

#[derive(Debug, Clone, Apiv2Schema, PartialEq, Eq, AsExpression, FromSqlRow, EnumDiscriminants)]
#[strum_discriminants(derive(Display, EnumString))]
#[strum_discriminants(name(TenantPermissionDiscriminant))]
#[diesel(sql_type = Text)]
pub enum TenantPermission {
    Admin,
    OnboardingConfiguration,
    ApiKeys,
    OrgSettings,
    SecurityLogs,
    Users,
    // Allows decrypting all custom attributes
    // TODO more fine-grained decryption controls
    DecryptCustom,
    // Similarly to how we store permissions on an OnboardingConfiguration, we denote the set of
    // decryptable fields with CollectedDataOption
    Decrypt(CollectedDataOption),
}

impl std::fmt::Display for TenantPermission {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let (variant, arguments) = match self {
            Self::Admin => (TenantPermissionDiscriminant::Admin, None),
            Self::OnboardingConfiguration => (TenantPermissionDiscriminant::OnboardingConfiguration, None),
            Self::ApiKeys => (TenantPermissionDiscriminant::ApiKeys, None),
            Self::OrgSettings => (TenantPermissionDiscriminant::OrgSettings, None),
            Self::SecurityLogs => (TenantPermissionDiscriminant::SecurityLogs, None),
            Self::Users => (TenantPermissionDiscriminant::Users, None),
            Self::DecryptCustom => (TenantPermissionDiscriminant::DecryptCustom, None),
            Self::Decrypt(args) => (TenantPermissionDiscriminant::Decrypt, Some(args.as_ref())),
        };
        let arguments = if let Some(arguments) = arguments {
            // Nest arguments in the serialized representation
            format!("({})", arguments)
        } else {
            // Represent the permission as just the discriminant name
            "".to_owned()
        };
        write!(f, "{}{}", variant, arguments)
    }
}

impl FromStr for TenantPermission {
    type Err = crate::Error;
    fn from_str(value: &str) -> Result<Self, Self::Err> {
        Self::try_from(value)
    }
}

lazy_static! {
    // TenantPermissions are represented as either a plain discriminant name OR the discriminant
    // name plus any arguments in parentheses.
    pub static ref TENANT_PERMISSION_REGEX: Regex =
        Regex::new(r#"(?P<variant>[A-Za-z0-9_]+)(\((?P<arguments>.+)\))?"#).unwrap();
}

impl TryFrom<&str> for TenantPermission {
    type Error = Error;
    fn try_from(value: &str) -> Result<Self, Self::Error> {
        let captures = TENANT_PERMISSION_REGEX
            .captures(value)
            .ok_or(Error::DeserializeError)?;
        let variant = captures.name("variant").ok_or(Error::DeserializeError)?.as_str();
        let arguments = captures.name("arguments");
        let variant =
            TenantPermissionDiscriminant::from_str(variant).map_err(|_| crate::Error::DeserializeError)?;
        let result = match variant {
            TenantPermissionDiscriminant::Admin => Self::Admin,
            TenantPermissionDiscriminant::OnboardingConfiguration => Self::OnboardingConfiguration,
            TenantPermissionDiscriminant::ApiKeys => Self::ApiKeys,
            TenantPermissionDiscriminant::OrgSettings => Self::OrgSettings,
            TenantPermissionDiscriminant::SecurityLogs => Self::SecurityLogs,
            TenantPermissionDiscriminant::Users => Self::Users,
            TenantPermissionDiscriminant::DecryptCustom => Self::DecryptCustom,
            TenantPermissionDiscriminant::Decrypt => {
                let arguments = arguments.ok_or(Error::DeserializeError)?.as_str();
                let option = CollectedDataOption::from_str(arguments).map_err(|_| Error::DeserializeError)?;
                Self::Decrypt(option)
            }
        };
        Ok(result)
    }
}

impl_enum_string_diesel!(TenantPermission);

#[cfg(test)]
mod tests {
    use super::*;
    use test_case::test_case;

    #[test_case(TenantPermission::Admin => "Admin")]
    #[test_case(TenantPermission::OnboardingConfiguration => "OnboardingConfiguration")]
    #[test_case(TenantPermission::DecryptCustom => "DecryptCustom")]
    #[test_case(TenantPermission::Decrypt(CollectedDataOption::Dob) => "Decrypt(Dob)")]
    #[test_case(TenantPermission::Decrypt(CollectedDataOption::FullAddress) => "Decrypt(FullAddress)")]
    #[test_case(TenantPermission::Decrypt(CollectedDataOption::Ssn9) => "Decrypt(Ssn9)")]
    fn test_to_string(identifier: TenantPermission) -> String {
        identifier.to_string()
    }

    #[test_case("Admin" => TenantPermission::Admin)]
    #[test_case("OnboardingConfiguration" => TenantPermission::OnboardingConfiguration)]
    #[test_case("DecryptCustom" => TenantPermission::DecryptCustom)]
    #[test_case("Decrypt(Dob)" => TenantPermission::Decrypt(CollectedDataOption::Dob))]
    #[test_case("Decrypt(FullAddress)" => TenantPermission::Decrypt(CollectedDataOption::FullAddress))]
    #[test_case("Decrypt(Ssn9)" => TenantPermission::Decrypt(CollectedDataOption::Ssn9))]
    fn test_from_str(input: &str) -> TenantPermission {
        TenantPermission::from_str(input).unwrap()
    }
}
