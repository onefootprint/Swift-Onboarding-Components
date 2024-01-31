use std::pin::Pin;

use crate::utils::headers::get_bool_header;

use actix_web::{http::header::HeaderMap, FromRequest};
use futures_util::Future;
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Apiv2Schema, Clone, Default)]
pub struct MetaHeaders {
    pub is_instant_app: Option<bool>,
    pub is_app_clip: Option<bool>,
    /// When true, photo was taken manually
    pub is_manual: Option<bool>,
    pub process_separately: Option<bool>,
    pub is_extra_compressed: bool,
}

impl MetaHeaders {
    const IS_APP_CLIP_HEADER_NAME: &'static str = "x-fp-is-app-clip";
    const IS_EXTRA_COMPRESSED: &'static str = "x-fp-is-extra-compressed";
    const IS_INSTANT_APP_HEADER_NAME: &'static str = "x-fp-is-instant-app";
    const IS_MANUAL_HEADER_NAME: &'static str = "x-fp-is-manual";
    const PROCESS_SEPARATELY_HEADER_NAME: &'static str = "x-fp-process-separately";

    pub fn parse_from_request(headers: &HeaderMap) -> Self {
        let is_instant_app = get_bool_header(Self::IS_INSTANT_APP_HEADER_NAME, headers);
        let is_app_clip = get_bool_header(Self::IS_APP_CLIP_HEADER_NAME, headers);
        let is_manual = get_bool_header(Self::IS_MANUAL_HEADER_NAME, headers);
        let process_separately = get_bool_header(Self::PROCESS_SEPARATELY_HEADER_NAME, headers);
        let is_extra_compressed = get_bool_header(Self::IS_EXTRA_COMPRESSED, headers).unwrap_or(false);
        Self {
            is_instant_app,
            is_app_clip,
            is_manual,
            process_separately,
            is_extra_compressed,
        }
    }
}

impl FromRequest for MetaHeaders {
    type Error = crate::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {
        let headers = MetaHeaders::parse_from_request(req.headers());
        Box::pin(async move { Ok(headers) })
    }
}
