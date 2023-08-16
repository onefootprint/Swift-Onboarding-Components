use newtypes::{ObConfigurationId, ScopedVaultId, WorkflowFixtureResult};

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
        insight_event: Some(CreateInsightEvent { ..Default::default() }),
    };
    let (wf, _) = Workflow::get_or_create_onboarding(conn, args, fixture_result).unwrap();
    wf
}
