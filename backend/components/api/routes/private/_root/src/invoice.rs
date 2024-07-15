use crate::ProtectedAuth;
use actix_web::post;
use actix_web::web::{
    self,
};
use api_core::types::ApiResponse;
use api_core::FpResult;
use api_core::State;
use billing::create_bill_for_tenant;
use chrono::Duration;
use chrono::NaiveDate;
use chrono::Utc;
use db::models::tenant::Tenant;
use futures::StreamExt;
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

    let tenant = state
        .db_pool
        .db_query(move |conn| Tenant::get(conn, &tenant_id))
        .await?;

    create_bill_for_tenant(&state.billing_client, &state.db_pool, tenant, billing_date).await?;

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
        tasks.push(Box::pin(create_bill_for_tenant(
            &state.billing_client,
            &state.db_pool,
            t,
            billing_date,
        )))
    }
    while tasks.next().await.is_some() {}

    Ok(api_wire_types::Empty)
}
