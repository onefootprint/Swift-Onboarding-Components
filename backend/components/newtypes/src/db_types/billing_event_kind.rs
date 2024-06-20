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
    /// Returns the Duration representing the billing frequency of this event.
    /// We will only create a BillingEvent once per interval for the product.
    /// None if the event is billed once per user.
    pub fn billing_interval(&self) -> Option<Duration> {
        match self {
            Self::ContinuousMonitoringPerYear => Some(Duration::days(365)),
            Self::AdverseMediaPerUser => None,
            Self::CurpValidation => None,
            Self::Kyc => None,
            Self::OneClickKyc => None,
            Self::KycWaterfallSecondVendor => None,
            Self::KycWaterfallThirdVendor => None,
            Self::IdentityDocument => None,
            Self::Kyb => None,
        }
    }
}

impl_enum_string_diesel!(BillingEventKind);
