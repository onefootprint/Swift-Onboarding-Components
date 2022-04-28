use actix_web::Responder;
use paperclip::actix::Apiv2Schema;
use serde::Serialize;


#[derive(Debug, Clone, serde::Serialize, Apiv2Schema)]
pub struct ApiResponseData<T> {
    pub data: T,
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
