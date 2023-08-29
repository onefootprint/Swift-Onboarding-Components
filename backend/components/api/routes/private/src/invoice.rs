use crate::auth::protected_custodian::ProtectedCustodianAuthContext;
use crate::auth::tenant::{GetFirmEmployee, TenantRbAuthContext};
use crate::auth::Either;
use crate::errors::ApiResult;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::State;
use actix_web::{post, web};
use billing::{BillingCounts, BillingInfo};
use chrono::{Duration, NaiveDate, Utc};
use db::models::access_event::AccessEvent;
use db::models::billing_profile::BillingProfile;
use db::models::identity_document::IdentityDocument;
use db::models::scoped_vault::ScopedVault;
use db::models::tenant::{Tenant, UpdateTenant};
use db::models::watchlist_check::WatchlistCheck;
use db::models::workflow::Workflow;
use newtypes::{AccessEventPurpose, StripeCustomerId, TenantId, VaultKind};
use strum::IntoEnumIterator;

#[derive(Debug, serde::Deserialize)]
struct CreateInvoiceRequest {
    tenant_id: TenantId,
    /// When provided,
    billing_date: Option<NaiveDate>,
}

#[post("/private/invoice")]
async fn post(
    state: web::Data<State>,
    request: web::Json<CreateInvoiceRequest>,
    auth: Either<TenantRbAuthContext, ProtectedCustodianAuthContext>,
) -> JsonApiResponse<EmptyResponse> {
    if let Either::Left(tenant_rb) = auth {
        // Make sure only firm employees can hit this endpoint
        tenant_rb.firm_employee_user()?;
    }
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

#[post("/private/invoices")]
async fn post_all(
    state: web::Data<State>,
    auth: Either<TenantRbAuthContext, ProtectedCustodianAuthContext>,
) -> JsonApiResponse<EmptyResponse> {
    if let Either::Left(tenant_rb) = auth {
        // Make sure only firm employees can hit this endpoint
        tenant_rb.firm_employee_user()?;
    }

    let tenants = state.db_pool.db_query(Tenant::list_billable).await??;

    // Subtract 8 hours so we always generate the invoice for last month
    let billing_date = (Utc::now() - Duration::hours(8)).date_naive();
    for t in tenants {
        create_bill_for_tenant(&state, t, billing_date).await?;
    }

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
    let i = billing::interval::get_billing_interval(billing_date)?;
    let t_id = tenant.id.clone();

    let billing_profile = state
        .db_pool
        .db_query(move |conn| BillingProfile::get(conn, &t_id))
        .await??;
    let billing_profile = state
        .billing_client
        .get_billing_profile(state.feature_flag_client_raw.clone(), billing_profile, &tenant.id)
        .await?;
    // Count the number of billable uses of each product for this tenant
    let t_id = tenant.id.clone();
    let (billing_profile, counts) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            // Fetch counts for most products regardless of whether the tenant is set up with
            // billing for them. We will error if any of these products have use when they haven't
            // been contracted
            let pii = ScopedVault::count_billable(conn, &t_id, i.end)?;
            let kyc = Workflow::get_billable_count(conn, &t_id, i.start, i.end, VaultKind::Person)?;
            let kyb = Workflow::get_billable_count(conn, &t_id, i.start, i.end, VaultKind::Business)?;
            let id_docs = IdentityDocument::get_billable_count(conn, &t_id, i.start, i.end)?;
            let watchlist_checks = WatchlistCheck::get_billable_count(conn, &t_id, i.start, i.end)?;

            // Hot vaults are only billed by some tenants, so only fetch them conditionally
            let p = AccessEventPurpose::iter().collect(); // Any access is billable
            let hot_vaults = billing_profile
                .hot_vaults
                .is_some()
                .then_some(AccessEvent::count_hot_vaults(conn, &t_id, i.start, i.end, p)?);
            let p = vec![AccessEventPurpose::VaultProxy];
            let hot_proxy_vaults = billing_profile
                .hot_proxy_vaults
                .is_some()
                .then_some(AccessEvent::count_hot_vaults(conn, &t_id, i.start, i.end, p)?);
            let counts = BillingCounts {
                pii,
                kyc,
                kyb,
                id_docs,
                watchlist_checks,
                hot_vaults,
                hot_proxy_vaults,
            };
            Ok((billing_profile, counts))
        })
        .await??;

    // Generate the invoice in stripe
    let customer_id = get_or_create_customer_id(state, &tenant).await?;
    let info = BillingInfo {
        tenant_id: tenant.id.clone(),
        billing_profile,
        interval: i,
        customer_id,
        counts,
    };
    state
        .billing_client
        .generate_draft_invoice(info)
        .await
        .map_err(|e| {
            // Log error since the request only fails with a single tenant's error message
            tracing::error!(error=?e, tenant_id = %tenant.id, "Couldn't bill tenant");
            e
        })?;
    Ok(())
}
