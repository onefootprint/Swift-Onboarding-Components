use newtypes::{DataAttribute, TenantPermission};

use super::{
    session_data::workos::{ParsedWorkOs, WorkOs},
    AuthError, CheckTenantPermissions, SessionContext, TenantAuth,
};

/// A shorthand for the commonly used ParsedWorkOs context
pub type WorkOsAuth = SessionContext<ParsedWorkOs>;

// These are the same methods as the CheckTenantPermission implementation below - but some methods
// need to check auth without converting the WorkOsAuth to a trait object of dyn TenantAuth
impl WorkOsAuth {
    /// Verifies that the auth token has one of the required scopes. If so, returns a WorkOs
    /// that is accessible
    pub fn check_permissions(
        self,
        permissions: Vec<TenantPermission>,
    ) -> Result<SessionContext<WorkOs>, AuthError> {
        let result = self.map(|c| c.check_permissions(permissions))?;
        Ok(result)
    }

    pub fn can_decrypt(self, attributes: Vec<DataAttribute>) -> Result<SessionContext<WorkOs>, AuthError> {
        let result = self.map(|c| c.can_decrypt(attributes))?;
        Ok(result)
    }
}

impl CheckTenantPermissions for WorkOsAuth {
    fn check_permissions(self, permissions: Vec<TenantPermission>) -> Result<Box<dyn TenantAuth>, AuthError> {
        self.check_permissions(permissions)
            .map(|auth| Box::new(auth) as Box<dyn TenantAuth>)
    }

    fn can_decrypt(self, attributes: Vec<DataAttribute>) -> Result<Box<dyn TenantAuth>, AuthError> {
        self.can_decrypt(attributes)
            .map(|auth| Box::new(auth) as Box<dyn TenantAuth>)
    }
}
