use crate::State;
use api_core::task::poll_and_execute_tasks_non_blocking;
use api_core::FpResult;
use api_wire_types::EntityActionResponse;
use db::models::task::TaskPollArgs;
use triggers::TriggerRequestOutcome;

mod decision;
pub mod post;
mod triggers;
mod validation;


#[derive(derive_more::From)]
enum EntityActionPostCommit {
    Trigger(TriggerRequestOutcome),
    ExecuteTasks(TaskPollArgs),
}

impl EntityActionPostCommit {
    async fn apply(self, state: &State) -> FpResult<Option<EntityActionResponse>> {
        match self {
            EntityActionPostCommit::Trigger(t) => t.post_commit(state),
            EntityActionPostCommit::ExecuteTasks(args) => {
                poll_and_execute_tasks_non_blocking(state.clone(), args);
                Ok(None)
            }
        }
    }
}
