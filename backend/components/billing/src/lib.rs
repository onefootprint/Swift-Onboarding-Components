use db::models::tenant::Tenant;
use newtypes::StripeCustomerId;
use std::{collections::HashMap, str::FromStr};
pub use stripe::Client as StripeClient;
use stripe::{
    CreateCustomer, CreateInvoice, CreateInvoiceItem, Customer, CustomerId, Invoice, InvoiceItem,
    InvoiceStatusFilter, ListCustomers, ListInvoiceItems, ListInvoices, PriceId, UpdateInvoiceItem,
};
use interval::BillingInterval;

pub type BResult<T> = Result<T, Error>;

pub mod interval;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("{0}")]
    Stripe(#[from] stripe::StripeError),
    #[error("{0}")]
    ParseIdError(#[from] stripe::ParseIdError),
    #[error("Error computing billing interval")]
    CannotComputeBillingInterval,
}

// Will put these in either config or launch darkly
const PII_PRICE_ID: &str = "price_1MbzcbGerPBo41PttkOIt6Xs";
const KYC_PRICE_ID: &str = "price_1McCYdGerPBo41Pt9VmDrsDZ";

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
        let extra_metadata = [
            ("tenant.id".to_string(), tenant.id.to_string()),
            ("environment".to_string(), environment),
        ];
        let metadata = extra_metadata.into_iter().chain(managed_metadata()).collect();
        let new_customer = CreateCustomer {
            name: Some(&tenant.name),
            email: None,
            description: description.as_deref(),
            // Add information to help us look up the customer
            metadata: Some(metadata),
            ..Default::default()
        };
        Customer::create(client, new_customer).await?
    };
    Ok(customer.id.to_string().into())
}

#[tracing::instrument(skip(client))]
async fn get_or_create_invoice_item(
    client: &StripeClient,
    customer_id: CustomerId,
    price_id: PriceId,
    quantity: i64,
) -> BResult<()> {
    if quantity == 0 {
        return Ok(());
    }
    let list_items = ListInvoiceItems {
        customer: Some(customer_id.clone()),
        pending: Some(true),
        ..Default::default()
    };
    let existing_items = InvoiceItem::list(client, &list_items).await?;
    let existing_item = existing_items
        .data
        .iter()
        .find(|l| l.price.as_ref().map(|p| &p.id) == Some(&price_id) && is_managed(&l.metadata));
    if let Some(item) = existing_item {
        let update = UpdateInvoiceItem {
            quantity: Some(quantity as u64),
            ..Default::default()
        };
        InvoiceItem::update(client, &item.id, update).await?;
    } else {
        let mut new_invoice_item = CreateInvoiceItem::new(customer_id);
        new_invoice_item.price = Some(price_id);
        new_invoice_item.quantity = Some(quantity as u64);
        new_invoice_item.metadata = Some(managed_metadata());
        InvoiceItem::create(client, new_invoice_item).await?;
    }
    Ok(())
}

/// Shorthand to autogenerate the HashMap of metadata that indicates this resource is managed by
/// code on stripe.
/// Our code will look for this auto-managed tag to make sure it isn't editing resources that were
/// created manually in the UI.
fn managed_metadata() -> HashMap<String, String> {
    HashMap::from_iter([("auto-managed".to_string(), "true".to_string())])
}

/// Shorthand to check, given a resource's metadata, if it is managed by code
fn is_managed(metadata: &HashMap<String, String>) -> bool {
    metadata.get("auto-managed") == Some(&"true".to_string())
}

#[tracing::instrument(skip(client))]
pub async fn bill_for_tenant(
    client: &StripeClient,
    interval: BillingInterval,
    // TODO use a struct
    customer_id: StripeCustomerId,
    count_pii: i64,
    count_kyc: i64,
) -> BResult<()> {
    if count_pii == 0 && count_kyc == 0 {
        return Ok(());
    }

    let customer_id = stripe::CustomerId::from_str(&customer_id)?;
    // See if there's an existing draft invoice for the tenant and cancel
    // TODO use search API rather than filtering in RAM
    let list_invoice = ListInvoices {
        customer: Some(customer_id.clone()),
        limit: Some(10),
        status: Some(InvoiceStatusFilter::Draft),
        ..Default::default()
    };
    let existing_invoices = Invoice::list(client, &list_invoice).await?;
    let existing_invoice = existing_invoices
        .data
        .into_iter()
        .find(|i| is_managed(&i.metadata) && i.metadata.get("billing-interval") == Some(&interval.label));
    if let Some(i) = existing_invoice {
        // Delete the existing draft invoice that was created from a previous run
        Invoice::delete(client, &i.id).await?;
    }

    // Create the invoice items, unassociated with any invoice, for all the items we'll be charging
    let pii_price_id = stripe::PriceId::from_str(PII_PRICE_ID)?;
    let kyc_price_id = stripe::PriceId::from_str(KYC_PRICE_ID)?;
    let items = [(pii_price_id, count_pii), (kyc_price_id, count_kyc)]
        .into_iter()
        .map(|(price_id, count)| get_or_create_invoice_item(client, customer_id.clone(), price_id, count));
    futures::future::join_all(items)
        .await
        .into_iter()
        .collect::<BResult<_>>()?;

    let extra_metadata = [("billing-interval".to_owned(), interval.label)];
    let metadata = extra_metadata.into_iter().chain(managed_metadata()).collect();
    let new_invoice = CreateInvoice {
        customer: Some(customer_id.clone()),
        metadata: Some(metadata),
        auto_advance: Some(false), // Don't let stripe automatically send out this invoice
        description: None,
        ..Default::default()
    };
    Invoice::create(client, new_invoice).await?;
    // TODO could probably do some basic validation of the invoice here

    Ok(())
}
