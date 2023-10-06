use crate::errors::file_upload::FileUploadError;
use crate::errors::ApiResult;
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
}

impl std::fmt::Debug for FileUpload {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("FileUpload")
            .field("mime_type", &self.mime_type)
            .field("filename", &self.filename)
            .finish()
    }
}

impl FileUpload {
    pub fn new_simple(pii: PiiBytes, name: String, mime: &str) -> Self {
        Self {
            bytes: pii,
            mime_type: mime.to_string(),
            filename: name,
        }
    }
}

pub fn mime_type_to_extension(mime_type: &str) -> Option<&'static str> {
    match mime_type {
        "image/png" => Some("png"),
        "image/svg+xml" => Some("svg"),
        "image/jpeg" => Some("jpg"),
        "image/gif" => Some("gif"),
        "image/heic" => Some("heic"),
        "application/pdf" => Some("pdf"),
        "application/json" => Some("json"),
        _ => None,
    }
}

#[tracing::instrument(skip_all)]
pub async fn handle_file_upload(
    payload: &mut Multipart,
    request: &HttpRequest,
    restrict_to_mime_types: Option<Vec<Mime>>,
    max_allowed_file_size_in_bytes: usize,
) -> ApiResult<FileUpload> {
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

    if let Some(allowed_mime_types) = restrict_to_mime_types {
        if !allowed_mime_types.contains(&mime) {
            return Err(FileUploadError::InvalidMimeType.into());
        }
    }

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
        filename,
    })
}
