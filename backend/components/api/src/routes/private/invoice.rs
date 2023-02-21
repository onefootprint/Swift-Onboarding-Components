use crate::auth::tenant::TenantRbAuthContext;
use crate::errors::ApiResult;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::State;
use billing::BillingInfo;
use chrono::Utc;
use db::models::onboarding_decision::OnboardingDecision;
use db::models::tenant::{Tenant, UpdateTenant};
use db::scoped_user::{count_authorized_for_tenant, ScopedUserListQueryParams};
use newtypes::StripeCustomerId;
use paperclip::actix::{api_v2_operation, post, web};

#[api_v2_operation(
    description = "Private endpoint to issue draft invoices for all billable tenants.",
    tags(Private)
)]
#[post("/private/invoice")]
async fn post(state: web::Data<State>, auth: TenantRbAuthContext) -> JsonApiResponse<EmptyResponse> {
    let _firm_employee = auth.firm_employee_user()?;

    let tenants = state.db_pool.db_query(Tenant::list_live).await??;

    let fut_bill_tenant = tenants.into_iter().map(|t| create_bill_for_tenant(&state, t));
    futures::future::join_all(fut_bill_tenant)
        .await
        .into_iter()
        .collect::<ApiResult<_>>()?;

    EmptyResponse::ok().json()
}

#[tracing::instrument(skip_all)]
pub async fn get_or_create_customer_id(state: &State, tenant: &Tenant) -> ApiResult<StripeCustomerId> {
    let customer_id = if let Some(customer_id) = tenant.stripe_customer_id.clone() {
        customer_id
    } else {
        // If there's no customer ID for the tenant, create it and save to the row
        let environment = state.config.service_config.environment.clone();
        let customer_id = state
            .billing_client
            .get_or_create_customer(tenant, environment)
            .await?;
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

#[tracing::instrument(skip_all)]
async fn create_bill_for_tenant(state: &State, tenant: Tenant) -> ApiResult<()> {
    if !crate::decision::utils::should_bill(&state.feature_flag_client, &tenant.id) {
        return Ok(());
    }
    let interval = billing::interval::get_billing_interval(Utc::now().date_naive())?;

    let params = ScopedUserListQueryParams {
        tenant_id: tenant.id.clone(),
        is_live: true,
        ..Default::default()
    };
    let tenant_id = tenant.id.clone();
    let (count_pii, count_kyc) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let count_pii_storage = count_authorized_for_tenant(conn, params)?;
            let billable_kyc =
                OnboardingDecision::get_billable_count(conn, &tenant_id, interval.start, interval.end)?;
            Ok((count_pii_storage, billable_kyc))
        })
        .await??;
    let customer_id = get_or_create_customer_id(state, &tenant).await?;
    let info = BillingInfo {
        interval,
        customer_id,
        count_pii,
        count_kyc,
    };
    state.billing_client.bill_tenant(info).await?;
    Ok(())
}
