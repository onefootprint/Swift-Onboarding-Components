use aws_sdk_kms::{
    error::{GenerateDataKeyPairWithoutPlaintextError, GenerateDataKeyWithoutPlaintextError},
    types::SdkError as KmsSdkError,
};
use aws_sdk_pinpointsmsvoicev2::{
    error::SendTextMessageError,
    types::SdkError as SmsSdkError,
};
use aws_sdk_pinpointemail::{
    error::SendEmailError,
    types::SdkError as EmailSdkError,
};
use aws_sdk_pinpoint::{
    error::PhoneNumberValidateError,
    types::SdkError as PinpointSdkError,
};
use enclave_proxy::bb8;
use db::errors::DbError;
use db::models::types::{ChallengeKind};
use thiserror::Error;

use crate::response::error::{ApiResponseError, ApiResponseErrorInfo};

#[derive(Debug, Error)]
pub enum ApiError {
    #[error("Auth error: {0}")]
    AuthError(#[from] crate::auth::AuthError),

    #[error("Data {0:?} not set for user")]
    DataNotSetForUser(ChallengeKind),
    #[error("kms.datakeypair.generate {0}")]
    KmsKeyPair(#[from] KmsSdkError<GenerateDataKeyPairWithoutPlaintextError>),
    #[error("kms.datakey.generate {0}")]
    KmsDataKey(#[from] KmsSdkError<GenerateDataKeyWithoutPlaintextError>),
    #[error("pinpoint.phonenumbervalidateerror {0}")]
    PinpointPhoneNumberValidateError(#[from] PinpointSdkError<PhoneNumberValidateError>),
    #[error("crypto {0}")]
    Crypto(#[from] crypto::Error),
    #[error("enclave_proxy {0}")]
    EnclaveProxy(#[from] enclave_proxy::Error),
    #[error("enclave_conn {0}")]
    EnclaveConnection(#[from] bb8::RunError<enclave_proxy::Error>),
    #[error("enclave {0}")]
    Enclave(#[from] enclave_proxy::EnclaveError),
    #[error("database_result {0}")]
    Database(#[from] DbError),
    #[error("dotenv {0}")]
    Dotenv(#[from] dotenv::Error),
    #[error("send_text_message_error {0}")]
    SendTextMessageError(#[from] SmsSdkError<SendTextMessageError>),
    #[error("send_email_error {0}")]
    SendEmailError(#[from] EmailSdkError<SendEmailError>),
    #[error("cannot_decode_utf8 {0}")]
    CannotDecodeUtf8(#[from] std::str::Utf8Error),
    #[error("user_data_not_populated")]
    UserDataNotPopulated,
    #[error("phone_number_validation_error")]
    PhoneNumberValidationError
}

fn status_code_for_db_error(e: &DbError) -> actix_web::http::StatusCode {
    match e {
        DbError::DbInteract(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
        DbError::DbError(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
        DbError::PoolGet(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
        DbError::PoolInit(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
        DbError::ConnectionError(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
        DbError::MigrationError(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
        DbError::InvalidTenantAuth => actix_web::http::StatusCode::UNAUTHORIZED,
        DbError::ChallengeDataMismatch => actix_web::http::StatusCode::BAD_REQUEST,
        DbError::ChallengeCodeMismatch => actix_web::http::StatusCode::BAD_REQUEST,
        DbError::ChallengeExpired => actix_web::http::StatusCode::BAD_REQUEST,
        DbError::ChallengeInactive => actix_web::http::StatusCode::BAD_REQUEST,
    }
}

impl actix_web::ResponseError for ApiError {
    fn status_code(&self) -> actix_web::http::StatusCode {
        match self {
            ApiError::AuthError(_) => actix_web::http::StatusCode::BAD_REQUEST,
            ApiError::DataNotSetForUser(_) => actix_web::http::StatusCode::BAD_REQUEST,
            ApiError::KmsKeyPair(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::KmsDataKey(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::PinpointPhoneNumberValidateError(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::Crypto(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::EnclaveProxy(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::EnclaveConnection(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::Enclave(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::Database(e) => status_code_for_db_error(e),
            ApiError::Dotenv(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::SendTextMessageError(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::SendEmailError(_) => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::CannotDecodeUtf8(_) => actix_web::http::StatusCode::BAD_REQUEST,
            ApiError::UserDataNotPopulated => actix_web::http::StatusCode::BAD_REQUEST,
            ApiError::PhoneNumberValidationError => actix_web::http::StatusCode::BAD_REQUEST,
        }
    }

    fn error_response(&self) -> actix_web::HttpResponse<actix_web::body::BoxBody> {
        let response = ApiResponseError {
            error: ApiResponseErrorInfo {
                status_code: self.status_code().as_u16(),
                message: self.to_string(),
        }};
        actix_web::HttpResponse::build(self.status_code()).json(response)
    }
}