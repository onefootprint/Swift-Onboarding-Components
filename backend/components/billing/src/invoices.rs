use crate::interval::get_billing_interval;
use crate::{
    BResult,
    BillingClient,
    BillingCounts,
    BillingInfo,
};
use chrono::NaiveDate;
use db::models::access_event::AccessEvent;
use db::models::billing_event::BillingEvent;
use db::models::billing_profile::BillingProfile;
use db::models::document::Document;
use db::models::scoped_vault::{
    ScopedVault,
    ScopedVaultPiiFilters,
};
use db::models::tenant::{
    Tenant,
    UpdateTenant,
};
use db::models::watchlist_check::WatchlistCheck;
use db::models::workflow::Workflow;
use db::{
    DbError,
    DbPool,
};
use newtypes::{
    AccessEventPurpose,
    BillingEventKind,
    StripeCustomerId,
    VaultKind,
};
use strum::IntoEnumIterator;

#[tracing::instrument(skip_all, fields(tenant_id=%tenant.id, billing_date))]
pub async fn create_bill_for_tenant(
    client: &BillingClient,
    db_pool: &DbPool,
    tenant: Tenant,
    billing_date: NaiveDate,
) -> BResult<()> {
    let i = get_billing_interval(billing_date)?;

    // Count the number of billable uses of each product for this tenant
    let t_id = tenant.id.clone();
    let (billing_profile, counts) = db_pool
        .db_query(move |conn| -> Result<_, DbError> {
            let billing_profile = BillingProfile::get(conn, &t_id)?;
            let bp = billing_profile.as_ref();
            // Fetch counts for most products regardless of whether the tenant is set up with
            // billing for them. We will error if any of these products have use when they haven't
            // been contracted
            let pii = ScopedVault::count_billable(conn, &t_id, i.end, ScopedVaultPiiFilters::None)?;
            let kyc = Workflow::get_kyc_kyb_billable_count(conn, &t_id, i.start, i.end, VaultKind::Person)?;
            let kyb = Workflow::get_kyc_kyb_billable_count(conn, &t_id, i.start, i.end, VaultKind::Business)?;
            let id_docs = Document::get_billable_count(conn, &t_id, i.start, i.end)?;
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
                kyc_waterfall_second_vendor: billing_event_counts
                    .get(&BillingEventKind::KycWaterfallSecondVendor)
                    .cloned(),
                kyc_waterfall_third_vendor: billing_event_counts
                    .get(&BillingEventKind::KycWaterfallThirdVendor)
                    .cloned(),
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
        .await?;

    // Generate the invoice in stripe
    let customer_id = get_or_create_customer_id(client, db_pool, &tenant).await?;
    let info = BillingInfo {
        tenant_id: tenant.id.clone(),
        billing_profile,
        interval: i,
        customer_id,
        counts,
    };
    client.generate_draft_invoice(info).await.map_err(|err| {
        // Log error since the request only fails with a single tenant's error message
        tracing::error!(?err, tenant_id = %tenant.id, "Couldn't bill tenant");
        err
    })?;
    Ok(())
}

#[tracing::instrument(skip_all)]
async fn get_or_create_customer_id(
    client: &BillingClient,
    db_pool: &DbPool,
    tenant: &Tenant,
) -> BResult<StripeCustomerId> {
    let customer_id = if let Some(customer_id) = tenant.stripe_customer_id.clone() {
        customer_id
    } else {
        // If there's no customer ID for the tenant, create it and save to the row
        let customer_id = client.get_or_create_customer(tenant).await?;
        let tenant_id = tenant.id.clone();
        let update = UpdateTenant {
            stripe_customer_id: Some(customer_id.clone()),
            ..Default::default()
        };
        db_pool
            .db_query(move |conn| Tenant::update(conn, &tenant_id, update))
            .await?;
        customer_id
    };
    Ok(customer_id)
}
