use crate::State;
use api_core::auth::session::check::CheckSessionContext;
use api_core::types::ApiResponse;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::Apiv2Response;
use paperclip::actix::{
    self,
};
use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Response, macros::JsonResponder)]
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
) -> ApiResponse<CheckSessionResponse> {
    let data = match session_check {
        CheckSessionContext::Active => CheckSessionResponse::Active,
        CheckSessionContext::Expired => CheckSessionResponse::Expired,
        CheckSessionContext::InvalidOrNotFound => CheckSessionResponse::Unknown,
    };

    Ok(data)
}
