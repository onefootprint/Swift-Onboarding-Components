use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::State;
use api_core::auth::session::check::CheckSessionContext;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
    Apiv2Schema,
};
use serde::{
    Deserialize,
    Serialize,
};

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum CheckSessionResponse {
    Active,
    Expired,
    Unknown,
}
#[api_v2_operation(
    tags(Hosted),
    description = "Checks a hosted session token for expiration/validity"
)]
#[actix::get("/hosted/check_session")]
pub async fn get(
    _state: web::Data<State>,
    session_check: CheckSessionContext,
) -> actix_web::Result<Json<ResponseData<CheckSessionResponse>>, ApiError> {
    let data = match session_check {
        CheckSessionContext::Active => CheckSessionResponse::Active,
        CheckSessionContext::Expired => CheckSessionResponse::Expired,
        CheckSessionContext::InvalidOrNotFound => CheckSessionResponse::Unknown,
    };

    Ok(Json(ResponseData { data }))
}
