use crate::{CollectedDataOption, NtResult, TenantError};
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
    /// Allows decrypting all custom attributes. TODO more fine-grained decryption controls
    DecryptCustom,
    /// Allows decrypting identity data attributes belonging to the listed CollectedDataOptions
    Decrypt(Vec<CollectedDataOption>),
    /// Allows performing manual review actions on users, like making a new decision or adding an annotation
    ManualReview,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, AsJsonb, JsonSchema)]
#[serde(transparent)]
/// Util wrapper around Vec<TenantScope> to make it easier to operate on as DB value
pub struct TenantScopeList(Vec<TenantScope>);

impl std::ops::Deref for TenantScopeList {
    type Target = Vec<TenantScope>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl TenantScopeList {
    /// Constructs a new TenantScopeList and validates its contents
    pub fn new(scopes: Vec<TenantScope>) -> NtResult<Self> {
        if !scopes.contains(&TenantScope::Read) && !scopes.contains(&TenantScope::Admin) {
            // Every role must have at least Read permissions for now
            return Err(TenantError::InsufficientScopes.into());
        }
        Ok(Self(scopes))
    }

    pub fn into_inner(self) -> Vec<TenantScope> {
        self.0
    }
}
