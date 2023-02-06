use thiserror::Error;

#[derive(Debug, Error)]
pub enum ImageUploadError {
    #[error("invalid file upload body missing")]
    InvalidFileUploadMissing,
    #[error("missing content type (mime)")]
    MissingMimeType,
    #[error("invalid file not supported or missing")]
    InvalidImageMimeType,
    #[error("invalid file upload body missing: {0}")]
    MultipartFileUploadError(#[from] actix_multipart::MultipartError),
    #[error("image too large: max size is 1MB")]
    ImageTooLarge,
    #[error("invalid content length")]
    InvalidContentLength,
}
