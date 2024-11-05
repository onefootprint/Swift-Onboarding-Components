use crate::util::impl_enum_str_diesel;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use paperclip::actix::Apiv2Schema;
use serde_with::DeserializeFromStr;
use serde_with::SerializeDisplay;
use strum::AsRefStr;
use strum_macros::Display;
use strum_macros::EnumString;

#[derive(
    Display,
    SerializeDisplay,
    DeserializeFromStr,
    Debug,
    Clone,
    Copy,
    Eq,
    PartialEq,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    Hash,
    Apiv2Schema,
)]
#[strum(serialize_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum RiskSignalGroupKind {
    Kyc,
    Kyb,
    Doc,
    WebDevice,
    NativeDevice,
    Aml,
    Behavior,
    Phone,
    Synthetic,
}

impl_enum_str_diesel!(RiskSignalGroupKind);
