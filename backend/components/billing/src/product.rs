use std::str::FromStr;

use stripe::PriceId;

use crate::BResult;
use strum_macros::EnumIter;

#[derive(Debug, Hash, PartialEq, Eq, Clone, Copy, EnumIter)]
pub enum Product {
    /// Total number user vaults with billable PII - either an authorized workflow OR created via API
    Pii,
    /// Number of KYC verifications ran this month
    Kyc,
    /// Number of KYB verifications ran this month
    Kyb,
    /// Number of Complete IdentityDocuments this month. We'll end up charging for users who don't finish onboarding
    IdDocs,
    /// Number of watchlist checks ran this month
    WatchlistChecks,
    /// Number of vaults with decrypts this month
    HotVaults,
    /// Number of vaults with proxy decrypts this month
    HotProxyVaults,
    /// Number of vaults with non-card and non-custom data
    VaultsWithNonPci,
    /// Number of vaults with card or custom data
    VaultsWithPci,
}

impl Product {
    /// The ProductId of the product in stripe's dashboard
    pub fn product_id(&self) -> &'static str {
        // TODO this doesn't have dev products
        match self {
            Self::HotProxyVaults => "prod_OVScZrizPqwPn7",
            Self::HotVaults => "prod_OVSbMYqHKSm9VT",
            Self::IdDocs => "prod_ON7rDKhCD3yVsw",
            Self::Kyb => "prod_NbtsYZ8CIBKWo2",
            Self::WatchlistChecks => "prod_NbtH04u60RlSWg",
            Self::Kyc => "prod_NPMdLP5c6udoVi",
            Self::Pii => "prod_NPMd4yoHoFrHw7",
            Self::VaultsWithNonPci => "prod_OXKFlTuCOGcCvW",
            Self::VaultsWithPci => "prod_OXKHHjVIuWL7OV",
        }
    }

    /// Every product has a special price called the "uncontracted" price that we use to create
    /// line items when a tenant hasn't been contracted to use a product but we count that they
    /// have already used it.
    pub fn uncontracted_price_id(&self) -> BResult<PriceId> {
        let price_id = match self {
            Self::Pii => "price_1NkF5kGerPBo41PtfIaoIhXN",
            Self::Kyc => "price_1NkF5NGerPBo41PtviDJIY8K",
            Self::Kyb => "price_1NkF4LGerPBo41PtnOXu0Zx2",
            Self::IdDocs => "price_1NkF3zGerPBo41PtnyBrvOU1",
            Self::WatchlistChecks => "price_1NkF4sGerPBo41Ptb21nKXbp",
            Self::HotVaults => "price_1NkF3eGerPBo41Ptv5wHuJFY",
            Self::HotProxyVaults => "price_1NkF3HGerPBo41Pt8FI5ii7q",
            Self::VaultsWithNonPci => "price_1NkFbHGerPBo41PtUNBe5Zlx",
            Self::VaultsWithPci => "price_1NkFcaGerPBo41Ptx8aKzHeS",
        };
        let result = PriceId::from_str(price_id)?;
        Ok(result)
    }
}
