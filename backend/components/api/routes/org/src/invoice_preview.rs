use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantSessionAuth;
use api_core::auth::Any;
use api_core::types::ApiResponse;
use api_core::State;
use billing::interval::get_billing_interval;
use chrono::DateTime;
use chrono::TimeZone;
use chrono::Utc;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;
use paperclip::actix::Apiv2Response;
use serde::Serialize;


#[derive(Debug, Clone, Default, Serialize, Apiv2Response, macros::JsonResponder)]
struct InvoicePreview {
    line_items: Vec<LineItem>,
    last_updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Serialize, Apiv2Response)]
struct LineItem {
    description: Option<String>,
    quantity: u64,
    unit_price_cents: Option<String>,
    notional_cents: i64,
}

#[api_v2_operation(
    tags(Billing, Private),
    description = "Returns a preview of the in-progress invoice for the month, if exists"
)]
#[get("/org/invoice_preview")]
async fn get(state: web::Data<State>, auth: TenantSessionAuth) -> ApiResponse<InvoicePreview> {
    let auth = auth.check_guard(Any)?;
    let Some(customer_id) = auth.tenant().stripe_customer_id.as_ref() else {
        return Ok(InvoicePreview::default());
    };

    let interval = get_billing_interval(Utc::now().date_naive())?;
    let line_items = state
        .billing_client
        .get_draft_line_items(customer_id, interval)
        .await?;

    let last_updated_at = line_items.iter().flat_map(|li| li.date).max();
    let last_updated_at = last_updated_at.and_then(|d| Utc.timestamp_opt(d, 0).single());
    let line_items = line_items
        .into_iter()
        .map(|li| LineItem {
            description: li.description,
            quantity: li.quantity.unwrap_or_default(),
            unit_price_cents: li.unit_amount_decimal,
            notional_cents: li.amount.unwrap_or_default(),
        })
        .collect();
    let result = InvoicePreview {
        line_items,
        last_updated_at,
    };
    Ok(result)
}
