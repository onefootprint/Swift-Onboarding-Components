use crate::utils::db2api::DbToApi;
use api_wire_types::ListPlaybookUsage;
use db::models::list::List;
use db::models::list_entry::ListEntry;
use db::models::ob_configuration::ObConfiguration;
use db::models::rule_instance::RuleInstance;
use newtypes::PiiString;

impl DbToApi<(List, usize, bool)> for api_wire_types::List {
    fn from_db((list, entries_count, used_in_playbook): (List, usize, bool)) -> Self {
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

pub type ListInfo = (List, Vec<(ObConfiguration, Vec<RuleInstance>)>);

impl DbToApi<ListInfo> for api_wire_types::ListDetails {
    fn from_db((list, playbook_and_rules): ListInfo) -> Self {
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
                // We can probably remove this field.
                #[allow(deprecated)]
                key: obc.key,
                name: obc.name,
                rules: rules.into_iter().map(api_wire_types::Rule::from_db).collect(),
            })
            .collect();

        Self {
            id,
            name,
            alias,
            kind,
            created_at,
            actor,
            playbooks,
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
