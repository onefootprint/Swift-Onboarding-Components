use diesel::result::DatabaseErrorKind;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum TransactionError<E> {
    DbError(#[from] diesel::result::Error),
    ApplicationError(E),
}

#[derive(Debug, Error)]
pub enum DbError {
    #[error("db_interact: {0}")]
    DbInteract(#[from] deadpool_diesel::InteractError),

    #[error("db_error: {0}")]
    DbError(#[from] diesel::result::Error),

    #[error("pool_get: {0}")]
    PoolGet(#[from] deadpool_diesel::PoolError),

    #[error("pool_init: {0}")]
    PoolInit(#[from] deadpool::managed::BuildError<deadpool_diesel::Error>),

    #[error("connection_error: {0}")]
    ConnectionError(#[from] diesel::ConnectionError),

    #[error("migration_error: {0}")]
    MigrationError(#[from] diesel_migrations::MigrationError),

    #[error("invalid_session")]
    InvalidSessionForOperation,

    #[error("invalid_tenant_auth")]
    InvalidTenantAuth,

    #[error("challenge_data_mismatch")]
    ChallengeDataMismatch,

    #[error("challenge_code_mismatch")]
    ChallengeCodeMismatch,

    #[error("challenge_expired")]
    ChallengeExpired,

    #[error("challenge_inactive")]
    ChallengeInactive,

    #[error("Incorrect number of rows updated")]
    IncorrectNumberOfRowsUpdated,
    #[error("Update target not found")]
    UpdateTargetNotFound,

    #[error("Related object not found")]
    RelatedObjectNotFound,

    #[error("Object not found")]
    ObjectNotFound,

    #[error("Invalid data group set for data kind. For instance, data group address may be set for ssn")]
    InvalidDataGroupForKind,

    #[error("Could not create uuid -- group uuid already exists")]
    CouldNotCreateGroupUuid,

    #[error("migration failed: {0}")]
    MigrationFailed(Box<dyn std::error::Error + Send + Sync>),

    #[error("crypto error: {0}")]
    CryptoError(#[from] crypto::Error),

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

    #[error("Not in transaction")]
    NotInTransaction,

    #[error("Transaction rollback in a unit test")]
    TransactionRollbackTest,

    #[error("Scoped user is_live doesn't match UserVault is_live")]
    SandboxMismatch,

    #[error("Only portable vaults can be linked to an ob config")]
    CannotCreatedScopedUser,
    #[error("Cannot update an immutable role {0}")]
    CannotUpdateImmutableRole(String),
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
}
