use derive_more::Display;
use diesel::sql_types::Text;
use diesel::{
    AsExpression,
    FromSqlRow,
};
use paperclip::actix::Apiv2Schema;
use serde::{
    Deserialize,
    Serialize,
};
use strum_macros::{
    AsRefStr,
    EnumString,
};

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
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum DecisionStatus {
    // The ordering of this enum matters
    Fail,
    StepUp,
    Pass,
}

crate::util::impl_enum_str_diesel!(DecisionStatus);

#[cfg(test)]
mod tests {
    use super::DecisionStatus;
    use std::cmp::Ordering;
    use test_case::test_case;

    #[test_case(DecisionStatus::Fail, DecisionStatus::Pass => Ordering::Less)]
    #[test_case(DecisionStatus::StepUp, DecisionStatus::Pass => Ordering::Less)]
    fn test_cmp_decision_status(s1: DecisionStatus, s2: DecisionStatus) -> Ordering {
        // Test ordering since we rely on it to extract minimum status
        s1.cmp(&s2)
    }
}
