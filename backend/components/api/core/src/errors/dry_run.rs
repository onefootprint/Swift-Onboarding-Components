use crate::FpError;
use crate::FpResult;

/// FIXME: this is incompatible with db_transaction.
///
/// Drop-in replacement for ApiError when we also want to be able to roll back a transaction
#[derive(Debug)]
pub enum DryRunError<T> {
    Err(FpError),
    DryRunRollback(T),
}

// Any error type from conn.transaction() needs to implement From<FpError>
impl<T> From<FpError> for DryRunError<T> {
    fn from(value: FpError) -> Self {
        Self::Err(value)
    }
}

// Convenience to allow using ? for db operations
impl<T> From<diesel::result::Error> for DryRunError<T> {
    fn from(value: diesel::result::Error) -> Self {
        Self::from(FpError::from(value))
    }
}

/// Drop-in for ApiResult<T> that _also_ supports rolling back a transaction in dry-run mode with
/// a result.
pub type DryRunResult<T> = Result<T, DryRunError<T>>;

pub trait DryRunResultTrait<T> {
    fn ok_or_rollback(value: T, dry_run: bool) -> Self;
    fn value(self) -> FpResult<T>;
}

impl<T> DryRunResultTrait<T> for DryRunResult<T> {
    fn ok_or_rollback(value: T, dry_run: bool) -> Self {
        if dry_run {
            // Return an Err result to tell the transaction to roll back.
            // Hide the value inside a variant of the DryRunError
            Err(DryRunError::DryRunRollback(value))
        } else {
            // No rollback, just return the result
            Ok(value)
        }
    }

    /// Unpack the result `T` from either the Ok result or dry run rollback result
    fn value(self) -> FpResult<T> {
        match self {
            Ok(v) => Ok(v),
            // If the result is an error, but the error is DryRunRollback, return the wrapped value
            Err(DryRunError::DryRunRollback(v)) => Ok(v),
            // If the result is a real error, return the error
            Err(DryRunError::Err(e)) => Err(e),
        }
    }
}
