use thiserror::Error;

#[derive(Debug, Error)]
pub enum FileUploadError {
    #[error("Invalid file upload: body missing")]
    InvalidFileUploadMissing,
    #[error("Missing content type (mime)")]
    MissingMimeType,
    #[error("Invalid file type: {0}")]
    InvalidMimeType(String),
    #[error("Invalid file upload: {0}")]
    MultipartError(String),
    #[error("Image too large: max size is {0}")]
    FileTooLarge(usize),
    #[error("Invalid content length")]
    InvalidContentLength,
    #[error("Missing filename")]
    MissingFilename,
}

impl From<actix_multipart::MultipartError> for FileUploadError {
    fn from(value: actix_multipart::MultipartError) -> Self {
        Self::MultipartError(format!("{:?}", &value))
    }
}
