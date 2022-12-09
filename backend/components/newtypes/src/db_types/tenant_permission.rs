use std::collections::HashSet;

use crate::{CollectedDataOption, DataLifetimeKind};
use diesel::sql_types::Jsonb;
use diesel::{AsExpression, FromSqlRow};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum::EnumDiscriminants;
use strum_macros::Display;

#[derive(
    Debug,
    Clone,
    Apiv2Schema,
    PartialEq,
    Eq,
    Serialize,
    Deserialize,
    AsExpression,
    EnumDiscriminants,
    JsonSchema,
)]
#[strum_discriminants(derive(Display))]
#[diesel(sql_type = Jsonb)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind")]
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
    Decrypt { attributes: Vec<CollectedDataOption> },
    ManualReview,
}

#[derive(Debug, Clone, Apiv2Schema, PartialEq, Eq, Serialize, Deserialize, AsJsonb, JsonSchema)]
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

    pub fn can_decrypt(&self, attributes: Vec<DataLifetimeKind>) -> bool {
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
    use crate::{CollectedDataOption, DataLifetimeKind};
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
    #[test_case(vec![ApiKeys], vec![DataLifetimeKind::Ssn9] => false)]
    #[test_case(vec![Admin], vec![DataLifetimeKind::Ssn9, DataLifetimeKind::FirstName, DataLifetimeKind::Email] => true)]
    #[test_case(vec![Decrypt{attributes: vec![Name]}, Decrypt{attributes: vec![FullAddress]}], vec![DataLifetimeKind::FirstName, DataLifetimeKind::City] => true)]
    fn test_can_decrypt_basic(granted: Vec<TenantPermission>, requested: Vec<DataLifetimeKind>) -> bool {
        TenantPermissionList(granted).can_decrypt(requested)
    }

    #[test_case(vec![Ssn9], vec![DataLifetimeKind::Ssn9] => true)]
    #[test_case(vec![Ssn9], vec![DataLifetimeKind::Ssn4] => true)]
    #[test_case(vec![Name], vec![DataLifetimeKind::Ssn4] => false)]
    #[test_case(vec![Name, FullAddress], vec![DataLifetimeKind::FirstName, DataLifetimeKind::Zip] => true)]
    #[test_case(vec![Name, FullAddress], vec![DataLifetimeKind::FirstName, DataLifetimeKind::Email] => false)]
    #[test_case(vec![], vec![DataLifetimeKind::FirstName] => false)]
    fn test_can_decrypt(granted: Vec<CollectedDataOption>, requested: Vec<DataLifetimeKind>) -> bool {
        TenantPermissionList(vec![Decrypt { attributes: granted }]).can_decrypt(requested)
    }
}
