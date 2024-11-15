use api_errors::FpErrorCode;
use itertools::Itertools;
use newtypes::output::Csv;
use newtypes::CollectedDataOption;
use newtypes::IdDocKind;
use newtypes::Iso3166TwoDigitCountryCode;
use newtypes::ObConfigurationKind;
use newtypes::OnboardingRequirement;
use std::fmt::Display;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum OnboardingError {
    #[error("Token invalid")]
    ValidateTokenInvalid,
    #[error("Sandbox users must be used in sandbox mode")]
    InvalidSandboxState,
    #[error("Onboarding does not exist")]
    NoOnboarding,
    #[error("Workflow doesn't exist")]
    NoWorkflow,
    #[error("IDV reqs have already been initiated")]
    IdvReqsAlreadyInitiated,
    #[error("Tenant does not match")]
    TenantMismatch,
    #[error("Some attributes have not been collected: {0}")]
    MissingAttributes(Csv<CollectedDataOption>),
    #[error("Onboarding is not in a terminal state")]
    NonTerminalState,
    #[error("Cannot create a document when no document request exists")]
    NoDocumentRequestFound,
    #[error("No playbook key provided")]
    NoPlaybook,
    #[error("Cannot edit completed onboarding")]
    AlreadyCompleted,
    #[error("User consent not found for onboarding")]
    UserConsentNotFound,
    #[error("Business Owner has not been set in Business vault yet")]
    BusinessOwnersNotSet,
    #[error("Expected BO to have an Onboarding but it was not found")]
    MissingBoOnboarding,
    #[error("Not expecting a selfie image to be uploaded")]
    NotExpectingSelfie,
    #[error("Unsupported document country. Supported document countries: {0}")]
    UnsupportedDocumentCountryForDocumentType(Csv<Iso3166TwoDigitCountryCode>),
    #[error("Unsupported document type. Supported document types: {0}")]
    UnsupportedDocumentType(Csv<IdDocKind>),
    #[error("Cannot use a fixture result for a non-sandbox Vault")]
    CannotCreateFixtureResultForNonSandbox,
    #[error("User not allowed to set fixture_result=Real")]
    RealDocumentFixtureNotAllowed,
    #[error("Sandbox vaults must have a fixture result")]
    NoFixtureResultForSandboxUser,
    #[error("Workflow doesn't have an associated status")]
    NoStatusForWorkflow,
    #[error("{0}")]
    Validation(String),
    #[error("Can only provide one image at a time")]
    OnlyOneImageAllowed,
    #[error("Cannot onboard onto an {0} playbook")]
    CannotOnboardOntoPlaybook(ObConfigurationKind),
    #[error("{0}")]
    UnmetRequirements(#[from] UnmetRequirements),
}

impl api_errors::FpErrorTrait for OnboardingError {
    fn status_code(&self) -> api_errors::StatusCode {
        api_errors::StatusCode::BAD_REQUEST
    }

    fn message(&self) -> String {
        self.to_string()
    }

    fn code(&self) -> Option<FpErrorCode> {
        match self {
            Self::NoPlaybook => Some(FpErrorCode::MissingPlaybookKey),
            _ => None,
        }
    }
}


#[derive(Debug, Error)]
pub struct UnmetRequirements(pub Vec<OnboardingRequirement>);

impl Display for UnmetRequirements {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> core::fmt::Result {
        let missing_reqs = self.0.iter().map(|req| req.unmet_str()).collect_vec();
        write!(f, "{}", missing_reqs.join(". "))
    }
}
