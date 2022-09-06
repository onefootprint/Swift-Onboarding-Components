use std::fmt::Debug;

pub mod idology;
pub mod verification;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("IDology error: {0}")]
    IDologyError(#[from] idology::Error),
    #[error("Not implemented")]
    NotImplemented,
}
