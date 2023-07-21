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
    #[error("Cannot run KYC for portable vault")]
    CannotRunKycForPortable,
    #[error("Incorrect entity kind for KYC")]
    IncorrectVaultKindForKyc,

    #[error("Token must be active for at least one minute and at most one day")]
    InvalidExpiry,
    #[error("Must provide at least one scope")]
    MustProvideScope,

    #[error("Missing required data options: {0} for cip: {1}")]
    MissingCdosForCip(Csv<CollectedDataOption>, CipKind),

    #[error("Cannot provide an HTTP body alongside an idempotency ID - behavior would be undefined if the user already exists.")]
    CannotProvideBodyAndIdempotencyId,

    #[error("You are not configured to create production onboarding configurations. Feel free to continue in sandbox, or contact us to enable.")]
    CannotCreateProdObConfigs,

    #[error("Invalid onboarding configuration for Vault. The following fields need to be authorized for read access: {0}")]
    MissingCanAccessCdos(Csv<CollectedDataOption>),

    #[error("Invalid onboarding configuration for Vault. {0}")]
    UnsupportedObcForNpv(String),

    #[error("Decryption reason must be provided")]
    NoDecryptionReasonProvided,
}
