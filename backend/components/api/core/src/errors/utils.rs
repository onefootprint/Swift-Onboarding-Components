use super::ApiResult;
use crate::{
    ApiError,
    ApiErrorKind,
};

#[derive(Debug)]
/// Shorthand to make it convenient to make an HTTP 500 assertion error.
/// Use this when an application-level invariant isn't met. This should only be returned when
/// there's a problem with our code that needs to be addressed - maybe a codepath hit that should
/// never occur in production.
pub struct AssertionError<'a>(pub &'a str);

impl<'a> From<AssertionError<'a>> for ApiError {
    fn from(value: AssertionError<'a>) -> Self {
        ApiError::from(ApiErrorKind::AssertionError(value.0.to_string()))
    }
}

impl<'a, T> From<AssertionError<'a>> for ApiResult<T> {
    fn from(value: AssertionError<'a>) -> Self {
        Err(ApiError::from(value))
    }
}

#[derive(Debug)]
/// Shorthand to make it convenient to make an HTTP 400 validation error.
pub struct ValidationError<'a>(pub &'a str);

impl<'a> From<ValidationError<'a>> for ApiError {
    fn from(value: ValidationError<'a>) -> Self {
        ApiError::from(ApiErrorKind::ValidationError(value.0.to_string()))
    }
}

impl<'a, T> From<ValidationError<'a>> for ApiResult<T> {
    fn from(value: ValidationError<'a>) -> Self {
        Err(ApiError::from(value))
    }
}

#[derive(Debug)]
/// Shorthand to make it convenient to return an arbitrary JSON error
pub struct JsonError<T>(pub T);

impl<T> From<JsonError<T>> for ApiError
where
    T: serde::Serialize,
{
    fn from(value: JsonError<T>) -> Self {
        match serde_json::value::to_value(value.0) {
            Ok(v) => ApiError::from(ApiErrorKind::JsonError(v)),
            Err(e) => ApiError::from(e),
        }
    }
}
