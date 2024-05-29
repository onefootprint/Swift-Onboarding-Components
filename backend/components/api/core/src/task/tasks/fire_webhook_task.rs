use crate::task::{
    ExecuteTask,
    TaskError,
};
use async_trait::async_trait;
use newtypes::FireWebhookArgs;
use std::sync::Arc;
use webhooks::events::WebhookEvent;
use webhooks::{
    WebhookApp,
    WebhookClient,
};

pub(crate) struct FireWebhookTask {
    webhook_client: Arc<dyn WebhookClient>,
}

impl FireWebhookTask {
    #[allow(unused)]
    pub fn new(webhook_client: Arc<dyn WebhookClient>) -> Self {
        Self { webhook_client }
    }
}

#[async_trait]
impl ExecuteTask<FireWebhookArgs> for FireWebhookTask {
    async fn execute(&self, args: &FireWebhookArgs) -> Result<(), TaskError> {
        let t_id = args.tenant_id.clone();
        let is_live = args.is_live;
        let event = WebhookEvent::from(args.webhook_event.clone());
        let _ = self
            .webhook_client
            .send_event_to_tenant(WebhookApp { id: t_id, is_live }, event, None)
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
    use newtypes::{
        OnboardingCompletedPayload as NTOnboardingCompletedPayload,
        OnboardingStatus,
        WebhookEvent as NTWebhookEvent,
    };
    use webhooks::MockWebhookClient;

    #[test_db_pool]
    async fn test(db_pool: TestDbPool) {
        // Setup
        let sv = db_pool
            .db_transaction(|conn| -> DbResult<_> {
                let t = fixtures::tenant::create(conn);
                let obc = fixtures::ob_configuration::create(conn, &t.id, true);
                let vault = fixtures::vault::create_person(conn, true);
                Ok(fixtures::scoped_vault::create(conn, &vault.id, &obc.id))
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
                requires_manual_review: true,
                is_live: sv.is_live,
            }),
        };

        // Expected webhook
        let fp_id = sv.fp_id.clone();
        let mut mock_webhook_client = MockWebhookClient::new();
        mock_webhook_client
            .expect_send_event_to_tenant()
            .withf(move |_, w, _| match w {
                WebhookEvent::OnboardingCompleted(obc) => {
                    obc.fp_id == fp_id && obc.status == OnboardingStatus::Fail && obc.requires_manual_review
                }
                _ => false,
            })
            .times(1)
            .return_once(|_, _, _| Ok(()));

        // Run task
        let task = FireWebhookTask::new(Arc::new(mock_webhook_client));
        task.execute(&args).await.unwrap();
    }
}
