use crate::task::ExecuteTask;
use crate::State;
use api_errors::FpResult;
use async_trait::async_trait;
use newtypes::FireWebhookArgs;
use webhooks::events::WebhookEvent;

#[derive(derive_more::Constructor)]
pub(crate) struct FireWebhookTask {
    state: State,
}

#[async_trait]
impl ExecuteTask<FireWebhookArgs> for FireWebhookTask {
    async fn execute(self, args: FireWebhookArgs) -> FpResult<()> {
        let Self { state } = self;
        let FireWebhookArgs {
            scoped_vault_id: _,
            webhook_event,
            tenant_id: t_id,
            is_live,
        } = args;
        let event = WebhookEvent::from(webhook_event.clone());
        state
            .webhook_client
            .send_event_to_tenant(&state.db_pool, &t_id, is_live, event, None)
            .await?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use db::tests::fixtures;
    use db::tests::test_db_pool::TestDbPool;
    use db::DbResult;
    use macros::test_db_pool;
    use newtypes::OnboardingCompletedPayload as NTOnboardingCompletedPayload;
    use newtypes::OnboardingStatus;
    use newtypes::WebhookEvent as NTWebhookEvent;
    use std::sync::Arc;
    use webhooks::MockWebhookClient;

    #[test_db_pool]
    async fn test(db_pool: TestDbPool) {
        // Setup
        let (sv, obc) = db_pool
            .db_transaction(|conn| -> DbResult<_> {
                let t = fixtures::tenant::create(conn);
                let obc = fixtures::ob_configuration::create(conn, &t.id, true);
                let vault = fixtures::vault::create_person(conn, true);
                let sv = fixtures::scoped_vault::create(conn, &vault.id, &obc.id);
                Ok((sv, obc))
            })
            .await
            .unwrap();

        let args = FireWebhookArgs {
            scoped_vault_id: sv.id,
            tenant_id: sv.tenant_id,
            is_live: sv.is_live,
            webhook_event: NTWebhookEvent::OnboardingCompleted(NTOnboardingCompletedPayload {
                fp_id: sv.fp_id.clone(),
                timestamp: chrono::Utc::now(),
                status: OnboardingStatus::Fail,
                playbook_key: obc.key.clone(),
                requires_manual_review: true,
                is_live: sv.is_live,
            }),
        };

        // Expected webhook
        let fp_id = sv.fp_id.clone();
        let mut mock_webhook_client = MockWebhookClient::new();
        mock_webhook_client
            .expect_send_event_to_tenant()
            .withf(move |_, _, _, w, _| match w {
                WebhookEvent::OnboardingCompleted(payload) => {
                    payload.fp_id == fp_id
                        && payload.status == OnboardingStatus::Fail
                        && payload.requires_manual_review
                        && payload.playbook_key == obc.key
                }
                _ => false,
            })
            .times(1)
            .return_once(|_, _, _, _, _| Ok(()));

        // Run task
        let mut state = State::test_state().await;
        state.set_webhook_client(Arc::new(mock_webhook_client));
        let task = FireWebhookTask::new(state);
        task.execute(args).await.unwrap();
    }
}
