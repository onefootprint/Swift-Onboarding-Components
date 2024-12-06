use crate::FpError;
use crate::FpErrorTrait;
use http::StatusCode;

#[derive(
    Debug,
    Copy,
    Clone,
    Eq,
    PartialEq,
    strum::EnumIter,
    strum::Display,
    serde_with::SerializeDisplay,
    derive_more::IsVariant,
)]
pub enum FpErrorCode {
    // Internal errors whose serialization generally don't matter
    #[strum(serialize = "I100")]
    IncodeMachineConcurrentChange,
    #[strum(serialize = "I101")]
    MiddeskAlreadyCompleted,
    #[strum(serialize = "I102")]
    MigrationDryRun,
    #[strum(serialize = "I103")]
    ParseNomFailure,
    #[strum(serialize = "I104")]
    MissingHeader,
    #[strum(serialize = "I105")]
    DbConnectionClosed,
    #[strum(serialize = "I106")]
    DbBrokenTransactionManager,
    #[strum(serialize = "I107")]
    DbReadOnlyTransaction,
    #[strum(serialize = "I108")]
    DbDataNotFound,
    #[strum(serialize = "I109")]
    DbUniqueConstraintViolation,

    // Errors used by our client
    #[strum(serialize = "E101")]
    InvalidStatusTransition,
    #[strum(serialize = "E102")]
    IncorrectPin,
    #[strum(serialize = "E103")]
    ChallengeExpired,
    #[strum(serialize = "E104")]
    RateLimited,
    #[strum(serialize = "E105")]
    UnsupportedChallengeKind,
    #[strum(serialize = "E106")]
    CannotRegisterPasskey,
    #[strum(serialize = "E107")]
    LoginChallengeUserNotFound,
    #[strum(serialize = "E108")]
    OnlyOneIdentifier,
    #[strum(serialize = "E109")]
    DocumentNotPending,
    #[strum(serialize = "E110")]
    InvalidFileUploadMissing,
    #[strum(serialize = "E111")]
    MissingMimeType,
    #[strum(serialize = "E112")]
    InvalidMimeType,
    #[strum(serialize = "E113")]
    MultipartError,
    #[strum(serialize = "E114")]
    FileTooLarge,
    #[strum(serialize = "E115")]
    InvalidContentLength,
    #[strum(serialize = "E116")]
    MissingFilename,
    #[strum(serialize = "E117")]
    NoSessionFound,
    #[strum(serialize = "E118")]
    SessionExpired,
    #[strum(serialize = "E119")]
    CouldNotParseSession,
    #[strum(serialize = "E120")]
    ExistingVault,
    #[strum(serialize = "E121")]
    FileUploadTimeout,
    #[strum(serialize = "E122")]
    FileTooSmall,
    #[strum(serialize = "E123")]
    MissingAuthHeader,
    #[strum(serialize = "E124")]
    BusinessNotOwnedByUser,
    #[strum(serialize = "E125")]
    LinkAlreadyUsed,
    #[strum(serialize = "E126")]
    MissingPlaybookKey,
    #[strum(serialize = "E127")]
    ConflictingPlaybookKey,
    #[strum(serialize = "E128")]
    ContactInfoNotYetVerified,
    #[strum(serialize = "E129")]
    ConflictingTenantDomain,

    // Tenant-facing errors
    #[strum(serialize = "T120")]
    VaultDataValidationError,
    #[strum(serialize = "T121")]
    PlaybookMissingRequirements,
    #[strum(serialize = "T122")]
    AlreadyOnboardedToPlaybook,
}

impl FpErrorCode {
    pub fn should_serialize(&self) -> bool {
        match self {
            // Internal errors whose serialization generally don't matter
            Self::IncodeMachineConcurrentChange => false,
            Self::MiddeskAlreadyCompleted => false,
            Self::MigrationDryRun => false,
            Self::ParseNomFailure => false,
            Self::MissingHeader => false,
            Self::DbConnectionClosed => false,
            Self::DbBrokenTransactionManager => false,
            Self::DbReadOnlyTransaction => false,
            Self::DbDataNotFound => false,
            Self::DbUniqueConstraintViolation => false,

            _ => true,
        }
    }
}


#[cfg(test)]
mod tests {
    use super::FpErrorCode;
    use itertools::Itertools;
    use strum::IntoEnumIterator;

    #[test]
    fn test_unique_error_codes() {
        assert!(FpErrorCode::iter().all(|e| !e.to_string().is_empty()));
        let codes = FpErrorCode::iter().map(|e| e.to_string()).unique().count();
        let total = FpErrorCode::iter().count();
        assert_eq!(codes, total, "Duplicate or missing error codes");
    }
}

#[derive(Debug)]
/// Shorthand for an error with an FpErrorCode
pub struct BadRequestWithCode(pub &'static str, pub FpErrorCode);

impl FpErrorTrait for BadRequestWithCode {
    fn code(&self) -> Option<FpErrorCode> {
        Some(self.1)
    }

    fn status_code(&self) -> StatusCode {
        StatusCode::BAD_REQUEST
    }

    fn message(&self) -> String {
        self.0.to_string()
    }
}

impl std::fmt::Display for BadRequestWithCode {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        std::fmt::Display::fmt(&self.0, f)
    }
}

impl std::error::Error for BadRequestWithCode {
    fn source(&self) -> std::option::Option<&(dyn std::error::Error + 'static)> {
        None
    }
}

impl<T, E: From<FpError>> From<BadRequestWithCode> for Result<T, E> {
    fn from(value: BadRequestWithCode) -> Self {
        Err(E::from(FpError::from(value)))
    }
}
