use newtypes::{output::Csv, CipKind, CollectedDataOption};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum TenantError {
    #[error("Validation error: {0}")]
    ValidationError(String),
    #[error("Cannot edit the currently logged-in user")]
    CannotEditCurrentUser,
    #[error("Cannot edit the currently authed API key")]
    CannotEditCurrentApiKey,
    #[error("Tenant user does not exist")]
    TenantUserDoesNotExist,
    #[error("Cannot inherit credentials for a non-integration test tenant")]
    NotIntegrationTestTenant,
    #[error("Cannot manually review a user with an incomplete onboarding")]
    CannotMakeDecision,

    #[error("Incorrect entity kind for redoing KYC")]
    IncorrectVaultKindForRedoKyc,
    #[error("Cannot trigger KYC for non-portable vault")]
    CannotTriggerKycForNonPortable,

    #[error("Token must be active for at least one minute and at most one day")]
    InvalidExpiry,
    #[error("Must provide at least one scope")]
    MustProvideScope,

    #[error("Missing required data options: {0} for cip: {1}")]
    MissingCdosForCip(Csv<CollectedDataOption>, CipKind),

    #[error("Cannot provide an HTTP body alongside an idempotency ID - behavior would be undefined if the user already exists.")]
    CannotProvideBodyAndIdempotencyId,
}
