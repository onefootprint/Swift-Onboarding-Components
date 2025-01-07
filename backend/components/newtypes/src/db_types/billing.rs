use crate::util::impl_enum_string_diesel;
use chrono::Duration;
use chrono::NaiveDate;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use diesel_as_jsonb::AsJsonb;
use serde::Deserialize;
use serde::Serialize;
use serde_with::DeserializeFromStr;
use serde_with::SerializeDisplay;
use std::collections::HashMap;
use strum_macros::Display;
use strum_macros::EnumIter;
use strum_macros::EnumString;

#[derive(Debug, Display, Eq, PartialEq, Hash, Clone, Copy, EnumString, AsExpression, FromSqlRow)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum BillingEventKind {
    /// TODO: charge again for events 1y after
    ContinuousMonitoringPerYear,
    AdverseMediaPerYear,
    AdverseMediaPerUser,
    CurpValidation,
    Kyc,
    OneClickKyc,
    KycWaterfallSecondVendor,
    KycWaterfallThirdVendor,
    IdentityDocument,
    Kyb,
    KybEinOnly,
    SambaActivityHistory,
    NeuroIdBehavioral,
    SentilinkScore,
}

impl BillingEventKind {
    pub fn billing_strategy(&self) -> BillingStrategy {
        match self {
            Self::ContinuousMonitoringPerYear => BillingStrategy::PerInterval(Duration::days(365)),
            Self::AdverseMediaPerYear => BillingStrategy::PerInterval(Duration::days(365)),
            Self::AdverseMediaPerUser => BillingStrategy::PerUser,
            Self::CurpValidation => BillingStrategy::Each,
            Self::Kyc => BillingStrategy::Each,
            Self::OneClickKyc => BillingStrategy::Each,
            Self::KycWaterfallSecondVendor => BillingStrategy::Each,
            Self::KycWaterfallThirdVendor => BillingStrategy::Each,
            Self::IdentityDocument => BillingStrategy::Each,
            Self::Kyb => BillingStrategy::Each,
            Self::KybEinOnly => BillingStrategy::Each,
            Self::SambaActivityHistory => BillingStrategy::Each,
            Self::NeuroIdBehavioral => BillingStrategy::Each,
            Self::SentilinkScore => BillingStrategy::Each,
        }
    }
}

pub enum BillingStrategy {
    /// Bill every time an event is created
    Each,
    /// Bill for this product once per user
    PerUser,
    /// Bill for this product once per user in the defined interval
    PerInterval(Duration),
}

impl_enum_string_diesel!(BillingEventKind);

// NOTE: the order of these products is the order in which the line items are rendered in Stripe
// invoices
#[derive(
    Debug,
    Hash,
    PartialEq,
    Eq,
    Clone,
    Copy,
    EnumIter,
    Display,
    EnumString,
    Ord,
    PartialOrd,
    DeserializeFromStr,
    SerializeDisplay,
)]
#[strum(serialize_all = "snake_case")]
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
    /// Instead of watchlist_checks, billing for incode continuos monitoring. We bill on a per year
    /// basis, but run the checks monthly
    ContinuousMonitoringPerYear,
    /// Instead of watchlist_checks, billing for incode continuos monitoring with adverse media. We
    /// bill on a per year basis, but run the checks monthly.
    AdverseMediaPerYear,
    /// Number of completed workflows onto playbooks that include adverse media checks.
    /// This is only for customers on a legacy billing plan that billed one-time for adverse media
    /// checks even though we're continuously running adverse media checks.
    AdverseMediaPerOnboarding,
    /// Number of KYB verifications ran this month
    Kyb,
    /// KYB run only on EIN
    KybEinOnly,
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
    /// Number of Samba activity history requests this month
    SambaActivityHistory,
    /// Sentilink Synthetic and ID Theft Scores
    SentilinkScore,
    /// Neuro ID Behavioral and Device Intelligence
    NeuroIdBehavioral,
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
            Self::KybEinOnly => "prod_QNTiOIxS3o60RG",
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
            Self::AdverseMediaPerYear => "prod_QS2lZZRG3QuzT8",
            Self::CurpVerification => "prod_QE6roGU9hUeA6m",
            Self::SambaActivityHistory => "prod_RAVutLy5GihkDE",
            Self::SentilinkScore => "prod_RAsaWO48Zgbu6F",
            Self::NeuroIdBehavioral => "prod_RAsb9TecOnqi4w",
        }
    }

    pub fn uncontracted_description(&self) -> &'static str {
        match self {
            Self::MonthlyPlatformFee => "Uncontracted MonthlyPlatformFee",
            Self::HotProxyVaults => "Uncontracted HotProxyVaults",
            Self::HotVaults => "Uncontracted HotVaults",
            Self::IdDocs => "Uncontracted IdDocs",
            Self::Kyb => "Uncontracted Kyb",
            Self::KybEinOnly => "Uncontracted Kyb EIN only",
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
            Self::AdverseMediaPerYear => "Uncontracted ContinuousMonitoringWithAdverseMediaPerYear",
            Self::CurpVerification => "Uncontracted CurpVerification",
            Self::SambaActivityHistory => "Uncontracted SambaActivityHistory",
            Self::SentilinkScore => "Uncontracted SentilinkScore",
            Self::NeuroIdBehavioral => "Uncontracted NeuroIDBehavioral",
        }
    }

    /// Only some products count towards the per-tenant monthly minimum on identity spend.
    /// Generally, vaulting and auth products do not count toward the monthly minimum.
    pub fn applies_to_monthly_minimum(&self) -> bool {
        // TODO:
        match self {
            Self::IdDocs
            | Self::Kyb
            | Self::KybEinOnly
            | Self::WatchlistChecks
            | Self::Kyc
            | Self::OneClickKyc
            | Self::KycWaterfallSecondVendor
            | Self::KycWaterfallThirdVendor
            | Self::AdverseMediaPerOnboarding
            | Self::ContinuousMonitoringPerYear
            | Self::AdverseMediaPerYear
            | Self::SambaActivityHistory
            | Self::SentilinkScore
            | Self::NeuroIdBehavioral
            | Self::CurpVerification => true,
            Self::MonthlyPlatformFee
            | Self::HotProxyVaults
            | Self::HotVaults
            | Self::Pii
            | Self::VaultsWithNonPci
            | Self::VaultsWithPci => false,
        }
    }

    /// Groups the product into one of the predefined revenue categories. These catgegories are used
    /// to generate monthly revenue reports in stripe sigms
    pub fn revenue_category(&self) -> RevenueCategory {
        match self {
            Self::IdDocs
            | Self::Kyb
            | Self::KybEinOnly
            | Self::WatchlistChecks
            | Self::Kyc
            | Self::OneClickKyc
            | Self::KycWaterfallSecondVendor
            | Self::KycWaterfallThirdVendor
            | Self::AdverseMediaPerOnboarding
            | Self::ContinuousMonitoringPerYear
            | Self::AdverseMediaPerYear
            | Self::CurpVerification
            | Self::SambaActivityHistory
            | Self::SentilinkScore
            | Self::NeuroIdBehavioral => RevenueCategory::Identity,
            Self::HotProxyVaults
            | Self::HotVaults
            | Self::Pii
            | Self::VaultsWithNonPci
            | Self::VaultsWithPci => RevenueCategory::Security,
            Self::MonthlyPlatformFee => RevenueCategory::PlatformFee,
        }
    }
}

#[derive(Display, Clone, Copy, PartialEq, Eq)]
#[strum(serialize_all = "snake_case")]
pub enum RevenueCategory {
    Identity,
    Security,
    PlatformFee,
}

impl From<BillingEventKind> for Product {
    fn from(value: BillingEventKind) -> Self {
        // If you've come here after adding a new BillingEventKind, you'll need to:
        // - Add a variant to the Product enum
        // - Create a new product in the stripe dashboard
        // - Add the product to billing-profile.tsx on the dashboard
        // The rust compiler will guide you through all but the dashboard changes
        match value {
            BillingEventKind::ContinuousMonitoringPerYear => Product::ContinuousMonitoringPerYear,
            BillingEventKind::AdverseMediaPerYear => Product::AdverseMediaPerYear,
            BillingEventKind::AdverseMediaPerUser => Product::AdverseMediaPerOnboarding,
            BillingEventKind::CurpValidation => Product::CurpVerification,
            BillingEventKind::Kyc => Product::Kyc,
            BillingEventKind::OneClickKyc => Product::OneClickKyc,
            BillingEventKind::KycWaterfallSecondVendor => Product::KycWaterfallSecondVendor,
            BillingEventKind::KycWaterfallThirdVendor => Product::KycWaterfallThirdVendor,
            BillingEventKind::IdentityDocument => Product::IdDocs,
            BillingEventKind::Kyb => Product::Kyb,
            BillingEventKind::KybEinOnly => Product::KybEinOnly,
            BillingEventKind::SambaActivityHistory => Product::SambaActivityHistory,
            BillingEventKind::NeuroIdBehavioral => Product::NeuroIdBehavioral,
            BillingEventKind::SentilinkScore => Product::SentilinkScore,
        }
    }
}

#[derive(
    Debug, Clone, AsJsonb, serde::Serialize, serde::Deserialize, derive_more::Deref, derive_more::DerefMut,
)]
#[serde(transparent)]
/// Mapping of Product -> price in cents
pub struct PriceMap(HashMap<Product, String>);

impl From<PriceMap> for HashMap<Product, String> {
    fn from(value: PriceMap) -> Self {
        value.0
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, AsJsonb)]
pub struct BillingMinimum {
    /// The set of products that apply towards this minimum
    pub products: Vec<Product>,
    /// The required minumum monthly spend, in cents
    pub amount_cents: rust_decimal::Decimal,
    /// The human-readable name that displays on the invoice line item
    pub name: String,
    /// The date on which the minimum starts applying
    pub starts_on: Option<NaiveDate>,
}
