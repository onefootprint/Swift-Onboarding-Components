use crate::triggers::TriggerRequestOutcome;
use crate::State;
use api_core::task::execute_webhook_tasks;
use api_core::FpResult;
use api_wire_types::EntityActionResponse;

mod decision;
pub mod post;


#[derive(derive_more::From)]
enum EntityActionPostCommit {
    Trigger(TriggerRequestOutcome),
    FireWebhooks,
}

impl EntityActionPostCommit {
    fn apply(self, state: &State) -> FpResult<Option<EntityActionResponse>> {
        match self {
            EntityActionPostCommit::Trigger(t) => t.post_commit(state),
            EntityActionPostCommit::FireWebhooks => {
                execute_webhook_tasks(state.clone());
                Ok(None)
            }
        }
    }
}
