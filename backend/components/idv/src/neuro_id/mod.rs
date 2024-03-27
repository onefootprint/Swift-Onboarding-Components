pub mod client;
pub mod error;
pub mod response;

pub type NeuroApiResult<T> = Result<T, error::Error>;
