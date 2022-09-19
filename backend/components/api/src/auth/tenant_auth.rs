use newtypes::{DataAttribute, TenantPermission};

use super::{
    session_data::workos::ParsedWorkOs, AuthError, CheckTenantPermissions, SessionContext, TenantAuth,
};

/// A shorthand for the commonly used ParsedWorkOs context
pub type WorkOsAuth = SessionContext<ParsedWorkOs>;

impl CheckTenantPermissions for WorkOsAuth {
    /// Verifies that the auth token has one of the required scopes. If so, returns a WorkOs
    /// that is accessible
    fn check_permissions(self, permissions: Vec<TenantPermission>) -> Result<Box<dyn TenantAuth>, AuthError> {
        let result = self.map(|c| c.check_permissions(permissions))?;
        Ok(Box::new(result))
    }

    fn can_decrypt(self, attributes: Vec<DataAttribute>) -> Result<Box<dyn TenantAuth>, AuthError> {
        let result = self.map(|c| c.can_decrypt(attributes))?;
        Ok(Box::new(result))
    }
}
