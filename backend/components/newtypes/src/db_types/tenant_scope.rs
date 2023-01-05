use crate::CollectedDataOption;
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
    Display,
    Deserialize,
    AsExpression,
    EnumDiscriminants,
    JsonSchema,
)]
#[strum_discriminants(derive(Display))]
#[diesel(sql_type = Jsonb)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind")]
/// Represents a scope that is granted to TenantUsers in a specific TenantRole
pub enum TenantScope {
    Admin,
    OnboardingConfiguration,
    ApiKeys,
    OrgSettings,
    Users,
    // Allows decrypting all custom attributes
    // TODO more fine-grained decryption controls
    DecryptCustom,
    // Similarly to how we store permissions on an OnboardingConfiguration, we denote the set of
    // decryptable fields with CollectedDataOption
    Decrypt(Vec<CollectedDataOption>),
    ManualReview,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, AsJsonb, JsonSchema)]
#[serde(transparent)]
/// Util wrapper around Vec<TenantScope> to make it easier to operate on as DB value
pub struct TenantScopeList(pub Vec<TenantScope>);

impl std::ops::Deref for TenantScopeList {
    type Target = Vec<TenantScope>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}
