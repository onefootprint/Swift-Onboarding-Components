use crate::interval::BillingInterval;
use crate::product::Product;
use crate::profile::{
    BillingProfile,
    PriceInfo,
};
use crate::{
    BResult,
    Error,
};
use db::models::access_event::AccessEvent;
use db::models::billing_event::BillingEvent;
use db::models::billing_profile::BillingProfile as DbBillingProfile;
use db::models::document::Document;
use db::models::scoped_vault::{
    ScopedVault,
    ScopedVaultPiiFilters,
};
use db::models::watchlist_check::WatchlistCheck;
use db::models::workflow::Workflow;
use db::{
    DbResult,
    PgConn,
};
use newtypes::{
    AccessEventPurpose,
    BillingEventKind,
    TenantId,
    VaultKind,
};
use rust_decimal_macros::dec;
use std::ops::Add;
use strum::IntoEnumIterator;

#[derive(Debug, Default)]
pub struct BillingCounts {
    /// Total number user vaults with billable PII - either an authorized workflow OR created via
    /// API
    pub pii: i64,
    /// Number of KYC verifications ran this month, not including one-click onboardings
    pub kyc: i64,
    /// Number of KYC verifications ran from one-click onboardings
    pub one_click_kyc: Option<i64>,
    pub kyc_waterfall_second_vendor: Option<i64>,
    pub kyc_waterfall_third_vendor: Option<i64>,
    /// Number of KYB verifications ran this month
    pub kyb: i64,
    /// Number of Complete IdentityDocuments this month. We'll end up charging for users who don't
    /// finish onboarding
    pub id_docs: i64,
    /// Number of watchlist checks ran this month
    pub curp_verifications: Option<i64>,
    /// Number of watchlist checks ran this month
    pub watchlist_checks: i64,
    /// Number of vaults with decrypts this month
    pub hot_vaults: Option<i64>,
    /// Number of vaults with proxy decrypts this month
    pub hot_proxy_vaults: Option<i64>,
    /// Number of vaults with non-card and non-custom data
    pub vaults_with_non_pci: Option<i64>,
    /// Number of vaults with card or custom data
    pub vaults_with_pci: Option<i64>,
    /// Number of completed workflows onto playbooks that include adverse media checks.
    /// Adverse media checks are billing per onboarding even though we run them monthly???
    pub adverse_media_per_user: Option<i64>,
    /// Instead of watchlist_checks, billing for incode continuos monitoring. We bill on a per year
    /// basis, but run the checks monthly
    pub continuous_monitoring_per_year: Option<i64>,
}

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
    pub(crate) fn is_zero(&self) -> bool {
        // Decompose to fail compiling when new count is added
        let &BillingCounts {
            pii,
            kyc,
            one_click_kyc,
            kyc_waterfall_second_vendor,
            kyc_waterfall_third_vendor,
            kyb,
            watchlist_checks,
            id_docs,
            curp_verifications,
            hot_vaults,
            hot_proxy_vaults,
            vaults_with_non_pci,
            vaults_with_pci,
            adverse_media_per_user,
            continuous_monitoring_per_year,
        } = self;
        pii + kyc
            + one_click_kyc.unwrap_or_default()
            + kyc_waterfall_second_vendor.unwrap_or_default()
            + kyc_waterfall_third_vendor.unwrap_or_default()
            + curp_verifications.unwrap_or_default()
            + kyb
            + id_docs
            + watchlist_checks
            + hot_vaults.unwrap_or_default()
            + hot_proxy_vaults.unwrap_or_default()
            + vaults_with_non_pci.unwrap_or_default()
            + vaults_with_pci.unwrap_or_default()
            + adverse_media_per_user.unwrap_or_default()
            + continuous_monitoring_per_year.unwrap_or_default()
            == 0
    }

    fn get_count(&self, product: Product) -> Option<i64> {
        match product {
            Product::MonthlyPlatformFee => Some(1), // Always quantity one
            Product::Pii => Some(self.pii),
            Product::Kyc => Some(self.kyc),
            Product::OneClickKyc => self.one_click_kyc,
            Product::KycWaterfallSecondVendor => self.kyc_waterfall_second_vendor,
            Product::KycWaterfallThirdVendor => self.kyc_waterfall_third_vendor,
            Product::Kyb => Some(self.kyb),
            Product::IdDocs => Some(self.id_docs),
            Product::CurpVerification => self.curp_verifications,
            Product::WatchlistChecks => Some(self.watchlist_checks),
            Product::HotVaults => self.hot_vaults,
            Product::HotProxyVaults => self.hot_proxy_vaults,
            Product::VaultsWithNonPci => self.vaults_with_non_pci,
            Product::VaultsWithPci => self.vaults_with_pci,
            Product::AdverseMediaPerOnboarding => self.adverse_media_per_user,
            Product::ContinuousMonitoringPerYear => self.continuous_monitoring_per_year,
        }
    }

    pub(crate) fn line_items(&self, profile: &BillingProfile) -> BResult<Vec<LineItem>> {
        let tenant_has = |p: Product| profile.get(p).is_some();
        if tenant_has(Product::ContinuousMonitoringPerYear) && tenant_has(Product::WatchlistChecks) {
            return Err(Error::ValidationError(
                "Tenant can't have both WatchlistChecks and ContinuousMonitoringPerYear".into(),
            ));
        }

        let results = Product::iter()
            .filter(|p| match p {
                Product::MonthlyPlatformFee => tenant_has(Product::MonthlyPlatformFee),
                // This is weird - there are two different products for effecitvely the same thing:
                // watchlist checks billed per instance vs billed per user per year.
                // If the tenant has pricing set up for one of those products, don't bill for the
                // other. We assert that a tenant can't have both prices.
                Product::WatchlistChecks => !tenant_has(Product::ContinuousMonitoringPerYear),
                Product::ContinuousMonitoringPerYear => !tenant_has(Product::WatchlistChecks),
                _ => true,
            })
            .map(|product| (product, self.get_count(product)))
            .filter_map(|(p, count)| count.map(|c| (p, c)))
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
        let kyc = Workflow::get_kyc_kyb_billable_count(conn, t_id, i.start, i.end, VaultKind::Person)?;
        let kyb = Workflow::get_kyc_kyb_billable_count(conn, t_id, i.start, i.end, VaultKind::Business)?;
        let id_docs = Document::get_billable_count(conn, t_id, i.start, i.end)?;
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

        let counts = BillingCounts {
            pii,
            kyc,
            one_click_kyc: billing_event_counts.get(&BillingEventKind::OneClickKyc).cloned(),
            kyc_waterfall_second_vendor: billing_event_counts
                .get(&BillingEventKind::KycWaterfallSecondVendor)
                .cloned(),
            kyc_waterfall_third_vendor: billing_event_counts
                .get(&BillingEventKind::KycWaterfallThirdVendor)
                .cloned(),
            kyb,
            id_docs,
            curp_verifications: billing_event_counts
                .get(&BillingEventKind::CurpValidation)
                .cloned(),
            watchlist_checks,
            hot_vaults,
            hot_proxy_vaults,
            vaults_with_non_pci,
            vaults_with_pci,
            // Could clean this up once all billing stuff is on BillingEvent
            adverse_media_per_user: billing_event_counts
                .get(&BillingEventKind::AdverseMediaPerUser)
                .cloned(),
            continuous_monitoring_per_year: billing_event_counts
                .get(&BillingEventKind::ContinuousMonitoringPerYear)
                .cloned(),
        };
        Ok(counts)
    }
}


impl Add for BillingCounts {
    type Output = BillingCounts;

    fn add(self, b: BillingCounts) -> BillingCounts {
        let add_opt = |a, b| match (a, b) {
            (Some(a), Some(b)) => Some(a + b),
            (Some(i), None) | (None, Some(i)) => Some(i),
            (None, None) => None,
        };
        let a = self;
        BillingCounts {
            pii: a.pii + b.pii,
            kyc: a.kyc + b.kyc,
            one_click_kyc: add_opt(a.one_click_kyc, b.one_click_kyc),
            kyc_waterfall_second_vendor: add_opt(
                a.kyc_waterfall_second_vendor,
                b.kyc_waterfall_second_vendor,
            ),
            kyc_waterfall_third_vendor: add_opt(a.kyc_waterfall_third_vendor, b.kyc_waterfall_third_vendor),
            kyb: a.kyb + b.kyb,
            id_docs: a.id_docs + b.id_docs,
            curp_verifications: add_opt(a.curp_verifications, b.curp_verifications),
            watchlist_checks: a.watchlist_checks + b.watchlist_checks,
            hot_vaults: add_opt(a.hot_vaults, b.hot_vaults),
            hot_proxy_vaults: add_opt(a.hot_proxy_vaults, b.hot_proxy_vaults),
            vaults_with_non_pci: add_opt(a.vaults_with_non_pci, b.vaults_with_non_pci),
            vaults_with_pci: add_opt(a.vaults_with_pci, b.vaults_with_pci),
            adverse_media_per_user: add_opt(a.adverse_media_per_user, b.adverse_media_per_user),
            continuous_monitoring_per_year: add_opt(
                a.continuous_monitoring_per_year,
                b.continuous_monitoring_per_year,
            ),
        }
    }
}
