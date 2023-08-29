use crate::counts::LineItem;
use db::models::billing_profile::BillingProfile as DbBillingProfile;
use db::models::tenant::Tenant;
use interval::BillingInterval;
use newtypes::{PiiString, StripeCustomerId, TenantId};
use profile::BillingProfile;
use std::{collections::HashMap, str::FromStr};
pub use stripe::Client;
use stripe::{
    CreateCustomer, CreateInvoice, CreateInvoiceItem, Customer, CustomerId, Invoice, InvoiceItem,
    InvoicePendingInvoiceItemsBehavior, InvoiceStatus, ListCustomers, ListInvoiceItems, ListInvoices,
    UpdateInvoiceItem,
};

pub type BResult<T> = Result<T, Error>;

mod counts;
pub use counts::BillingCounts;
pub mod interval;
mod product;
mod profile;

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("{0}")]
    Stripe(#[from] stripe::StripeError),
    #[error("{0}")]
    ParseIdError(#[from] stripe::ParseIdError),
    #[error("Error computing billing interval")]
    CannotComputeBillingInterval,
    #[error("Line item is not an InvoiceItem: {0}")]
    NonInvoiceLineItem(String),
    #[error("Unknown InvoiceItem: {0}")]
    UnknownInvoiceItem(String),
    #[error("Quantity of line item doesn't match InvoiceItem: {0}")]
    InvalidLineItemQuantity(String),
    #[error("Invoice is missing a line item. Has {0} line items, expected to have {1} line items")]
    InvoiceMissingItem(usize, usize),
    #[error("{0}")]
    FeatureFlagError(#[from] feature_flag::Error),
    #[error("{0}")]
    DecimalError(#[from] rust_decimal::Error),
}

#[derive(Clone)]
pub struct BillingClient {
    client: Client,
}

impl BillingClient {
    pub fn new(secret_key: PiiString) -> Self {
        let client = Client::new(secret_key.leak_to_string());
        Self { client }
    }

    #[tracing::instrument(skip(self))]
    pub async fn get_or_create_customer(
        &self,
        tenant: &Tenant,
        environment: String,
    ) -> BResult<StripeCustomerId> {
        // TODO use search API instead of paginating
        let params = ListCustomers {
            limit: Some(100),
            ..Default::default()
        };
        let existing_customers = Customer::list(&self.client, &params).await?;
        let existing_customer = existing_customers.data.into_iter().find(|c| {
            c.metadata.get("tenant.id") == Some(&tenant.id)
                && c.metadata.get("environment") == Some(&environment)
        });
        let customer = if let Some(c) = existing_customer {
            c
        } else {
            let extra_metadata = [
                ("tenant.id".to_string(), tenant.id.to_string()),
                ("environment".to_string(), environment),
                ("org_name".to_string(), tenant.name.clone()),
            ];
            let metadata = extra_metadata.into_iter().chain(managed_metadata()).collect();
            let new_customer = CreateCustomer {
                name: Some(&tenant.name),
                email: None,
                description: tenant.website_url.as_deref(),
                // Add information to help us look up the customer
                metadata: Some(metadata),
                ..Default::default()
            };
            Customer::create(&self.client, new_customer).await?
        };
        Ok(customer.id.to_string().into())
    }

    #[tracing::instrument(skip(self))]
    async fn get_or_create_invoice_item(
        &self,
        customer_id: CustomerId,
        line_item: LineItem,
    ) -> BResult<Option<InvoiceItem>> {
        let LineItem {
            price_id,
            count,
            is_uncontracted,
        } = line_item;
        if count == 0 {
            return Ok(None);
        }
        let description = is_uncontracted
            .then_some("The price for this product is not contracted for this tenant. Please review.");
        if is_uncontracted {
            // These require manual human action, but we don't want to prevent invoice generation
            tracing::error!(customer_id=%customer_id, price_id=%price_id, "Billing line item is uncontracted");
        }
        // First check if there's already a pending invoice item
        let list_items = ListInvoiceItems {
            customer: Some(customer_id.clone()),
            pending: Some(true),
            ..Default::default()
        };
        let existing_items = InvoiceItem::list(&self.client, &list_items).await?;
        let existing_item = existing_items
            .data
            .iter()
            .find(|l| l.price.as_ref().map(|p| &p.id) == Some(&price_id) && is_managed(&l.metadata));

        let item = if let Some(item) = existing_item {
            // If the pending invoice item for this price exists, just update it
            let update = UpdateInvoiceItem {
                quantity: Some(count as u64),
                description,
                ..Default::default()
            };
            InvoiceItem::update(&self.client, &item.id, update).await?
        } else {
            // Otherwise, make a new one
            let mut new_invoice_item = CreateInvoiceItem::new(customer_id);
            new_invoice_item.price = Some(price_id);
            new_invoice_item.quantity = Some(count as u64);
            new_invoice_item.metadata = Some(managed_metadata());
            new_invoice_item.description = description;
            InvoiceItem::create(&self.client, new_invoice_item).await?
        };
        Ok(Some(item))
    }

    #[tracing::instrument(skip(self))]
    pub async fn generate_draft_invoice(&self, info: BillingInfo) -> BResult<()> {
        if info.counts.is_zero() {
            return Ok(());
        }

        let customer_id = stripe::CustomerId::from_str(&info.customer_id)?;
        // See if there's an existing draft invoice for the tenant and cancel
        // TODO use search API rather than filtering in RAM
        let list_invoice = ListInvoices {
            customer: Some(customer_id.clone()),
            limit: Some(10),
            status: Some(InvoiceStatus::Draft),
            ..Default::default()
        };
        let existing_invoices = Invoice::list(&self.client, &list_invoice).await?;
        let existing_invoice = existing_invoices.data.into_iter().find(|i| {
            is_managed(&i.metadata) && i.metadata.get("billing-interval") == Some(&info.interval.label)
        });
        if let Some(i) = existing_invoice {
            // Delete the existing draft invoice that was created from a previous run.
            // This may fail if the invoice is no longer a draft
            Invoice::delete(&self.client, &i.id).await?;
        }

        // Create the invoice items, unassociated with any invoice, for all the items we'll be charging
        let prices = BillingProfile::get_for(&self.client, info.billing_profile).await?;
        let items_fut = info
            .counts
            .line_items(prices)?
            .into_iter()
            .map(|l| self.get_or_create_invoice_item(customer_id.clone(), l));
        let items: HashMap<_, _> = futures::future::join_all(items_fut)
            .await
            .into_iter()
            .collect::<BResult<Vec<_>>>()?
            .into_iter()
            .flatten()
            .map(|i| (i.id.clone(), i))
            .collect();

        // Create the invoice, which will automatically include these billing items
        let extra_metadata = [("billing-interval".to_owned(), info.interval.label)];
        let metadata = extra_metadata.into_iter().chain(managed_metadata()).collect();
        let new_invoice = CreateInvoice {
            customer: Some(customer_id.clone()),
            metadata: Some(metadata),
            auto_advance: Some(false), // Don't let stripe automatically send out this invoice
            pending_invoice_items_behavior: Some(InvoicePendingInvoiceItemsBehavior::Include),
            description: None,
            ..Default::default()
        };
        let invoice = Invoice::create(&self.client, new_invoice).await?;

        // Do some basic validation on the invoice. When the invoice is created, it will
        // include all pending InvoiceItems. Let's make sure we didn't accidentally include an extra
        // line item we didn't know about
        let data = invoice.lines.data;
        data.iter().try_for_each(|l| -> BResult<_> {
            let Some(item_id) = l.invoice_item.as_ref().map(|i| i.id()) else {
                return Err(Error::NonInvoiceLineItem(l.id.to_string()));
            };
            let Some(item) = items.get(&item_id) else {
                return Err(Error::UnknownInvoiceItem(l.id.to_string()));
            };
            if item.quantity != l.quantity {
                return Err(Error::InvalidLineItemQuantity(l.id.to_string()));
            }
            Ok(())
        })?;
        if data.len() < items.len() {
            return Err(Error::InvoiceMissingItem(data.len(), items.len()));
        }

        Ok(())
    }
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

#[derive(Debug)]
pub struct BillingInfo {
    pub tenant_id: TenantId,
    pub billing_profile: Option<DbBillingProfile>,
    pub customer_id: StripeCustomerId,
    pub interval: BillingInterval,
    pub counts: BillingCounts,
}
