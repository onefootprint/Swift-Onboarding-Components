use crate::ModernApiError;
use actix_web::dev::Payload;
use actix_web::FromRequest;
use actix_web::HttpRequest;
use futures::Future;
use paperclip::actix::web;
use paperclip::v2::models::DataTypeFormat;
use paperclip::v2::schema::Apiv2Schema;
use std::pin::Pin;
use std::task::ready;
use std::task::Context;
use std::task::Poll;
pub use web::Bytes;
pub use web::BytesMut;

/// Just like Actix's bytes, but custom size limit represented in the type
#[derive(derive_more::Deref, derive_more::DerefMut)]
pub struct BodyBytes<const LIMIT: usize>(web::Bytes);

impl<const L: usize> BodyBytes<L> {
    pub fn into_inner(self) -> Bytes {
        self.0
    }
}
// This is our actual deserialzier (where the limit is used)
impl<const LIMIT: usize> FromRequest for BodyBytes<LIMIT> {
    type Error = ModernApiError;
    type Future = actix_bytes::BytesExtractFut<LIMIT>;

    fn from_request(req: &HttpRequest, payload: &mut Payload) -> Self::Future {
        actix_bytes::BytesExtractFut {
            body_fut: actix_bytes::HttpMessageBody::new(req, payload),
        }
    }
}

impl<const LIMIT: usize> std::fmt::Display for BodyBytes<LIMIT> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        format!("Raw HTTP body ({}MB limit)", LIMIT / 1024).fmt(f)
    }
}

#[derive(thiserror::Error, Debug)]
pub enum InvalidBodyError {
    #[error("The request is too large, max size accepted is {max} KB.")]
    RequestTooLarge { max: usize },
    #[error("The request is missing a Content-Length header.")]
    UnknownLength,
    #[error("The request body is incomplete.")]
    Incomplete,
    #[error("The request body could not be decoded.")]
    FailedToDecode,
}
/// adapted from actix_web payload.rs to control limits per request
mod actix_bytes {
    pub use super::*;
    use actix_web::dev;
    use actix_web::http::header;
    use futures_util::Stream;

    /// Future for `Bytes` extractor.
    pub struct BytesExtractFut<const LIMIT: usize> {
        pub(super) body_fut: HttpMessageBody<LIMIT>,
    }

    impl<const LIMIT: usize> Future for BytesExtractFut<LIMIT> {
        type Output = Result<BodyBytes<LIMIT>, ModernApiError>;

        fn poll(mut self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
            Pin::new(&mut self.body_fut).poll(cx).map_err(Into::into)
        }
    }

    /// Future that resolves to a complete HTTP body payload.
    pub struct HttpMessageBody<const LIMIT: usize> {
        #[allow(unused)]
        length: Option<usize>,
        stream: dev::Decompress<dev::Payload>,
        buf: BytesMut,
        err: Option<ModernApiError>,
    }

    impl<const LIMIT: usize> HttpMessageBody<LIMIT> {
        /// Create `MessageBody` for request.
        #[allow(clippy::borrow_interior_mutable_const)]
        pub fn new(req: &HttpRequest, payload: &mut dev::Payload) -> HttpMessageBody<LIMIT> {
            let mut length = None;
            let mut err = None;

            if let Some(l) = req.headers().get(&header::CONTENT_LENGTH) {
                match l.to_str() {
                    Ok(s) => match s.parse::<usize>() {
                        Ok(l) => {
                            if l > LIMIT {
                                err = Some(ModernApiError::from(InvalidBodyError::RequestTooLarge {
                                    max: LIMIT,
                                }));
                            }
                            length = Some(l)
                        }
                        Err(_) => err = Some(ModernApiError::from(InvalidBodyError::UnknownLength)),
                    },
                    Err(_) => err = Some(ModernApiError::from(InvalidBodyError::UnknownLength)),
                }
            }

            let stream = dev::Decompress::from_headers(payload.take(), req.headers());

            HttpMessageBody {
                stream,
                length,
                buf: BytesMut::with_capacity(8192),
                err,
            }
        }
    }

    impl<const LIMIT: usize> Future for HttpMessageBody<LIMIT> {
        type Output = Result<BodyBytes<LIMIT>, ModernApiError>;

        fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
            let this = self.get_mut();

            if let Some(err) = this.err.take() {
                return Poll::Ready(Err(err));
            }

            loop {
                let res = ready!(Pin::new(&mut this.stream).poll_next(cx));
                match res {
                    Some(chunk) => {
                        let chunk = chunk
                            .map_err(|err| match &err {
                                actix_web::error::PayloadError::Overflow => {
                                    InvalidBodyError::RequestTooLarge { max: LIMIT }
                                }
                                actix_web::error::PayloadError::UnknownLength => {
                                    InvalidBodyError::UnknownLength
                                }
                                actix_web::error::PayloadError::Incomplete(_) => InvalidBodyError::Incomplete,
                                _ => {
                                    tracing::warn!(error=?err, "io/http2/encoding error");
                                    InvalidBodyError::FailedToDecode
                                }
                            })
                            .map_err(ModernApiError::from)?;

                        if this.buf.len() + chunk.len() > LIMIT {
                            return Poll::Ready(Err(ModernApiError::from(
                                InvalidBodyError::RequestTooLarge { max: LIMIT },
                            )));
                        } else {
                            this.buf.extend_from_slice(&chunk);
                        }
                    }
                    None => return Poll::Ready(Ok(BodyBytes(this.buf.split().freeze()))),
                }
            }
        }
    }
}

// Defines Paperclip schemas
impl<const L: usize> Apiv2Schema for BodyBytes<L> {
    fn name() -> Option<String> {
        Some(format!("Body ({}MB limit)", L / 1024))
    }

    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        Bytes::raw_schema()
    }
}

impl<const L: usize> paperclip::actix::OperationModifier for BodyBytes<L> {
    fn update_parameter(op: &mut paperclip::v2::models::DefaultOperationRaw) {
        op.parameters.push(paperclip::v2::models::Either::Right(
            paperclip::v2::models::Parameter {
                description: Some("Raw body".to_owned()),
                in_: paperclip::v2::models::ParameterIn::Body,
                name: "body".into(),
                required: true,
                max_length: Some(L as u32),
                format: Some(DataTypeFormat::Other),
                ..Default::default()
            },
        ));
    }
}
