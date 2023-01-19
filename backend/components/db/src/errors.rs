use diesel::result::DatabaseErrorKind;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum TransactionError<E> {
    DbError(#[from] diesel::result::Error),
    ApplicationError(E),
}

#[derive(Debug, Error)]
/// Note: the error messages here are publicly visible to the API
pub enum DbError {
    // Wrapped errors
    #[error("Db interact error")]
    DbInteract(#[from] deadpool_diesel::InteractError),
    #[error("Db error")]
    DbError(#[from] diesel::result::Error),
    #[error("Pool error")]
    PoolGet(#[from] deadpool_diesel::PoolError),
    #[error("Pool init error")]
    PoolInit(#[from] deadpool::managed::BuildError<deadpool_diesel::Error>),
    #[error("Connection error")]
    ConnectionError(#[from] diesel::ConnectionError),
    #[error("Migration error")]
    MigrationError(#[from] diesel_migrations::MigrationError),
    #[error("Migration failed")]
    MigrationFailed(Box<dyn std::error::Error + Send + Sync>),

    // Application errors
    #[error("Incorrect number of rows updated")]
    IncorrectNumberOfRowsUpdated,
    #[error("Update target not found")]
    UpdateTargetNotFound,
    #[error("Related object not found")]
    RelatedObjectNotFound,
    #[error("Object not found")]
    ObjectNotFound,
    #[error("This API key is disabled")]
    ApiKeyDisabled,
    #[error("User is deactivated. Please contact your administor for assistance.")]
    TenantUserDeactivated,
    #[error("Role used by this user is deactivated. Please contact your administor for assistance.")]
    TenantRoleDeactivated,
    #[error("Cannot deactivate a role while users are using it. There are {0} active users with this role.")]
    TenantRoleHasUsers(i64),
    #[error("User and role belong to different tenants.")]
    TenantRoleMismatch,
    #[error("Scoped user is_live doesn't match UserVault is_live")]
    SandboxMismatch,
    #[error("Only portable vaults can be linked to an ob config")]
    CannotCreatedScopedUser,
    #[error("Cannot update an immutable role {0}")]
    CannotUpdateImmutableRole(String),
    #[error("Tenant role scopes must include at least Read")]
    InsufficientTenantScopes,

    // Pass-through errors from other crates
    #[error("{0}")]
    NewtypesError(#[from] newtypes::Error),
    #[error("{0}")]
    CryptoError(#[from] crypto::Error),

    // Testing-only error
    #[error("Transaction rollback in a unit test")]
    TransactionRollbackTest,
}

impl DbError {
    pub fn is_not_found(&self) -> bool {
        matches!(self, Self::DbError(diesel::result::Error::NotFound))
    }

    pub fn is_constraint_violation(&self) -> bool {
        if let Self::DbError(diesel::result::Error::DatabaseError(kind, _)) = self {
            matches!(
                kind,
                DatabaseErrorKind::UniqueViolation
                    | DatabaseErrorKind::ForeignKeyViolation
                    | DatabaseErrorKind::CheckViolation
            )
        } else {
            false
        }
    }

    pub fn message(&self) -> String {
        if self.is_not_found() {
            return "Data not found".to_owned();
        }
        if self.is_constraint_violation() {
            return "Operation not allowed: constraint violation".to_owned();
        }
        self.to_string()
    }
}
