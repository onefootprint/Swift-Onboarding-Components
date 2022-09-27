use std::collections::HashSet;

use crate::{CollectedDataOption, DataAttribute};
use diesel::sql_types::Jsonb;
use diesel::{AsExpression, FromSqlRow};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use strum::EnumDiscriminants;
use strum_macros::Display;

#[derive(
    Debug, Clone, Apiv2Schema, PartialEq, Eq, Serialize, Deserialize, AsExpression, EnumDiscriminants,
)]
#[strum_discriminants(derive(Display))]
#[diesel(sql_type = Jsonb)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind")]
pub enum TenantPermission {
    Admin,
    OnboardingConfiguration,
    ApiKeys,
    AuditTrail,
    OrgSettings,
    SecurityLogs,
    Users,
    // Allows decrypting all custom attributes
    // TODO more fine-grained decryption controls
    DecryptCustom,
    // Similarly to how we store permissions on an OnboardingConfiguration, we denote the set of
    // decryptable fields with CollectedDataOption
    Decrypt { attributes: Vec<CollectedDataOption> },
}

#[derive(Debug, Clone, Apiv2Schema, PartialEq, Eq, Serialize, Deserialize, AsJsonb)]
#[serde(transparent)]
pub struct TenantPermissionList(pub Vec<TenantPermission>);

impl From<Vec<TenantPermission>> for TenantPermissionList {
    fn from(p: Vec<TenantPermission>) -> Self {
        Self(p)
    }
}

impl std::ops::Deref for TenantPermissionList {
    type Target = Vec<TenantPermission>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl TenantPermissionList {
    pub fn is_admin(&self) -> bool {
        self.contains(&TenantPermission::Admin)
    }

    pub fn has_permission(&self, permission: &TenantPermission) -> bool {
        self.is_admin() || self.contains(permission)
    }

    pub fn can_decrypt(&self, attributes: Vec<DataAttribute>) -> bool {
        let can_access_attributes: HashSet<_> = self
            .iter()
            .filter_map(|p| match p {
                TenantPermission::Decrypt { attributes } => Some(attributes),
                _ => None,
            })
            .flatten()
            .flat_map(|x| x.attributes())
            .collect();
        self.is_admin() || can_access_attributes.is_superset(&HashSet::from_iter(attributes.into_iter()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{CollectedDataOption, DataAttribute};
    use test_case::test_case;
    use CollectedDataOption::*;
    use TenantPermission::*;

    #[test_case(vec![ApiKeys, OnboardingConfiguration], Users => false)]
    #[test_case(vec![OnboardingConfiguration], ApiKeys => false)]
    #[test_case(vec![ApiKeys, OnboardingConfiguration], ApiKeys => true)]
    #[test_case(vec![ApiKeys, OnboardingConfiguration], OnboardingConfiguration => true)]
    #[test_case(vec![ApiKeys, OnboardingConfiguration], DecryptCustom => false)]
    #[test_case(vec![], OnboardingConfiguration => false)]
    #[test_case(vec![Admin], OnboardingConfiguration => true)]
    fn test_has_permission(granted: Vec<TenantPermission>, requested: TenantPermission) -> bool {
        TenantPermissionList(granted).has_permission(&requested)
    }

    #[test_case(vec![ApiKeys], vec![] => true)]
    #[test_case(vec![ApiKeys], vec![DataAttribute::Ssn9] => false)]
    #[test_case(vec![Admin], vec![DataAttribute::Ssn9, DataAttribute::FirstName, DataAttribute::Email] => true)]
    #[test_case(vec![Decrypt{attributes: vec![Name]}, Decrypt{attributes: vec![FullAddress]}], vec![DataAttribute::FirstName, DataAttribute::City] => true)]
    fn test_can_decrypt_basic(granted: Vec<TenantPermission>, requested: Vec<DataAttribute>) -> bool {
        TenantPermissionList(granted).can_decrypt(requested)
    }

    #[test_case(vec![Ssn9], vec![DataAttribute::Ssn9] => true)]
    #[test_case(vec![Ssn9], vec![DataAttribute::Ssn4] => true)]
    #[test_case(vec![Name], vec![DataAttribute::Ssn4] => false)]
    #[test_case(vec![Name, FullAddress], vec![DataAttribute::FirstName, DataAttribute::Zip] => true)]
    #[test_case(vec![Name, FullAddress], vec![DataAttribute::FirstName, DataAttribute::Email] => false)]
    #[test_case(vec![], vec![DataAttribute::FirstName] => false)]
    fn test_can_decrypt(granted: Vec<CollectedDataOption>, requested: Vec<DataAttribute>) -> bool {
        TenantPermissionList(vec![Decrypt { attributes: granted }]).can_decrypt(requested)
    }
}
