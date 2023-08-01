use newtypes::{FpId, TenantApiKeyId, TenantId, TenantRolebindingId, TenantUserId, WorkosAuthMethod};

use crate::auth::tenant::ClientTenantScope;

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
/// Basic auth used for dashboard sessions - this represents an authenticated TenantUser at a
/// single Tenant
pub struct TenantRbSession {
    pub tenant_rolebinding_id: TenantRolebindingId,
    // TODO make this non-null after old session expires
    /// The auth method used to log in via workos
    pub auth_method: Option<WorkosAuthMethod>,
}

impl From<TenantRbSession> for super::AuthSessionData {
    fn from(value: TenantRbSession) -> Self {
        Self::TenantRb(value)
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
/// Represents a session where a footprint employee is logged in to assume another tenant
pub struct FirmEmployeeSession {
    /// The TenantUserId that is proven to be owned via a workos auth.
    /// Must be a TenantUser with is_firm_employee=true
    pub tenant_user_id: TenantUserId,
    /// The TenantId whose role is being assumed by this firm employee
    pub tenant_id: TenantId,
    // TODO make this non-null after old session expires
    /// The auth method used to log in via workos
    pub auth_method: Option<WorkosAuthMethod>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
/// Represents a session where a user has logged in but is part of multiple tenants and hasn't yet
/// selected the tenant whose dashboard they want to view
pub struct WorkOsSession {
    /// The TenantUserId that is proven to be owned via a workos auth
    pub tenant_user_id: TenantUserId,
    // TODO make this non-null after old session expires
    /// The auth method used to log in via workos
    pub auth_method: Option<WorkosAuthMethod>,
}

/// Short-lived token that temporarily gives a tenant's access to perform operations on a single user.
/// For now, they are only allowed to be generated with a tenant API key that has admin permissions.
/// Otherwise, we have to deal with the complexity of permissions
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ClientTenantAuth {
    /// The scoped_vault_id belonging to this tenant
    pub fp_id: FpId,
    pub is_live: bool,
    pub tenant_id: TenantId,
    pub scopes: Vec<ClientTenantScope>,
    /// The tenant API key whose permissions are proxied into this token.
    /// In the future, maybe we'll want to support generating this token through other auth methods,
    /// but for now it only makes sense to create a short-lived token through tenant API key
    pub tenant_api_key_id: TenantApiKeyId,
    pub decrypt_reason: Option<String>,
}

impl From<ClientTenantAuth> for super::AuthSessionData {
    fn from(value: ClientTenantAuth) -> Self {
        Self::ClientTenant(value)
    }
}
