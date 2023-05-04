use std::pin::Pin;

use actix_web::{dev::Payload, web::Json, FromRequest, HttpRequest};
use derive_more::{Deref, DerefMut};
use futures_util::Future;
use serde::de::DeserializeOwned;

#[derive(Debug, Deref, DerefMut)]
/// Optionally extracts json-serialized T from the request body.
/// If there is no request body provided, extracts as None.
/// If there is a request body provided, runs the extractor for T and passes along the Result.
/// This is different from Option<Json<T>>, which will swallow errors by converting Err results
/// into None
pub struct OptionalJson<T>(pub Option<T>);

impl<T> OptionalJson<T> {
    /// Unwrap into inner `Option<T>` value.
    pub fn into_inner(self) -> Option<T> {
        self.0
    }
}

impl<T: DeserializeOwned + 'static> FromRequest for OptionalJson<T> {
    type Error = <Json<T> as FromRequest>::Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    #[inline]
    fn from_request(req: &HttpRequest, payload: &mut Payload) -> Self::Future {
        // We inspect the content-length header to see if there is a body worth parsing.
        // Clients could lie to us about content-length, but then they'll get undefined behavior
        let has_body = req
            .headers()
            .get("content-length")
            .and_then(|v| v.to_str().ok().and_then(|v| Some(v.parse::<i64>().ok()? > 0)));
        let has_body = has_body == Some(true);
        let json_fut = Json::<T>::from_request(req, payload);
        Box::pin(async move {
            if has_body {
                let value = json_fut.await?;
                Ok(Self(Some(value.into_inner())))
            } else {
                Ok(Self(None))
            }
        })
    }
}

impl<T: paperclip::v2::schema::Apiv2Schema> paperclip::v2::schema::Apiv2Schema for OptionalJson<T> {
    fn name() -> Option<String> {
        T::name()
    }

    fn security_scheme() -> Option<paperclip::v2::models::SecurityScheme> {
        T::security_scheme()
    }
}

impl<T: paperclip::v2::schema::Apiv2Schema> paperclip::actix::OperationModifier for OptionalJson<T> {}
