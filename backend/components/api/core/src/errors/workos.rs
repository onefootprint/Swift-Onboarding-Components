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
