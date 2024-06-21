use ::workos::organizations::CreateOrganizationError;
use ::workos::sso::GetProfileAndTokenError;
use ::workos::WorkOsError as LibWorkOsError;
use thiserror::Error;
use workos::organizations::GetOrganizationError;
use workos::passwordless::CreatePasswordlessSessionError;

#[derive(Debug, Error)]
pub enum WorkOsError {
    #[error("Workos profile has an org, but no tenant exists with the org")]
    TenantForOrgDoesNotExist,
    #[error("Invariant broken: multiple orgs for 1 domain returned")]
    MultipleOrgsForDomain,
    #[error("{0}")]
    AuthorizationUrlError(#[from] url::ParseError),
    #[error("{0}")]
    GetProfileAndToken(#[from] LibWorkOsError<GetProfileAndTokenError>),
    #[error("{0}")]
    CreateOrganization(#[from] LibWorkOsError<CreateOrganizationError>),
    #[error("{0}")]
    CreatePasswordlessSession(#[from] LibWorkOsError<CreatePasswordlessSessionError>),
    #[error("{0}")]
    GetOrganization(#[from] LibWorkOsError<GetOrganizationError>),
    #[error("{0}")]
    Generic(#[from] LibWorkOsError<()>),
}

impl api_errors::FpErrorTrait for WorkOsError {
    fn status_code(&self) -> api_errors::StatusCode {
        match self {
            WorkOsError::GetProfileAndToken(::workos::WorkOsError::Operation(e)) => {
                if e.error == *"invalid_grant" {
                    // Should not 500 when the token is invalid
                    api_errors::StatusCode::BAD_REQUEST
                } else {
                    api_errors::StatusCode::INTERNAL_SERVER_ERROR
                }
            }
            _ => api_errors::StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn message(&self) -> String {
        self.to_string()
    }
}
