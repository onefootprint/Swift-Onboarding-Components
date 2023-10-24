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
/// Metadata required for a cursor-paginated response.
pub struct CursorPaginatedResponseMeta<C> {
    /// The cursor to be provided in the next request to fetch the next page
    // TODO need a reasonable openapi example. This doesn't work for every C
    #[openapi(example = "1234")]
    /// The `cursor` parameter to provide in order to request the next page of results
    pub next: Option<C>,
    #[openapi(example = "10000")]
    // TODO why is this optional
    /// The total number of results
    pub count: Option<i64>,
}

pub type CursorPaginatedResponse<T, C> = ApiResult<Json<CursorPaginatedResponseInner<T, C>>>;

#[derive(Debug, Clone, serde::Serialize)]
/// Wraps the response data with metadata needed for a cursor-paginated result.
/// Cursor pagination requests take in a cursor that identifies the start of the page (and is
/// delivered by the last pagination request) using an ordered field.
/// TODO need to wrap this in Json.
/// make an alias that is ApiResult<Json<CursorPaginatedResponseInner>>
pub struct CursorPaginatedResponseInner<T, C> {
    pub data: T,
    pub meta: CursorPaginatedResponseMeta<C>,
}

impl<T, C: Clone> CursorPaginatedResponseInner<T, C> {
    pub fn ok(data: T, next: Option<C>, count: Option<i64>) -> ApiResult<Json<Self>> {
        Ok(Json(Self {
            data,
            meta: CursorPaginatedResponseMeta { next, count },
        }))
    }
}

impl<T, C> paperclip::v2::schema::Apiv2Schema for CursorPaginatedResponseInner<T, C>
where
    T: paperclip::v2::schema::Apiv2Schema,
    C: TypedData,
{
    fn name() -> Option<String> {
        T::name().map(|n| format!("CursorPaginated{}", n))
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
        schema.properties.insert(
            "meta".into(),
            Box::new(CursorPaginatedResponseMeta::<C>::raw_schema()),
        );
        schema.required.insert("data".into());
        schema.required.insert("meta".into());

        schema
    }
}

impl<T, C> paperclip::actix::OperationModifier for CursorPaginatedResponseInner<T, C>
where
    T: paperclip::v2::schema::Apiv2Schema,
    C: TypedData,
{
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct OffsetPaginatedResponseMeta {
    #[openapi(example = "2")]
    /// The `page` parameter to provide in order to request the next page of results
    pub next_page: Option<usize>,
    #[openapi(example = "10000")]
    /// The total number of results
    pub count: i64,
}

#[derive(Debug, Clone, serde::Serialize)]
/// Wraps the response data with metadata needed for an offset-paginated result.
/// Offset pagination requests take in a page number and page size and use postgres's OFFSET
/// in order to fetch the requested page.
/// Can be used alongside another actix web::Query extractor
pub struct OffsetPaginatedResponse<T> {
    pub data: Vec<T>,
    pub meta: OffsetPaginatedResponseMeta,
}

impl<T> paperclip::v2::schema::Apiv2Schema for OffsetPaginatedResponse<T>
where
    T: paperclip::v2::schema::Apiv2Schema,
{
    fn name() -> Option<String> {
        T::name().map(|n| format!("OffsetPaginated{}", n))
    }

    fn description() -> &'static str {
        T::description()
    }

    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        let mut schema = paperclip::v2::models::DefaultSchemaRaw {
            name: Self::name(),
            description: Some(Self::description().to_owned()),
            example: None,
            data_type: Some(DataType::Object),
            ..Default::default()
        };
        schema
            .properties
            .insert("data".into(), Vec::<T>::raw_schema().into());
        schema
            .properties
            .insert("meta".into(), OffsetPaginatedResponseMeta::raw_schema().into());
        schema.required.insert("data".into());
        schema.required.insert("meta".into());
        schema
    }
}

impl<T> OffsetPaginatedResponse<T> {
    pub fn ok(data: Vec<T>, next_page: Option<usize>, count: i64) -> Self {
        Self {
            data,
            meta: OffsetPaginatedResponseMeta { next_page, count },
        }
    }
}
