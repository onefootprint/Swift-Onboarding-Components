use super::onboarding::UnmetRequirements;
use http::StatusCode;
use newtypes::ObConfigurationKind;
use serde_json::Value;

#[derive(Debug, strum_macros::EnumDiscriminants, thiserror::Error)]
#[strum_discriminants(name(TfErrorKind))]
#[strum_discriminants(derive(strum_macros::Display, strum_macros::EnumIter))]
pub enum TfError {
    #[strum_discriminants(strum(serialize = "T120"))]
    #[error("Vault data failed validation")]
    VaultDataValidationError(newtypes::DataValidationError),
    #[strum_discriminants(strum(serialize = "T121"))]
    #[error("Cannot run {0} playbook due to unmet requirements. {1}")]
    PlaybookMissingRequirements(ObConfigurationKind, UnmetRequirements),
    #[strum_discriminants(strum(serialize = "T122"))]
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

    fn code(&self) -> Option<String> {
        Some(TfErrorKind::from(self).to_string())
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

#[cfg(test)]
mod tests {
    use super::TfErrorKind;
    use itertools::Itertools;
    use strum::IntoEnumIterator;

    #[test]
    fn test_unique_error_codes() {
        assert!(TfErrorKind::iter().all(|e| !e.to_string().is_empty()));
        let codes = TfErrorKind::iter().map(|e| e.to_string()).unique().count();
        let total = TfErrorKind::iter().count();
        assert_eq!(codes, total, "Duplicate or missing error codes");
    }
}
