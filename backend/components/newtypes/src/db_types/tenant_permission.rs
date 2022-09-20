pub use derive_more::Display;
use diesel::sql_types::Jsonb;
use diesel::{AsExpression, FromSqlRow};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use strum::EnumDiscriminants;

use crate::CollectedDataOption;

#[derive(
    Debug, Clone, Apiv2Schema, PartialEq, Eq, Serialize, Deserialize, AsExpression, EnumDiscriminants,
)]
#[strum_discriminants(derive(Display))]
#[diesel(sql_type=Jsonb)]
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
