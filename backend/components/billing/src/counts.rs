use std::str::FromStr;

use crate::{profile::BillingProfile, BResult};
use stripe::PriceId;

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
    pub(crate) price_id: PriceId,
    pub(crate) count: i64,
    pub(crate) is_uncontracted: bool,
}

const PII_UNCONTRACTED_PRICE: &str = "price_1NkF5kGerPBo41PtfIaoIhXN";
const KYC_UNCONTRACTED_PRICE: &str = "price_1NkF5NGerPBo41PtviDJIY8K";
const KYB_UNCONTRACTED_PRICE: &str = "price_1NkF4LGerPBo41PtnOXu0Zx2";
const ID_DOC_UNCONTRACTED_PRICE: &str = "price_1NkF3zGerPBo41PtnyBrvOU1";
const WATCHLIST_UNCONTRACTED_PRICE: &str = "price_1NkF4sGerPBo41Ptb21nKXbp";
const HOT_VAULTS_UNCONTRACTED_PRICE: &str = "price_1NkF3eGerPBo41Ptv5wHuJFY";
const HOT_PROXY_UNCONTRACTED_PRICE: &str = "price_1NkF3HGerPBo41Pt8FI5ii7q";
const NON_PCI_UNCONTRACTED_PRICE: &str = "price_1NkFbHGerPBo41PtUNBe5Zlx";
const PCI_UNCONTRACTED_PRICE: &str = "price_1NkFcaGerPBo41Ptx8aKzHeS";

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

    pub(crate) fn line_items(&self, prices: BillingProfile) -> BResult<Vec<LineItem>> {
        // Decompose to fail compiling when new count is added
        let &BillingCounts {
            pii,
            kyc,
            kyb,
            id_docs,
            watchlist_checks,
            hot_vaults,
            hot_proxy_vaults,
            vaults_with_non_pci,
            vaults_with_pci,
        } = self;

        let results = vec![
            (prices.pii, PriceId::from_str(PII_UNCONTRACTED_PRICE)?, Some(pii)),
            (prices.kyc, PriceId::from_str(KYC_UNCONTRACTED_PRICE)?, Some(kyc)),
            (prices.kyb, PriceId::from_str(KYB_UNCONTRACTED_PRICE)?, Some(kyb)),
            (
                prices.id_docs,
                PriceId::from_str(ID_DOC_UNCONTRACTED_PRICE)?,
                Some(id_docs),
            ),
            (
                prices.watchlist,
                PriceId::from_str(WATCHLIST_UNCONTRACTED_PRICE)?,
                Some(watchlist_checks),
            ),
            (
                prices.hot_vaults,
                PriceId::from_str(HOT_VAULTS_UNCONTRACTED_PRICE)?,
                hot_vaults,
            ),
            (
                prices.hot_proxy_vaults,
                PriceId::from_str(HOT_PROXY_UNCONTRACTED_PRICE)?,
                hot_proxy_vaults,
            ),
            (
                prices.vaults_with_non_pci,
                PriceId::from_str(NON_PCI_UNCONTRACTED_PRICE)?,
                vaults_with_non_pci,
            ),
            (
                prices.vaults_with_pci,
                PriceId::from_str(PCI_UNCONTRACTED_PRICE)?,
                vaults_with_pci,
            ),
        ]
        .into_iter()
        .filter_map(|(p, u, count)| count.map(|c| (p, u, c)))
        .filter(|(_, _, count)| count > &0)
        .map(|(price_id, uncontracted_price_id, count)| {
            let (price_id, is_uncontracted) = if let Some(price_id) = price_id {
                (price_id, false)
            } else {
                // If there is no price set up for this tenant but they have used the product,
                // error by adding a line item to the invoice that shows the uncontracted price
                (uncontracted_price_id, true)
            };
            LineItem {
                price_id,
                count,
                is_uncontracted,
            }
        })
        .collect();
        Ok(results)
    }
}
