use newtypes::{ObConfigurationId, ScopedVaultId, WorkflowFixtureResult, WorkflowSource};

use crate::{
    models::{
        insight_event::CreateInsightEvent,
        workflow::{OnboardingWorkflowArgs, Workflow},
    },
    TxnPgConn,
};

pub fn create(
    conn: &mut TxnPgConn,
    sv_id: &ScopedVaultId,
    obc_id: &ObConfigurationId,
    fixture_result: Option<WorkflowFixtureResult>,
) -> Workflow {
    let args = OnboardingWorkflowArgs {
        scoped_vault_id: sv_id.clone(),
        ob_configuration_id: obc_id.clone(),
        authorized: false,
        insight_event: Some(CreateInsightEvent { ..Default::default() }),
        source: WorkflowSource::Hosted,
        fixture_result,
        is_one_click: false,
        wfr: None,
    };
    let (wf, _) = Workflow::get_or_create_onboarding(conn, args, false).unwrap();
    wf
}
