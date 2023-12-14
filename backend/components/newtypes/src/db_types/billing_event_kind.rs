use crate::util::impl_enum_string_diesel;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use strum_macros::{Display, EnumString};

#[derive(Debug, Display, Eq, PartialEq, Hash, Clone, Copy, EnumString, AsExpression, FromSqlRow)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum BillingEventKind {
    /// TODO: charge again for events 1y after
    ContinuousMonitoringPerYear,
    AdverseMediaPerUser,
}

impl_enum_string_diesel!(BillingEventKind);
