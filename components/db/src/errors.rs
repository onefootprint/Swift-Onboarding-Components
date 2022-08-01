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

    #[error("Invalid data group set for data kind. For instance, data group address may be set for ssn")]
    InvalidDataGroupForKind,

    #[error("Could not create uuid -- group uuid already exists")]
    CouldNotCreateGroupUuid,

    #[error("migration failed: {0}")]
    MigrationFailed(Box<dyn std::error::Error + Send + Sync>),

    #[error("crypto error: {0}")]
    CryptoError(#[from] crypto::Error),
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
