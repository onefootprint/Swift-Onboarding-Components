use crate::product::Product;
use crate::profile::{
    BillingProfile,
    PriceInfo,
};
use crate::{
    BResult,
    Error,
};
use strum::IntoEnumIterator;

#[derive(Debug)]
pub struct BillingCounts {
    /// Total number user vaults with billable PII - either an authorized workflow OR created via
    /// API
    pub pii: i64,
    /// Number of KYC verifications ran this month
    pub kyc: i64,
    pub kyc_waterfall_second_vendor: Option<i64>,
    pub kyc_waterfall_third_vendor: Option<i64>,
    /// Number of KYB verifications ran this month
    pub kyb: i64,
    /// Number of Complete IdentityDocuments this month. We'll end up charging for users who don't
    /// finish onboarding
    pub id_docs: i64,
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
    pub adverse_media_per_user: i64,
    /// Instead of watchlist_checks, billing for incode continuos monitoring. We bill on a per year
    /// basis, but run the checks monthly
    pub continuous_monitoring_per_year: i64,
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
            kyc_waterfall_second_vendor,
            kyc_waterfall_third_vendor,
            kyb,
            watchlist_checks,
            id_docs,
            hot_vaults,
            hot_proxy_vaults,
            vaults_with_non_pci,
            vaults_with_pci,
            adverse_media_per_user,
            continuous_monitoring_per_year,
        } = self;
        pii + kyc
            + kyc_waterfall_second_vendor.unwrap_or_default()
            + kyc_waterfall_third_vendor.unwrap_or_default()
            + kyb
            + id_docs
            + watchlist_checks
            + hot_vaults.unwrap_or_default()
            + hot_proxy_vaults.unwrap_or_default()
            + vaults_with_non_pci.unwrap_or_default()
            + vaults_with_pci.unwrap_or_default()
            + adverse_media_per_user
            + continuous_monitoring_per_year
            == 0
    }

    fn get_count(&self, product: Product) -> Option<i64> {
        match product {
            Product::Pii => Some(self.pii),
            Product::Kyc => Some(self.kyc),
            Product::KycWaterfallSecondVendor => self.kyc_waterfall_second_vendor,
            Product::KycWaterfallThirdVendor => self.kyc_waterfall_third_vendor,
            Product::Kyb => Some(self.kyb),
            Product::IdDocs => Some(self.id_docs),
            Product::WatchlistChecks => Some(self.watchlist_checks),
            // These optional counts won't cause uncontracted price errors
            Product::HotVaults => self.hot_vaults,
            Product::HotProxyVaults => self.hot_proxy_vaults,
            Product::VaultsWithNonPci => self.vaults_with_non_pci,
            Product::VaultsWithPci => self.vaults_with_pci,
            Product::AdverseMediaPerOnboarding => Some(self.adverse_media_per_user),
            Product::ContinuousMonitoringPerYear => Some(self.continuous_monitoring_per_year),
        }
    }

    pub(crate) fn line_items(&self, profile: &BillingProfile) -> BResult<Vec<LineItem>> {
        let tenant_has_watchlist_product = profile.get(Product::WatchlistChecks).is_some();
        let tenant_has_cm_product = profile.get(Product::ContinuousMonitoringPerYear).is_some();
        if tenant_has_watchlist_product && tenant_has_cm_product {
            return Err(Error::ValidationError(
                "Tenant can't have both WatchlistChecks and ContinuousMonitoringPerYear".into(),
            ));
        }

        let results = Product::iter()
            .filter(|p| match p {
                // This is weird - there are two different products for effecitvely the same thing:
                // watchlist checks billed per instance vs billed per user per year.
                // If the tenant has pricing set up for one of those products, don't bill for the
                // other. We assert that a tenant can't have both prices.
                Product::WatchlistChecks => !tenant_has_cm_product,
                Product::ContinuousMonitoringPerYear => !tenant_has_watchlist_product,
                _ => true,
            })
            .map(|product| (product, self.get_count(product)))
            .filter_map(|(p, count)| count.map(|c| (p, c)))
            .filter(|(_, count)| count > &0)
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
}
