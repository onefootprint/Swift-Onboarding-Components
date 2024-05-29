use newtypes::output::Csv;
use newtypes::{
    CipKind,
    CollectedDataOption,
    DataIdentifier,
    FpId,
    ObConfigurationKind,
};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum TenantError {
    #[error("Unknown workos auth method: {0}")]
    UnknownWorkosAuthMethod(String),
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
    #[error("Invalid trigger")]
    InvalidTriggerKind,
    #[error("Cannot redo KYC with no previous KYC")]
    CannotRedoKyc,
    #[error("Cannot run KYB for a vault that was not created via API")]
    CannotRunKybForPortable,
    #[error("Cannot run KYC for a vault that was not created via API")]
    CannotRunKycForPortable,
    #[error("Incorrect entity kind for KYB (must be a business vault)")]
    IncorrectVaultKindForKyb,
    #[error("Incorrect entity kind for KYC  (must be a user vault)")]
    IncorrectVaultKindForKyc,
    #[error("Token must be active for at least one minute and at most one day")]
    InvalidExpiry,
    #[error("Must provide at least one scope")]
    MustProvideScope,
    #[error("Must provide at least one field")]
    MustProvideFields,
    #[error("Can only provide one field to create a token with decrypt_download scope")]
    OneDecryptDownloadField,
    #[error("decrypt_download tokens may not have a TTL longer than 5 mins")]
    InvalidDecryptDownloadExpiry,
    #[error("Missing required data options: {0} for cip: {1}")]
    MissingCdosForCip(Csv<CollectedDataOption>, CipKind),
    #[error("Cannot provide an HTTP body alongside an idempotency or external ID - behavior would be undefined if the user already exists.")]
    CannotProvideBodyAndIdempotencyId,
    #[error("You are not configured to create production {0} playbooks. Feel free to continue in sandbox, or contact us to enable this feature.")]
    CannotCreateProdPlaybook(ObConfigurationKind),
    #[error("Cannot run a playbook whose authorized scopes don't include all collected data. The following fields need to be authorized for read access: {0}")]
    MissingCanAccessCdos(Csv<CollectedDataOption>),
    #[error("Invalid onboarding configuration for Vault. {0}")]
    UnsupportedObcForNpv(String),
    #[error("Decryption reason must be provided")]
    NoDecryptionReasonProvided,
    #[error("{0} doesn't exist for user")]
    DataDoesntExist(DataIdentifier),
    #[error("User {0} does not exist")]
    VaultDoesntExist(FpId),
    #[error("Allowed origins must be HTTPS in live-mode")]
    AllowedOriginsMustBeHttpsInLive,
    #[error("Invalid tenant role kind")]
    InvalidTenantRoleKind,
    #[error("Login target incompatible with other login request fields")]
    IncompatibleLoginTarget,
}
