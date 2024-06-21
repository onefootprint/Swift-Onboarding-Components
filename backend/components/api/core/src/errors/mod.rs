use actix_web::error::QueryPayloadError;
use actix_web::error::UrlencodedError;
use actix_web::http::StatusCode;
use api_errors::FpError;
use api_errors::FpErrorTrait;
use newtypes::output::Csv;
use newtypes::ContactInfoKind;
use newtypes::DataIdentifier;
use newtypes::FilterFunction;
use thiserror::Error;

pub mod business;
pub mod challenge;
pub mod cip_error;
pub mod enclave;
pub mod error_with_code;
pub mod handoff;
pub mod kms;
pub mod onboarding;
pub mod proxy;
pub mod tenant;
pub mod user;
mod utils;
pub mod workflow;
pub mod workos;
pub use utils::*;
mod dry_run;
pub use dry_run::*;
mod tenant_facing_error;
pub use tenant_facing_error::*;

pub type ApiResult<T> = Result<T, FpError>;
// TODO rm
pub type ApiError = FpError;

#[derive(Debug, Error)]
pub enum ApiErrorKind {
    #[error("No {0} in vault")]
    ContactInfoKindNotInVault(ContactInfoKind),
    #[error("Sendgrid error: {0}")]
    SendgridError(String),
    #[error("{0}")]
    InvalidQueryParam(QueryPayloadError),
    #[error("{0}")]
    InvalidFormError(UrlencodedError),
    #[error("Endpoint not found")]
    EndpointNotFound,
    #[error("Resource not found")]
    ResourceNotFound,
    #[error("One or more vendor requests failed")]
    VendorRequestsFailed,
    #[error("{0}")]
    AssertionError(String),
    #[error("{0}")]
    ValidationError(String),
    #[error("Invalid body: proxy requests must contain utf8 only")]
    InvalidProxyBody,
    #[error("Missing required header: {0}")]
    MissingRequiredHeader(&'static str),
    #[error("Required entity data is missing data: {0} {1}")]
    MissingRequiredEntityData(DataIdentifier, Csv<FilterFunction>),
    #[error("Rolling back migration as a dry run")]
    MigrationDryRun,
    #[error("Timeout handling request")]
    ResponseTimeout,
    #[error("AI completion Error")]
    OpenAiCompletionError(String),
}

impl From<std::convert::Infallible> for ApiErrorKind {
    fn from(_: std::convert::Infallible) -> Self {
        panic!("impossible condition convert Infallible to ApiError")
    }
}

impl FpErrorTrait for ApiErrorKind {
    fn status_code(&self) -> StatusCode {
        match self {
            // This invariant should never be broken
            ApiErrorKind::ContactInfoKindNotInVault(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::SendgridError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::VendorRequestsFailed => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::InvalidFormError(_) | ApiErrorKind::InvalidQueryParam(_) => StatusCode::BAD_REQUEST,
            ApiErrorKind::EndpointNotFound => StatusCode::NOT_FOUND,
            ApiErrorKind::ResourceNotFound => StatusCode::NOT_FOUND,
            ApiErrorKind::AssertionError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::ValidationError(_) => StatusCode::BAD_REQUEST,
            ApiErrorKind::InvalidProxyBody => StatusCode::BAD_REQUEST,
            ApiErrorKind::MissingRequiredHeader(_) => StatusCode::BAD_REQUEST,
            ApiErrorKind::MissingRequiredEntityData(_, _) => StatusCode::BAD_REQUEST,
            ApiErrorKind::MigrationDryRun => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::ResponseTimeout => StatusCode::GATEWAY_TIMEOUT,
            ApiErrorKind::OpenAiCompletionError(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn message(&self) -> String {
        self.to_string()
    }

    fn code(&self) -> Option<String> {
        match self {
            Self::MigrationDryRun => Some(api_errors::MIGRATION_DRY_RUN.to_string()),
            _ => None,
        }
    }

    fn mutate_response(&self, resp: &mut actix_web::HttpResponseBuilder) {
        // Failing to close the TCP connection after sending a timeout response allows clients to
        // continue sending request data even server has sent an error response. This would create
        // unneccesary work for both the server and the client.
        //
        // Closing the connection on FileTooLarge errors works around a long-standing actix-web
        // bug:
        // https://github.com/actix/actix-web/issues/2357
        // https://github.com/actix/actix-web/issues/3152
        // May not be necessary in all environments (e.g. load balancers mask the issue), but it's
        // necessary in local dev to prevent the client from hanging.
        if matches!(self, ApiErrorKind::ResponseTimeout) {
            resp.force_close();
        }
    }
}
