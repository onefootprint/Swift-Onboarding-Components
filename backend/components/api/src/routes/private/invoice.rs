use crate::auth::tenant::TenantRbAuthContext;
use crate::errors::ApiResult;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::State;
use billing::BillingInfo;
use chrono::{NaiveDate, Utc};
use db::models::onboarding::Onboarding;
use db::models::tenant::{Tenant, UpdateTenant};
use db::scoped_user::{count_authorized_for_tenant, ScopedUserListQueryParams};
use feature_flag::{BoolFlag, FeatureFlagClient};
use newtypes::{StripeCustomerId, TenantId};
use paperclip::actix::{api_v2_operation, post, web, Apiv2Schema};

#[derive(Debug, serde::Deserialize, Apiv2Schema)]
struct CreateInvoiceRequest {
    tenant_id: TenantId,
    /// When provided,
    billing_date: Option<NaiveDate>,
}

#[api_v2_operation(
    description = "Private endpoint to issue draft invoices for a specific tenant on a specific billing period.",
    tags(Private)
)]
#[post("/private/invoice")]
async fn post(
    state: web::Data<State>,
    request: web::Json<CreateInvoiceRequest>,
    auth: TenantRbAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let _firm_employee = auth.firm_employee_user()?;
    let CreateInvoiceRequest {
        tenant_id,
        billing_date,
    } = request.into_inner();
    let billing_date = billing_date.unwrap_or_else(|| Utc::now().date_naive());

    let tenant = state
        .db_pool
        .db_query(move |conn| Tenant::get(conn, &tenant_id))
        .await??;

    create_bill_for_tenant(&state, tenant, billing_date).await?;

    EmptyResponse::ok().json()
}

#[api_v2_operation(
    description = "Private endpoint to issue draft invoices for all billable tenants.",
    tags(Private)
)]
#[post("/private/invoices")]
async fn post_all(state: web::Data<State>, auth: TenantRbAuthContext) -> JsonApiResponse<EmptyResponse> {
    let _firm_employee = auth.firm_employee_user()?;

    let tenants = state.db_pool.db_query(Tenant::list_live).await??;

    let billing_date = Utc::now().date_naive();
    let fut_bill_tenant = tenants
        .into_iter()
        .map(|t| create_bill_for_tenant(&state, t, billing_date));
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
async fn create_bill_for_tenant(state: &State, tenant: Tenant, billing_date: NaiveDate) -> ApiResult<()> {
    if !state.feature_flag_client.flag(BoolFlag::ShouldBill(&tenant.id)) {
        return Ok(());
    }
    let interval = billing::interval::get_billing_interval(billing_date)?;

    let params = ScopedUserListQueryParams {
        tenant_id: tenant.id.clone(),
        is_live: true,
        only_billable: true,
        ..Default::default()
    };
    let tenant_id = tenant.id.clone();
    let (count_pii, count_kyc) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let count_pii_storage = count_authorized_for_tenant(conn, params)?;
            let billable_kyc =
                Onboarding::get_billable_count(conn, &tenant_id, interval.start, interval.end)?;
            Ok((count_pii_storage, billable_kyc))
        })
        .await??;
    let customer_id = get_or_create_customer_id(state, &tenant).await?;
    let info = BillingInfo {
        tenant_id: tenant.id.clone(),
        interval,
        customer_id,
        count_pii,
        count_kyc,
    };
    state
        .billing_client
        .bill_tenant(&state.feature_flag_client, info)
        .await
        .map_err(|e| {
            // Log error since the request only fails with a single tenant's error message
            tracing::error!(tenant_id = %tenant.id, "Couldn't bill tenant {}", e);
            e
        })?;
    Ok(())
}
