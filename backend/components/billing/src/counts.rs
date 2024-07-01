use crate::interval::BillingInterval;
use crate::product::Product;
use crate::profile::BillingProfile;
use crate::profile::PriceInfo;
use crate::BResult;
use crate::Error;
use db::models::access_event::AccessEvent;
use db::models::billing_event::BillingEvent;
use db::models::billing_profile::BillingProfile as DbBillingProfile;
use db::models::scoped_vault::ScopedVault;
use db::models::scoped_vault::ScopedVaultPiiFilters;
use db::models::watchlist_check::WatchlistCheck;
use db::DbResult;
use db::PgConn;
use itertools::chain;
use newtypes::AccessEventPurpose;
use newtypes::TenantId;
use rust_decimal_macros::dec;
use std::collections::HashMap;
use std::ops::Add;
use strum::IntoEnumIterator;

#[derive(Debug, Default)]
pub struct BillingCounts(HashMap<Product, i64>);

#[derive(Debug)]
pub(crate) struct LineItem {
    pub product: Product,
    pub price: LineItemPrice,
    pub count: i64,
}

#[derive(Debug, derive_more::From)]
pub enum LineItemPrice {
    Price(PriceInfo),
    Uncontracted,
}

impl BillingCounts {
    fn get_count(&self, product: Product) -> i64 {
        self.0.get(&product).cloned().unwrap_or_default()
    }

    fn raw_line_items(&self) -> Vec<(Product, i64)> {
        Product::iter().map(|p| (p, self.get_count(p))).collect()
    }

    pub(crate) fn line_items(&self, profile: &BillingProfile) -> BResult<Vec<LineItem>> {
        let tenant_has = |p: Product| profile.get(p).is_some();
        if tenant_has(Product::ContinuousMonitoringPerYear) && tenant_has(Product::WatchlistChecks) {
            return Err(Error::ValidationError(
                "Tenant can't have both WatchlistChecks and ContinuousMonitoringPerYear".into(),
            ));
        }

        let results = self
            .raw_line_items()
            .into_iter()
            .filter(|(p, _)| match p {
                Product::MonthlyPlatformFee => tenant_has(Product::MonthlyPlatformFee),
                // This is weird - there are two different products for effecitvely the same thing:
                // watchlist checks billed per instance vs billed per user per year.
                // If the tenant has pricing set up for one of those products, don't bill for the
                // other. We assert that a tenant can't have both prices.
                Product::WatchlistChecks => !tenant_has(Product::ContinuousMonitoringPerYear),
                Product::ContinuousMonitoringPerYear => !tenant_has(Product::WatchlistChecks),
                _ => true,
            })
            .filter(|(_, count)| count > &0)
            // Filter out line items that have a price of 0c explicitly in the billing profile
            .filter(|(product, _)| !profile.get(*product).is_some_and(|p| p.price_cents == dec!(0)))
            .map(|(product, count)| -> BResult<_> {
                let price = if let Some(price) = profile.get(product) {
                    // If the BillingProfile for this tenant has a price set for the product, use it
                    price.clone().into()
                } else {
                    // If there is no price set up for this tenant but they have used the product,
                    // error by adding a line item to the invoice that shows the uncontracted price.
                    // These require manual human action, but we don't want to prevent invoice generation
                    tracing::error!(tenant_id=%profile.tenant_id, product=%product, "Billing line item is uncontracted");
                    LineItemPrice::Uncontracted
                };
                Ok(LineItem { product, price, count })
            })
            .collect::<BResult<Vec<_>>>()?;

        Ok(results)
    }

    pub fn build_for_tenant(
        conn: &mut PgConn,
        t_id: &TenantId,
        bp: Option<&DbBillingProfile>,
        i: &BillingInterval,
    ) -> DbResult<Self> {
        // Fetch counts for most products regardless of whether the tenant is set up with
        // billing for them. We will error if any of these products have use when they haven't
        // been contracted
        let pii = ScopedVault::count_billable(conn, t_id, i.end, ScopedVaultPiiFilters::None)?;
        let watchlist_checks = WatchlistCheck::get_billable_count(conn, t_id, i.start, i.end)?;

        // These billing schemes are only used by some tenants, so only count them conditionally
        let hot_vaults = if bp.is_some_and(|p| p.hot_vaults.is_some()) {
            let p = AccessEventPurpose::iter().collect(); // Any access is billable
            Some(AccessEvent::count_hot_vaults(conn, t_id, i.start, i.end, p)?)
        } else {
            None
        };
        let hot_proxy_vaults = if bp.is_some_and(|p| p.hot_proxy_vaults.is_some()) {
            let p = vec![AccessEventPurpose::VaultProxy];
            Some(AccessEvent::count_hot_vaults(conn, t_id, i.start, i.end, p)?)
        } else {
            None
        };
        let vaults_with_non_pci = if bp.is_some_and(|p| p.vaults_with_non_pci.is_some()) {
            let filter = ScopedVaultPiiFilters::NonPci;
            Some(ScopedVault::count_billable(conn, t_id, i.end, filter)?)
        } else {
            None
        };
        let vaults_with_pci = if bp.is_some_and(|p| p.vaults_with_non_pci.is_some()) {
            let filter = ScopedVaultPiiFilters::PciOrCustom;
            Some(ScopedVault::count_billable(conn, t_id, i.end, filter)?)
        } else {
            None
        };

        // More modern-style BillingEvents - maybe we'll move some of these discrete events to
        // the BillingEvent model so it becomes easier to count at read time
        let billing_event_counts = BillingEvent::get_counts(conn, t_id, i.start, i.end)?;

        let counts = chain!(
            vec![
                (Product::Pii, pii),
                (Product::WatchlistChecks, watchlist_checks),
                (Product::HotVaults, hot_vaults.unwrap_or_default()),
                (Product::HotProxyVaults, hot_proxy_vaults.unwrap_or_default()),
                (Product::VaultsWithNonPci, vaults_with_non_pci.unwrap_or_default()),
                (Product::VaultsWithPci, vaults_with_pci.unwrap_or_default()),
            ],
            billing_event_counts.into_iter().map(|(k, c)| (k.into(), c)),
        )
        .collect();
        Ok(Self(counts))
    }
}

impl Add for BillingCounts {
    type Output = BillingCounts;

    fn add(self, b: BillingCounts) -> BillingCounts {
        let a = self;
        let counts = Product::iter()
            .map(|p| (p, a.get_count(p) + b.get_count(p)))
            .collect();
        BillingCounts(counts)
    }
}
