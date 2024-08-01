use crate::counts::LineItem;
use counts::LineItemPrice;
use db::models::billing_profile::BillingProfile as DbBillingProfile;
use db::models::tenant::Tenant;
use db::DbError;
use interval::BillingInterval;
use itertools::chain;
use itertools::Itertools;
use newtypes::PiiString;
use newtypes::Product;
use newtypes::RevenueCategory;
use newtypes::StripeCustomerId;
use newtypes::TenantId;
use profile::get_or_create_price;
use profile::BillingProfile;
use rust_decimal::prelude::ToPrimitive;
use rust_decimal::Decimal;
use std::collections::HashMap;
use std::str::FromStr;
pub use stripe::Client;
use stripe::CollectionMethod;
use stripe::CreateCustomer;
use stripe::CreateInvoice;
use stripe::CreateInvoiceItem;
use stripe::CreateInvoicePaymentSettings;
use stripe::CreateInvoicePaymentSettingsPaymentMethodTypes;
use stripe::Currency;
use stripe::Customer;
use stripe::CustomerId;
use stripe::Invoice;
use stripe::InvoiceItem;
use stripe::InvoicePendingInvoiceItemsBehavior;
use stripe::InvoiceStatus;
use stripe::ListCustomers;
use stripe::ListInvoiceItems;
use stripe::ListInvoices;

pub type BResult<T> = Result<T, Error>;

mod counts;
pub use counts::BillingCounts;
pub mod interval;
mod invoices;
pub use invoices::*;
mod profile;

#[allow(clippy::inconsistent_digit_grouping)]
const SMALL_INVOICE_NOTIONAL_CENTS: i64 = 500_00;

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
    #[error("{0}")]
    ValidationError(String),
    #[error("Invoice is missing a line item. Has {0} line items, expected to have {1} line items")]
    InvoiceMissingItem(usize, usize),
    #[error("{0}")]
    FeatureFlagError(#[from] feature_flag::Error),
    #[error("{0}")]
    DecimalError(#[from] rust_decimal::Error),
    // TODO remove this and use FpResult everywhere in this crate
    #[error("{0}")]
    Database(Box<DbError>),
}

impl api_errors::FpErrorTrait for Error {
    fn status_code(&self) -> api_errors::StatusCode {
        api_errors::StatusCode::INTERNAL_SERVER_ERROR
    }

    fn message(&self) -> String {
        self.to_string()
    }
}


macro_rules! box_from_error_impl {
    ($var:ident, $typ:ty) => {
        impl From<$typ> for Error {
            #[inline]
            fn from(value: $typ) -> Self {
                Error::$var(Box::new(value))
            }
        }
    };
}

box_from_error_impl!(Database, DbError);

#[derive(Clone)]
pub struct BillingClient {
    client: Client,
    environment: String,
}

impl BillingClient {
    pub fn new(secret_key: PiiString, environment: String) -> Self {
        let client = Client::new(secret_key.leak_to_string());
        Self { client, environment }
    }

    #[tracing::instrument(skip(self))]
    pub async fn get_or_create_customer(&self, tenant: &Tenant) -> BResult<StripeCustomerId> {
        // TODO use search API instead of paginating
        let params = ListCustomers {
            limit: Some(100),
            ..Default::default()
        };
        let existing_customers = Customer::list(&self.client, &params).await?;
        let existing_customer = existing_customers.data.into_iter().find(|c| {
            c.metadata.get("tenant.id") == Some(&tenant.id)
                && c.metadata.get("environment") == Some(&self.environment)
        });
        let customer = if let Some(c) = existing_customer {
            c
        } else {
            let extra_metadata = [
                ("tenant.id".to_string(), tenant.id.to_string()),
                ("environment".to_string(), self.environment.clone()),
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
        customer_id: &CustomerId,
        line_item: LineItem,
    ) -> BResult<Option<InvoiceItem>> {
        let LineItem {
            price,
            count,
            product,
        } = line_item;
        if count == 0 {
            return Ok(None);
        }
        // Otherwise, make a new one
        let mut new_invoice_item = CreateInvoiceItem::new(customer_id.clone());
        match price {
            LineItemPrice::Price(price_cents) => {
                let price_cents = price_cents.to_string();
                let price_id = get_or_create_price(&self.client, product.product_id(), &price_cents).await?;
                new_invoice_item.price = Some(price_id);
            }
            LineItemPrice::Uncontracted => {
                new_invoice_item.currency = Some(Currency::USD);
                new_invoice_item.unit_amount = Some(0);
                new_invoice_item.description = Some(product.uncontracted_description());
            }
        }
        new_invoice_item.quantity = Some(count as u64);
        let extra_metadata = [("revenue-category".into(), product.revenue_category().to_string())];
        new_invoice_item.metadata = Some(chain!(extra_metadata, managed_metadata()).collect());
        let item = InvoiceItem::create(&self.client, new_invoice_item).await?;
        Ok(Some(item))
    }

    #[tracing::instrument(skip(self))]
    pub async fn generate_draft_invoice(&self, info: BillingInfo) -> BResult<()> {
        let customer_id = stripe::CustomerId::from_str(&info.customer_id)?;
        let existing_invoice = self.get_draft_invoice(&customer_id, info.interval).await?;
        if let Some(i) = existing_invoice {
            // Delete the existing draft invoice that was created from a previous run.
            // This may fail if the invoice is no longer a draft
            Invoice::delete(&self.client, &i.id).await?;
        }

        // Calculate each of the line items
        let profile = BillingProfile::new(info.billing_profile.clone())?;
        let mut items = HashMap::new();
        let line_items = info.counts.line_items(&info.tenant_id, &profile)?;
        let monthly_spend_cents: Decimal = line_items
            .iter()
            .filter(|li| li.product.applies_to_monthly_minimum())
            .flat_map(|li| li.notional())
            .sum();

        // Create the invoice items in stripe, including monthly minimum
        for l in line_items.into_iter().sorted_by_key(|l| l.product) {
            let Some(i) = self.get_or_create_invoice_item(&customer_id, l).await? else {
                continue;
            };
            items.insert(i.id.clone(), i);
        }

        // If the tenant didn't hit their monthly minimum, add another line item for the remaining
        // amount
        if let Some(monthly_minimum_price) = profile.get(&Product::MonthlyMinimumOnIdentity) {
            if monthly_spend_cents < *monthly_minimum_price {
                let remaining_cents = monthly_minimum_price - monthly_spend_cents;
                let mut new_invoice_item = CreateInvoiceItem::new(customer_id.clone());
                let extra_metadata = [("revenue-category".into(), RevenueCategory::Identity.to_string())];

                new_invoice_item.description = Some("Monthly minimum spend on identity");
                new_invoice_item.amount = remaining_cents.to_i64();
                new_invoice_item.metadata = Some(chain!(extra_metadata, managed_metadata()).collect());
                new_invoice_item.currency = Some(Currency::USD);
                let i = InvoiceItem::create(&self.client, new_invoice_item).await?;
                items.insert(i.id.clone(), i);
            }
        }

        // If there are no line items, no-op
        if items.is_empty() {
            return Ok(());
        }

        //
        // Create the invoice, which will automatically include these billing items
        //

        let extra_metadata = [("billing-interval".to_owned(), info.interval.label())];
        let metadata = chain!(extra_metadata, managed_metadata()).collect();

        let mut payment_method_types = vec![
            CreateInvoicePaymentSettingsPaymentMethodTypes::AchCreditTransfer,
            CreateInvoicePaymentSettingsPaymentMethodTypes::UsBankAccount,
        ];
        let total_notional_cents: i64 = items.values().flat_map(|i| i.amount).sum();
        if total_notional_cents < SMALL_INVOICE_NOTIONAL_CENTS {
            // For small invoices, let tenants pay via card
            payment_method_types.push(CreateInvoicePaymentSettingsPaymentMethodTypes::Card);
            payment_method_types.push(CreateInvoicePaymentSettingsPaymentMethodTypes::Cashapp);
        }

        // TODO settings for which invoices can automatically be sent out

        let new_invoice = CreateInvoice {
            customer: Some(customer_id.clone()),
            metadata: Some(metadata),
            pending_invoice_items_behavior: Some(InvoicePendingInvoiceItemsBehavior::Include),
            // TODO: Only set to SendInvoice if there's an email on the billing profile
            collection_method: Some(CollectionMethod::ChargeAutomatically),
            payment_settings: Some(CreateInvoicePaymentSettings {
                payment_method_types: Some(payment_method_types),
                ..Default::default()
            }),
            days_until_due: Some(30),
            // TODO Testing this for footprint live, then enable this for other tenants
            auto_advance: Some(info.tenant_id.is_footprint_live()),
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

    async fn get_draft_invoice(
        &self,
        customer_id: &stripe::CustomerId,
        interval: BillingInterval,
    ) -> BResult<Option<Invoice>> {
        let list_invoice = ListInvoices {
            customer: Some(customer_id.clone()),
            limit: Some(10),
            status: Some(InvoiceStatus::Draft),
            ..Default::default()
        };
        let existing_invoices = Invoice::list(&self.client, &list_invoice).await?;
        let existing_invoice = existing_invoices.data.into_iter().find(|i| {
            is_managed(&i.metadata) && i.metadata.get("billing-interval") == Some(&interval.label())
        });
        Ok(existing_invoice)
    }

    pub async fn get_draft_line_items(
        &self,
        customer_id: &StripeCustomerId,
        interval: BillingInterval,
    ) -> BResult<Vec<InvoiceItem>> {
        let customer_id = stripe::CustomerId::from_str(customer_id)?;
        let Some(invoice) = self.get_draft_invoice(&customer_id, interval).await? else {
            return Ok(vec![]);
        };

        let params = ListInvoiceItems {
            invoice: Some(invoice.id.clone()),
            limit: Some(100),
            ..Default::default()
        };
        let items = InvoiceItem::list(&self.client, &params).await?;
        if items.has_more {
            tracing::error!(invoice_id=%invoice.id, customer_id=%customer_id, "Need to implement pagination in get_draft_line_items");
        }
        Ok(items.data)
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
