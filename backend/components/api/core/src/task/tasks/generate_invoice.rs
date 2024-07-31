use crate::task::ExecuteTask;
use crate::State;
use api_errors::FpResult;
use async_trait::async_trait;
use billing::generate_invoice_for_tenant;
use newtypes::GenerateInvoiceArgs;

#[derive(derive_more::Constructor)]
pub(crate) struct GenerateInvoiceTask {
    state: State,
}

#[async_trait]
impl ExecuteTask<GenerateInvoiceArgs> for GenerateInvoiceTask {
    #[tracing::instrument("GenerateInvoiceArgs::execute", skip(self))]
    async fn execute(self, args: GenerateInvoiceArgs) -> FpResult<()> {
        let Self { state } = self;
        let GenerateInvoiceArgs {
            tenant_id,
            billing_date,
        } = args;
        generate_invoice_for_tenant(&state.billing_client, &state.db_pool, tenant_id, billing_date).await?;
        Ok(())
    }
}
