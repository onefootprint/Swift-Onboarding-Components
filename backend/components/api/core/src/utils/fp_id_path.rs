use std::pin::Pin;

use actix_web::FromRequest;
use futures_util::Future;
use newtypes::FpId;
use paperclip::{
    actix::{web::Path, OperationModifier},
    v2::schema::Apiv2Schema,
};

use crate::telemetry::RootSpan;

pub struct FpIdPath(FpId);

impl FromRequest for FpIdPath {
    type Error = <Path<FpId> as FromRequest>::Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, payload: &mut actix_web::dev::Payload) -> Self::Future {
        let fp_id_fut = <Path<FpId> as FromRequest>::from_request(req, payload);
        let root_span_fut = RootSpan::from_request(req, payload);

        Box::pin(async move {
            let fp_id = fp_id_fut.await?.into_inner();
            let root_span = root_span_fut.await?;
            root_span.record("fp_id", fp_id.to_string());

            Ok(Self(fp_id))
        })
    }
}

impl FpIdPath {
    pub fn into_inner(self) -> FpId {
        self.0
    }
}

impl Apiv2Schema for FpIdPath {
    fn name() -> Option<String> {
        Some("FpIdPath".into())
    }

    fn description() -> &'static str {
        <Path<FpId> as Apiv2Schema>::description()
    }

    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        <Path<FpId> as Apiv2Schema>::raw_schema()
    }

    fn required() -> bool {
        <Path<FpId> as Apiv2Schema>::required()
    }
}

impl paperclip::actix::OperationModifier for FpIdPath {
    fn update_parameter(op: &mut paperclip::v2::models::DefaultOperationRaw) {
        <Path<FpId> as OperationModifier>::update_parameter(op)
    }
}
