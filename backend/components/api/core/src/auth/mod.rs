use api_errors::FpErrorCode;
use api_errors::StatusCode;
use thiserror::Error;

pub mod custodian;
pub mod session;
pub use session::SessionContext;
mod either;
pub use self::either::Either;
mod guard;
pub mod ob_config;
pub mod protected_custodian;
pub mod sdk_args;
pub mod tenant;
pub mod user;
pub use guard::*;
pub mod protected_auth;

#[derive(Debug, Error)]
pub enum AuthError {
    #[error("Secret API key with this value not found.")]
    ApiKeyNotFound,
    #[error(
        "It looks like you may have provided an onboarding publishable key. Please use a secret API key instead."
    )]
    ObConfigKeyUsedForApiKey,
    #[error("Onboarding publishable key with this value not found.")]
    ObConfigNotFound,
    #[error(
        "It looks like you may have provide a secret API key. Please use an onboarding publishable key instead, and keep your secret API keys safe on your backend!"
    )]
    ApiKeyUsedForObConfig,
    #[error("Missing header: {0}")]
    MissingHeader(String),
    #[error("Invalid {0}")]
    InvalidHeader(String),
    #[error("Error loading session for header {0}: {1}")]
    ErrorLoadingSession(String, String),
    #[error("Invalid request body")]
    InvalidBody,
    #[error("Incorrect auth session type")]
    SessionTypeError,
    #[error("Not allowed: restricted to sandbox mode")]
    SandboxRestricted,
    #[error("Not allowed: required permission is missing: {0}")]
    MissingUserPermission(String),
    #[error("Not allowed without business")]
    MissingBusiness,
    #[error("Not allowed without workflow")]
    MissingWorkflow,
    #[error("Not allowed without scoped user")]
    MissingScopedUser,
    #[error("Not allowed: required permission is missing: {0}")]
    MissingTenantPermission(String),
    #[error("Not allowed: user is not a firm employee")]
    NotFirmEmployee,
    #[error("Not allowed: integration testing user cannot perform this action")]
    NotAllowedForIntegrationTestUser,
    #[error("Not allowed: user is not a risk ops firm employee")]
    NotRiskOpsFirmEmployee,
    #[error("Not allowed: ob config doesn't require collecting business")]
    BusinessNotRequired,
    #[error("Cannot log in as a non-person vault")]
    NonPersonVault,
    #[error("Workflow state does not allow {0}")]
    MissingWorkflowGuard(newtypes::WorkflowGuard),
    #[error("You are not allowed to access this preview API. Please contact us if you'd like to use this functionality.")]
    CannotAccessPreviewApi,
    #[error("Workflow is deactivated. Cannot perform {0}")]
    WorkflowDeactivated(newtypes::WorkflowGuard),
}

impl api_errors::FpErrorTrait for AuthError {
    fn status_code(&self) -> StatusCode {
        match self {
            AuthError::ApiKeyNotFound => StatusCode::UNAUTHORIZED,
            AuthError::ObConfigKeyUsedForApiKey => StatusCode::UNAUTHORIZED,
            AuthError::ObConfigNotFound => StatusCode::UNAUTHORIZED,
            AuthError::ApiKeyUsedForObConfig => StatusCode::UNAUTHORIZED,
            AuthError::MissingHeader(_) => StatusCode::UNAUTHORIZED,
            AuthError::InvalidHeader(_) => StatusCode::UNAUTHORIZED,
            AuthError::ErrorLoadingSession(_, _) => StatusCode::UNAUTHORIZED,
            AuthError::InvalidBody => StatusCode::UNAUTHORIZED,
            AuthError::SessionTypeError => StatusCode::UNAUTHORIZED,
            AuthError::SandboxRestricted => StatusCode::FORBIDDEN,
            AuthError::MissingUserPermission(_) => StatusCode::FORBIDDEN,
            AuthError::MissingBusiness => StatusCode::UNAUTHORIZED,
            AuthError::MissingWorkflow => StatusCode::UNAUTHORIZED,
            AuthError::MissingScopedUser => StatusCode::UNAUTHORIZED,
            AuthError::MissingTenantPermission(_) => StatusCode::UNAUTHORIZED,
            AuthError::NotFirmEmployee => StatusCode::FORBIDDEN,
            AuthError::NotAllowedForIntegrationTestUser => StatusCode::FORBIDDEN,
            AuthError::NotRiskOpsFirmEmployee => StatusCode::FORBIDDEN,
            AuthError::BusinessNotRequired => StatusCode::UNAUTHORIZED,
            AuthError::NonPersonVault => StatusCode::UNAUTHORIZED,
            AuthError::MissingWorkflowGuard(_) => StatusCode::FORBIDDEN,
            AuthError::CannotAccessPreviewApi => StatusCode::FORBIDDEN,
            AuthError::WorkflowDeactivated(_) => StatusCode::UNAUTHORIZED,
        }
    }

    fn message(&self) -> String {
        self.to_string()
    }

    fn code(&self) -> Option<FpErrorCode> {
        match self {
            AuthError::MissingHeader(_) => Some(FpErrorCode::MissingAuthHeader),
            _ => None,
        }
    }

    fn context(&self) -> Option<serde_json::Value> {
        match self {
            AuthError::MissingHeader(h) => Some(serde_json::json!({"header": h})),
            _ => None,
        }
    }
}
