use api_errors::FpError;
use api_errors::FpErrorTrait;
use api_errors::StatusCode;
use newtypes::TenantRoleKindDiscriminant;
use newtypes::TenantScopeDiscriminants;
use thiserror::Error;

#[derive(Debug, Error, strum_macros::Display)]
/// Opening and closing a transaction requires sending `BEGIN` and `COMMIT` instructions to the
/// database behind the scenes. So, we use this type to represent the difference between errors
/// running the user-provided closure vs errors opening/committing the transaction
pub enum TransactionError {
    DbError(#[from] diesel::result::Error),
    ApplicationError(FpError),
}

#[derive(Debug, Error)]
/// Note: the error messages here are publicly visible to the API
pub enum DbError {
    // Wrapped errors
    #[error("Database interact error: {0}")]
    DbInteract(#[from] deadpool_diesel::InteractError),

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
    #[error("This playbook is disabled")]
    PlaybookDisabled,
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
    #[error("Scoped user is_live doesn't match UserVault is_live")]
    SandboxMismatch,
    #[error("TenantRole must have is_live set IFF it is an API key role")]
    InvalidRoleIsLive,
    #[error("Cannot update an immutable role {0}")]
    CannotUpdateImmutableRole(String),
    #[error("Tenant role scopes must include at least {0}")]
    InsufficientTenantScopes(TenantScopeDiscriminants),
    #[error("Tenant role of kind {0} cannot have a scope of kind {1}")]
    InvalidTenantScope(TenantRoleKindDiscriminant, TenantScopeDiscriminants),
    #[error("List already deactivated")]
    ListAlreadyDeactivated,
    #[error("List entry already deactivated")]
    ListEntryAlreadyDeactivated,

    // Pass-through errors from other crates
    #[error("{0}")]
    NewtypesError(#[from] newtypes::Error),
    #[error("{0}")]
    CryptoError(#[from] crypto::Error),
}


impl FpErrorTrait for DbError {
    fn message(&self) -> String {
        self.to_string()
    }

    fn status_code(&self) -> StatusCode {
        match self {
            Self::MigrationFailed(_) => StatusCode::INTERNAL_SERVER_ERROR,
            Self::DbInteract(_) => StatusCode::INTERNAL_SERVER_ERROR,
            Self::PoolGet(_) => StatusCode::INTERNAL_SERVER_ERROR,
            Self::PoolInit(_) => StatusCode::INTERNAL_SERVER_ERROR,
            Self::ConnectionError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            Self::MigrationError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            Self::IncorrectNumberOfRowsUpdated => StatusCode::INTERNAL_SERVER_ERROR,
            Self::ObjectNotFound => StatusCode::NOT_FOUND,
            Self::UpdateTargetNotFound => StatusCode::NOT_FOUND,
            Self::RelatedObjectNotFound => StatusCode::NOT_FOUND,
            Self::CryptoError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            Self::ApiKeyDisabled => StatusCode::UNAUTHORIZED,
            Self::PlaybookDisabled => StatusCode::UNAUTHORIZED,
            Self::PlaybookNotFound => StatusCode::BAD_REQUEST,
            Self::TenantUserDeactivated => StatusCode::UNAUTHORIZED,
            Self::TenantRoleMismatch => StatusCode::UNAUTHORIZED,
            Self::TenantRoleAlreadyExists => StatusCode::BAD_REQUEST,
            Self::TenantRoleDeactivated => StatusCode::UNAUTHORIZED,
            Self::TargetTenantRoleDeactivated => StatusCode::BAD_REQUEST,
            Self::TenantRoleHasUsers(_) => StatusCode::BAD_REQUEST,
            Self::InvalidTenantScope(_, _) => StatusCode::BAD_REQUEST,
            Self::TenantRoleAlreadyDeactivated => StatusCode::BAD_REQUEST,
            Self::InvalidRoleIsLive => StatusCode::BAD_REQUEST,
            Self::TenantRoleHasActiveApiKeys(_) => StatusCode::BAD_REQUEST,
            Self::SandboxMismatch => StatusCode::BAD_REQUEST,
            Self::CannotUpdateImmutableRole(_) => StatusCode::BAD_REQUEST,
            Self::NewtypesError(newtypes::Error::AssertionError(_)) => StatusCode::INTERNAL_SERVER_ERROR,
            Self::NewtypesError(_) => StatusCode::BAD_REQUEST,
            Self::InsufficientTenantScopes(_) => StatusCode::BAD_REQUEST,
            Self::ListAlreadyDeactivated => StatusCode::BAD_REQUEST,
            Self::ListEntryAlreadyDeactivated => StatusCode::BAD_REQUEST,
            Self::TenantRolebindingAlreadyExists => StatusCode::BAD_REQUEST,
        }
    }
}
