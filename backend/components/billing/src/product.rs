use strum_macros::{
    Display,
    EnumIter,
};

// NOTE: the order of these products is the order in which the line items are rendered in Stripe
// invoices
#[derive(Debug, Hash, PartialEq, Eq, Clone, Copy, EnumIter, Display, Ord, PartialOrd)]
pub enum Product {
    /// A fixed amount charged monthly
    MonthlyPlatformFee,

    /// Number of KYC verifications ran this month, not including one-click onboardings
    Kyc,
    /// Number of KYC verifications ran this month from one-click onboardings
    OneClickKyc,
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
    /// Number of Complete IdentityDocuments this month. We'll end up charging for users who don't
    /// finish onboarding
    IdDocs,
    /// Number of watchlist checks ran this month
    WatchlistChecks,
    /// Number of CURP verifications ran this month
    CurpVerification,

    /// Total number user vaults with billable PII - either an authorized workflow OR created via
    /// API
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
            Self::MonthlyPlatformFee => "prod_QED8Zrp4vBxKRD",
            Self::HotProxyVaults => "prod_OVScZrizPqwPn7",
            Self::HotVaults => "prod_OVSbMYqHKSm9VT",
            Self::IdDocs => "prod_ON7rDKhCD3yVsw",
            Self::Kyb => "prod_NbtsYZ8CIBKWo2",
            Self::WatchlistChecks => "prod_NbtH04u60RlSWg",
            Self::Kyc => "prod_NPMdLP5c6udoVi",
            Self::OneClickKyc => "prod_QC1i3DEeWac4Xy",
            Self::KycWaterfallSecondVendor => "prod_Q1mwTQQ0xcjBDu",
            Self::KycWaterfallThirdVendor => "prod_Q9b7G9YpzDznfs",
            Self::Pii => "prod_NPMd4yoHoFrHw7",
            Self::VaultsWithNonPci => "prod_OXKFlTuCOGcCvW",
            Self::VaultsWithPci => "prod_OXKHHjVIuWL7OV",
            Self::AdverseMediaPerOnboarding => "prod_P6nOzVVredzvo1",
            Self::ContinuousMonitoringPerYear => "prod_P6nPpoj4yjL3tj",
            Self::CurpVerification => "prod_QE6roGU9hUeA6m",
        }
    }

    pub fn uncontracted_description(&self) -> &'static str {
        match self {
            Self::MonthlyPlatformFee => "Uncontracted MonthlyPlatformFee",
            Self::HotProxyVaults => "Uncontracted HotProxyVaults",
            Self::HotVaults => "Uncontracted HotVaults",
            Self::IdDocs => "Uncontracted IdDocs",
            Self::Kyb => "Uncontracted Kyb",
            Self::WatchlistChecks => "Uncontracted WatchlistChecks",
            Self::Kyc => "Uncontracted Kyc",
            Self::OneClickKyc => "Uncontracted OneClickKyc",
            Self::KycWaterfallSecondVendor => "Uncontracted KycWaterfallSecondVendor",
            Self::KycWaterfallThirdVendor => "Uncontracted KycWaterfallThirdVendor",
            Self::Pii => "Uncontracted Pii",
            Self::VaultsWithNonPci => "Uncontracted VaultsWithNonPci",
            Self::VaultsWithPci => "Uncontracted VaultsWithPci",
            Self::AdverseMediaPerOnboarding => "Uncontracted AdverseMediaPerOnboarding",
            Self::ContinuousMonitoringPerYear => "Uncontracted ContinuousMonitoringPerYear",
            Self::CurpVerification => "Uncontracted CurpVerification",
        }
    }

    /// Only some products count towards the per-tenant monthly minimum on identity spend.
    /// Generally, vaulting and auth products do not count toward the monthly minimum.
    pub fn applies_to_monthly_minimum(&self) -> bool {
        match self {
            Self::IdDocs
            | Self::Kyb
            | Self::WatchlistChecks
            | Self::Kyc
            | Self::OneClickKyc
            | Self::KycWaterfallSecondVendor
            | Self::KycWaterfallThirdVendor
            | Self::AdverseMediaPerOnboarding
            | Self::ContinuousMonitoringPerYear
            | Self::CurpVerification => true,
            Self::MonthlyPlatformFee
            | Self::HotProxyVaults
            | Self::HotVaults
            | Self::Pii
            | Self::VaultsWithNonPci
            | Self::VaultsWithPci => false,
        }
    }
}
