use crate::is_managed;
use crate::managed_metadata;
use crate::BResult;
use crate::BillingInfo;
use newtypes::Product;
use newtypes::TenantId;
use rust_decimal::Decimal;
use std::collections::HashMap;
use std::str::FromStr;
use stripe::CreatePrice;
use stripe::Currency;
use stripe::IdOrCreate;
use stripe::ListPrices;
use stripe::Price;
use stripe::PriceBillingScheme;
use stripe::PriceId;
use strum::IntoEnumIterator;

/// Stores all the price IDs for products we offer. This may differ per environment and occasionally
/// per tenant
#[derive(Debug)]
pub struct BillingProfile {
    pub(crate) tenant_id: TenantId,
    prices: HashMap<Product, PriceInfo>,
}

#[derive(Debug, Clone)]
pub struct PriceInfo {
    /// Identifier for the price of the specific product on stripe
    pub(crate) price_id: stripe::PriceId,
    /// Price, in cents
    pub(crate) price_cents: Decimal,
}

impl BillingProfile {
    pub(crate) fn get(&self, product: Product) -> Option<&PriceInfo> {
        self.prices.get(&product)
    }

    pub(crate) async fn get_for(client: &stripe::Client, info: &BillingInfo) -> BResult<Self> {
        // Get prices for each product
        let mut prices = HashMap::new();
        for product in Product::iter() {
            let bp = info.billing_profile.as_ref();
            let price_cents = bp.and_then(|bp| bp.prices.get(&product));
            if let Some(price_cents) = price_cents {
                let product_id = product.product_id();
                let price_id = get_or_create_price(client, product_id, price_cents).await?;
                let price_cents = Decimal::from_str(price_cents)?;
                let price_info = PriceInfo {
                    price_id,
                    price_cents,
                };
                prices.insert(product, price_info);
            }
        }
        let tenant_id = info.tenant_id.clone();
        let profile = BillingProfile { tenant_id, prices };
        Ok(profile)
    }
}


/// Lookup existing prices for the specified product. If one exists with the same numeric price,
/// return it. Otherwise, make a new price
#[tracing::instrument(skip(client))]
async fn get_or_create_price(client: &stripe::Client, product_id: &str, price: &str) -> BResult<PriceId> {
    let existing_price = get_price(client, product_id, price).await?;
    if let Some(p) = existing_price {
        return Ok(p.id);
    }
    let result = create_price(client, product_id, price).await?;
    Ok(result)
}

#[tracing::instrument(skip(client))]
async fn get_price(client: &stripe::Client, product_id: &str, price: &str) -> BResult<Option<Price>> {
    let request = ListPrices {
        active: Some(true),
        currency: Some(Currency::USD),
        product: Some(IdOrCreate::Id(product_id)),
        ..Default::default()
    };

    let prices = Price::list(client, &request).await?;
    let price_decimal = Decimal::from_str(price)?;
    let existing_price = prices.data.into_iter().find(|p| {
        // Can clean this up with is_some_and one day...
        if p.billing_scheme != Some(PriceBillingScheme::PerUnit) || !is_managed(&p.metadata) {
            return false;
        }
        let Some(a) = p.unit_amount_decimal.as_ref() else {
            return false;
        };
        let Ok(a) = Decimal::from_str(a) else {
            return false;
        };
        a == price_decimal
    });
    Ok(existing_price)
}

#[tracing::instrument(skip(client))]
async fn create_price(client: &stripe::Client, product_id: &str, price: &str) -> BResult<PriceId> {
    let mut params = CreatePrice::new(Currency::USD);
    params.active = Some(true);
    params.billing_scheme = Some(PriceBillingScheme::PerUnit);
    params.product = Some(IdOrCreate::Id(product_id));
    params.metadata = Some(managed_metadata());
    params.unit_amount_decimal = Some(price);
    let price = Price::create(client, params).await?;
    Ok(price.id)
}
