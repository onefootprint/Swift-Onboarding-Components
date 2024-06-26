use crate::util::impl_enum_string_diesel;
use chrono::Duration;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use strum_macros::Display;
use strum_macros::EnumString;

#[derive(Debug, Display, Eq, PartialEq, Hash, Clone, Copy, EnumString, AsExpression, FromSqlRow)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum BillingEventKind {
    /// TODO: charge again for events 1y after
    ContinuousMonitoringPerYear,
    AdverseMediaPerUser,
    CurpValidation,
    Kyc,
    OneClickKyc,
    KycWaterfallSecondVendor,
    KycWaterfallThirdVendor,
    IdentityDocument,
    Kyb,
}

impl BillingEventKind {
    pub fn billing_strategy(&self) -> BillingStrategy {
        match self {
            Self::ContinuousMonitoringPerYear => BillingStrategy::PerInterval(Duration::days(365)),
            Self::AdverseMediaPerUser => BillingStrategy::PerUser,
            Self::CurpValidation => BillingStrategy::Each,
            Self::Kyc => BillingStrategy::Each,
            Self::OneClickKyc => BillingStrategy::Each,
            Self::KycWaterfallSecondVendor => BillingStrategy::Each,
            Self::KycWaterfallThirdVendor => BillingStrategy::Each,
            Self::IdentityDocument => BillingStrategy::Each,
            Self::Kyb => BillingStrategy::Each,
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
