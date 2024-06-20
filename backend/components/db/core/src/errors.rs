use diesel::result::DatabaseErrorKind;
use diesel::result::Error::DatabaseError as DieselDbError;
use newtypes::TenantRoleKindDiscriminant;
use newtypes::TenantScopeDiscriminants;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum TransactionError<E> {
    DbError(#[from] diesel::result::Error),
    ApplicationError(E),
}

impl<E> From<DbError> for TransactionError<E>
where
    E: From<DbError>,
{
    fn from(value: DbError) -> Self {
        match value {
            DbError::DbError(e) => Self::DbError(e),
            e => Self::ApplicationError(E::from(e)),
        }
    }
}

#[derive(Debug, Error)]
/// Note: the error messages here are publicly visible to the API
pub enum DbError {
    // Wrapped errors
    #[error("Db interact error: {0}")]
    DbInteract(#[from] deadpool_diesel::InteractError),
    #[error("Database error: {0}")]
    DbError(#[from] diesel::result::Error),
    #[error("Pool error: {0}")]
    PoolGet(#[from] deadpool_diesel::PoolError),
    #[error("Pool init error: {0}")]
    PoolInit(#[from] deadpool::managed::BuildError),
    #[error("Connection error: {0}")]
    ConnectionError(#[from] diesel::ConnectionError),
    #[error("Migration error: {0}")]
    MigrationError(#[from] diesel_migrations::MigrationError),
    #[error("Migration failed: {0}")]
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
    #[error("Playbook not found with this key. Make sure your credentials are for the correct environment.")]
    PlaybookNotFound,
    #[error("User is deactivated. Please contact your administor for assistance.")]
    TenantUserDeactivated,
    #[error("User with this email already exists.")]
    TenantRolebindingAlreadyExists,
    #[error("Role used by this user is deactivated. Please contact your administor for assistance.")]
    TenantRoleDeactivated,
    #[error("Cannot fetch deactivated role.")]
    TargetTenantRoleDeactivated,
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
    #[error("This kind of role cannot be bound to this entity.")]
    IncorrectTenantRoleKind,
    #[error("Incorrect tenant kind in this context.")]
    IncorrectTenantKind,
    #[error("Scoped user is_live doesn't match UserVault is_live")]
    SandboxMismatch,
    #[error("Only portable vaults can be linked to an ob config")]
    CannotCreatedScopedUser,
    #[error("TenantRole must have is_live set IFF it is an API key role")]
    InvalidRoleIsLive,
    #[error("Cannot update an immutable role {0}")]
    CannotUpdateImmutableRole(String),
    #[error("Tenant role scopes must include at least {0}")]
    InsufficientTenantScopes(TenantScopeDiscriminants),
    #[error("Tenant role scopes must be unique")]
    NonUniqueTenantScopes,
    #[error("Tenant role of kind {0} cannot have a scope of kind {1}")]
    InvalidTenantScope(TenantRoleKindDiscriminant, TenantScopeDiscriminants),
    #[error("Proxy config with provided ID does not exist")]
    InvalidProxyConfigId,
    #[error("List already deactivated")]
    ListAlreadyDeactivated,
    #[error("List entry already deactivated")]
    ListEntryAlreadyDeactivated,
    #[error("Expected version {0} but latest version is {1}")]
    UnexpectedRuleSetVersion(i32, i32),
    #[error("Your organization administrator has disabled the ability to log in using this auth method. Please retry using another auth method.")]
    UnsupportedAuthMethod,
    #[error("{0}")]
    ValidationError(String),
    #[error("{0}")]
    AssertionError(String),

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

pub trait OptionalExtension<T, E> {
    fn optional(self) -> Result<Option<T>, E>;
}

impl<T> OptionalExtension<T, DbError> for Result<T, DbError> {
    fn optional(self) -> Result<Option<T>, DbError> {
        match self {
            Ok(v) => Ok(Some(v)),
            Err(e) => {
                if e.is_not_found() {
                    Ok(None)
                } else {
                    Err(e)
                }
            }
        }
    }
}

#[derive(Debug)]
/// Shorthand to make it convenient to make an HTTP 400 validation error.
pub(crate) struct ValidationError<'a>(pub &'a str);

impl<'a> From<ValidationError<'a>> for DbError {
    fn from(value: ValidationError<'a>) -> Self {
        Self::ValidationError(value.0.to_string())
    }
}

impl<'a, T> From<ValidationError<'a>> for Result<T, DbError> {
    fn from(value: ValidationError<'a>) -> Self {
        Err(value.into())
    }
}

#[derive(Debug)]
/// Shorthand to make it convenient to make an HTTP 500 server error.
pub(crate) struct AssertionError<'a>(pub &'a str);

impl<'a> From<AssertionError<'a>> for DbError {
    fn from(value: AssertionError<'a>) -> Self {
        Self::AssertionError(value.0.to_string())
    }
}

impl<'a, T> From<AssertionError<'a>> for Result<T, DbError> {
    fn from(value: AssertionError<'a>) -> Self {
        Err(value.into())
    }
}
