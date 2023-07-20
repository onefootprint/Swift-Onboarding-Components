pub use derive_more::Display;
use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use strum_macros::{AsRefStr, EnumString};

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Deserialize,
    Serialize,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    Apiv2Schema,
    JsonSchema,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum DecisionStatus {
    // The ordering of this enum matters
    Fail,
    Pass,
    StepUp,
}

crate::util::impl_enum_str_diesel!(DecisionStatus);

#[cfg(test)]
mod tests {
    use test_case::test_case;

    use super::DecisionStatus;
    use std::cmp::Ordering;

    #[test_case(DecisionStatus::Fail, DecisionStatus::Pass => Ordering::Less)]
    #[test_case(DecisionStatus::Pass, DecisionStatus::StepUp => Ordering::Less)]
    fn test_cmp_decision_status(s1: DecisionStatus, s2: DecisionStatus) -> Ordering {
        // Test ordering since we rely on it to extract minimum status
        s1.cmp(&s2)
    }
}
