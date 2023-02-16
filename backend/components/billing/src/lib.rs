use std::{collections::HashMap, str::FromStr};

use db::{
    models::tenant::Tenant,
    scoped_user::{count_authorized_for_tenant, ScopedUserListQueryParams},
};
use newtypes::{ScopedUserId, StripeCustomerId, TenantId};
pub use stripe::Client as StripeClient;
use stripe::{
    CreateCustomer, CreateSubscription, CreateSubscriptionItems, CreateUsageRecord, Customer, ListCustomers,
    ListSubscriptions, Subscription, SubscriptionItem, SubscriptionProrationBehavior, UpdateSubscriptionItem,
    UsageRecord, UsageRecordAction,
};

pub type BResult<T> = Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("{0}")]
    Stripe(#[from] stripe::StripeError),
    #[error("{0}")]
    ParseIdError(#[from] stripe::ParseIdError),
    #[error("{0}")]
    DbError(#[from] db::DbError),
    #[error("No subscription item found")]
    NoSubscriptionItem,
    #[error("Tenant does not yet have an associated customer ID")]
    NoCustomerId,
}

// Will put these in either config or launch darkly
const PII_PRICE_ID: &str = "price_1Mbq7GGerPBo41PtfQcCkjzw";
const KYC_PRICE_ID: &str = "price_1Mbq6cGerPBo41PtZfrxXBTs";

pub fn init_client(secret_key: String) -> StripeClient {
    StripeClient::new(secret_key)
}

#[tracing::instrument(skip(client))]
pub async fn get_or_create_customer(
    client: &StripeClient,
    tenant: &Tenant,
    environment: String,
) -> BResult<StripeCustomerId> {
    let description = match (tenant.website_url.as_ref(), tenant.company_size.as_ref()) {
        (Some(url), Some(size)) => Some(format!("{}, {}", url, size)),
        (Some(a), None) => Some(a.to_string()),
        (None, Some(a)) => Some(format!("{}", a)),
        (None, None) => None,
    };
    // TODO use search API instead of paginating
    let params = ListCustomers {
        limit: Some(100),
        ..Default::default()
    };
    let existing_customers = Customer::list(client, &params).await?;
    let existing_customer = existing_customers.data.into_iter().find(|c| {
        c.metadata.get("tenant.id") == Some(&tenant.id) && c.metadata.get("environment") == Some(&environment)
    });
    let customer = if let Some(c) = existing_customer {
        c
    } else {
        let new_customer = CreateCustomer {
            name: Some(&tenant.name),
            email: None,
            description: description.as_deref(),
            // Add information to help us look up the customer
            metadata: Some(HashMap::from_iter([
                ("tenant.id".to_string(), tenant.id.to_string()),
                ("environment".to_string(), environment),
            ])),
            ..Default::default()
        };
        Customer::create(client, new_customer).await?
    };
    Ok(customer.id.to_string().into())
}

#[tracing::instrument(skip(client))]
async fn find_subscription_item_for(
    client: &StripeClient,
    customer_id: stripe::CustomerId,
    price_id: stripe::PriceId,
) -> BResult<SubscriptionItem> {
    // TODO implement this with search API rather than iterating through list in RAM
    let params = ListSubscriptions {
        customer: Some(customer_id.clone()),
        limit: Some(10),
        ..Default::default()
    };
    let subscriptions = Subscription::list(client, &params).await?;
    let result = subscriptions.data.into_iter().find_map(|s| {
        s.items
            .data
            .into_iter()
            .find(|si| si.price.as_ref().map(|p| &p.id) == Some(&price_id))
    });
    let result = if let Some(si) = result {
        si
    } else {
        let si = CreateSubscriptionItems {
            price: Some(price_id.to_string()),
            ..Default::default()
        };
        let mut params = CreateSubscription::new(customer_id);
        params.items = Some(vec![si]);
        // TODO anchor to first of the months
        params.billing_cycle_anchor = None;
        let s = Subscription::create(client, params).await?;
        s.items.data.into_iter().next().ok_or(Error::NoSubscriptionItem)?
    };
    Ok(result)
}

#[tracing::instrument(skip(client))]
pub async fn charge_for_kyc(
    client: &StripeClient,
    customer_id: StripeCustomerId,
    #[allow(unused)] scoped_user_id: ScopedUserId,
) -> BResult<()> {
    // TODO better way to convert between newtypes and stripe SDK newtypes
    let customer_id = stripe::CustomerId::from_str(&customer_id)?;
    let kyc_price_id = stripe::PriceId::from_str(KYC_PRICE_ID)?;
    let si = find_subscription_item_for(client, customer_id, kyc_price_id).await?;
    let create_ur = CreateUsageRecord {
        quantity: 1,
        action: Some(UsageRecordAction::Increment),
        timestamp: None, // Default to Now. TODO handle delayed sending?
    };
    // TODO idempotent id header, scoped_user.id
    UsageRecord::create(client, &si.id, create_ur).await?;
    Ok(())
}

#[tracing::instrument(skip(client, pool))]
async fn update_pii_charge_inner(client: StripeClient, pool: db::DbPool, tenant_id: TenantId) -> BResult<()> {
    // Do we want a different product for non-portable and portable?
    let params = ScopedUserListQueryParams {
        tenant_id: tenant_id.clone(),
        is_live: true,
        ..Default::default()
    };
    // Not ideal, but since there isn't a convenient way to simply increment the subscription count
    // by one for non-metered billing, we just sum up the count of users for which to charge PII
    // storage every time.
    // Maybe we will move this to a daily job one day
    let (tenant, count) = pool
        .db_query(move |conn| -> BResult<_> {
            let tenant = Tenant::get(conn, &tenant_id)?;
            let count = count_authorized_for_tenant(conn, params)?;
            Ok((tenant, count))
        })
        .await??;
    let customer_id = tenant
        .stripe_customer_id
        .map(|ci| stripe::CustomerId::from_str(&ci))
        .transpose()?
        .ok_or(Error::NoCustomerId)?;
    let pii_price_id = stripe::PriceId::from_str(PII_PRICE_ID)?;
    let si = find_subscription_item_for(&client, customer_id, pii_price_id).await?;
    let si_update = UpdateSubscriptionItem {
        quantity: Some(count as u64),
        proration_behavior: Some(SubscriptionProrationBehavior::None),
        ..Default::default()
    };
    SubscriptionItem::update(&client, &si.id, si_update).await?;
    Ok(())
}

#[tracing::instrument(skip(client, pool))]
pub fn update_pii_charge(client: StripeClient, pool: db::DbPool, tenant_id: TenantId) {
    tokio::spawn(async move {
        let result = update_pii_charge_inner(client, pool, tenant_id).await;
        if let Err(e) = result {
            tracing::error!("Couldn't update PII vaulting charge: {}", e);
        }
    });
}
