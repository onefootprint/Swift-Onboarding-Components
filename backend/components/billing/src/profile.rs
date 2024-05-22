use std::{collections::HashMap, str::FromStr};

use db::models::billing_profile::BillingProfile as DbBillingProfile;
use newtypes::TenantId;
use rust_decimal::Decimal;
use stripe::{CreatePrice, Currency, IdOrCreate, ListPrices, Price, PriceBillingScheme, PriceId};
use strum::IntoEnumIterator;

use crate::{is_managed, managed_metadata, product::Product, BResult, BillingInfo};

/// Stores all the price IDs for products we offer. This may differ per environment and occasionally per tenant
#[derive(Debug)]
pub struct BillingProfile {
    pub(crate) tenant_id: TenantId,
    prices: HashMap<Product, stripe::PriceId>,
}

impl BillingProfile {
    pub(crate) fn get(&self, product: Product) -> Option<stripe::PriceId> {
        self.prices.get(&product).cloned()
    }

    pub(crate) async fn get_for(client: &stripe::Client, info: &BillingInfo) -> BResult<Self> {
        // Get prices for each product
        let mut prices = HashMap::new();
        for product in Product::iter() {
            let price = get_price_from(info.billing_profile.as_ref(), product);
            if let Some(price) = price {
                let product_id = product.product_id();
                let price_id = get_or_create_price(client, product_id, price).await?;
                prices.insert(product, price_id);
            }
        }
        let tenant_id = info.tenant_id.clone();
        let profile = BillingProfile { tenant_id, prices };
        Ok(profile)
    }
}

fn get_price_from(profile: Option<&DbBillingProfile>, product: Product) -> Option<&str> {
    let profile = profile?;
    match product {
        Product::Pii => profile.pii.as_deref(),
        Product::Kyc => profile.kyc.as_deref(),
        Product::Kyb => profile.kyb.as_deref(),
        Product::IdDocs => profile.id_docs.as_deref(),
        Product::WatchlistChecks => profile.watchlist.as_deref(),
        Product::HotVaults => profile.hot_vaults.as_deref(),
        Product::HotProxyVaults => profile.hot_proxy_vaults.as_deref(),
        Product::VaultsWithNonPci => profile.vaults_with_non_pci.as_deref(),
        Product::VaultsWithPci => profile.vaults_with_pci.as_deref(),
        Product::AdverseMediaPerOnboarding => profile.adverse_media_per_user.as_deref(),
        Product::ContinuousMonitoringPerYear => profile.continuous_monitoring_per_year.as_deref(),
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
