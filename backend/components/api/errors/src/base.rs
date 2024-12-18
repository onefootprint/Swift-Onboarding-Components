use crate::FpError;
use crate::FpErrorCode;
use crate::FpErrorTrait;
use ::paste::paste;
use actix_web::http::StatusCode;


/// Defines convenience utils for a given error status code. Using an example name of `BadRequest`,
/// this will define:
/// - `BadRequest`: Shorthand to return an error with a BAD_REQUEST status code
/// - `BadRequestInto`: Shorthand to return a Result with a BAD_REQUEST status code
/// - `BadRequest!`: Shorthand macro to return a BAD_REQUEST error with a formatted message
/// - `BadRequestInto!`: Shorthand macro to return a Result with a BAD_REQUEST status code with a
///   formatted message
macro_rules! define_err_type {
    ($name:ident, $status_code:tt) => {
        define_err_type!(($), $name, $status_code);
    };
    // Since this macro defines another macro, we need to pass the $ in explicitly as `$d`
    // https://www.reddit.com/r/rust/comments/dtrmmg/help_macro_rules_inside_of_macro_rules/
    (($d: tt), $name:ident, $status_code:tt) => {
        paste!(
            #[track_caller]
            #[allow(non_snake_case)]
            #[doc = "Shorthand to return an HTTP "]
            #[doc = stringify!($status_code)]
            #[doc = " error."]
            pub fn [< $name >]<TErr>(err: TErr) -> FpError
            where
                TErr: ToString,
            {
                [< $name Into >]::<_, FpError>(err)
            }

            #[track_caller]
            #[allow(non_snake_case)]
            #[doc = "Shorthand to return an HTTP "]
            #[doc = stringify!($status_code)]
            #[doc = " error. Can be coerced into a result."]
            pub fn [< $name Into >]<TErr, TRes>(err: TErr) -> TRes
            where
                TErr: ToString,
                TRes: From<[< $name Internal >]>,
            {
                TRes::from([< $name Internal >](err.to_string()))
            }

            #[macro_export]
            #[doc = "Shorthand to return an HTTP "]
            #[doc = stringify!($name)]
            #[doc = " error with a formatted error message."]
            macro_rules! [< $name >] {
                ($d($arg:tt)*) => {
                    [< $name >](format!($d($arg)*))
                }
            }

            #[macro_export]
            #[doc = "Shorthand to return an HTTP "]
            #[doc = stringify!($name)]
            #[doc = " error with a formatted error message. Can be coerced into a result."]
            macro_rules! [< $name Into >] {
                ($d($arg:tt)*) => {
                    [< $name Into >](format!($d($arg)*))
                }
            }

            #[derive(Debug)]
            pub struct [< $name Internal >](String);

            impl std::fmt::Display for [< $name Internal >] {
                fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                    std::fmt::Display::fmt(&self.0, f)
                }
            }

            impl std::error::Error for [< $name Internal >] {
                fn source(&self) -> std::option::Option<&(dyn std::error::Error + 'static)> {
                    None
                }
            }

            impl FpErrorTrait for [< $name Internal >] {
                fn status_code(&self) -> StatusCode {
                    StatusCode::$status_code
                }

                fn message(&self) -> String {
                    self.0.to_string()
                }
            }

            impl<T, E> From<[< $name Internal >]> for Result<T, E>
            where
                E: From<FpError>,
            {
                #[track_caller]
                fn from(value: [< $name Internal >]) -> Self {
                    Err(E::from(FpError::from(value)))
                }
            }
        );
    };
}

define_err_type!(BadRequest, BAD_REQUEST);
define_err_type!(Unauthorized, UNAUTHORIZED);
define_err_type!(Forbidden, FORBIDDEN);
define_err_type!(ServerErr, INTERNAL_SERVER_ERROR);
define_err_type!(NotFound, NOT_FOUND);

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
fp_error_trait_impl!(chrono::ParseError, INTERNAL_SERVER_ERROR);

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

impl FpErrorTrait for crypto::Error {
    fn status_code(&self) -> StatusCode {
        StatusCode::INTERNAL_SERVER_ERROR
    }

    fn message(&self) -> String {
        self.to_string()
    }
}


impl FpErrorTrait for rpc::TransformError {
    fn status_code(&self) -> StatusCode {
        StatusCode::BAD_REQUEST
    }

    fn message(&self) -> String {
        self.to_string()
    }
}
