#[derive(
    Debug, Copy, Clone, Eq, PartialEq, strum::EnumIter, strum::Display, serde_with::SerializeDisplay,
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

            // Errors used by our client
            Self::InvalidStatusTransition => true,
            Self::IncorrectPin => true,
            Self::ChallengeExpired => true,
            Self::RateLimited => true,
            Self::UnsupportedChallengeKind => true,
            Self::CannotRegisterPasskey => true,
            Self::LoginChallengeUserNotFound => true,
            Self::OnlyOneIdentifier => true,
            Self::DocumentNotPending => true,
            Self::InvalidFileUploadMissing => true,
            Self::MissingMimeType => true,
            Self::InvalidMimeType => true,
            Self::MultipartError => true,
            Self::FileTooLarge => true,
            Self::InvalidContentLength => true,
            Self::MissingFilename => true,
            Self::NoSessionFound => true,
            Self::SessionExpired => true,
            Self::CouldNotParseSession => true,
            Self::ExistingVault => true,
            Self::FileUploadTimeout => true,
            Self::FileTooSmall => true,
            Self::MissingAuthHeader => true,

            // Tenant-facing errors
            Self::VaultDataValidationError => true,
            Self::PlaybookMissingRequirements => true,
            Self::AlreadyOnboardedToPlaybook => true,
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
