use actix_web::web;
use actix_web::FromRequest;
use api_core::auth::AuthError;
use api_core::decision;
use api_core::types::ApiResponse;
use api_core::State;
use crypto::hex;
use futures_util::Future;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::Apiv2Header;
use std::pin::Pin;

#[api_v2_operation(description = "Handles Middesk webhooks.", tags(Webhooks, Private))]
#[post("/webhooks/middesk/handle_webhook")]
async fn handle_webhook(
    webhook_signature: MiddeskWebhookSignature,
    state: web::Data<State>,
) -> ApiResponse<api_wire_types::Empty> {
    let res = decision::vendor::middesk::handle_middesk_webhook(&state, webhook_signature.request).await;

    match res {
        Ok(_) => {}
        Err(err) => {
            // We are sometimes getting extraneous webhooks for businesses we've already completed
            // verification for. For these cases we still want to log the error, but we want to
            // return a 200 response to middesk doesn't keep retrying the webhook
            if err.code() == Some(api_errors::MIDDESK_ALREADY_COMPLETED.to_string()) {
                tracing::error!(?err, "Received webhook for completed middesk_request");
            } else {
                Err(err)?;
            }
        }
    }

    Ok(api_wire_types::Empty)
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

            let expected = crypto::hmac_sha256_sign(secret.leak_to_string().as_bytes(), &req_bytes)?;

            if crypto::safe_compare(&expected, &webhook_signature) {
                let request = serde_json::from_slice(&req_bytes)?;
                Ok(Self { request })
            } else {
                Err(AuthError::InvalidHeader(MIDDESK_WEBHOOK_SIGNATURE_HEADER_NAME.to_owned()).into())
            }
        })
    }
}
