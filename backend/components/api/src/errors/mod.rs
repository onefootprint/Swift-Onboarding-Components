use actix_web::{error::JsonPayloadError, http::StatusCode};
use db::errors::DbError;
use newtypes::Uuid;
use paperclip::actix::api_v2_errors;
use thiserror::Error;
use webauthn_rs_core::error::WebauthnError;
use workos::WorkOsError;
pub mod challenge;
pub mod enclave;
pub mod handoff;
pub mod kms;
pub mod onboarding;
pub mod tenant;
pub mod user;
pub mod workos_login;

use crate::types::error::{ApiResponseError, FpResponseErrorInfo};

use self::{challenge::ChallengeError, handoff::HandoffError};

pub type ApiResult<T> = Result<T, ApiError>;

#[api_v2_errors(
    code=400 description="Invalid request",
    code=401, description="Unauthorized: Can't read session from header",
)]
#[allow(clippy::large_enum_variant)]
#[derive(Debug, Error)]
pub enum ApiError {
    #[error("Auth error: {0}")]
    AuthError(#[from] crate::auth::AuthError),
    #[error("kms error: {0}")]
    KmsError(#[from] kms::KmsSignError),
    #[error("onboarding error: {0}")]
    OnboardingError(#[from] onboarding::OnboardingError),
    #[error("{0}")]
    TenantError(#[from] tenant::TenantError),
    #[error("handoff error: {0}")]
    HandoffError(#[from] HandoffError),
    #[error("user error: {0}")]
    UserError(#[from] user::UserError),
    #[error("challenge error: {0}")]
    ChallengeError(#[from] ChallengeError),
    #[error("crypto error: {0}")]
    Crypto(#[from] crypto::Error),
    #[error("database error: {0}")]
    Database(#[from] DbError),
    #[error("dotenv error: {0}")]
    Dotenv(#[from] dotenv::Error),
    #[error("enclave error: {0}")]
    EnclaveError(#[from] enclave::EnclaveError),
    #[error("workos api error: {0}")]
    WorkOsApiError(String),
    #[error("workos error: {0}")]
    WorkOsLoginError(#[from] workos_login::WorkOsLoginError),
    #[error("webauthn error: {0}")]
    Webauthn(#[from] WebauthnError),
    #[error("no phone number for vault")]
    NoPhoneNumberForVault,
    #[error("not implemented")]
    NotImplemented,
    #[error("external request error: {0}")]
    ReqwestError(#[from] reqwest::Error),
    #[error("error from sendgrid api: {0}")]
    SendgridError(String),
    #[error("invalid parameter: {0}")]
    NewtypeError(#[from] newtypes::Error),
    #[error("decode utf8 error: {0}")]
    CannotDecodeUtf8(#[from] std::str::Utf8Error),
    #[error("json body invalid: {0}")]
    InvalidJsonBody(JsonPayloadError),
    #[error("json error: {0}")]
    SerdeJson(#[from] serde_json::Error),
    #[error("cbor error: {0}")]
    SerdeCbor(#[from] serde_cbor::Error),
    #[error("twilio error: {0}")]
    Twilio(#[from] twilio::error::Error),
    #[error("Not running in locked transaction")]
    UserNotLocked,
    #[error("Endpoint not found")]
    EndpointNotFound,
    #[error("Method not allowed for endpoint")]
    MethodNotAllowed,
    #[error("Idv error: {0}")]
    IdvError(#[from] idv::Error),
    #[error("{0}")]
    Custom(String),
}

impl<T> From<WorkOsError<T>> for ApiError
where
    T: std::fmt::Debug,
{
    fn from(e: WorkOsError<T>) -> Self {
        ApiError::WorkOsApiError(format!("{:?}", e))
    }
}

fn status_code_for_db_error(e: &DbError) -> StatusCode {
    match e {
        DbError::MigrationFailed(_) => StatusCode::INTERNAL_SERVER_ERROR,
        DbError::DbInteract(_) => StatusCode::INTERNAL_SERVER_ERROR,
        DbError::DbError(_) => {
            if e.is_not_found() {
                return StatusCode::NOT_FOUND;
            }
            if e.is_constraint_violation() {
                return StatusCode::BAD_REQUEST;
            }
            StatusCode::INTERNAL_SERVER_ERROR
        }
        DbError::PoolGet(_) => StatusCode::INTERNAL_SERVER_ERROR,
        DbError::PoolInit(_) => StatusCode::INTERNAL_SERVER_ERROR,
        DbError::ConnectionError(_) => StatusCode::INTERNAL_SERVER_ERROR,
        DbError::MigrationError(_) => StatusCode::INTERNAL_SERVER_ERROR,
        DbError::InvalidTenantAuth => StatusCode::UNAUTHORIZED,
        DbError::ChallengeDataMismatch => StatusCode::BAD_REQUEST,
        DbError::ChallengeCodeMismatch => StatusCode::BAD_REQUEST,
        DbError::ChallengeExpired => StatusCode::BAD_REQUEST,
        DbError::ChallengeInactive => StatusCode::BAD_REQUEST,
        DbError::InvalidSessionForOperation => StatusCode::UNAUTHORIZED,
        DbError::IncorrectNumberOfRowsUpdated => StatusCode::INTERNAL_SERVER_ERROR,
        DbError::UpdateTargetNotFound => StatusCode::NOT_FOUND,
        DbError::CryptoError(_) => StatusCode::INTERNAL_SERVER_ERROR,
        DbError::InvalidDataGroupForKind => StatusCode::INTERNAL_SERVER_ERROR,
        DbError::CouldNotCreateGroupUuid => StatusCode::INTERNAL_SERVER_ERROR,
        DbError::ApiKeyDisabled => StatusCode::UNAUTHORIZED,
        DbError::NotInTransaction => StatusCode::INTERNAL_SERVER_ERROR,
    }
}

impl actix_web::ResponseError for ApiError {
    fn status_code(&self) -> StatusCode {
        match self {
            ApiError::AuthError(_) => StatusCode::UNAUTHORIZED,
            ApiError::KmsError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::Crypto(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::EnclaveError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::Database(e) => status_code_for_db_error(e),
            ApiError::Dotenv(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
            // This invariant should never be broken
            ApiError::NoPhoneNumberForVault => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::NotImplemented => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::HandoffError(_) => StatusCode::BAD_REQUEST,
            ApiError::ReqwestError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::Twilio(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::SendgridError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::NewtypeError(_) => StatusCode::BAD_REQUEST,
            ApiError::ChallengeError(_) => StatusCode::BAD_REQUEST,
            ApiError::WorkOsApiError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::OnboardingError(_) => StatusCode::BAD_REQUEST,
            ApiError::TenantError(_) => StatusCode::BAD_REQUEST,
            ApiError::UserError(_) => StatusCode::BAD_REQUEST,
            ApiError::Webauthn(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::CannotDecodeUtf8(_)
            | ApiError::InvalidJsonBody(_)
            | ApiError::SerdeJson(_)
            | ApiError::SerdeCbor(_) => StatusCode::BAD_REQUEST,
            ApiError::WorkOsLoginError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::UserNotLocked => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::EndpointNotFound => StatusCode::NOT_FOUND,
            ApiError::MethodNotAllowed => StatusCode::METHOD_NOT_ALLOWED,
            ApiError::IdvError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::Custom(_) => StatusCode::BAD_REQUEST,
        }
    }

    fn error_response(&self) -> actix_web::HttpResponse<actix_web::body::BoxBody> {
        let support_id = Uuid::new_v4();
        let status_code = self.status_code().as_u16();

        // in prod, omit 500 errors from the client
        let message = if status_code == StatusCode::INTERNAL_SERVER_ERROR
            && crate::config::SERVICE_CONFIG.is_production()
        {
            tracing::error!(error=?self, support_id=support_id.to_string(), status_code, "returning api ISE");
            "something went wrong".to_string()
        } else {
            tracing::info!(error=?self, support_id=support_id.to_string(), status_code, "returning api error");
            self.to_string()
        };

        let response = ApiResponseError {
            error: FpResponseErrorInfo {
                status_code,
                message,
                support_id,
            },
        };
        actix_web::HttpResponse::build(self.status_code()).json(response)
    }
}
