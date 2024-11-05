use crate::utils::db2api::DbToApi;
use db::models::ob_configuration::ObConfiguration;
use db::models::rule_set_result::RuleSetResult;
use db::models::workflow::Workflow;
use itertools::Itertools;
use newtypes::DataLifetimeSeqno;

impl
    DbToApi<(
        Workflow,
        ObConfiguration,
        Vec<RuleSetResult>,
        Option<DataLifetimeSeqno>,
    )> for api_wire_types::EntityOnboarding
{
    fn from_db(
        (wf, obc, rsrs, seqno): (
            Workflow,
            ObConfiguration,
            Vec<RuleSetResult>,
            Option<DataLifetimeSeqno>,
        ),
    ) -> Self {
        let Workflow {
            created_at,
            status,
            id,
            ..
        } = wf;
        let ObConfiguration { key, .. } = obc;
        let rule_set_results = rsrs
            .iter()
            .map(|rsr| api_wire_types::EntityOnboardingRuleSetResult {
                id: rsr.id.clone(),
                timestamp: rsr.created_at,
            })
            .collect_vec();

        Self {
            id,
            playbook_key: key,
            status,
            rule_set_results,
            seqno,
            timestamp: created_at,
        }
    }
}
