use actix_web::web;
use api_core::types::{
    EmptyResponse,
    JsonApiResponse,
};
use api_core::web::Json;
use api_core::State;
use idv::samba::response::webhook::SambaWebhook;
use paperclip::actix::{
    api_v2_operation,
    post,
};

#[api_v2_operation(description = "Handles Samba Safety webhooks.", tags(Webhooks, Private))]
#[post("/webhooks/samba/handle_webhook")]
async fn handle_webhook(
    _state: web::Data<State>,
    request: Json<serde_json::Value>,
) -> JsonApiResponse<EmptyResponse> {
    let req = request.into_inner();
    match serde_json::from_value::<SambaWebhook>(req) {
        Ok(webhook) => {
            tracing::info!(event_type=?webhook.event_type(), "samba webhook received");
        }
        Err(_) => {
            tracing::info!("samba webhook error deserializing");
        }
    }


    EmptyResponse::ok().json()
}
