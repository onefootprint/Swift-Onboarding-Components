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
    sv_id: ScopedVaultId,
    obc_id: ObConfigurationId,
    fixture_result: Option<WorkflowFixtureResult>,
) -> Workflow {
    let args = OnboardingWorkflowArgs {
        scoped_vault_id: sv_id,
        ob_configuration_id: obc_id,
        authorized: false,
        insight_event: Some(CreateInsightEvent { ..Default::default() }),
        source: WorkflowSource::Hosted,
    };
    let (wf, _) = Workflow::get_or_create_onboarding(conn, args, fixture_result, false).unwrap();
    wf
}
