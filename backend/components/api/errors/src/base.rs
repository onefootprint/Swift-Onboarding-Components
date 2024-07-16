use crate::FpError;
use crate::FpErrorCode;
use crate::FpErrorTrait;
use actix_web::http::StatusCode;

#[derive(Debug)]
/// Shorthand to make it convenient to make an HTTP 500 assertion error.
/// Use this when an application-level invariant isn't met. This should only be returned when
/// there's a problem with our code that needs to be addressed - maybe a codepath hit that should
/// never occur in production.
pub struct AssertionError<'a>(pub &'a str);

#[derive(Debug)]
struct AssertionErrorInternal(String);

impl std::fmt::Display for AssertionErrorInternal {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        std::fmt::Display::fmt(&self.0, f)
    }
}

impl std::error::Error for AssertionErrorInternal {
    fn source(&self) -> std::option::Option<&(dyn std::error::Error + 'static)> {
        None
    }
}

impl FpErrorTrait for AssertionErrorInternal {
    fn status_code(&self) -> StatusCode {
        StatusCode::INTERNAL_SERVER_ERROR
    }

    fn message(&self) -> String {
        self.0.to_string()
    }
}

impl<'a> From<AssertionError<'a>> for FpError {
    fn from(value: AssertionError<'a>) -> Self {
        FpError::from(AssertionErrorInternal(value.0.to_string()))
    }
}

// Shorthand to easily an AssertionError into a Result easily
impl<'a, T, E: From<FpError>> From<AssertionError<'a>> for Result<T, E> {
    fn from(value: AssertionError<'a>) -> Self {
        Err(E::from(FpError::from(value)))
    }
}


#[derive(Debug)]
/// Shorthand to make it convenient to make an HTTP 400 validation error.
pub struct ValidationError<'a>(pub &'a str);

#[derive(Debug)]
struct ValidationErrorInternal(String);

impl std::fmt::Display for ValidationErrorInternal {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        std::fmt::Display::fmt(&self.0, f)
    }
}

impl std::error::Error for ValidationErrorInternal {
    fn source(&self) -> std::option::Option<&(dyn std::error::Error + 'static)> {
        None
    }
}

impl FpErrorTrait for ValidationErrorInternal {
    fn status_code(&self) -> StatusCode {
        StatusCode::BAD_REQUEST
    }

    fn message(&self) -> String {
        self.0.to_string()
    }
}

impl<'a> From<ValidationError<'a>> for FpError {
    fn from(value: ValidationError<'a>) -> Self {
        FpError::from(ValidationErrorInternal(value.0.to_string()))
    }
}

impl<'a, T, E: From<FpError>> From<ValidationError<'a>> for Result<T, E> {
    fn from(value: ValidationError<'a>) -> Self {
        Err(E::from(FpError::from(value)))
    }
}

macro_rules! fp_error_trait_impl {
    ($typ:ty, $status_code: tt) => {
        impl $crate::FpErrorTrait for $typ {
            fn status_code(&self) -> StatusCode {
                StatusCode::$status_code
            }

            fn message(&self) -> String {
                self.to_string()
            }
        }
    };
}

fp_error_trait_impl!(regex::Error, INTERNAL_SERVER_ERROR);
fp_error_trait_impl!(reqwest::header::ToStrError, INTERNAL_SERVER_ERROR);
fp_error_trait_impl!(reqwest::header::InvalidHeaderName, INTERNAL_SERVER_ERROR);
fp_error_trait_impl!(reqwest::Error, INTERNAL_SERVER_ERROR);
fp_error_trait_impl!(reqwest_middleware::Error, INTERNAL_SERVER_ERROR);
fp_error_trait_impl!(std::io::Error, INTERNAL_SERVER_ERROR);
fp_error_trait_impl!(
    aws_sdk_pinpointsmsvoicev2::error::SdkError<
        aws_sdk_pinpointsmsvoicev2::operation::send_text_message::SendTextMessageError,
    >,
    INTERNAL_SERVER_ERROR
);
fp_error_trait_impl!(tokio::task::JoinError, INTERNAL_SERVER_ERROR);

fp_error_trait_impl!(base64::DecodeError, BAD_REQUEST);
fp_error_trait_impl!(url::ParseError, BAD_REQUEST);
fp_error_trait_impl!(http::method::InvalidMethod, BAD_REQUEST);
fp_error_trait_impl!(http::header::InvalidHeaderValue, BAD_REQUEST);
fp_error_trait_impl!(strum::ParseError, BAD_REQUEST);
fp_error_trait_impl!(std::str::Utf8Error, BAD_REQUEST);
fp_error_trait_impl!(serde_json::Error, BAD_REQUEST);
fp_error_trait_impl!(serde_cbor::Error, BAD_REQUEST);
fp_error_trait_impl!(actix_web::error::JsonPayloadError, BAD_REQUEST);

impl FpErrorTrait for webauthn_rs_core::error::WebauthnError {
    fn status_code(&self) -> StatusCode {
        StatusCode::BAD_REQUEST
    }

    fn message(&self) -> String {
        self.to_string()
    }

    fn code(&self) -> Option<FpErrorCode> {
        match self {
            Self::ParseNOMFailure => Some(FpErrorCode::ParseNomFailure),
            _ => None,
        }
    }
}
