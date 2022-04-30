use thiserror::Error;

#[derive(Debug, Error)]
pub enum DbError {
    #[error("db_interact: {0}")]
    DbInteract(#[from] deadpool_diesel::InteractError),

    #[error("db_error: {0}")]
    DbError(#[from] diesel::result::Error),

    #[error("pool_get: {0}")]
    PoolGet(#[from] deadpool::managed::PoolError<deadpool_diesel::Error>),

    #[error("pool_init: {0}")]
    PoolInit(#[from] deadpool::managed::BuildError<deadpool_diesel::Error>),

    #[error("connection_error: {0}")]
    ConnectionError(#[from] diesel::ConnectionError),

    #[error("migration_error: {0}")]
    MigrationError(#[from] diesel_migrations::RunMigrationsError),

    #[error("invalid_tenant_auth")]
    InvalidTenantAuth,

    #[error("onboarding_token_token")]
    OnboardingTokenInactive,

    #[error("challenge_code_mismatch")]
    ChallengeCodeMismatch,

    #[error("challenge_expired")]
    ChallengeExpired,

    #[error("challenge_inactive")]
    ChallengeInactive,
}
