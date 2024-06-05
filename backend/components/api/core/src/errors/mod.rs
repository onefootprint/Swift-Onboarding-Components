use self::challenge::ChallengeError;
use self::error_with_code::ErrorWithCode;
use self::handoff::HandoffError;
use crate::decision::vendor::{
    middesk,
    VendorAPIError,
};
use crate::types::error::{
    ApiResponseError,
    FpResponseErrorInfo,
};
use crate::utils::body_bytes::InvalidBodyError;
use actix_web::error::{
    JsonPayloadError,
    QueryPayloadError,
    UrlencodedError,
};
use actix_web::http::StatusCode;
use aws_sdk_pinpointsmsvoicev2::error::SdkError as SmsSdkError;
use aws_sdk_pinpointsmsvoicev2::operation::send_text_message::SendTextMessageError;
use db::errors::DbError;
use error_with_code::CodedError;
use newtypes::output::Csv;
use newtypes::{
    ContactInfoKind,
    DataIdentifier,
    ErrorMessage,
    FilterFunction,
    Uuid,
};
use paperclip::actix::api_v2_errors;
use thiserror::Error;
use twilio::error::Error as TwilioError;
use webauthn_rs_core::error::WebauthnError;

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

pub type ApiResult<T> = Result<T, ApiError>;

#[api_v2_errors(
    code=400 description="Invalid request",
    code=401, description="Unauthorized: Can't read session from header",
)]
#[derive(Error, Debug)]
#[error(transparent)]
pub struct ApiError(Box<ApiErrorKind>);

impl ApiError {
    pub fn kind(&self) -> &ApiErrorKind {
        self.0.as_ref()
    }

    pub fn into_kind(self) -> ApiErrorKind {
        *self.0
    }
}

impl<E> From<E> for ApiError
where
    ApiErrorKind: From<E>,
{
    #[inline]
    fn from(err: E) -> Self {
        ApiError(Box::new(ApiErrorKind::from(err)))
    }
}

#[derive(Debug, Error)]
pub enum ApiErrorKind {
    #[error("{0}")]
    ErrorWithCode(#[from] error_with_code::ErrorWithCode),
    #[error("{0}")]
    AuthError(#[from] crate::auth::AuthError),
    #[error("{0}")]
    KmsError(Box<kms::KmsSignError>),
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
    Database(Box<DbError>),
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
    #[error("No email for vault")]
    NoEmailForVault,
    #[error("No {0} in vault")]
    ContactInfoKindNotInVault(ContactInfoKind),
    #[error("{0}")]
    ReqwestError(#[from] reqwest::Error),
    #[error("{0}")]
    ReqwestMiddlewareError(#[from] reqwest_middleware::Error),
    #[error("Sendgrid error: {0}")]
    SendgridError(String),
    #[error("{0}")]
    NewtypeError(Box<newtypes::Error>),
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
    InvalidBody(#[from] InvalidBodyError),
    #[error("{0}")]
    SerdeJson(#[from] serde_json::Error),
    #[error("{0}")]
    SerdeCbor(#[from] serde_cbor::Error),
    #[error("{0}")]
    Twilio(#[from] TwilioError),
    #[error("{0}")]
    PinpointSms(#[from] SmsSdkError<SendTextMessageError>),
    #[error("Endpoint not found")]
    EndpointNotFound,
    #[error("Resource not found")]
    ResourceNotFound,
    #[error("{0}")]
    IdvError(Box<idv::Error>),
    #[error("{0}")]
    Io(#[from] std::io::Error),
    #[error("{0}")]
    S3Error(Box<crate::s3::S3Error>),
    #[error("{0}")]
    PrivacyPassError(#[from] privacy_pass::Error),
    #[error("Vendor request failed {0}")]
    VendorRequestFailed(Box<VendorAPIError>),
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
    #[error("Internal webhook error")]
    WebhooksError(#[from] webhooks::Error),
    #[error("MiddeskError: {0}")]
    MiddeskError(#[from] middesk::MiddeskError),
    #[error("StateError: {0}")]
    StateError(#[from] crate::decision::state::StateError),
    #[error("{0}")]
    CipIntegrationError(#[from] cip_error::CipError),
    #[error("Required entity data is missing data: {0} {1}")]
    MissingRequiredEntityData(DataIdentifier, Csv<FilterFunction>),
    #[error("Enclave transform error: {0}")]
    EnclaveDataTransformError(#[from] enclave_proxy::TransformError),

    #[error("Invalid URL")]
    InvalidUrl(#[from] url::ParseError),

    #[error("Invalid HTTP Method")]
    InvalidHttpMethod(#[from] http::method::InvalidMethod),

    #[error("Invalid identifier")]
    InvalidIdentifierFound(#[from] strum::ParseError),

    #[error("Invalid Base64")]
    Base64Error(#[from] crypto::base64::DecodeError),

    #[error("Attestation error")]
    AttestError(#[from] app_attest::error::AttestationError),

    #[error("AWS selfie doc error")]
    AwsSelfieDocError(#[from] selfie_doc::AwsSelfieDocError),
    #[error("Rolling back migration as a dry run")]
    MigrationDryRun,
    #[error("Arbitrary json error - not used")]
    JsonError(serde_json::Value),

    #[error("Invalid header name: {0}")]
    InvalidHeaderName(#[from] reqwest::header::InvalidHeaderName),
    #[error("Invalid header value: {0}")]
    InvalidHeaderValue(#[from] reqwest::header::InvalidHeaderValue),
    #[error("Failed to convert header to a str")]
    HeaderToStrError(#[from] reqwest::header::ToStrError),

    #[error("Timeout handling request")]
    ResponseTimeout,

    #[error("AI completion Error")]
    OpenAiCompletionError(String),

    #[error("Regex error: {0}")]
    RegexError(#[from] regex::Error),
}

impl From<std::convert::Infallible> for ApiError {
    fn from(_: std::convert::Infallible) -> Self {
        panic!("impossible condition convert Infallible to ApiError")
    }
}

macro_rules! box_from_error_impl {
    ($var:ident, $typ:ty) => {
        impl From<$typ> for ApiErrorKind {
            #[inline]
            fn from(value: $typ) -> Self {
                ApiErrorKind::$var(Box::new(value))
            }
        }
    };
}

box_from_error_impl!(KmsError, kms::KmsSignError);
box_from_error_impl!(Database, DbError);
box_from_error_impl!(NewtypeError, newtypes::Error);
box_from_error_impl!(IdvError, idv::Error);
box_from_error_impl!(S3Error, crate::s3::S3Error);
box_from_error_impl!(VendorRequestFailed, VendorAPIError);

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
        DbError::PlaybookNotFound => StatusCode::BAD_REQUEST,
        DbError::TenantUserDeactivated => StatusCode::UNAUTHORIZED,
        DbError::TenantRoleMismatch => StatusCode::UNAUTHORIZED,
        DbError::TenantRoleAlreadyExists => StatusCode::BAD_REQUEST,
        DbError::TenantRoleDeactivated => StatusCode::UNAUTHORIZED,
        DbError::TargetTenantRoleDeactivated => StatusCode::BAD_REQUEST,
        DbError::TenantRoleHasUsers(_) => StatusCode::BAD_REQUEST,
        DbError::InvalidTenantScope(_, _) => StatusCode::BAD_REQUEST,
        DbError::TenantRoleAlreadyDeactivated => StatusCode::BAD_REQUEST,
        DbError::InvalidRoleIsLive => StatusCode::BAD_REQUEST,
        DbError::TenantRoleHasActiveApiKeys(_) => StatusCode::BAD_REQUEST,
        DbError::IncorrectTenantRoleKind => StatusCode::BAD_REQUEST,
        DbError::IncorrectTenantKind => StatusCode::BAD_REQUEST,
        DbError::SandboxMismatch => StatusCode::BAD_REQUEST,
        DbError::CannotCreatedScopedUser => StatusCode::INTERNAL_SERVER_ERROR,
        DbError::CannotUpdateImmutableRole(_) => StatusCode::BAD_REQUEST,
        DbError::NewtypesError(newtypes::Error::AssertionError(_)) => StatusCode::INTERNAL_SERVER_ERROR,
        DbError::NewtypesError(_) => StatusCode::BAD_REQUEST,
        DbError::InsufficientTenantScopes(_) => StatusCode::BAD_REQUEST,
        DbError::NonUniqueTenantScopes => StatusCode::BAD_REQUEST,
        DbError::InvalidProxyConfigId => StatusCode::BAD_REQUEST,
        DbError::ListAlreadyDeactivated => StatusCode::BAD_REQUEST,
        DbError::ListEntryAlreadyDeactivated => StatusCode::BAD_REQUEST,
        DbError::TenantRolebindingAlreadyExists => StatusCode::BAD_REQUEST,
        DbError::UnexpectedRuleSetVersion(_, _) => StatusCode::BAD_REQUEST,
        DbError::ValidationError(_) => StatusCode::BAD_REQUEST,
        DbError::AssertionError(_) => StatusCode::INTERNAL_SERVER_ERROR,
        DbError::UnsupportedAuthMethod => StatusCode::UNAUTHORIZED,
    }
}

impl ApiError {
    fn message(&self) -> ErrorMessage {
        use ApiErrorKind::*;
        match self.0.as_ref() {
            NewtypeError(e) => {
                if let newtypes::Error::DataValidationError(err) = e.as_ref() {
                    return err.json_message();
                }
            }
            JsonError(e) => return ErrorMessage::Json(e.clone()),
            Twilio(e) => return ErrorMessage::String(e.message()),
            Database(e) => return ErrorMessage::String(e.message()),
            _ => {}
        };
        ErrorMessage::String(self.to_string())
    }
}

impl actix_web::ResponseError for ApiError {
    fn status_code(&self) -> StatusCode {
        match self.0.as_ref() {
            ApiErrorKind::ErrorWithCode(e) => e.status_code(),
            ApiErrorKind::AuthError(_) => StatusCode::UNAUTHORIZED,
            ApiErrorKind::KmsError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::S3Error(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::Crypto(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::EnclaveDataTransformError(_) => StatusCode::BAD_REQUEST,
            ApiErrorKind::EnclaveError(enclave::EnclaveError::Enclave(
                enclave_proxy::EnclaveError::EnclaveError(err),
            )) if err.starts_with("TransformError") => StatusCode::BAD_REQUEST, /* a little hacky, but for */
            // future need structured
            // errors from enclave!
            ApiErrorKind::EnclaveError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::Database(e) => status_code_for_db_error(e),
            ApiErrorKind::Dotenv(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
            // This invariant should never be broken
            ApiErrorKind::NoPhoneNumberForVault => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::NoEmailForVault => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::ContactInfoKindNotInVault(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::HandoffError(_) => StatusCode::BAD_REQUEST,
            ApiErrorKind::ReqwestError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::ReqwestMiddlewareError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::Twilio(e) => match e {
                TwilioError::Request(_) | TwilioError::ReqwestMiddleware(_) | TwilioError::SerdeJson(_) => {
                    StatusCode::INTERNAL_SERVER_ERROR
                }
                TwilioError::DeliveryFailed(_, _) | TwilioError::NotDeliveredAfterTimeout(_, _) => {
                    StatusCode::BAD_REQUEST
                }
                TwilioError::Api(e) => match e.status {
                    400 => StatusCode::BAD_REQUEST,
                    _ => StatusCode::INTERNAL_SERVER_ERROR,
                },
            },
            ApiErrorKind::PinpointSms(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::SendgridError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::NewtypeError(_) => StatusCode::BAD_REQUEST,
            ApiErrorKind::BillingError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::ChallengeError(_) => StatusCode::BAD_REQUEST,
            ApiErrorKind::WorkOsError(e) => match e {
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
            ApiErrorKind::DecisionError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::OnboardingError(_) => StatusCode::BAD_REQUEST,
            ApiErrorKind::WorkflowError(_) => StatusCode::BAD_REQUEST,
            ApiErrorKind::TenantError(tenant::TenantError::DataDoesntExist(_)) => StatusCode::NOT_FOUND,
            ApiErrorKind::TenantError(_) => StatusCode::BAD_REQUEST,
            ApiErrorKind::UserError(_) => StatusCode::BAD_REQUEST,
            ApiErrorKind::BusinessError(_) => StatusCode::BAD_REQUEST,
            ApiErrorKind::Webauthn(_) => StatusCode::BAD_REQUEST,
            ApiErrorKind::Io(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::VendorRequestFailed(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::VendorRequestsFailed => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::CannotDecodeUtf8(_)
            | ApiErrorKind::InvalidJsonBody(_)
            | ApiErrorKind::InvalidFormError(_)
            | ApiErrorKind::InvalidQueryParam(_)
            | ApiErrorKind::SerdeJson(_)
            | ApiErrorKind::SerdeCbor(_) => StatusCode::BAD_REQUEST,
            ApiErrorKind::EndpointNotFound => StatusCode::NOT_FOUND,
            ApiErrorKind::ResourceNotFound => StatusCode::NOT_FOUND,
            ApiErrorKind::IdvError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::PrivacyPassError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::AssertionError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::ValidationError(_) => StatusCode::BAD_REQUEST,
            ApiErrorKind::FeatureFlagError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::InvalidProxyBody => StatusCode::BAD_REQUEST,
            ApiErrorKind::VaultProxyError(e) => e.status_code(),
            ApiErrorKind::InvalidBody(_) | ApiErrorKind::MissingRequiredHeader(_) => StatusCode::BAD_REQUEST,
            ApiErrorKind::WebhooksError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::MiddeskError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::StateError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::MissingRequiredEntityData(_, _) => StatusCode::BAD_REQUEST,
            ApiErrorKind::InvalidUrl(_)
            | ApiErrorKind::InvalidHttpMethod(_)
            | ApiErrorKind::InvalidIdentifierFound(_) => StatusCode::BAD_REQUEST,
            ApiErrorKind::CipIntegrationError(c) => c.status_code(),
            ApiErrorKind::Base64Error(_) => StatusCode::BAD_REQUEST,
            ApiErrorKind::AttestError(_) => StatusCode::BAD_REQUEST,
            ApiErrorKind::AwsSelfieDocError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::MigrationDryRun => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::JsonError(_) => StatusCode::BAD_REQUEST,
            ApiErrorKind::InvalidHeaderName(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::InvalidHeaderValue(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::HeaderToStrError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::ResponseTimeout => StatusCode::GATEWAY_TIMEOUT,
            ApiErrorKind::OpenAiCompletionError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiErrorKind::RegexError(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn error_response(&self) -> actix_web::HttpResponse<actix_web::body::BoxBody> {
        let support_id = Uuid::new_v4();
        let status_code = self.status_code().as_u16();

        // Some errors have specific error codes and context
        let error_with_code = match self.kind() {
            ApiErrorKind::ErrorWithCode(e) => Some(e as &dyn CodedError),
            _ => None,
        };
        let code = error_with_code.map(|e| e.code());
        let context = error_with_code.and_then(|e| e.context());
        let message = self.message();

        // in prod, omit 500 errors from the client
        let message = if status_code == StatusCode::INTERNAL_SERVER_ERROR
            && crate::config::SERVICE_CONFIG.is_production()
        {
            tracing::error!(err=?self, support_id=support_id.to_string(), status_code, "returning api 500: {}", self.to_string());
            ErrorMessage::String("something went wrong".to_string())
        } else {
            tracing::info!(error=?self, support_id=support_id.to_string(), status_code, "returning api {}", status_code);
            message
        };

        let mut resp = actix_web::HttpResponse::build(self.status_code());

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
        match self.kind() {
            ApiErrorKind::ResponseTimeout
            | ApiErrorKind::ErrorWithCode(ErrorWithCode::FileUploadTimeout)
            | ApiErrorKind::ErrorWithCode(ErrorWithCode::FileTooLarge(_)) => {
                resp.force_close();
            }
            _ => {}
        };

        resp.json(ApiResponseError {
            error: FpResponseErrorInfo {
                status_code,
                message,
                code,
                context,
                support_id,
            },
        })
    }
}
