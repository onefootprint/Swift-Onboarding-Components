use api_errors::FpError;
use api_errors::FpErrorCode;
use http::StatusCode;
use newtypes::Base64Data;
use newtypes::Uuid;
use paperclip::actix::api_v2_errors;
use paperclip::actix::web::Json;
use paperclip::actix::Apiv2Schema;
use paperclip::v2::models::DataType;
use paperclip::v2::schema::Apiv2Schema;
use paperclip::v2::schema::TypedData;
use serde::Deserialize;
use serde::Serialize;

/// Wrapper around FpError that implements actix_web::ResponseError
#[api_v2_errors()] // We don't support error responses on our docs site yet
#[derive(derive_more::Deref)]
pub struct ApiError(FpError);

impl std::fmt::Display for ApiError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        std::fmt::Display::fmt(&self.0, f)
    }
}

impl std::fmt::Debug for ApiError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        std::fmt::Debug::fmt(&self.0, f)
    }
}

impl std::error::Error for ApiError {
    fn source(&self) -> std::option::Option<&(dyn std::error::Error + 'static)> {
        self.0.source()
    }
}

impl<T: Into<FpError>> From<T> for ApiError {
    fn from(value: T) -> Self {
        Self(value.into())
    }
}

#[derive(Clone, serde::Serialize)]
pub struct SerializedApiResponse {
    pub message: String,
    pub code: Option<FpErrorCode>,
    /// Any freeform JSON context to give more information on the error
    #[serde(skip_serializing_if = "Option::is_none")]
    pub context: Option<serde_json::Value>,
    pub support_id: Uuid,
    // In non-prod, debug representation of the error message
    #[serde(skip_serializing_if = "Option::is_none")]
    pub debug: Option<String>,
    // In non-prod, file location that produced the error message
    #[serde(skip_serializing_if = "Option::is_none")]
    pub location: Option<String>,
}


impl actix_web::ResponseError for ApiError {
    fn status_code(&self) -> StatusCode {
        self.0.status_code()
    }

    fn error_response(&self) -> actix_web::HttpResponse<actix_web::body::BoxBody> {
        let support_id = newtypes::Uuid::new_v4();
        self.log_error(support_id.to_string());

        let status_code = self.status_code();
        let mut message = self.message();

        if status_code == StatusCode::INTERNAL_SERVER_ERROR && crate::config::SERVICE_CONFIG.is_production() {
            // Scrub the error message for 500s in prod
            message = "Something went wrong".to_string()
        };
        let debug = (!crate::config::SERVICE_CONFIG.is_production()).then_some(format!("{:?}", self));
        let location = (!crate::config::SERVICE_CONFIG.is_production()).then_some(self.location());

        // Some errors have specific error codes and context
        let code = self.code();
        let context = self.context();

        let mut resp = actix_web::HttpResponse::build(status_code);
        self.mutate_response(&mut resp);

        resp.json(SerializedApiResponse {
            message,
            code: code.filter(|c| c.should_serialize()),
            context,
            support_id,
            debug,
            location,
        })
    }
}

/// The return type for any HTTP handler function. `FpError`s are coerced into `ApiError`s and are
/// serialized in the HTTP response JSON body.
pub type ApiResponse<T> = Result<T, ApiError>;

/// For legacy non-paginated APIs, a wrapper around Vec that implements Responder.
/// Should only use this for non-paginated APIs, which we shouldn't add many of.
pub type ApiListResponse<T> = ApiResponse<ListResponse<T>>;

#[derive(derive_more::From, serde::Serialize)]
pub struct ListResponse<T>(Vec<T>);

impl<T: paperclip::v2::schema::Apiv2Schema> paperclip::v2::schema::Apiv2Schema for ListResponse<T> {
    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        <Vec<T> as paperclip::v2::schema::Apiv2Schema>::raw_schema()
    }
}

impl<T: Apiv2Schema> paperclip::actix::OperationModifier for ListResponse<T> {
    fn update_parameter(op: &mut paperclip::v2::models::DefaultOperationRaw) {
        newtypes::map_container::update_body_parameter::<Vec<T>>(op);
    }

    fn update_response(op: &mut paperclip::v2::models::DefaultOperationRaw) {
        newtypes::map_container::update_200_response::<Vec<T>>(op, Default::default());
    }
}

impl<T: serde::Serialize> actix_web::Responder for ListResponse<T> {
    type Body = actix_web::body::BoxBody;

    fn respond_to(self, _req: &actix_web::HttpRequest) -> actix_web::HttpResponse<Self::Body> {
        let json_resp = paperclip::actix::web::Json(self.0);
        actix_web::HttpResponse::build(actix_web::http::StatusCode::OK).json(json_resp)
    }
}

impl<A> FromIterator<A> for ListResponse<A> {
    // Required method
    fn from_iter<T>(iter: T) -> Self
    where
        T: IntoIterator<Item = A>,
    {
        Self(Vec::from_iter(iter))
    }
}

pub type StringResponse = ApiResponse<String>;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
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

pub type CursorPaginatedResponse<T, C> = ApiResponse<Json<CursorPaginatedResponseInner<T, C>>>;

#[derive(Debug, serde::Serialize)]
/// Wraps the response data with metadata needed for a cursor-paginated result.
/// Cursor pagination requests take in a cursor that identifies the start of the page (and is
/// delivered by the last pagination request) using an ordered field.
/// Cursor pagination should be used when newer data can be added to the top of results, for ex when
/// sorting by created_at desc.
pub struct CursorPaginatedResponseInner<T, C> {
    pub data: Vec<T>,
    pub meta: CursorPaginatedResponseMeta<C>,
}

impl<T, C> CursorPaginatedResponseInner<T, C> {
    pub fn ok(
        data: Vec<T>,
        page_size: usize,
        next: Option<C>,
        count: Option<i64>,
    ) -> ApiResponse<Json<Self>> {
        Ok(Json(Self {
            // Since cursor-paginated DB utils fetch N+1 results to see if there's a next page, we have to
            // drop the last element
            data: data.into_iter().take(page_size).collect(),
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

    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        let mut schema = paperclip::v2::models::DefaultSchemaRaw {
            name: Self::name(),
            description: Some(T::description().to_string()),
            data_type: Some(DataType::Object),
            ..Default::default()
        };
        schema
            .properties
            .insert("data".into(), Box::new(Vec::<T>::raw_schema()));
        schema.properties.insert(
            "meta".into(),
            Box::new(CursorPaginatedResponseMeta::<C>::raw_schema()),
        );
        schema.required.insert("data".into());
        schema.required.insert("meta".into());

        schema
    }
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
pub struct OffsetPaginatedResponseMetaNoCount {
    #[openapi(example = "2")]
    /// The `page` parameter to provide in order to request the next page of results
    pub next_page: Option<usize>,
}

// TODO clean up these implementations with the newer macros::JsonResponder paradigm
#[derive(Debug, Clone, serde::Serialize)]
/// Wraps the response data with metadata needed for an offset-paginated result.
/// Offset pagination requests take in a page number and page size and use postgres's OFFSET
/// in order to fetch the requested page.
/// Can be used alongside another actix web::Query extractor
pub struct OffsetPaginatedResponse<T, TMeta = OffsetPaginatedResponseMeta> {
    pub data: Vec<T>,
    pub meta: TMeta,
}

pub type OffsetPaginatedResponseNoCount<T> = OffsetPaginatedResponse<T, OffsetPaginatedResponseMetaNoCount>;


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
            data_type: Some(DataType::Object),
            example: None,
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
