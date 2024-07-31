use anyhow::anyhow;
use anyhow::Result;
use api_core::config::Config;
use api_core::FpResult;
use api_core::State;
use billing::generate_invoice_for_tenant;
use chrono::Duration;
use chrono::NaiveDate;
use chrono::Utc;
use clap::Parser;
use db::models::tenant::Tenant;
use futures::StreamExt;
use tracing::info;

#[derive(Parser, Debug)]
pub struct GenerateInvoices {
    #[arg(long)]
    pub billing_date: Option<NaiveDate>,
}

impl GenerateInvoices {
    #[tracing::instrument("GenerateInvoices::run", skip_all)]
    pub async fn run(self, _config: Config, state: State) -> Result<()> {
        // Subtract 5 hours so we always generate the invoice for last month
        let billing_date = self
            .billing_date
            .unwrap_or_else(|| (Utc::now() - Duration::hours(5)).date_naive());

        info!(%billing_date, "generating invoices...",);

        let tenants = state
            .db_pool
            .db_query(Tenant::list_billable)
            .await
            .map_err(|e| anyhow!("{}", e))?;

        let mut tasks = futures::stream::FuturesUnordered::<
            std::pin::Pin<Box<dyn std::future::Future<Output = FpResult<()>>>>,
        >::new();
        let num_tenants = tenants.len();
        for t in tenants {
            let fut = generate_invoice_for_tenant(&state.billing_client, &state.db_pool, t.id, billing_date);
            tasks.push(Box::pin(fut))
        }
        while tasks.next().await.is_some() {}

        info!(num_tenants, "finished generating invoices");

        Ok(())
    }
}
