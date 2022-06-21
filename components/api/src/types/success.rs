use actix_web::Responder;
use paperclip::actix::Apiv2Schema;
use serde::Serialize;

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct ApiResponseData<T> {
    pub data: T,
}

impl<T> ApiResponseData<T> {
    pub fn ok(data: T) -> Self {
        Self { data }
    }
}

impl<T> Responder for ApiResponseData<T>
where
    T: Serialize,
{
    type Body = actix_web::body::BoxBody;

    fn respond_to(self, _req: &actix_web::HttpRequest) -> actix_web::HttpResponse<Self::Body> {
        actix_web::HttpResponse::build(actix_web::http::StatusCode::OK).json(self)
    }
}

#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct ApiPaginatedResponseData<T, C> {
    pub data: T,
    pub next: Option<C>,
    pub count: Option<i64>,
}

impl<T, C> ApiPaginatedResponseData<T, C> {
    pub fn ok(data: T, next: Option<C>, count: Option<i64>) -> Self {
        Self { data, next, count }
    }
}

impl<T, C> Responder for ApiPaginatedResponseData<T, C>
where
    T: Serialize,
    C: Serialize,
{
    type Body = actix_web::body::BoxBody;

    fn respond_to(self, _req: &actix_web::HttpRequest) -> actix_web::HttpResponse<Self::Body> {
        actix_web::HttpResponse::build(actix_web::http::StatusCode::OK).json(self)
    }
}
