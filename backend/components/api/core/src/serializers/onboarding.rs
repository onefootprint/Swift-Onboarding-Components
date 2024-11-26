use crate::utils::db2api::DbToApi;
use db::models::playbook::Playbook;
use db::models::workflow::Workflow;

impl DbToApi<(Workflow, Playbook)> for api_wire_types::PublicOnboarding {
    fn from_db((wf, playbook): (Workflow, Playbook)) -> Self {
        let Workflow {
            created_at, status, ..
        } = wf;
        let Playbook { key, .. } = playbook;
        Self {
            status,
            playbook_key: key,
            timestamp: created_at,
        }
    }
}
