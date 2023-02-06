use crate::errors::ApiError;
use actix_web::dev::Payload;
use actix_web::error::Error as ActixError;
use actix_web::{error::JsonPayloadError, HttpRequest};
use actix_web::{web::JsonBody, FromRequest};
use futures::Future;
use paperclip::v2::schema::Apiv2Schema;
use serde::de::DeserializeOwned;
use std::{
    pin::Pin,
    task::{ready, Context, Poll},
};

/// Just like Actix's Json, but custom size limit represented in the type
pub struct LargeJson<T, const LIMIT: usize>(pub T);

// This is our actual deserialzier (where the limit is used)
impl<T: DeserializeOwned, const LIMIT: usize> FromRequest for LargeJson<T, LIMIT> {
    type Error = ActixError;
    type Future = actix_json::JsonExtractFut<T, LIMIT>;

    fn from_request(req: &HttpRequest, payload: &mut Payload) -> Self::Future {
        actix_json::JsonExtractFut {
            fut: JsonBody::new(req, payload, None, false).limit(LIMIT),
        }
    }
}

/// Code adapted from actix's json.rs
/// to poll the json parsing future
mod actix_json {
    use super::*;

    fn err_handler(err: JsonPayloadError) -> ActixError {
        actix_web::Error::from(ApiError::InvalidJsonBody(err))
    }

    pub struct JsonExtractFut<T, const LIMIT: usize> {
        pub(super) fut: JsonBody<T>,
    }

    impl<T: DeserializeOwned, const LIMIT: usize> Future for JsonExtractFut<T, LIMIT> {
        type Output = Result<LargeJson<T, LIMIT>, ActixError>;

        fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
            let this = self.get_mut();

            let res = ready!(Pin::new(&mut this.fut).poll(cx));

            let res = match res {
                Err(err) => {
                    tracing::debug!("Failed to deserialize Json from payload");
                    Err(err_handler(err))
                }
                Ok(data) => Ok(LargeJson(data)),
            };

            Poll::Ready(res)
        }
    }
}

// NOTE: the rest of this module is just re-duplicated Json trait impls since we created a newtype
impl<T, const LIMIT: usize> std::ops::Deref for LargeJson<T, LIMIT> {
    type Target = T;

    fn deref(&self) -> &T {
        &self.0
    }
}

impl<T, const LIMIT: usize> std::ops::DerefMut for LargeJson<T, LIMIT> {
    fn deref_mut(&mut self) -> &mut T {
        &mut self.0
    }
}
impl<T: std::fmt::Display, const LIMIT: usize> std::fmt::Display for LargeJson<T, LIMIT> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        std::fmt::Display::fmt(&self.0, f)
    }
}

// Defines Paperclip schemas

impl<T: Apiv2Schema, const L: usize> Apiv2Schema for LargeJson<T, L> {
    fn name() -> Option<String> {
        T::name()
    }

    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        T::raw_schema()
    }
}

impl<T: Apiv2Schema, const L: usize> paperclip::actix::OperationModifier for LargeJson<T, L> {
    fn update_parameter(op: &mut paperclip::v2::models::DefaultOperationRaw) {
        op.parameters.push(paperclip::v2::models::Either::Right(
            paperclip::v2::models::Parameter {
                description: None,
                in_: paperclip::v2::models::ParameterIn::Body,
                name: "body".into(),
                required: true,
                max_length: Some(L as u32),
                schema: Some({
                    let mut def = T::schema_with_ref();
                    def.retain_ref();
                    def
                }),
                ..Default::default()
            },
        ));
    }

    fn update_response(op: &mut paperclip::v2::models::DefaultOperationRaw) {
        op.responses.insert(
            "200".into(),
            paperclip::v2::models::Either::Right(paperclip::v2::models::Response {
                // TODO: Support configuring other 2xx codes using macro attribute.
                description: Some("OK".into()),
                schema: Some({
                    let mut def = T::schema_with_ref();
                    def.retain_ref();
                    def
                }),
                ..Default::default()
            }),
        );
    }
}
