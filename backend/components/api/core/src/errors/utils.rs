use super::ApiResult;
use crate::types::ModernApiResult;
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

impl<'a, T> From<AssertionError<'a>> for ModernApiResult<T> {
    fn from(value: AssertionError<'a>) -> Self {
        Err(ApiError::from(value).into())
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

impl<'a, T> From<ValidationError<'a>> for ModernApiResult<T> {
    fn from(value: ValidationError<'a>) -> Self {
        Err(ApiError::from(value).into())
    }
}
