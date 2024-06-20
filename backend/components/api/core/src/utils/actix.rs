use actix_web::dev::Payload;
use actix_web::web::Json;
use actix_web::FromRequest;
use actix_web::HttpRequest;
use derive_more::Deref;
use derive_more::DerefMut;
use futures_util::Future;
use paperclip::actix::OperationModifier;
use paperclip::v2::models::DefaultOperationRaw;
use paperclip::v2::models::Either;
use paperclip::v2::models::Parameter;
use paperclip::v2::models::ParameterIn;
use paperclip::v2::schema::Apiv2Schema;
use serde::de::DeserializeOwned;
use std::pin::Pin;

#[derive(Debug, Deref, DerefMut)]
/// Optionally extracts json-serialized `T` from the request body.
/// If there is no request body provided, extracts as None.
/// If there is a request body provided, runs the extractor for `T` and passes along the Result.
/// This is different from `Option<Json<T>>`, which will swallow errors by converting Err results
/// into None.
/// The const type parameter `REQUIRED` controls whether the open API spec for this Json should
/// be marked as required, allowing the open API spec to drift from application behavior.
pub struct OptionalJson<T, const REQUIRED: bool = false>(pub Option<T>);

impl<T> OptionalJson<T> {
    /// Unwrap into inner `Option<T>` value.
    pub fn into_inner(self) -> Option<T> {
        self.0
    }
}

impl<T: DeserializeOwned + 'static, const REQUIRED: bool> FromRequest for OptionalJson<T, REQUIRED> {
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

impl<T, const REQUIRED: bool> Apiv2Schema for OptionalJson<T, REQUIRED>
where
    T: Apiv2Schema,
{
    fn name() -> Option<String> {
        T::name()
    }

    fn description() -> &'static str {
        T::description()
    }

    fn required() -> bool {
        REQUIRED
    }

    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        T::raw_schema()
    }

    fn schema_with_ref() -> paperclip::v2::models::DefaultSchemaRaw {
        T::schema_with_ref()
    }

    fn security_scheme() -> Option<paperclip::v2::models::SecurityScheme> {
        T::security_scheme()
    }

    fn header_parameter_schema(
    ) -> Vec<paperclip::v2::models::Parameter<paperclip::v2::models::DefaultSchemaRaw>> {
        T::header_parameter_schema()
    }
}

impl<T: Apiv2Schema, const REQUIRED: bool> OperationModifier for OptionalJson<T, REQUIRED> {
    fn update_parameter(op: &mut DefaultOperationRaw) {
        // Mostly replicates <Json::<T> as OperationModifier>::update_parameter, but we override to
        // set required = false since the body is optional
        // <Json::<T> as OperationModifier>::update_parameter
        op.parameters.push(Either::Right(Parameter {
            description: Some(T::description().to_owned()),
            in_: ParameterIn::Body,
            name: "body".into(),
            required: REQUIRED,
            schema: Some({
                let mut def = Json::<T>::schema_with_ref();
                def.retain_ref();
                def
            }),
            ..Default::default()
        }))
    }
}
