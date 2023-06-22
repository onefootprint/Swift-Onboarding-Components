use diesel::result::DatabaseErrorKind;
use diesel::result::Error::DatabaseError as DieselDbError;
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
    #[error("database error")]
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
    #[error("Onboarding config not found with this key")]
    ApiKeyNotFound,
    #[error("User is deactivated. Please contact your administor for assistance.")]
    TenantUserDeactivated,
    #[error("User with this email already exists.")]
    TenantRolebindingAlreadyExists,
    #[error("Role used by this user is deactivated. Please contact your administor for assistance.")]
    TenantRoleDeactivated,
    #[error("Role with this name already exists")]
    TenantRoleAlreadyExists,
    #[error(
        "Cannot deactivate a role while active users inherit it. There are {0} active users with this role."
    )]
    TenantRoleHasUsers(i64),
    #[error("Cannot deactivate a role while active API keys inherit it. There are {0} active API keys with this role.")]
    TenantRoleHasActiveApiKeys(i64),
    #[error("Role is deactivated - please choose an active role.")]
    TenantRoleAlreadyDeactivated,
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
    #[error("{0}")]
    ValidationError(String),

    // Pass-through errors from other crates
    #[error("{0}")]
    NewtypesError(#[from] newtypes::Error),
    #[error("{0}")]
    CryptoError(#[from] crypto::Error),
}

impl DbError {
    pub fn is_not_found(&self) -> bool {
        matches!(self, Self::DbError(diesel::result::Error::NotFound))
    }

    pub fn is_fk_constraint_violation(&self) -> bool {
        matches!(
            self,
            Self::DbError(DieselDbError(DatabaseErrorKind::ForeignKeyViolation, _))
        )
    }

    pub fn is_check_constraint_violation(&self) -> bool {
        matches!(
            self,
            Self::DbError(DieselDbError(DatabaseErrorKind::CheckViolation, _))
        )
    }

    pub fn is_unique_constraint_violation(&self) -> bool {
        matches!(
            self,
            Self::DbError(DieselDbError(DatabaseErrorKind::UniqueViolation, _))
        )
    }

    pub fn message(&self) -> String {
        if self.is_not_found() {
            return "Data not found".to_owned();
        }
        if self.is_fk_constraint_violation() {
            return "Operation not allowed: foreign key constraint violation".to_owned();
        }
        if self.is_check_constraint_violation() {
            return "Operation not allowed: check constraint violation".to_owned();
        }
        if self.is_unique_constraint_violation() {
            return "Operation not allowed: unique constraint violation".to_owned();
        }
        self.to_string()
    }
}
