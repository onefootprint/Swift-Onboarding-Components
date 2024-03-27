use crate::utils::db2api::DbToApi;
use db::models::{list::List, list_entry::ListEntry};
use newtypes::PiiString;

pub type ListInfo = (List, bool, usize);

impl DbToApi<ListInfo> for api_wire_types::List {
    fn from_db((list, used_in_playbook, entries_count): ListInfo) -> Self {
        let List {
            id,
            created_at,
            actor,
            name,
            alias,
            kind,
            ..
        } = list;

        Self {
            id,
            name,
            alias,
            kind,
            created_at,
            actor,
            entries_count,
            used_in_playbook,
        }
    }
}

impl DbToApi<(ListEntry, PiiString)> for api_wire_types::ListEntry {
    fn from_db((list_entry, data): (ListEntry, PiiString)) -> Self {
        let ListEntry {
            id,
            created_at,
            actor,
            ..
        } = list_entry;

        Self {
            id,
            data,
            created_at,
            actor,
        }
    }
}
