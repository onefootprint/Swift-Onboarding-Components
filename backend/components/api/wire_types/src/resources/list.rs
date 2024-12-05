use crate::*;
use newtypes::DbActor;
use newtypes::ListAlias;
use newtypes::ListEntryId;
use newtypes::ListId;
use newtypes::ListKind;
use newtypes::ObConfigurationId;
use newtypes::PiiString;

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct List {
    pub id: ListId,
    pub name: String,
    pub alias: ListAlias,
    pub kind: ListKind,
    pub created_at: DateTime<Utc>,
    pub actor: DbActor,
    pub entries_count: usize,
    pub used_in_playbook: bool,
}

#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]
pub struct ListDetails {
    pub id: ListId,
    pub name: String,
    pub alias: ListAlias,
    pub kind: ListKind,
    pub created_at: DateTime<Utc>,
    pub actor: DbActor,
    pub playbooks: Vec<ListPlaybookUsage>,
}
#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct ListEntry {
    pub id: ListEntryId,
    pub data: PiiString,
    pub created_at: DateTime<Utc>,
    pub actor: DbActor,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct ListPlaybookUsage {
    pub id: ObConfigurationId,
    pub name: String,
    pub rules: Vec<Rule>,
}
