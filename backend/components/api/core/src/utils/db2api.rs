//! Helper trait to convert DB types to API types

use crate::FpResult;

/// Convert DB type to an API type
pub trait DbToApi<T>: Sized {
    ///  convert from the target type
    fn from_db(target: T) -> Self;
}

/// Convert DB type to an API type
pub trait TryDbToApi<T>: Sized {
    ///  convert from the target type
    fn try_from_db(target: T) -> FpResult<Self>;
}
