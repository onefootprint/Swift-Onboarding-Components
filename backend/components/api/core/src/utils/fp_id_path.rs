use crate::telemetry::RootSpan;
use actix_web::FromRequest;
use futures_util::Future;
use newtypes::FpId;
use paperclip::actix::web::Path;
use paperclip::actix::OperationModifier;
use paperclip::v2::schema::Apiv2Schema;
use std::pin::Pin;

/// Extractor to pull fp_id out of the path and log it in the root span
pub struct FpIdPath<T = FpId>(T);

/// Shorthand for a path that includes both the FpId and another type T
pub type FpIdPathPlus<T> = FpIdPath<(FpId, T)>;

pub trait GetFpId {
    fn fp_id(&self) -> &FpId;
}

impl GetFpId for FpId {
    fn fp_id(&self) -> &FpId {
        self
    }
}

impl<T> GetFpId for (FpId, T) {
    fn fp_id(&self) -> &FpId {
        &self.0
    }
}

impl<T> FromRequest for FpIdPath<T>
where
    T: serde::de::DeserializeOwned + 'static + GetFpId,
{
    type Error = <Path<T> as FromRequest>::Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, payload: &mut actix_web::dev::Payload) -> Self::Future {
        let fp_id_fut = <Path<T> as FromRequest>::from_request(req, payload);
        let root_span_fut = RootSpan::from_request(req, payload);

        Box::pin(async move {
            let t = fp_id_fut.await?.into_inner();
            let root_span = root_span_fut.await?;
            root_span.record("fp_id", t.fp_id().to_string());

            Ok(Self(t))
        })
    }
}

impl<T> FpIdPath<T> {
    pub fn into_inner(self) -> T {
        self.0
    }
}

impl<T> Apiv2Schema for FpIdPath<T>
where
    Path<T>: Apiv2Schema,
{
    fn name() -> Option<String> {
        Some("FpIdPath".into())
    }

    fn description() -> &'static str {
        <Path<T> as Apiv2Schema>::description()
    }

    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        <Path<T> as Apiv2Schema>::raw_schema()
    }

    fn required() -> bool {
        <Path<T> as Apiv2Schema>::required()
    }
}

impl<T> paperclip::actix::OperationModifier for FpIdPath<T>
where
    Path<T>: paperclip::actix::OperationModifier,
{
    fn update_parameter(op: &mut paperclip::v2::models::DefaultOperationRaw) {
        <Path<T> as OperationModifier>::update_parameter(op)
    }
}
