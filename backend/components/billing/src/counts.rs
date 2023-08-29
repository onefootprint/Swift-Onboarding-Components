use crate::{product::Product, profile::BillingProfile, BResult};
use stripe::PriceId;
use strum::IntoEnumIterator;

#[derive(Debug)]
pub struct BillingCounts {
    /// Total number user vaults with billable PII - either an authorized workflow OR created via API
    pub pii: i64,
    /// Number of KYC verifications ran this month
    pub kyc: i64,
    /// Number of KYB verifications ran this month
    pub kyb: i64,
    /// Number of Complete IdentityDocuments this month. We'll end up charging for users who don't finish onboarding
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
}

#[derive(Debug)]
pub(crate) struct LineItem {
    pub product: Product,
    pub price_id: PriceId,
    pub count: i64,
    pub is_uncontracted: bool,
}

impl BillingCounts {
    pub(crate) fn is_zero(&self) -> bool {
        // Decompose to fail compiling when new count is added
        let &BillingCounts {
            pii,
            kyc,
            kyb,
            watchlist_checks,
            id_docs,
            hot_vaults,
            hot_proxy_vaults,
            vaults_with_non_pci,
            vaults_with_pci,
        } = self;
        pii + kyc
            + kyb
            + id_docs
            + watchlist_checks
            + hot_vaults.unwrap_or_default()
            + hot_proxy_vaults.unwrap_or_default()
            + vaults_with_non_pci.unwrap_or_default()
            + vaults_with_pci.unwrap_or_default()
            == 0
    }

    fn get_count(&self, product: Product) -> Option<i64> {
        match product {
            Product::Pii => Some(self.pii),
            Product::Kyc => Some(self.kyc),
            Product::Kyb => Some(self.kyb),
            Product::IdDocs => Some(self.id_docs),
            Product::WatchlistChecks => Some(self.watchlist_checks),
            Product::HotVaults => self.hot_vaults,
            Product::HotProxyVaults => self.hot_proxy_vaults,
            Product::VaultsWithNonPci => self.vaults_with_non_pci,
            Product::VaultsWithPci => self.vaults_with_pci,
        }
    }

    pub(crate) fn line_items(&self, prices: BillingProfile) -> BResult<Vec<LineItem>> {
        let results = Product::iter()
            .map(|product| (product, self.get_count(product)))
            .filter_map(|(p, count)| count.map(|c| (p, c)))
            .filter(|(_, count)| count > &0)
            .map(|(product, count)| -> BResult<_> {
                let (price_id, is_uncontracted) = if let Some(price_id) = prices.get(product) {
                    // If the BillingProfile for this tenant has a price set for the product, us it
                    (price_id, false)
                } else {
                    // If there is no price set up for this tenant but they have used the product,
                    // error by adding a line item to the invoice that shows the uncontracted price
                    (product.uncontracted_price_id()?, true)
                };
                Ok(LineItem {
                    product,
                    price_id,
                    count,
                    is_uncontracted,
                })
            })
            .collect::<BResult<_>>()?;
        Ok(results)
    }
}
