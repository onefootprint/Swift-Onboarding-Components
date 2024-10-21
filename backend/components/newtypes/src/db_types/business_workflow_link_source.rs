use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use paperclip::actix::Apiv2Schema;
use serde_with::DeserializeFromStr;
use serde_with::SerializeDisplay;
use strum::Display;
use strum_macros::AsRefStr;
use strum_macros::EnumString;

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Eq,
    PartialEq,
    DeserializeFromStr,
    SerializeDisplay,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    Apiv2Schema,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum BusinessWorkflowLinkSource {
    /// The user workflow was created for this business workflow in bifrost.
    Hosted,
    /// The user workflow already existed from a previous onboarding and is being reused while the
    /// business is redoing KYB.
    Reuse,
}

crate::util::impl_enum_str_diesel!(BusinessWorkflowLinkSource);
