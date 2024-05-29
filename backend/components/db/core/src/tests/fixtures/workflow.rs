use crate::models::insight_event::CreateInsightEvent;
use crate::models::workflow::{
    OnboardingWorkflowArgs,
    Workflow,
};
use crate::TxnPgConn;
use newtypes::{
    ObConfigurationId,
    ScopedVaultId,
    WorkflowFixtureResult,
    WorkflowSource,
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
        is_neuro_enabled: false,
    };
    let (wf, _) = Workflow::get_or_create_onboarding(conn, args, true).unwrap();
    wf
}
