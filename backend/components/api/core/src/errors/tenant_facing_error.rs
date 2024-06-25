use super::onboarding::UnmetRequirements;
use api_errors::FpErrorCode;
use http::StatusCode;
use newtypes::ObConfigurationKind;
use serde_json::Value;

#[derive(Debug, thiserror::Error)]
pub enum TfError {
    #[error("Vault data failed validation")]
    VaultDataValidationError(newtypes::DataValidationError),
    #[error("Cannot run {0} playbook due to unmet requirements. {1}")]
    PlaybookMissingRequirements(ObConfigurationKind, UnmetRequirements),
    #[error("User has already started onboarding onto this playbook")]
    AlreadyOnboardedToPlaybook,
}

impl api_errors::FpErrorTrait for TfError {
    fn context(&self) -> Option<Value> {
        let context = match self {
            Self::VaultDataValidationError(err) => err.context(),
            _ => return None,
        };
        Some(context)
    }

    fn code(&self) -> Option<FpErrorCode> {
        let code = match self {
            Self::VaultDataValidationError(_) => FpErrorCode::VaultDataValidationError,
            Self::PlaybookMissingRequirements(_, _) => FpErrorCode::PlaybookMissingRequirements,
            Self::AlreadyOnboardedToPlaybook => FpErrorCode::AlreadyOnboardedToPlaybook,
        };
        Some(code)
    }

    fn status_code(&self) -> StatusCode {
        match self {
            Self::VaultDataValidationError(_) => StatusCode::BAD_REQUEST,
            Self::PlaybookMissingRequirements(_, _) => StatusCode::BAD_REQUEST,
            Self::AlreadyOnboardedToPlaybook => StatusCode::CONFLICT,
        }
    }

    fn message(&self) -> String {
        self.to_string()
    }
}
