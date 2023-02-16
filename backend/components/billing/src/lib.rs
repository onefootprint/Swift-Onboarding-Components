use std::{collections::HashMap, str::FromStr};

use db::models::tenant::Tenant;
use newtypes::{ScopedUserId, StripeCustomerId};
pub use stripe::Client as StripeClient;
use stripe::{
    CreateCustomer, CreateSubscription, CreateSubscriptionItems, CreateUsageRecord, Customer, ListCustomers,
    ListSubscriptions, Subscription, SubscriptionItem, UsageRecord, UsageRecordAction,
};

pub type BResult<T> = Result<T, Error>;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("{0}")]
    Stripe(#[from] stripe::StripeError),
    #[error("{0}")]
    ParseIdError(#[from] stripe::ParseIdError),
    #[error("No subscription item found")]
    NoSubscriptionItem,
}

// Will put these in either config or launch darkly
#[allow(unused)]
const PII_PRICE: &str = "price_1Mbq7GGerPBo41PtfQcCkjzw";
const KYC_PRICE: &str = "price_1Mbq6cGerPBo41PtZfrxXBTs";

pub fn init_client(secret_key: String) -> StripeClient {
    StripeClient::new(secret_key)
}

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

pub async fn charge_for_kyc(
    client: &StripeClient,
    customer_id: StripeCustomerId,
    #[allow(unused)] scoped_user_id: ScopedUserId,
) -> BResult<()> {
    // TODO better way to convert between newtypes and stripe SDK newtypes
    let customer_id = stripe::CustomerId::from_str(&customer_id)?;
    let kyc_price_id = stripe::PriceId::from_str(KYC_PRICE)?;
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
