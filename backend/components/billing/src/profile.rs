use feature_flag::{JsonFlag, LaunchDarklyFeatureFlagClient};
use newtypes::TenantId;

use crate::BResult;

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

impl BillingProfile {
    pub(crate) fn get_for(ff_client: LaunchDarklyFeatureFlagClient, tenant_id: &TenantId) -> BResult<Self> {
        let result = ff_client.json_flag(JsonFlag::BillingProfile(tenant_id))?;
        Ok(result)
    }
}
