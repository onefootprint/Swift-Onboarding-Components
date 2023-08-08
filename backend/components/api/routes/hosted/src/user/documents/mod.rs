use std::sync::Arc;

use db::models::vault::Vault;
use feature_flag::{BoolFlag, FeatureFlagClient};
use newtypes::TenantId;

pub mod index;
pub mod upload;

// TEMPORARY until appclip supports consent always
// if appclip enabled && sandbox && !selfie
pub fn temporary_should_skip_consent_always(
    ff_client: Arc<dyn FeatureFlagClient>,
    tenant_id: &TenantId,
    vault: &Vault,
) -> bool {
    ff_client.flag(BoolFlag::IsAppClipEnabled(tenant_id)) && !vault.is_live
}
