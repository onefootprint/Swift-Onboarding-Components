use std::str::FromStr;

use db::models::billing_profile::BillingProfile as DbBillingProfile;
use feature_flag::{JsonFlag, LaunchDarklyFeatureFlagClient};
use futures::future::OptionFuture;
use newtypes::TenantId;
use rust_decimal::Decimal;
use stripe::{CreatePrice, Currency, IdOrCreate, ListPrices, Price, PriceBillingScheme, PriceId};

use crate::{is_managed, managed_metadata, BResult};

/// Stores all the price IDs for products we offer. This may differ per environment and occasionally per tenant
#[derive(serde::Deserialize)]
pub(crate) struct BillingProfile {
    pub(crate) kyc: Option<stripe::PriceId>,
    pub(crate) pii: Option<stripe::PriceId>,
    pub(crate) kyb: Option<stripe::PriceId>,
    pub(crate) id_docs: Option<stripe::PriceId>,
    pub(crate) watchlist: Option<stripe::PriceId>,

    // Not all tenants have billing for hot vaults
    pub(crate) hot_vaults: Option<stripe::PriceId>,
    pub(crate) hot_proxy_vaults: Option<stripe::PriceId>,
}

// TODO this doesn't have dev products
const HOT_PROXY_VAULTS: &str = "prod_OVScZrizPqwPn7";
const HOT_VAULTS: &str = "prod_OVSbMYqHKSm9VT";
const DOCUMENT_SCANS: &str = "prod_ON7rDKhCD3yVsw";
const KYB: &str = "prod_NbtsYZ8CIBKWo2";
const WATCHLIST_MONITORING: &str = "prod_NbtH04u60RlSWg";
const KYC: &str = "prod_NPMdLP5c6udoVi";
const PII: &str = "prod_NPMd4yoHoFrHw7";

impl BillingProfile {
    pub(crate) async fn get_for(
        client: &stripe::Client,
        ff_client: LaunchDarklyFeatureFlagClient,
        tenant_id: &TenantId,
        billing_profile: Option<DbBillingProfile>,
    ) -> BResult<Self> {
        // If there's a billing profile in the database, use it
        let Some(billing_profile) = billing_profile else { 
            // Otherwise, default to the LD flag for now
            let result = ff_client.json_flag(JsonFlag::BillingProfile(tenant_id))?;
            return Ok(result)
        };

        // Otherwise, get or create prices for each
        let DbBillingProfile {
            kyc,
            kyb,
            pii,
            id_docs,
            hot_vaults,
            hot_proxy_vaults,
            watchlist,
            id: _,
            tenant_id: _,
            _created_at: _,
            _updated_at: _,
        } = billing_profile;
        let kyc = OptionFuture::from(kyc.map(|p| get_or_create_price(client, KYC, p)))
            .await
            .transpose()?;
        let kyb = OptionFuture::from(kyb.map(|p| get_or_create_price(client, KYB, p)))
            .await
            .transpose()?;
        let pii = OptionFuture::from(pii.map(|p| get_or_create_price(client, PII, p)))
            .await
            .transpose()?;
        let id_docs = OptionFuture::from(id_docs.map(|p| get_or_create_price(client, DOCUMENT_SCANS, p)))
            .await
            .transpose()?;
        let hot_vaults = OptionFuture::from(hot_vaults.map(|p| get_or_create_price(client, HOT_VAULTS, p)))
            .await
            .transpose()?;
        let hot_proxy_vaults =
            OptionFuture::from(hot_proxy_vaults.map(|p| get_or_create_price(client, HOT_PROXY_VAULTS, p)))
                .await
                .transpose()?;
        let watchlist =
            OptionFuture::from(watchlist.map(|p| get_or_create_price(client, WATCHLIST_MONITORING, p)))
                .await
                .transpose()?;

        let profile = BillingProfile {
            kyc,
            kyb,
            pii,
            id_docs,
            hot_vaults,
            hot_proxy_vaults,
            watchlist,
        };
        Ok(profile)
    }
}

/// Lookup existing prices for the specified product. If one exists with the same numeric price,
/// return it. Otherwise, make a new price
async fn get_or_create_price(client: &stripe::Client, product_id: &str, price: String) -> BResult<PriceId> {
    let request = ListPrices {
        active: Some(true),
        currency: Some(Currency::USD),
        product: Some(IdOrCreate::Id(HOT_PROXY_VAULTS)),
        ..Default::default()
    };

    let prices = Price::list(client, &request).await?;
    let price_decimal = Decimal::from_str(&price)?;
    let existing_price = prices.data.into_iter().find(|p| {
        // Can clean this up with is_some_and one day...
        if p.billing_scheme != Some(PriceBillingScheme::PerUnit) || !is_managed(&p.metadata) {
            return false;
        }
        let Some(a) = p.unit_amount_decimal.as_ref() else {
            return false
        };
        let Ok(a) = Decimal::from_str(a) else {
            return false;
        };
        a == price_decimal
    });
    if let Some(p) = existing_price {
        return Ok(p.id);
    }
    let params = CreatePrice {
        billing_scheme: Some(PriceBillingScheme::PerUnit),
        currency: Currency::USD,
        product: Some(IdOrCreate::Id(product_id)),
        metadata: Some(managed_metadata()),
        unit_amount_decimal: Some(&price),
        // This doesn't implement Default for some reason...
        active: None,
        currency_options: None,
        custom_unit_amount: None,
        expand: &[],
        lookup_key: None,
        nickname: None,
        product_data: None,
        recurring: None,
        tax_behavior: None,
        tiers: None,
        tiers_mode: None,
        transfer_lookup_key: None,
        transform_quantity: None,
        unit_amount: None,
    };
    let price = Price::create(client, params).await?;
    Ok(price.id)
}
