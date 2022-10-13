//! Helper trait to convert DB types to API types

/// Convert DB type to an API type
pub trait DbToApi<T>: Sized {
    ///
    ///  convert from the target type
    fn from_db(target: T) -> Self;
}
