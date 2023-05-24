use actix_web::{web, FromRequest};
use api_core::auth::AuthError;
use api_core::types::{EmptyResponse, JsonApiResponse};
use api_core::{decision, State};
use crypto::hex;
use futures_util::Future;
use paperclip::actix::Apiv2Header;
use paperclip::actix::{api_v2_operation, post};
use std::pin::Pin;

#[api_v2_operation(description = "Handles Middesk webhooks.", tags(Private))]
#[post("/webhooks/middesk/handle_webhook")]
async fn handle_webhook(
    webhook_signature: MiddeskWebhookSignature,
    state: web::Data<State>,
) -> JsonApiResponse<EmptyResponse> {
    decision::vendor::middesk::handle_middesk_webhook(
        &state.db_pool,
        state.feature_flag_client.clone(),
        state.vendor_clients.middesk_get_business.clone(),
        &state.enclave_client,
        webhook_signature.request,
    )
    .await?;
    EmptyResponse::ok().json()
}

#[derive(Debug, Clone, Apiv2Header)]
pub struct MiddeskWebhookSignature {
    #[openapi(skip)]
    pub request: serde_json::Value,
}

const MIDDESK_WEBHOOK_SIGNATURE_HEADER_NAME: &str = "X-Middesk-Signature-256";

impl FromRequest for MiddeskWebhookSignature {
    type Error = api_core::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, payload: &mut actix_web::dev::Payload) -> Self::Future {
        let webhook_signature = req
            .headers()
            .get(MIDDESK_WEBHOOK_SIGNATURE_HEADER_NAME)
            .and_then(|hv| hv.to_str().map(|s| s.to_string()).ok())
            .ok_or_else(|| AuthError::MissingHeader(MIDDESK_WEBHOOK_SIGNATURE_HEADER_NAME.to_owned()));

        let req_bytes = web::Bytes::from_request(req, payload);

        #[allow(clippy::unwrap_used)]
        let secret = req
            .app_data::<web::Data<State>>()
            .unwrap()
            .config
            .middesk_config
            .middesk_webhook_secret
            .clone();

        Box::pin(async move {
            let req_bytes = req_bytes.await.map_err(|_| AuthError::InvalidBody)?;

            let webhook_signature = webhook_signature?;
            let webhook_signature = hex::decode(webhook_signature)
                .map_err(|_| AuthError::InvalidHeader("Invalid encoding".to_owned()))?;

            let expected = crypto::hmac_sha256_sign(secret.as_bytes(), &req_bytes)?;

            if crypto::safe_compare(&expected, &webhook_signature) {
                let request = serde_json::from_slice(&req_bytes)?;
                Ok(Self { request })
            } else {
                Err(AuthError::InvalidHeader(MIDDESK_WEBHOOK_SIGNATURE_HEADER_NAME.to_owned()).into())
            }
        })
    }
}
