use super::TenantScope;
use paperclip::actix::Apiv2Schema;
use strum_macros::Display;
use strum_macros::EnumString;

#[derive(
    EnumString,
    Display,
    serde_with::SerializeDisplay,
    serde_with::DeserializeFromStr,
    Debug,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Apiv2Schema,
    macros::SerdeAttr,
)]
#[serde(rename_all = "snake_case")]
#[strum(serialize_all = "snake_case")]
pub enum TenantSessionPurpose {
    Dashboard,
    Docs,
}

impl TenantSessionPurpose {
    /// For the provided scope, returns the subset of scopes that are permissible by the auth token
    /// purpose.
    /// This allows down-scoping a role for specific token purposes.
    pub fn restrict_scope(&self, scope: TenantScope) -> Vec<TenantScope> {
        match self {
            // Dashboard tokens can use all permissions on a role
            Self::Dashboard => vec![scope],
            // Tokens for the docs site have a more limited set of permissions
            Self::Docs => match scope {
                TenantScope::Read | TenantScope::ApiKeys => vec![scope],
                // Specially map Admin to the subset of permissions that are available
                TenantScope::Admin => vec![TenantScope::Read, TenantScope::ApiKeys],
                _ => vec![],
            },
        }
    }
}
