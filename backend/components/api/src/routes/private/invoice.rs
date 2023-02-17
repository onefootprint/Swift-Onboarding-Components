use crate::auth::tenant::TenantRbAuthContext;
use crate::errors::{ApiError, ApiResult};
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::State;
use chrono::{DateTime, Datelike, Months, NaiveDate, Utc};
use db::models::onboarding_decision::OnboardingDecision;
use db::models::tenant::{Tenant, UpdateTenant};
use db::scoped_user::{count_authorized_for_tenant, ScopedUserListQueryParams};
use newtypes::StripeCustomerId;
use paperclip::actix::{api_v2_operation, post, web};
use std::ops::Add;

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

/// Calculate the beginning and end of the current billing interval.
/// Our billing intervals span midnight UTC on the first day of each month.
fn get_billing_interval() -> ApiResult<(DateTime<Utc>, DateTime<Utc>)> {
    let today = Utc::now().date_naive();
    let utc_timestamp_first_day_of_month = |date: NaiveDate| {
        let err = || ApiError::AssertionError("Invalid date math".to_owned());
        date.with_day(1)
            .ok_or_else(err)?
            .and_hms_opt(0, 0, 0)
            .ok_or_else(err)?
            .and_local_timezone(Utc)
            .single()
            .ok_or_else(err)
    };
    let first_day_of_month = utc_timestamp_first_day_of_month(today)?;
    let first_day_of_next_month = utc_timestamp_first_day_of_month(today.add(Months::new(1)))?;
    Ok((first_day_of_month, first_day_of_next_month))
}

#[tracing::instrument(skip_all)]
pub async fn get_or_create_customer_id(state: &State, tenant: &Tenant) -> ApiResult<StripeCustomerId> {
    let customer_id = if let Some(customer_id) = tenant.stripe_customer_id.clone() {
        customer_id
    } else {
        // If there's no customer ID for the tenant, create it and save to the row
        let environment = state.config.service_config.environment.clone();
        let customer_id = billing::get_or_create_customer(&state.stripe_client, tenant, environment).await?;
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
    let (start_date, end_date) = get_billing_interval()?;

    let params = ScopedUserListQueryParams {
        tenant_id: tenant.id.clone(),
        is_live: true,
        ..Default::default()
    };
    let tenant_id = tenant.id.clone();
    let (count_pii_storage, count_billable_kyc) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let count_pii_storage = count_authorized_for_tenant(conn, params)?;
            let billable_kyc =
                OnboardingDecision::get_billable_count(conn, &tenant_id, start_date, end_date)?;
            Ok((count_pii_storage, billable_kyc))
        })
        .await??;
    let customer_id = get_or_create_customer_id(state, &tenant).await?;
    billing::bill_for_tenant(
        &state.stripe_client,
        customer_id,
        count_pii_storage,
        count_billable_kyc,
    )
    .await?;
    Ok(())
}
