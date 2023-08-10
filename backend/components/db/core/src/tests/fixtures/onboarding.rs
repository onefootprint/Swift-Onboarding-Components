use newtypes::{ObConfigurationId, ScopedVaultId, WorkflowFixtureResult};

use crate::{
    models::{
        insight_event::CreateInsightEvent,
        onboarding::{Onboarding, OnboardingCreateArgs},
        workflow::Workflow,
    },
    TxnPgConn,
};

pub fn create(
    conn: &mut TxnPgConn,
    scoped_vault_id: ScopedVaultId,
    ob_configuration_id: ObConfigurationId,
    fixture_result: Option<WorkflowFixtureResult>,
) -> (Onboarding, Workflow) {
    let ob_args = OnboardingCreateArgs {
        scoped_vault_id,
        ob_configuration_id,
        insight_event: Some(CreateInsightEvent { ..Default::default() }),
    };

    let (ob, wf, _) = Onboarding::get_or_create(conn, ob_args, fixture_result).unwrap();
    (ob, wf)
}
