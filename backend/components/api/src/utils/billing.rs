use db::models::tenant::{Tenant, UpdateTenant};
use newtypes::StripeCustomerId;

use crate::{errors::ApiResult, State};

pub async fn get_or_create_customer_id(state: &State, tenant: Tenant) -> ApiResult<StripeCustomerId> {
    let customer_id = if let Some(customer_id) = tenant.stripe_customer_id.clone() {
        customer_id
    } else {
        // If there's no customer ID for the tenant, create it and save to the row
        let environment = state.config.service_config.environment.clone();
        let customer_id =
            ::billing::get_or_create_customer(&state.stripe_client, &tenant, environment).await?;
        let tenant_id = tenant.id.clone();
        let update = UpdateTenant {
            stripe_customer_id: Some(customer_id.clone()),
            ..Default::default()
        };
        state
            .db_pool
            .db_query(move |conn| Tenant::update(conn, &tenant_id, update))
            .await??;
        customer_id
    };
    Ok(customer_id)
}
