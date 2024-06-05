use crate::utils::db2api::DbToApi;
use db::models::ob_configuration::ObConfiguration;
use db::models::workflow::Workflow;

impl DbToApi<(Workflow, ObConfiguration)> for api_wire_types::PublicOnboarding {
    fn from_db((wf, obc): (Workflow, ObConfiguration)) -> Self {
        let Workflow {
            created_at, status, ..
        } = wf;
        let ObConfiguration { key, .. } = obc;
        Self {
            status,
            playbook_key: key,
            timestamp: created_at,
        }
    }
}
