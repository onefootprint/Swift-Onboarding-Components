use crate::ProtectedAuth;
use actix_web::post;
use actix_web::web::{
    self,
};
use api_core::types::ApiResponse;
use api_core::FpResult;
use api_core::State;
use billing::generate_invoice_for_tenant;
use chrono::Duration;
use chrono::NaiveDate;
use chrono::Utc;
use db::models::task::Task;
use db::models::tenant::Tenant;
use futures::StreamExt;
use newtypes::GenerateInvoiceArgs;
use newtypes::TenantId;

#[derive(Debug, serde::Deserialize)]
struct CreateInvoiceRequest {
    tenant_id: TenantId,
    /// When provided, we'll generate the invoice as if this ran in the billing period containing
    /// this date
    billing_date: Option<NaiveDate>,
}

#[post("/private/invoice")]
async fn post(
    state: web::Data<State>,
    request: web::Json<CreateInvoiceRequest>,
    _: ProtectedAuth,
) -> ApiResponse<api_wire_types::Empty> {
    let CreateInvoiceRequest {
        tenant_id,
        billing_date,
    } = request.into_inner();
    let billing_date = billing_date.unwrap_or_else(|| Utc::now().date_naive());
    let task_data = GenerateInvoiceArgs {
        tenant_id,
        billing_date,
    };

    // Queue a task to generate the invoice, since it can take some time.
    // NOTE: be careful using this as it can clog up our single task queue.
    // We should make a separate task queue for lower-priority high latency operations
    state
        .db_pool
        .db_query(move |conn| Task::create(conn, Utc::now(), task_data.into()))
        .await?;

    Ok(api_wire_types::Empty)
}

#[derive(Debug, serde::Deserialize)]
struct CreateInvoicesRequest {
    /// When provided, we'll generate the invoice as if this ran in the billing period containing
    /// this date
    billing_date: Option<NaiveDate>,
}

#[actix_web::post("/private/invoices")]
async fn post_all(
    state: web::Data<State>,
    request: Option<web::Json<CreateInvoicesRequest>>,
    _: ProtectedAuth,
) -> ApiResponse<api_wire_types::Empty> {
    let tenants = state.db_pool.db_query(Tenant::list_billable).await?;

    // Subtract 8 hours so we always generate the invoice for last month
    let billing_date = request
        .and_then(|b| b.billing_date)
        .unwrap_or((Utc::now() - Duration::hours(8)).date_naive());

    let mut tasks = futures::stream::FuturesUnordered::<
        std::pin::Pin<Box<dyn std::future::Future<Output = FpResult<()>>>>,
    >::new();
    for t in tenants {
        let fut = generate_invoice_for_tenant(&state.billing_client, &state.db_pool, t.id, billing_date);
        tasks.push(Box::pin(fut))
    }
    while tasks.next().await.is_some() {}

    Ok(api_wire_types::Empty)
}
