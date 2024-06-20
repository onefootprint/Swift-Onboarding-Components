use derive_more::Display;
use diesel::sql_types::Text;
use diesel::AsExpression;
use diesel::FromSqlRow;
use strum_macros::AsRefStr;
use strum_macros::EnumString;

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    AsExpression,
    FromSqlRow,
    EnumString,
    AsRefStr,
    macros::SerdeAttr,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[diesel(sql_type = Text)]
pub enum MiddeskRequestState {
    PendingCreateBusinessCall,
    AwaitingBusinessUpdateWebhook,
    AwaitingTinRetry,
    PendingGetBusinessCall,
    Complete,
}

crate::util::impl_enum_str_diesel!(MiddeskRequestState);
