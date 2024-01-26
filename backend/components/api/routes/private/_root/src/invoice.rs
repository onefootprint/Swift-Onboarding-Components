use crate::ProtectedAuth;
use actix_web::post;
use actix_web::web::{self};
use api_core::errors::ApiResult;
use api_core::types::{EmptyResponse, JsonApiResponse};
use api_core::State;
use billing::{BillingCounts, BillingInfo};
use chrono::{Duration, NaiveDate, Utc};
use db::models::access_event::AccessEvent;
use db::models::billing_event::BillingEvent;
use db::models::billing_profile::BillingProfile;
use db::models::identity_document::IdentityDocument;
use db::models::scoped_vault::{ScopedVault, ScopedVaultPiiFilters};
use db::models::tenant::{Tenant, UpdateTenant};
use db::models::watchlist_check::WatchlistCheck;
use db::models::workflow::Workflow;
use futures::StreamExt;
use newtypes::{AccessEventPurpose, BillingEventKind, StripeCustomerId, TenantId, VaultKind};
use strum::IntoEnumIterator;

#[derive(Debug, serde::Deserialize)]
struct CreateInvoiceRequest {
    tenant_id: TenantId,
    /// When provided, we'll generate the invoice as if this ran in the billing period containing this date
    billing_date: Option<NaiveDate>,
}

#[post("/private/invoice")]
async fn post(
    state: web::Data<State>,
    request: web::Json<CreateInvoiceRequest>,
    _: ProtectedAuth,
) -> JsonApiResponse<EmptyResponse> {
    let CreateInvoiceRequest {
        tenant_id,
        billing_date,
    } = request.into_inner();
    let billing_date = billing_date.unwrap_or_else(|| Utc::now().date_naive());

    let tenant = state
        .db_pool
        .db_query(move |conn| Tenant::get(conn, &tenant_id))
        .await??;

    create_bill_for_tenant(&state, tenant, billing_date).await?;

    EmptyResponse::ok().json()
}

#[derive(Debug, serde::Deserialize)]
struct CreateInvoicesRequest {
    /// When provided, we'll generate the invoice as if this ran in the billing period containing this date
    billing_date: Option<NaiveDate>,
}

#[actix_web::post("/private/invoices")]
async fn post_all(
    state: web::Data<State>,
    request: Option<web::Json<CreateInvoicesRequest>>,
    _: ProtectedAuth,
) -> JsonApiResponse<EmptyResponse> {
    let tenants = state.db_pool.db_query(Tenant::list_billable).await??;

    // Subtract 8 hours so we always generate the invoice for last month
    let billing_date = request
        .and_then(|b| b.billing_date)
        .unwrap_or((Utc::now() - Duration::hours(8)).date_naive());

    let mut tasks = futures::stream::FuturesUnordered::<
        std::pin::Pin<Box<dyn std::future::Future<Output = ApiResult<()>>>>,
    >::new();
    for t in tenants {
        tasks.push(Box::pin(create_bill_for_tenant(&state, t, billing_date)))
    }
    while tasks.next().await.is_some() {}

    EmptyResponse::ok().json()
}

#[tracing::instrument(skip_all)]
pub async fn get_or_create_customer_id(state: &State, tenant: &Tenant) -> ApiResult<StripeCustomerId> {
    let customer_id = if let Some(customer_id) = tenant.stripe_customer_id.clone() {
        customer_id
    } else {
        // If there's no customer ID for the tenant, create it and save to the row
        let environment = state.config.service_config.environment.clone();
        let customer_id = state
            .billing_client
            .get_or_create_customer(tenant, environment)
            .await?;
        let tenant_id = tenant.id.clone();
        let update = UpdateTenant {
            stripe_customer_id: Some(customer_id.clone()),
            ..Default::default()
        };
        state
            .db_pool
            .db_query(move |conn| Tenant::update(conn, &tenant_id, update))
            .await??;
        customer_id
    };
    Ok(customer_id)
}

#[tracing::instrument(skip_all, fields(tenant_id=%tenant.id, billing_date))]
async fn create_bill_for_tenant(state: &State, tenant: Tenant, billing_date: NaiveDate) -> ApiResult<()> {
    let i = billing::interval::get_billing_interval(billing_date)?;

    // Count the number of billable uses of each product for this tenant
    let t_id = tenant.id.clone();
    let (billing_profile, counts) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let billing_profile = BillingProfile::get(conn, &t_id)?;
            let bp = billing_profile.as_ref();
            // Fetch counts for most products regardless of whether the tenant is set up with
            // billing for them. We will error if any of these products have use when they haven't
            // been contracted
            let pii = ScopedVault::count_billable(conn, &t_id, i.end, ScopedVaultPiiFilters::None)?;
            let kyc = Workflow::get_kyc_kyb_billable_count(conn, &t_id, i.start, i.end, VaultKind::Person)?;
            let kyb = Workflow::get_kyc_kyb_billable_count(conn, &t_id, i.start, i.end, VaultKind::Business)?;
            let id_docs = IdentityDocument::get_billable_count(conn, &t_id, i.start, i.end)?;
            let watchlist_checks = WatchlistCheck::get_billable_count(conn, &t_id, i.start, i.end)?;

            // These billing schemes are only used by some tenants, so only count them conditionally
            let hot_vaults = if bp.is_some_and(|p| p.hot_vaults.is_some()) {
                let p = AccessEventPurpose::iter().collect(); // Any access is billable
                Some(AccessEvent::count_hot_vaults(conn, &t_id, i.start, i.end, p)?)
            } else {
                None
            };
            let hot_proxy_vaults = if bp.is_some_and(|p| p.hot_proxy_vaults.is_some()) {
                let p = vec![AccessEventPurpose::VaultProxy];
                Some(AccessEvent::count_hot_vaults(conn, &t_id, i.start, i.end, p)?)
            } else {
                None
            };
            let vaults_with_non_pci = if bp.is_some_and(|p| p.vaults_with_non_pci.is_some()) {
                let filter = ScopedVaultPiiFilters::NonPci;
                Some(ScopedVault::count_billable(conn, &t_id, i.end, filter)?)
            } else {
                None
            };
            let vaults_with_pci = if bp.is_some_and(|p| p.vaults_with_non_pci.is_some()) {
                let filter = ScopedVaultPiiFilters::PciOrCustom;
                Some(ScopedVault::count_billable(conn, &t_id, i.end, filter)?)
            } else {
                None
            };

            // More modern-style BillingEvents - maybe we'll move some of these discrete events to
            // the BillingEvent model so it becomes easier to count at read time
            let billing_event_counts = BillingEvent::get_counts(conn, &t_id, i.start, i.end)?;

            let counts = BillingCounts {
                pii,
                kyc,
                kyb,
                id_docs,
                watchlist_checks,
                hot_vaults,
                hot_proxy_vaults,
                vaults_with_non_pci,
                vaults_with_pci,
                // Could clean this up once all billing stuff is on BillingEvent
                adverse_media_per_user: billing_event_counts
                    .get(&BillingEventKind::AdverseMediaPerUser)
                    .cloned()
                    .unwrap_or_default(),
                continuous_monitoring_per_year: billing_event_counts
                    .get(&BillingEventKind::ContinuousMonitoringPerYear)
                    .cloned()
                    .unwrap_or_default(),
            };
            Ok((billing_profile, counts))
        })
        .await??;

    // Generate the invoice in stripe
    let customer_id = get_or_create_customer_id(state, &tenant).await?;
    let info = BillingInfo {
        tenant_id: tenant.id.clone(),
        billing_profile,
        interval: i,
        customer_id,
        counts,
    };
    state
        .billing_client
        .generate_draft_invoice(info)
        .await
        .map_err(|err| {
            // Log error since the request only fails with a single tenant's error message
            tracing::error!(?err, tenant_id = %tenant.id, "Couldn't bill tenant");
            err
        })?;
    Ok(())
}
