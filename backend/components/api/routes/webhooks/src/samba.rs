use actix_web::web;
use api_core::decision::vendor::samba::license_validation::get_samba_license_validation_report;
use api_core::types::ApiResponse;
use api_core::web::Json;
use api_core::FpResult;
use api_core::State;
use idv::samba::response::webhook::SambaWebhook;
use newtypes::SambaWebhookEventType;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;

#[api_v2_operation(description = "Handler for Samba Safety webhooks", tags(Webhooks, Private))]
#[post("/webhooks/samba/handle_webhook")]
async fn handle_webhook(
    state: web::Data<State>,
    request: Json<serde_json::Value>,
) -> ApiResponse<api_wire_types::Empty> {
    let req = request.into_inner();
    match serde_json::from_value::<SambaWebhook>(req) {
        Ok(webhook) => {
            tracing::info!(?webhook, msg = "samba webhook received", "samba_webhook");
            match handle_webhook_inner(&state, webhook).await {
                Ok(_) => log(None, "success"),
                Err(e) => tracing::info!(err=?e, msg = "error handling webhook", "samba_webhook"),
            }
        }
        Err(_) => {
            log(None, "error deserializing");
        }
    }

    Ok(api_wire_types::Empty)
}

#[tracing::instrument(skip_all)]
async fn handle_webhook_inner(state: &State, webhook: SambaWebhook) -> FpResult<()> {
    match webhook.event_type() {
        Some(k) => match k {
            SambaWebhookEventType::LicenseValidationReceived => {
                get_samba_license_validation_report(state, webhook).await?;
            }
            event_type @ SambaWebhookEventType::LicenseValidationError => {
                log(Some(event_type), "lv error");
            }
            event_type => {
                log(Some(event_type), "unexpected event");
            }
        },
        None => log(None, "event type missing"),
    }

    Ok(())
}

fn log(event_type: Option<SambaWebhookEventType>, msg: &str) {
    tracing::info!(?event_type, ?msg, "samba webhook");
}
