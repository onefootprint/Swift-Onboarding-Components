use std::str::FromStr;

use stripe::PriceId;

use crate::BResult;
use strum_macros::{Display, EnumIter};

#[derive(Debug, Hash, PartialEq, Eq, Clone, Copy, EnumIter, Display, Ord, PartialOrd)]
pub enum Product {
    /// Number of KYC verifications ran this month
    Kyc,
    /// Number of KYC verifications that contacted a second vendor in waterfall
    KycWaterfallSecondVendor,
    /// Number of KYC verifications that contacted a third vendor in waterfall
    KycWaterfallThirdVendor,
    /// Number of completed workflows onto playbooks that include adverse media checks.
    /// Adverse media checks are billing per onboarding even though we run them monthly???
    AdverseMediaPerOnboarding,
    /// Instead of watchlist_checks, billing for incode continuos monitoring. We bill on a per year
    /// basis, but run the checks monthly
    ContinuousMonitoringPerYear,
    /// Number of KYB verifications ran this month
    Kyb,
    /// Number of Complete IdentityDocuments this month. We'll end up charging for users who don't finish onboarding
    IdDocs,
    /// Number of watchlist checks ran this month
    WatchlistChecks,
    /// Total number user vaults with billable PII - either an authorized workflow OR created via API
    Pii,
    /// Number of vaults with non-card and non-custom data
    VaultsWithNonPci,
    /// Number of vaults with card or custom data
    VaultsWithPci,
    /// Number of vaults with proxy decrypts this month
    HotProxyVaults,
    /// Number of vaults with decrypts this month
    HotVaults,
}

impl Product {
    /// The ProductId of the product in stripe's dashboard
    pub fn product_id(&self) -> &'static str {
        match self {
            Self::HotProxyVaults => "prod_OVScZrizPqwPn7",
            Self::HotVaults => "prod_OVSbMYqHKSm9VT",
            Self::IdDocs => "prod_ON7rDKhCD3yVsw",
            Self::Kyb => "prod_NbtsYZ8CIBKWo2",
            Self::WatchlistChecks => "prod_NbtH04u60RlSWg",
            Self::Kyc => "prod_NPMdLP5c6udoVi",
            Self::KycWaterfallSecondVendor => "prod_Q1mwTQQ0xcjBDu",
            Self::KycWaterfallThirdVendor => "prod_Q9b7G9YpzDznfs",
            Self::Pii => "prod_NPMd4yoHoFrHw7",
            Self::VaultsWithNonPci => "prod_OXKFlTuCOGcCvW",
            Self::VaultsWithPci => "prod_OXKHHjVIuWL7OV",
            Self::AdverseMediaPerOnboarding => "prod_P6nOzVVredzvo1",
            Self::ContinuousMonitoringPerYear => "prod_P6nPpoj4yjL3tj",
        }
    }

    /// Every product has a special price called the "uncontracted" price that we use to create
    /// line items when a tenant hasn't been contracted to use a product but we count that they
    /// have already used it.
    pub fn uncontracted_price_id(&self) -> BResult<PriceId> {
        let price_id = match self {
            Self::Pii => "price_1NkF5kGerPBo41PtfIaoIhXN",
            Self::Kyc => "price_1NkF5NGerPBo41PtviDJIY8K",
            Self::KycWaterfallSecondVendor => "price_1PJHuvGerPBo41PtDjwSRWvJ",
            Self::KycWaterfallThirdVendor => "price_1PJHwLGerPBo41Ptc4G3h022",
            Self::Kyb => "price_1NkLQ1GerPBo41PtKbvpKKCg",
            Self::IdDocs => "price_1NkF3zGerPBo41PtnyBrvOU1",
            Self::WatchlistChecks => "price_1NkF4sGerPBo41Ptb21nKXbp",
            Self::HotVaults => "price_1NkF3eGerPBo41Ptv5wHuJFY",
            Self::HotProxyVaults => "price_1NkF3HGerPBo41Pt8FI5ii7q",
            Self::VaultsWithNonPci => "price_1NkFbHGerPBo41PtUNBe5Zlx",
            Self::VaultsWithPci => "price_1NkFcaGerPBo41Ptx8aKzHeS",
            Self::AdverseMediaPerOnboarding => "price_1OIZnRGerPBo41Pt2hz8DkKf",
            Self::ContinuousMonitoringPerYear => "price_1OIZoPGerPBo41PtautRHeYl",
        };
        let result = PriceId::from_str(price_id)?;
        Ok(result)
    }
}
