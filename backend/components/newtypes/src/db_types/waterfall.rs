use diesel::sql_types::Text;
use diesel::{
    AsExpression,
    FromSqlRow,
};
use macros::SerdeAttr;
use paperclip::actix::Apiv2Schema;
use serde_with::{
    DeserializeFromStr,
    SerializeDisplay,
};
use strum_macros::{
    AsRefStr,
    Display,
    EnumString,
};

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    DeserializeFromStr,
    SerializeDisplay,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    PartialEq,
    Eq,
    SerdeAttr,
    PartialOrd,
    Ord,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum WaterfallStepAction {
    Pass,
    IdFlagged,
    RuleTriggered,
    VendorError,
}
crate::util::impl_enum_str_diesel!(WaterfallStepAction);

#[cfg(test)]
mod tests {
    use super::*;
    use std::cmp::Ordering;
    use test_case::test_case;
    #[test_case(WaterfallStepAction::Pass, WaterfallStepAction::IdFlagged => Ordering::Less)]
    #[test_case(WaterfallStepAction::IdFlagged, WaterfallStepAction::RuleTriggered => Ordering::Less)]
    #[test_case(WaterfallStepAction::RuleTriggered, WaterfallStepAction::VendorError => Ordering::Less)]
    fn test_cmp_waterfall_reason(s1: WaterfallStepAction, s2: WaterfallStepAction) -> Ordering {
        s1.cmp(&s2)
    }
}
