use crate::utils::db2api::DbToApi;
use api_wire_types::ListPlaybookUsage;
use db::models::{
    list::List, list_entry::ListEntry, ob_configuration::ObConfiguration, rule_instance::RuleInstance,
};
use newtypes::PiiString;

pub type ListInfo = (List, Vec<(ObConfiguration, Vec<RuleInstance>)>, usize);

impl DbToApi<ListInfo> for api_wire_types::List {
    fn from_db((list, playbook_and_rules, entries_count): ListInfo) -> Self {
        let List {
            id,
            created_at,
            actor,
            name,
            alias,
            kind,
            ..
        } = list;

        let playbooks: Vec<_> = playbook_and_rules
            .into_iter()
            .map(|(obc, rules)| ListPlaybookUsage {
                id: obc.id,
                key: obc.key,
                rules: rules.into_iter().map(api_wire_types::Rule::from_db).collect(),
            })
            .collect();
        let used_in_playbook = !playbooks.is_empty();

        Self {
            id,
            name,
            alias,
            kind,
            created_at,
            actor,
            entries_count,
            playbooks,
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
