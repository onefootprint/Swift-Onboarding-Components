use diesel::sql_types::Text;
use diesel::{
    AsExpression,
    FromSqlRow,
};
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use serde::{
    Deserialize,
    Serialize,
};
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
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
    Deserialize,
    Serialize,
    AsRefStr,
    Apiv2Schema,
    AsJsonb,
)]
#[strum(serialize_all = "snake_case")]
#[serde(rename_all = "snake_case")]
#[serde(tag = "kind", content = "data")]
pub enum WatchlistCheckStatus {
    Pending, // have not completed vendors calls or decisioning yet
    Pass,    // no watchlist hit
    Fail,    // yes watchlist hit
    Error(WatchlistCheckError), /* check could not be performed (eg: a non-portable vault has
              * insufficient or malformed data the vendor errors on) */
    NotNeeded(WatchlistCheckNotNeededReason), /* we do not need to perform the watchlist check for the
                                               * user at the time the task is run (currently this would
                                               * be because they are offboarded) */
}

// couldnt get EnumDiscriminants to work with the diesel attributes ¯\_(ツ)_/¯
#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
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
pub enum WatchlistCheckStatusKind {
    Pending,
    Pass,
    Fail,
    Error,
    NotNeeded,
}

impl From<WatchlistCheckStatus> for WatchlistCheckStatusKind {
    fn from(value: WatchlistCheckStatus) -> Self {
        match value {
            WatchlistCheckStatus::Pending => Self::Pending,
            WatchlistCheckStatus::Pass => Self::Pass,
            WatchlistCheckStatus::Fail => Self::Fail,
            WatchlistCheckStatus::Error(_) => Self::Error,
            WatchlistCheckStatus::NotNeeded(_) => Self::NotNeeded,
        }
    }
}

crate::util::impl_enum_str_diesel!(WatchlistCheckStatusKind);

impl Default for WatchlistCheckStatusKind {
    fn default() -> Self {
        Self::Pending
    }
}

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
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
pub enum WatchlistCheckError {
    RequiredDataNotPresent,
}

crate::util::impl_enum_str_diesel!(WatchlistCheckError);

#[derive(
    Debug,
    Display,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Ord,
    PartialOrd,
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
pub enum WatchlistCheckNotNeededReason {
    VaultOffboarded,
    VaultNotLive,
}

crate::util::impl_enum_str_diesel!(WatchlistCheckNotNeededReason);
