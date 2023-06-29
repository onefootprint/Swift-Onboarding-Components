use actix_web::{
    error::{JsonPayloadError, QueryPayloadError, UrlencodedError},
    http::StatusCode,
};

use db::errors::DbError;
use newtypes::{output::Csv, DataIdentifier, ErrorMessage, Uuid};
use paperclip::actix::api_v2_errors;
use thiserror::Error;
use webauthn_rs_core::error::WebauthnError;
mod assertion;
pub mod business;
pub mod challenge;
pub mod cip_error;
pub mod enclave;
pub mod file_upload;
pub mod handoff;
pub mod kms;
pub mod onboarding;
pub mod proxy;
pub mod tenant;
pub mod user;
pub mod workflow;
pub mod workos;
pub use assertion::*;

use crate::{
    decision::vendor::{middesk, VendorAPIError},
    types::error::{ApiResponseError, FpResponseErrorInfo},
    utils::twilio::TwilioError,
};

use self::{challenge::ChallengeError, handoff::HandoffError};

pub type ApiResult<T> = Result<T, ApiError>;

#[api_v2_errors(
    code=400 description="Invalid request",
    code=401, description="Unauthorized: Can't read session from header",
)]
#[allow(clippy::large_enum_variant)]
#[derive(Debug, Error)]
pub enum ApiError {
    #[error("{0}")]
    AuthError(#[from] crate::auth::AuthError),
    #[error("{0}")]
    KmsError(#[from] kms::KmsSignError),
    #[error("{0}")]
    OnboardingError(#[from] onboarding::OnboardingError),
    #[error("{0}")]
    WorkflowError(#[from] workflow::WorkflowError),
    #[error("{0}")]
    TenantError(#[from] tenant::TenantError),
    #[error("{0}")]
    HandoffError(#[from] HandoffError),
    #[error("{0}")]
    UserError(#[from] user::UserError),
    #[error("{0}")]
    BusinessError(#[from] business::BusinessError),
    #[error("{0}")]
    ChallengeError(#[from] ChallengeError),
    #[error("{0}")]
    Crypto(#[from] crypto::Error),
    #[error("{0}")]
    Database(#[from] DbError),
    #[error("{0}")]
    Dotenv(#[from] dotenv::Error),
    #[error("{0}")]
    EnclaveError(#[from] enclave::EnclaveError),
    #[error("{0}")]
    WorkOsError(#[from] workos::WorkOsError),
    #[error("{0}")]
    Webauthn(#[from] WebauthnError),
    #[error("No phone number for vault")]
    NoPhoneNumberForVault,
    #[error("{0}")]
    ReqwestError(#[from] reqwest::Error),
    #[error("Sendgrid error: {0}")]
    SendgridError(String),
    #[error("{0}")]
    NewtypeError(#[from] newtypes::Error),
    #[error("{0}")]
    BillingError(#[from] billing::Error),
    #[error("{0}")]
    CannotDecodeUtf8(#[from] std::str::Utf8Error),
    #[error("{0}")]
    InvalidJsonBody(JsonPayloadError),
    #[error("{0}")]
    InvalidQueryParam(QueryPayloadError),
    #[error("{0}")]
    InvalidFormError(UrlencodedError),
    #[error("{0}")]
    SerdeJson(#[from] serde_json::Error),
    #[error("{0}")]
    SerdeCbor(#[from] serde_cbor::Error),
    #[error("{0}")]
    Twilio(#[from] TwilioError),
    #[error("Endpoint not found")]
    EndpointNotFound,
    #[error("Resource not found")]
    ResourceNotFound,
    #[error("{0}")]
    IdvError(#[from] idv::Error),
    #[error("{0}")]
    Io(#[from] std::io::Error),
    #[error("{0}")]
    S3Error(#[from] crate::s3::S3Error),
    #[error("{0}")]
    PrivacyPassError(#[from] privacy_pass::Error),
    #[error("Vendor request failed {0}")]
    VendorRequestFailed(VendorAPIError),
    #[error("One or more vendor requests failed")]
    VendorRequestsFailed,
    #[error("{0}")]
    AssertionError(String),
    #[error("{0}")]
    ValidationError(String),
    #[error("{0}")]
    FeatureFlagError(#[from] feature_flag::Error),
    #[error("Invalid body: proxy requests must contain utf8 only")]
    InvalidProxyBody,
    #[error("Missing required header: {0}")]
    MissingRequiredHeader(&'static str),
    #[error("{0}")]
    VaultProxyError(#[from] proxy::VaultProxyError),
    #[error("Decision error: {0}")]
    DecisionError(#[from] crate::decision::Error),
    #[error("image upload error: {0}")]
    FileUploadError(#[from] file_upload::FileUploadError),
    #[error("internal webhook error")]
    WebhooksError(#[from] webhooks::Error),
    #[error("MiddeskError: {0}")]
    MiddeskError(#[from] middesk::MiddeskError),
    #[error("StateError: {0}")]
    StateError(#[from] crate::decision::state::StateError),
    #[error("{0}")]
    CipIntegrationError(#[from] cip_error::CipError),
    #[error("Required entity data is missing data: {0} {1}")]
    MissingRequiredEntityData(DataIdentifier, Csv<enclave_proxy::DataTransform>),
    #[error("Enclave transform error: {0}")]
    EnclaveDataTransformError(#[from] enclave_proxy::TransformError),
}

fn status_code_for_db_error(e: &DbError) -> StatusCode {
    match e {
        DbError::MigrationFailed(_) => StatusCode::INTERNAL_SERVER_ERROR,
        DbError::DbInteract(_) => StatusCode::INTERNAL_SERVER_ERROR,
        DbError::DbError(_) => {
            if e.is_not_found() {
                return StatusCode::NOT_FOUND;
            }
            if e.is_fk_constraint_violation()
                || e.is_check_constraint_violation()
                || e.is_unique_constraint_violation()
            {
                return StatusCode::BAD_REQUEST;
            }
            StatusCode::INTERNAL_SERVER_ERROR
        }
        DbError::PoolGet(_) => StatusCode::INTERNAL_SERVER_ERROR,
        DbError::PoolInit(_) => StatusCode::INTERNAL_SERVER_ERROR,
        DbError::ConnectionError(_) => StatusCode::INTERNAL_SERVER_ERROR,
        DbError::MigrationError(_) => StatusCode::INTERNAL_SERVER_ERROR,
        DbError::IncorrectNumberOfRowsUpdated => StatusCode::INTERNAL_SERVER_ERROR,
        DbError::ObjectNotFound => StatusCode::NOT_FOUND,
        DbError::UpdateTargetNotFound => StatusCode::NOT_FOUND,
        DbError::RelatedObjectNotFound => StatusCode::NOT_FOUND,
        DbError::CryptoError(_) => StatusCode::INTERNAL_SERVER_ERROR,
        DbError::ApiKeyDisabled => StatusCode::UNAUTHORIZED,
        DbError::ApiKeyNotFound => StatusCode::UNAUTHORIZED,
        DbError::TenantUserDeactivated => StatusCode::UNAUTHORIZED,
        DbError::TenantRoleMismatch => StatusCode::UNAUTHORIZED,
        DbError::TenantRoleAlreadyExists => StatusCode::BAD_REQUEST,
        DbError::TenantRoleDeactivated => StatusCode::UNAUTHORIZED,
        DbError::TenantRoleHasUsers(_) => StatusCode::BAD_REQUEST,
        DbError::TenantRoleAlreadyDeactivated => StatusCode::BAD_REQUEST,
        DbError::TenantRoleHasActiveApiKeys(_) => StatusCode::BAD_REQUEST,
        DbError::SandboxMismatch => StatusCode::BAD_REQUEST,
        DbError::CannotCreatedScopedUser => StatusCode::INTERNAL_SERVER_ERROR,
        DbError::CannotUpdateImmutableRole(_) => StatusCode::BAD_REQUEST,
        DbError::NewtypesError(_) => StatusCode::BAD_REQUEST,
        DbError::InsufficientTenantScopes => StatusCode::BAD_REQUEST,
        DbError::TenantRolebindingAlreadyExists => StatusCode::BAD_REQUEST,
        DbError::ValidationError(_) => StatusCode::BAD_REQUEST,
    }
}

impl ApiError {
    fn message(&self) -> ErrorMessage {
        match self {
            Self::NewtypeError(newtypes::Error::ValidationError(e)) => e.json_message(),
            ApiError::Database(e) => ErrorMessage::String(e.message()),
            _ => ErrorMessage::String(self.to_string()),
        }
    }
}

impl actix_web::ResponseError for ApiError {
    fn status_code(&self) -> StatusCode {
        match self {
            ApiError::AuthError(_) => StatusCode::UNAUTHORIZED,
            ApiError::KmsError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::S3Error(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::Crypto(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::EnclaveDataTransformError(_) | ApiError::EnclaveError(_) => {
                StatusCode::INTERNAL_SERVER_ERROR
            }
            ApiError::Database(e) => status_code_for_db_error(e),
            ApiError::Dotenv(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
            // This invariant should never be broken
            ApiError::NoPhoneNumberForVault => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::HandoffError(_) => StatusCode::BAD_REQUEST,
            ApiError::ReqwestError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::Twilio(e) => e.status_code(),
            ApiError::SendgridError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::NewtypeError(_) => StatusCode::BAD_REQUEST,
            ApiError::BillingError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::ChallengeError(_) => StatusCode::BAD_REQUEST,
            ApiError::WorkOsError(e) => match e {
                workos::WorkOsError::GetProfileAndToken(::workos::WorkOsError::Operation(e)) => {
                    if e.error == *"invalid_grant" {
                        // Should not 500 when the token is invalid
                        StatusCode::BAD_REQUEST
                    } else {
                        StatusCode::INTERNAL_SERVER_ERROR
                    }
                }
                _ => StatusCode::INTERNAL_SERVER_ERROR,
            },
            ApiError::DecisionError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::OnboardingError(_) => StatusCode::BAD_REQUEST,
            ApiError::WorkflowError(_) => StatusCode::BAD_REQUEST,
            ApiError::TenantError(_) => StatusCode::BAD_REQUEST,
            ApiError::UserError(_) => StatusCode::BAD_REQUEST,
            ApiError::BusinessError(_) => StatusCode::BAD_REQUEST,
            ApiError::Webauthn(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::Io(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::VendorRequestFailed(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::VendorRequestsFailed => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::CannotDecodeUtf8(_)
            | ApiError::InvalidJsonBody(_)
            | ApiError::InvalidFormError(_)
            | ApiError::InvalidQueryParam(_)
            | ApiError::SerdeJson(_)
            | ApiError::SerdeCbor(_) => StatusCode::BAD_REQUEST,
            ApiError::EndpointNotFound => StatusCode::NOT_FOUND,
            ApiError::ResourceNotFound => StatusCode::NOT_FOUND,
            ApiError::IdvError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::PrivacyPassError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::AssertionError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::ValidationError(_) => StatusCode::BAD_REQUEST,
            ApiError::FeatureFlagError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::InvalidProxyBody => StatusCode::BAD_REQUEST,
            ApiError::VaultProxyError(_) => StatusCode::BAD_REQUEST,
            ApiError::FileUploadError(_) => StatusCode::BAD_REQUEST,
            ApiError::MissingRequiredHeader(_) => StatusCode::BAD_REQUEST,
            ApiError::WebhooksError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::MiddeskError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::StateError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::MissingRequiredEntityData(_, _) => StatusCode::BAD_REQUEST,
            ApiError::CipIntegrationError(c) => c.status_code(),
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
            ErrorMessage::String("something went wrong".to_string())
        } else {
            tracing::info!(error=?self, support_id=support_id.to_string(), status_code, "returning api error");
            self.message()
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
