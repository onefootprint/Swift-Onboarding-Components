use crate::util::impl_enum_str_diesel;
use diesel::sql_types::Text;
use diesel::{
    AsExpression,
    FromSqlRow,
};
use paperclip::actix::Apiv2Schema;
use serde_json;
use serde_with::{
    DeserializeFromStr,
    SerializeDisplay,
};
use strum::AsRefStr;
use strum_macros::{
    Display,
    EnumString,
};

#[derive(
    Display,
    SerializeDisplay,
    DeserializeFromStr,
    Debug,
    Clone,
    Copy,
    Eq,
    Default,
    PartialEq,
    Apiv2Schema,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum LabelKind {
    #[default]
    /// User is active and in good standing
    Active,
    /// User was offboarded due to fraud
    OffboardFraud,
    /// User was offboarded (not for fraud)
    OffboardOther,
}

impl_enum_str_diesel!(LabelKind);
