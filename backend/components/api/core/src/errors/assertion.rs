use crate::ApiError;

#[derive(Debug)]
/// Shorthand to make it convenient to make an HTTP 500 assertion error.
/// Use this when an application-level invariant isn't met. This should only be returned when
/// there's a problem with our code that needs to be addressed - maybe a codepath hit that should
/// never occur in production.
pub struct AssertionError<'a>(pub &'a str);

impl<'a> From<AssertionError<'a>> for ApiError {
    fn from(value: AssertionError<'a>) -> Self {
        ApiError::AssertionError(value.0.to_string())
    }
}
