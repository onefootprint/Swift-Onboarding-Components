use actix_web::error::JsonPayloadError;
use actix_web::http::StatusCode;
use aws_sdk_kms::{
    error::{
        GenerateDataKeyPairWithoutPlaintextError, GenerateDataKeyWithoutPlaintextError,
        GenerateMacError, VerifyMacError,
    },
    types::SdkError as KmsSdkError,
};
use aws_sdk_pinpoint::{error::PhoneNumberValidateError, types::SdkError as PinpointSdkError};
use aws_sdk_pinpointemail::{error::SendEmailError, types::SdkError as EmailSdkError};
use aws_sdk_pinpointsmsvoicev2::{error::SendTextMessageError, types::SdkError as SmsSdkError};
use db::errors::DbError;
use enclave_proxy::bb8;
use paperclip::v2::schema::Apiv2Errors;
use thiserror::Error;

use crate::types::error::{ApiResponseError, ApiResponseErrorInfo};

#[derive(Debug, Error)]
pub enum ApiError {
    #[error("auth error: {0}")]
    AuthError(#[from] crate::auth::AuthError),
    #[error("kms datakeypair generate error: {0}")]
    KmsKeyPair(#[from] KmsSdkError<GenerateDataKeyPairWithoutPlaintextError>),
    #[error("kms datakey generate error: {0}")]
    KmsDataKey(#[from] KmsSdkError<GenerateDataKeyWithoutPlaintextError>),
    #[error("kms hmac sign error: {0}")]
    KmsSignMacError(#[from] KmsSdkError<GenerateMacError>),
    #[error("kms hmac verify error: {0}")]
    KmsVerifyMacError(#[from] KmsSdkError<VerifyMacError>),
    #[error("pinpoint phone number validate error: {0}")]
    PinpointPhoneNumberValidateError(#[from] PinpointSdkError<PhoneNumberValidateError>),
    #[error("crypto error: {0}")]
    Crypto(#[from] crypto::Error),
    #[error("enclave proxy error: {0}")]
    EnclaveProxy(#[from] enclave_proxy::Error),
    #[error("enclave conn error: {0}")]
    EnclaveConnection(#[from] bb8::RunError<enclave_proxy::Error>),
    #[error("enclave error: {0}")]
    Enclave(#[from] enclave_proxy::EnclaveError),
    #[error("Invalid enclave decrypt response")]
    InvalidEnclaveDecryptResponse,
    #[error("database error: {0}")]
    Database(#[from] DbError),
    #[error("dotenv error: {0}")]
    Dotenv(#[from] dotenv::Error),
    #[error("send text message error: {0}")]
    SendTextMessageError(#[from] SmsSdkError<SendTextMessageError>),
    #[error("send email error: {0}")]
    SendEmailError(#[from] EmailSdkError<SendEmailError>),
    #[error("decode utf8 error: {0}")]
    CannotDecodeUtf8(#[from] std::str::Utf8Error),
    #[error("phone number validation error")]
    PhoneNumberValidationError,
    #[error("json body invalid: {0}")]
    InvalidJsonBody(JsonPayloadError),
    #[error("challenge timeout or mismatch")]
    ChallengeNotValid,
    #[error("Challenge is expired")]
    ChallengeExpired,
    #[error("missing fields required for user signup: {0}")]
    UserMissingRequiredFields(String),
    #[error("user does not exist for email challenge")]
    UserDoesntExistForEmailChallenge,
    #[error("email challenge decrpytion error")]
    EmailChallengeDecryptionError,
    #[error("email challenge expired")]
    EmailChallengeExpired,
    #[error("invalid tenant skey or footprint user id")]
    InvalidTenantKeyOrUserId,
    #[error("webauthn error: {0}")]
    Webauthn(#[from] webauthn_rs::error::WebauthnError),
    #[error("json error: {0}")]
    Serde(#[from] serde_json::Error),
    #[error("onboarding for tenant, user pair does not exist")]
    OnboardingForTenantDoesNotExist,
    #[error("webauthn credential not set")]
    WebauthnCredentialsNotSet,
    #[error("Please wait {0} more seconds")]
    RateLimited(i64),
    #[error("workos error: {0}")]
    WorkOS(#[from] awc::error::SendRequestError),
    #[error("workos decode error: {0}")]
    WorkOsDecode(#[from] awc::error::JsonPayloadError),
    #[error("workos payload error: {0}")]
    WorkOsPayload(#[from] actix_web::error::PayloadError),
    #[error("invalid redirect header returned")]
    WorkOsError(#[from] actix_web::http::header::ToStrError),
    #[error("invalid response from WorkOS")]
    WorkOSError,
    #[error("no phone number for vault")]
    NoPhoneNumberForVault,
    #[error("not implemented")]
    NotImplemented,
    #[error("cannot transition status backwards")]
    InvalidStatusTransition,
}

fn status_code_for_db_error(e: &DbError) -> StatusCode {
    match e {
        DbError::DbInteract(_) => StatusCode::INTERNAL_SERVER_ERROR,
        DbError::DbError(_) => StatusCode::INTERNAL_SERVER_ERROR,
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
    }
}

impl actix_web::ResponseError for ApiError {
    fn status_code(&self) -> StatusCode {
        match self {
            ApiError::AuthError(_) => StatusCode::UNAUTHORIZED,
            ApiError::KmsKeyPair(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::KmsDataKey(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::PinpointPhoneNumberValidateError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::Crypto(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::EnclaveProxy(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::EnclaveConnection(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::Enclave(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::InvalidEnclaveDecryptResponse => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::Database(e) => status_code_for_db_error(e),
            ApiError::Dotenv(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::SendTextMessageError(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::SendEmailError(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::CannotDecodeUtf8(_) => actix_web::http::StatusCode::BAD_REQUEST,
            ApiError::PhoneNumberValidationError => actix_web::http::StatusCode::BAD_REQUEST,
            ApiError::InvalidJsonBody(_) => actix_web::http::StatusCode::BAD_REQUEST,
            ApiError::ChallengeNotValid => actix_web::http::StatusCode::BAD_REQUEST,
            ApiError::ChallengeExpired => actix_web::http::StatusCode::BAD_REQUEST,
            ApiError::UserMissingRequiredFields(_) => actix_web::http::StatusCode::BAD_REQUEST,
            ApiError::UserDoesntExistForEmailChallenge => actix_web::http::StatusCode::BAD_REQUEST,
            ApiError::EmailChallengeDecryptionError => actix_web::http::StatusCode::BAD_REQUEST,
            ApiError::EmailChallengeExpired => actix_web::http::StatusCode::BAD_REQUEST,
            ApiError::InvalidTenantKeyOrUserId => actix_web::http::StatusCode::BAD_REQUEST,
            ApiError::Webauthn(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::Serde(_) => StatusCode::BAD_REQUEST,
            ApiError::OnboardingForTenantDoesNotExist => StatusCode::UNAUTHORIZED,
            ApiError::KmsSignMacError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::KmsVerifyMacError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::WebauthnCredentialsNotSet => StatusCode::BAD_REQUEST,
            ApiError::RateLimited(_) => StatusCode::BAD_REQUEST,
            ApiError::WorkOS(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::WorkOsDecode(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::WorkOsPayload(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::WorkOsError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::WorkOSError => StatusCode::INTERNAL_SERVER_ERROR,
            // This invariant should never be broken
            ApiError::NoPhoneNumberForVault => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::NotImplemented => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::InvalidStatusTransition => StatusCode::BAD_REQUEST,
        }
    }

    fn error_response(&self) -> actix_web::HttpResponse<actix_web::body::BoxBody> {
        let response = ApiResponseError {
            error: ApiResponseErrorInfo {
                status_code: self.status_code().as_u16(),
                message: self.to_string(),
            },
        };
        actix_web::HttpResponse::build(self.status_code()).json(response)
    }
}
impl Apiv2Errors for ApiError {}
