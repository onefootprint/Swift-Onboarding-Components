use crate::utils::db2api::DbToApi;
use db::models::ob_configuration::ObConfiguration;
use db::models::playbook::Playbook;
use db::models::rule_set_result::RuleSetResult;
use db::models::workflow::Workflow;
use itertools::Itertools;
use newtypes::DataLifetimeSeqno;

impl
    DbToApi<(
        Workflow,
        Playbook,
        ObConfiguration,
        Vec<RuleSetResult>,
        Option<DataLifetimeSeqno>,
    )> for api_wire_types::EntityOnboarding
{
    fn from_db(
        (wf, playbook, obc, rsrs, seqno): (
            Workflow,
            Playbook,
            ObConfiguration,
            Vec<RuleSetResult>,
            Option<DataLifetimeSeqno>,
        ),
    ) -> Self {
        let Workflow {
            created_at,
            status,
            id,
            kind,
            ..
        } = wf;
        let Playbook { key, .. } = playbook;
        let ObConfiguration { name, .. } = obc;
        let rule_set_results = rsrs
            .iter()
            .map(|rsr| api_wire_types::EntityOnboardingRuleSetResult {
                id: rsr.id.clone(),
                timestamp: rsr.created_at,
            })
            .collect_vec();

        Self {
            id,
            playbook_name: name,
            playbook_key: key,
            kind,
            status,
            rule_set_results,
            seqno,
            timestamp: created_at,
        }
    }
}
