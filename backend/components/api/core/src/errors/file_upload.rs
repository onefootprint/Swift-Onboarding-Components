use thiserror::Error;

#[derive(Debug, Error)]
pub enum FileUploadError {
    #[error("invalid file upload body missing")]
    InvalidFileUploadMissing,
    #[error("missing content type (mime)")]
    MissingMimeType,
    #[error("invalid file type")]
    InvalidMimeType,
    #[error("invalid file upload body missing: {0}")]
    MultipartError(#[from] actix_multipart::MultipartError),
    #[error("image too large: max size is {0}")]
    FileTooLarge(usize),
    #[error("invalid content length")]
    InvalidContentLength,
    #[error("missing filename")]
    MissingFilename,
}
