use crate::interval::get_billing_interval;
use crate::BResult;
use crate::BillingClient;
use crate::BillingCounts;
use crate::BillingInfo;
use api_errors::BadRequestInto;
use api_errors::FpResult;
use chrono::NaiveDate;
use db::models::billing_profile::BillingProfile;
use db::models::tenant::Tenant;
use db::models::tenant::UpdateTenant;
use db::DbPool;
use db::DbResult;
use itertools::chain;
use newtypes::StripeCustomerId;
use newtypes::TenantId;

#[tracing::instrument(skip_all, fields(tenant_id, billing_date))]
pub async fn generate_invoice_for_tenant(
    client: &BillingClient,
    db_pool: &DbPool,
    tenant_id: TenantId,
    billing_date: NaiveDate,
) -> FpResult<()> {
    let i = get_billing_interval(billing_date)?;

    // Count the number of billable uses of each product for this tenant
    let (tenant, billing_profile, counts) = db_pool
        .db_query(move |conn| -> FpResult<_> {
            let tenant = Tenant::get(conn, &tenant_id)?;
            if tenant.super_tenant_id.is_some() {
                return BadRequestInto("Cannot generate invoice for subtenant");
            }
            let children = Tenant::list_children(conn, &tenant_id)?;
            let billing_profile = BillingProfile::get(conn, &tenant_id)?;
            let bp = billing_profile.as_ref();

            // Add up the count of each product used by the parent tenant and all children
            let counts = chain!(Some(&tenant), children.iter())
                .map(|t| {
                    BillingCounts::build_for_tenant(conn, &t.id, bp, &i).map(|counts| (t.id.clone(), counts))
                })
                .collect::<DbResult<Vec<_>>>()?;
            if counts.len() > 1 {
                for (t_id, counts) in counts.iter() {
                    tracing::info!(%t_id, ?counts, "Merging billing counts of children");
                }
            };
            let counts = counts
                .into_iter()
                .map(|x| x.1)
                .fold(BillingCounts::default(), |a, b| a + b);
            Ok((tenant, billing_profile, counts))
        })
        .await?;

    if billing_profile.as_ref().is_some_and(|bp| bp.omit_billing) {
        tracing::warn!("Omitting invoice generation for tenant");
        return Ok(());
    }

    // Generate the invoice in stripe
    let customer_id = get_or_create_customer_id(client, db_pool, &tenant).await?;
    client
        .update_customer(&customer_id, &tenant, billing_profile.as_ref())
        .await?;
    let info = BillingInfo {
        tenant_id: tenant.id.clone(),
        billing_profile,
        interval: i,
        customer_id,
        counts,
    };
    client.generate_draft_invoice(info).await.map_err(|err| {
        // Log error since the request only fails with a single tenant's error message
        tracing::error!(?err, tenant_id = %tenant.id, "Couldn't bill tenant");
        err
    })?;
    Ok(())
}

#[tracing::instrument(skip_all)]
async fn get_or_create_customer_id(
    client: &BillingClient,
    db_pool: &DbPool,
    tenant: &Tenant,
) -> BResult<StripeCustomerId> {
    let customer_id = if let Some(customer_id) = tenant.stripe_customer_id.clone() {
        customer_id
    } else {
        // If there's no customer ID for the tenant, create it and save to the row
        let customer_id = client.get_or_create_customer(tenant).await?;
        let tenant_id = tenant.id.clone();
        let update = UpdateTenant {
            stripe_customer_id: Some(customer_id.clone()),
            ..Default::default()
        };
        db_pool
            .db_query(move |conn| Tenant::update(conn, &tenant_id, update))
            .await?;
        customer_id
    };
    Ok(customer_id)
}
