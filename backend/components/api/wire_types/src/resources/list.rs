use crate::*;
use newtypes::{
    DbActor, ListAlias, ListEntryId, ListId, ListKind, ObConfigurationId, ObConfigurationKey, PiiString,
};

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct List {
    pub id: ListId,
    pub name: String,
    pub alias: ListAlias,
    pub kind: ListKind,
    pub created_at: DateTime<Utc>,
    pub actor: DbActor,
    pub playbooks: Vec<ListPlaybookUsage>,
    pub entries_count: usize,
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
    pub key: ObConfigurationKey,
    pub name: String,
    pub rules: Vec<Rule>,
}
