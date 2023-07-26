use crate::errors::file_upload::FileUploadError;
use crate::errors::ApiError;
use actix_multipart::Multipart;
use actix_web::HttpRequest;
use bytes::BytesMut;
use futures_util::StreamExt as _;

use mime::Mime;
use newtypes::PiiBytes;
use reqwest::header::CONTENT_LENGTH;

#[derive(Clone)]
pub struct FileUpload {
    pub bytes: PiiBytes,
    pub mime_type: String,
    pub filename: String,
    pub file_extension: String,
}

impl std::fmt::Debug for FileUpload {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("FileUpload")
            .field("mime_type", &self.mime_type)
            .field("filename", &self.filename)
            .field("file_extension", &self.file_extension)
            .finish()
    }
}

impl FileUpload {
    pub fn new_simple(pii: PiiBytes, name: String, mime: &str) -> Self {
        let file_extension = match mime {
            "image/png" => "png",
            "image/svg+xml" => "svg",
            "image/jpeg" => "jpg",
            "application/pdf" => "pdf",
            _ => "bin",
        };

        Self {
            bytes: pii,
            mime_type: mime.to_string(),
            file_extension: file_extension.to_string(),
            filename: name,
        }
    }
}

pub async fn handle_file_upload(
    payload: &mut Multipart,
    request: &HttpRequest,
    allowed_mime_types: Vec<Mime>,
    max_allowed_file_size_in_bytes: usize,
) -> Result<FileUpload, ApiError> {
    let request_content_length: usize =
        crate::utils::headers::get_required_header(CONTENT_LENGTH.as_str(), request.headers())?
            .parse()
            .map_err(|_| FileUploadError::InvalidContentLength)?;

    if request_content_length > max_allowed_file_size_in_bytes {
        return Err(FileUploadError::FileTooLarge(max_allowed_file_size_in_bytes))?;
    }

    // extract the file contents from body
    let Some(item) = payload.next().await else {
        return Err(FileUploadError::InvalidFileUploadMissing)?;
    };

    let mut item = item.map_err(FileUploadError::from)?;

    let filename = item
        .content_disposition()
        .get_filename()
        .ok_or(FileUploadError::MissingFilename)?
        .to_owned();
    let mime = item
        .content_type()
        .ok_or(FileUploadError::MissingMimeType)?
        .clone();
    let mime_type = mime.to_string();

    let file_extension = allowed_mime_types
        .contains(&mime)
        .then_some(match mime_type.as_str() {
            "image/png" => Some("png"),
            "image/svg+xml" => Some("svg"),
            "image/jpeg" => Some("jpg"),
            "application/pdf" => Some("pdf"),
            _ => None,
        })
        .flatten()
        .ok_or(FileUploadError::InvalidMimeType)?
        .to_string();

    let mut bytes = BytesMut::new();
    while let Some(chunk) = item.next().await {
        let chunk = chunk.map_err(FileUploadError::from)?;
        bytes.extend(chunk);

        if bytes.len() > request_content_length {
            return Err(FileUploadError::FileTooLarge(max_allowed_file_size_in_bytes))?;
        }
    }

    let bytes = PiiBytes::new(bytes.to_vec());

    Ok(FileUpload {
        bytes,
        mime_type,
        file_extension,
        filename,
    })
}
