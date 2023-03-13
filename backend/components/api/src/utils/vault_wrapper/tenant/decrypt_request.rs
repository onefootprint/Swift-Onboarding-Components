use crate::errors::ApiResult;
use crate::State;
use db::models::access_event::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use newtypes::{AccessEventKind, DataIdentifier, DbActor, ScopedVaultId};

pub struct DecryptRequest {
    pub reason: String,
    pub principal: DbActor,
    pub insight: CreateInsightEvent,
}

impl DecryptRequest {
    pub(super) async fn create_access_event(
        self,
        state: &State,
        scoped_user_id: ScopedVaultId,
        targets: Vec<DataIdentifier>,
    ) -> ApiResult<()> {
        let DecryptRequest {
            reason,
            principal,
            insight,
        } = self;
        let event = NewAccessEvent {
            scoped_user_id,
            reason: Some(reason),
            principal,
            insight,
            kind: AccessEventKind::Decrypt,
            targets,
        };
        state.db_pool.db_query(|conn| event.create(conn)).await??;
        Ok(())
    }
}
