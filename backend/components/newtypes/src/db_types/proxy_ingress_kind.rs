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
    Display,
    EnumIter,
    EnumString,
};

#[derive(
    Debug,
    Display,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Apiv2Schema,
    Serialize,
    Deserialize,
    Hash,
    Clone,
    Copy,
    AsExpression,
    FromSqlRow,
    EnumIter,
    EnumString,
    AsRefStr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum ProxyIngressContentType {
    Json,
}
crate::util::impl_enum_str_diesel!(ProxyIngressContentType);
