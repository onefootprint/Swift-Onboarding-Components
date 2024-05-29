use crate::*;
use newtypes::input::deserialize_stringified_list;
use newtypes::DbUserTimelineEventKind;

#[derive(Debug, Clone, Eq, PartialEq, Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub struct ListTimelineRequest {
    #[serde(default)]
    #[serde(deserialize_with = "deserialize_stringified_list")]
    pub kinds: Vec<DbUserTimelineEventKind>,
}
