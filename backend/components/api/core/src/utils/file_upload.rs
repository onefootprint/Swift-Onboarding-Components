use std::time::Duration;

use crate::{
    errors::{error_with_code::ErrorWithCode, ApiResult},
    ApiError, ApiErrorKind,
};
use actix_multipart::Multipart;
use actix_web::{HttpMessage, HttpRequest};
use bytes::{BufMut, BytesMut};
use futures_util::StreamExt as _;

use super::timeouts::ResponseDeadline;
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
    must_be_gt_file_size_in_bytes: usize,
) -> ApiResult<FileUpload> {
    let fut = handle_file_upload_inner(
        payload,
        request,
        restrict_to_mime_types,
        max_allowed_file_size_in_bytes,
        must_be_gt_file_size_in_bytes,
    );

    // If there's no response deadline, don't apply a timeout. This wouldn't happen as long as the
    // middleware is installed.
    let Some(&resp_deadline) = request.extensions().get::<ResponseDeadline>() else {
        return fut.await;
    };

    // Set to one second less than the timeout for the request to allow for the upload to complete.
    let upload_deadline = resp_deadline.into_instant() - Duration::from_secs(1);

    let fut_with_timeout = tokio::time::timeout_at(upload_deadline, fut);
    match fut_with_timeout.await {
        Ok(res) => res,
        Err(_) => Err(ApiError::from(ApiErrorKind::ErrorWithCode(
            ErrorWithCode::FileUploadTimeout,
        ))),
    }
}

#[tracing::instrument(skip_all)]
async fn handle_file_upload_inner(
    payload: &mut Multipart,
    request: &HttpRequest,
    restrict_to_mime_types: Option<Vec<Mime>>,
    max_allowed_file_size_in_bytes: usize,
    must_be_gt_file_size_in_bytes: usize,
) -> ApiResult<FileUpload> {
    let request_content_length: usize =
        crate::utils::headers::get_required_header(CONTENT_LENGTH.as_str(), request.headers())?
            .parse()
            .map_err(|_| ErrorWithCode::InvalidContentLength)?;

    if request_content_length > max_allowed_file_size_in_bytes {
        return Err(ErrorWithCode::FileTooLarge(max_allowed_file_size_in_bytes))?;
    }

    // extract the file contents from body
    let Some(item) = payload.next().await else {
        return Err(ErrorWithCode::InvalidFileUploadMissing)?;
    };

    let mut item = item.map_err(|_| ErrorWithCode::MultipartError)?;

    let filename = item
        .content_disposition()
        .get_filename()
        .ok_or(ErrorWithCode::MissingFilename)?
        .to_owned();
    let mime = item.content_type().ok_or(ErrorWithCode::MissingMimeType)?.clone();
    let mime_type = mime.to_string();

    if let Some(allowed_mime_types) = restrict_to_mime_types {
        if !allowed_mime_types.contains(&mime) {
            return Err(ErrorWithCode::InvalidMimeType(mime.to_string()).into());
        }
    }

    let mut bytes = BytesMut::with_capacity(request_content_length);

    while let Some(chunk) = item.next().await {
        let chunk = chunk.map_err(|_| ErrorWithCode::MultipartError)?;
        let chunk_size = chunk.len();

        if bytes.len() + chunk_size > request_content_length {
            return Err(ErrorWithCode::FileTooLarge(max_allowed_file_size_in_bytes))?;
        }

        bytes.put(chunk);
    }

    // wait until we've actually read the file in to determine the size since content length header
    // includes other aspects of the request
    if bytes.len() <= must_be_gt_file_size_in_bytes {
        return Err(ErrorWithCode::FileTooSmall(must_be_gt_file_size_in_bytes))?;
    }

    let bytes = PiiBytes::new(bytes.to_vec());

    Ok(FileUpload {
        bytes,
        mime_type,
        filename,
    })
}
