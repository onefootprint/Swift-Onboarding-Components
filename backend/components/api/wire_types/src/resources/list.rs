use crate::*;
use newtypes::{DbActor, ListAlias, ListId, ListKind};

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct List {
    pub id: ListId,
    pub name: String,
    pub alias: ListAlias,
    pub kind: ListKind,
    pub created_at: DateTime<Utc>,
    pub actor: DbActor,
}
