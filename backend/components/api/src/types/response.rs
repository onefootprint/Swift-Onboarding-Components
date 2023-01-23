use actix_web::Responder;
use paperclip::actix::web::Json;
use paperclip::{
    actix::Apiv2Schema,
    v2::{models::DataType, schema::TypedData},
};
use serde::Serialize;

use crate::errors::ApiResult;

/// return footprint api results
pub type JsonApiResponse<T> = ApiResult<Json<ResponseData<T>>>;

/// return string results
pub type StringResponse = ApiResult<String>;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
#[openapi(description = "Empty response")]
pub struct EmptyResponse {}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(transparent)]
pub struct ResponseData<T> {
    pub data: T,
}

impl<T> ResponseData<T> {
    pub fn ok(data: T) -> Self {
        Self { data }
    }

    pub fn json(self) -> JsonApiResponse<T> {
        ApiResult::Ok(Json(self))
    }
}

impl EmptyResponse {
    pub fn ok() -> ResponseData<EmptyResponse> {
        ResponseData {
            data: EmptyResponse {},
        }
    }
}

impl<T> paperclip::v2::schema::Apiv2Schema for ResponseData<T>
where
    T: paperclip::v2::schema::Apiv2Schema,
{
    fn name() -> Option<String> {
        T::name()
    }

    fn description() -> &'static str {
        T::description()
    }

    fn required() -> bool {
        T::required()
    }

    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        T::raw_schema()
    }
}

impl<T> paperclip::actix::OperationModifier for ResponseData<T> where T: paperclip::actix::OperationModifier {}

impl<T> Responder for ResponseData<T>
where
    T: Serialize,
{
    type Body = actix_web::body::BoxBody;

    fn respond_to(self, _req: &actix_web::HttpRequest) -> actix_web::HttpResponse<Self::Body> {
        actix_web::HttpResponse::build(actix_web::http::StatusCode::OK).json(self)
    }
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct PaginatedReponseMeta<C> {
    pub next: Option<C>,
    // TODO why is this optional?
    pub count: Option<i64>,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct PaginatedResponseData<T, C> {
    pub data: T,
    pub meta: PaginatedReponseMeta<C>,
}

impl<T, C: Clone> PaginatedResponseData<T, C> {
    pub fn ok(data: T, next: Option<C>, count: Option<i64>) -> Self {
        Self {
            data,
            meta: PaginatedReponseMeta { next, count },
        }
    }
}

impl<T, C> Responder for PaginatedResponseData<T, C>
where
    T: Serialize,
    C: Serialize,
{
    type Body = actix_web::body::BoxBody;

    fn respond_to(self, _req: &actix_web::HttpRequest) -> actix_web::HttpResponse<Self::Body> {
        actix_web::HttpResponse::build(actix_web::http::StatusCode::OK).json(self)
    }
}

impl<T, C> paperclip::v2::schema::Apiv2Schema for PaginatedResponseData<T, C>
where
    T: paperclip::v2::schema::Apiv2Schema,
    C: TypedData,
{
    fn name() -> Option<String> {
        T::name().map(|n| format!("PageResponse<{}>", n))
    }

    fn description() -> &'static str {
        T::description()
    }

    fn required() -> bool {
        T::required()
    }

    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        let mut schema = paperclip::v2::models::DefaultSchemaRaw {
            name: Self::name(),
            description: Some(T::description().to_string()),
            data_type: Some(DataType::Object),
            items: Some(Box::new(T::raw_schema())),
            reference: Self::name(),
            ..Default::default()
        };
        schema.properties.insert("data".into(), Box::new(T::raw_schema()));
        schema
            .properties
            .insert("meta".into(), Box::new(PaginatedReponseMeta::<C>::raw_schema()));

        schema
    }
}

impl<T, C> paperclip::actix::OperationModifier for PaginatedResponseData<T, C>
where
    T: paperclip::v2::schema::Apiv2Schema,
    C: TypedData,
{
}
