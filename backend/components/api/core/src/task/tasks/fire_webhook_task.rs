use std::sync::Arc;

use crate::task::{ExecuteTask, TaskError};
use async_trait::async_trait;
use db::{models::scoped_vault::ScopedVault, DbPool, DbResult};
use newtypes::FireWebhookArgs;
use webhooks::{events::WebhookEvent, WebhookApp, WebhookClient};

pub(crate) struct FireWebhookTask {
    db_pool: DbPool,
    webhook_client: Arc<dyn WebhookClient>,
}

impl FireWebhookTask {
    #[allow(unused)]
    pub fn new(db_pool: DbPool, webhook_client: Arc<dyn WebhookClient>) -> Self {
        Self {
            db_pool,
            webhook_client,
        }
    }
}

#[async_trait]
impl ExecuteTask<FireWebhookArgs> for FireWebhookTask {
    async fn execute(&self, args: &FireWebhookArgs) -> Result<(), TaskError> {
        let svid = args.scoped_vault_id.clone();
        let (t_id, is_live) = self
            .db_pool
            .db_query(move |conn| -> DbResult<_> {
                let su = ScopedVault::get(conn, &svid)?;
                Ok((su.tenant_id, su.is_live))
            })
            .await??;

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
    use db::tests::test_db_pool::TestDbPool;
    use macros::test_db_pool;

    use db::tests::fixtures;
    use newtypes::{
        OnboardingCompletedPayload as NTOnboardingCompletedPayload, OnboardingStatus,
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
            webhook_event: NTWebhookEvent::OnboardingCompleted(NTOnboardingCompletedPayload {
                fp_id: sv.fp_id.clone(),
                footprint_user_id: None,
                timestamp: chrono::Utc::now(),
                status: OnboardingStatus::Fail,
                requires_manual_review: true,
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
        let task = FireWebhookTask::new((*db_pool).clone(), Arc::new(mock_webhook_client));
        task.execute(&args).await.unwrap();
    }
}
