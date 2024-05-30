use crate::errors::ApiResult;
use actix_web::Responder;
use newtypes::Base64Data;
use paperclip::actix::web::Json;
use paperclip::actix::Apiv2Schema;
use paperclip::v2::models::DataType;
use paperclip::v2::schema::TypedData;
use serde::{
    Deserialize,
    Serialize,
};

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
    // TODO need a reasonable openapi example. This doesn't work for every C
    #[openapi(example = "1234")]
    /// The `cursor` parameter to provide in order to request the next page of results.
    pub next: Option<C>,
    #[openapi(example = "10000")]
    // TODO why is this optional
    /// The total number of results.
    pub count: Option<i64>,
}

pub type CursorPaginatedResponse<T, C> = ApiResult<Json<CursorPaginatedResponseInner<T, C>>>;

#[derive(Debug, serde::Serialize)]
/// Wraps the response data with metadata needed for a cursor-paginated result.
/// Cursor pagination requests take in a cursor that identifies the start of the page (and is
/// delivered by the last pagination request) using an ordered field.
/// TODO need to wrap this in Json.
/// make an alias that is ApiResult<Json<CursorPaginatedResponseInner>>
pub struct CursorPaginatedResponseInner<T, C> {
    pub data: T,
    pub meta: CursorPaginatedResponseMeta<C>,
}

impl<T, C> CursorPaginatedResponseInner<T, C> {
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

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
/// Alternative to OffsetPaginatedResponseMeta for queries that don't return a count
pub struct OffsetPaginatedResponseMetaNoCount {
    #[openapi(example = "2")]
    /// The `page` parameter to provide in order to request the next page of results
    pub next_page: Option<usize>,
}

#[derive(Debug, Clone, serde::Serialize)]
/// Wraps the response data with metadata needed for an offset-paginated result.
/// Offset pagination requests take in a page number and page size and use postgres's OFFSET
/// in order to fetch the requested page.
/// Can be used alongside another actix web::Query extractor
pub struct OffsetPaginatedResponse<T, TMeta = OffsetPaginatedResponseMeta> {
    pub data: Vec<T>,
    pub meta: TMeta,
}

impl<T, TMeta> paperclip::v2::schema::Apiv2Schema for OffsetPaginatedResponse<T, TMeta>
where
    T: paperclip::v2::schema::Apiv2Schema,
    TMeta: paperclip::v2::schema::Apiv2Schema,
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
            .insert("meta".into(), TMeta::raw_schema().into());
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

impl<T> OffsetPaginatedResponse<T, OffsetPaginatedResponseMetaNoCount> {
    pub fn ok_no_count(data: Vec<T>, next_page: Option<usize>) -> Self {
        Self {
            data,
            meta: OffsetPaginatedResponseMetaNoCount { next_page },
        }
    }
}

/// Wraps a rich cursor type so it's serialized as an base64 string.
/// Facilitates multi-field cursors.
#[derive(Debug, PartialEq)]
pub struct Base64Cursor<T>(T);

impl<T> Base64Cursor<T>
where
    T: Serialize + for<'de> Deserialize<'de>,
{
    pub fn new(t: T) -> Base64Cursor<T> {
        Base64Cursor(t)
    }

    pub fn inner(&self) -> &T {
        &self.0
    }
}

impl<T> Serialize for Base64Cursor<T>
where
    T: Serialize,
{
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let j = serde_cbor::to_vec(&self.0).map_err(serde::ser::Error::custom)?;
        Base64Data(j).serialize(serializer)
    }
}

impl<'de, T> Deserialize<'de> for Base64Cursor<T>
where
    T: for<'tde> Deserialize<'tde>,
{
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let b = Base64Data::deserialize(deserializer)?.0;
        let val = serde_cbor::from_slice(&b).map_err(serde::de::Error::custom)?;

        Ok(Base64Cursor(val))
    }
}

impl<T> TypedData for Base64Cursor<T> {
    fn data_type() -> paperclip::v2::models::DataType {
        paperclip::v2::models::DataType::String
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[derive(Debug, PartialEq, Serialize, Deserialize)]
    struct TestCursor {
        a: i32,
        b: String,
        c: Vec<i32>,
    }

    #[test]
    fn test_base_64_cursor() {
        let c = Base64Cursor(TestCursor {
            a: 10,
            b: "frogs".to_owned(),
            c: vec![2, 4, 6, 8],
        });

        let cursor_str = serde_json::to_string(&c).unwrap();
        assert_eq!(cursor_str, "\"o2FhCmFiZWZyb2dzYWOEAgQGCA\"");

        let decoded_c = serde_json::from_str(&cursor_str).unwrap();
        assert_eq!(c, decoded_c);
    }
}
