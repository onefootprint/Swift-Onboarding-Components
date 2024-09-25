// webhooks/twilio_callback

use actix_web::web;
use actix_web::FromRequest;
use api_core::types::ApiResponse;
use api_core::utils::headers::get_header;
use api_core::FpResult;
use api_core::State;
use api_errors::AssertionError;
use api_errors::ValidationError;
use db::models::twilio_message_log::TwilioMessageLog;
use itertools::Itertools;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web::Form;
use paperclip::actix::Apiv2Header;
use serde::Deserialize;
use serde_json::Map;
use serde_json::Value;
use std::future::Future;
use std::pin::Pin;


#[derive(Debug, Clone, Deserialize)]
struct TwilioWebhookContents {
    /// captures all the fields
    #[serde(flatten)]
    other: Map<String, Value>,
}

#[api_v2_operation(
    description = "Handler for Twilio Message webhook callback",
    tags(Webhooks, Private)
)]
#[post("/webhooks/twilio_status_callback")]
async fn handle_webhook(
    state: web::Data<State>,
    webhook: VerifiedTwilioWebhook,
) -> ApiResponse<api_wire_types::Empty> {
    if &webhook.message.message_status == "sent" {
        tracing::info!("Twilio webhook: got message sent, skipping log update");
        return Ok(api_wire_types::Empty);
    }

    state
        .db_pool
        .db_query(move |conn| {
            TwilioMessageLog::update_or_create(
                conn,
                webhook.message.message_sid,
                webhook.message.account_sid,
                webhook.message.message_status,
                webhook.message.error_code,
            )
        })
        .await?;

    Ok(api_wire_types::Empty)
}

#[derive(Debug, Clone, Apiv2Header)]
struct VerifiedTwilioWebhook {
    #[openapi(skip)]
    message: TwilioMessage,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "PascalCase")]
struct TwilioMessage {
    message_sid: String,
    account_sid: String,
    message_status: String,
    error_code: Option<String>,
}
impl FromRequest for VerifiedTwilioWebhook {
    type Error = api_core::ApiError;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &actix_web::HttpRequest, payload: &mut actix_web::dev::Payload) -> Self::Future {
        let signature: FpResult<_> = get_header("X-Twilio-Signature", req.headers())
            .ok_or(ValidationError("Missing X-Twilio-Signature header").into());

        #[allow(clippy::unwrap_used)]
        let state = req.app_data::<web::Data<State>>().unwrap();
        let clients = vec![
            Some(state.sms_client.twilio_client.clone()),
            state.sms_client.twilio_client_backup.clone(),
        ]
        .into_iter()
        .flatten()
        .collect();

        let form = Form::<TwilioWebhookContents>::from_request(req, payload);
        let uri = state
            .config
            .twilio_status_callback_url()
            .ok_or(AssertionError("No twilio callback URL configured"));

        Box::pin(async move {
            let signature = signature?;
            let params = form
                .await
                .map_err(|_| ValidationError("Invalid twilio callback request body"))?
                .into_inner();

            let message = verify_twilio_webhook(uri?, signature, params.other, clients)?;

            Ok(Self { message })
        })
    }
}


fn verify_twilio_webhook(
    uri: String,
    twilio_signature: String,
    form: Map<String, Value>,
    clients: Vec<twilio::Client>,
) -> FpResult<TwilioMessage> {
    let mut to_sign: String = uri;

    let sorted_params: Vec<(&str, &str)> = form
        .iter()
        .flat_map(|(k, v)| v.as_str().map(|v| (k.as_str(), v)))
        .sorted_by(|a, b| a.0.cmp(b.0))
        .collect();

    for (key, value) in sorted_params {
        to_sign.push_str(key);
        to_sign.push_str(value);
    }

    for client in clients {
        let computed_signature: String = client.webhook_signature(&to_sign)?;
        if computed_signature == twilio_signature {
            let message = serde_json::from_value(serde_json::Value::Object(form))?;
            return Ok(message);
        }
    }

    Err(ValidationError("Invalid Twilio signature").into())
}
