use crate::utils::vault_wrapper::TenantUvw;
use api_core::utils::db2api::DbToApi;
use db::models::onboarding::SerializableOnboardingInfo;
use db::models::scoped_vault::ScopedVault;
use newtypes::{BusinessDataKind as BDK, DataIdentifier};
use std::collections::HashMap;

pub mod detail;
pub mod list;

type EntityDetailResponse = api_wire_types::Entity;
type EntityListResponse = Vec<EntityDetailResponse>;

/// Shared logic to map info on an entity into its serialized form.
/// Pulled out since we do some special logic to decrypt certain attributes
fn serialize_entity(
    sv: ScopedVault,
    vw: &TenantUvw,
    ob: Option<SerializableOnboardingInfo>,
) -> api_wire_types::Entity {
    // We only allow tenants to see data in the vault that they have requested to collected and ob config has been authorized
    let dis = vw.get_visible_populated_fields();

    let is_portable = vw.vault.is_portable;
    // Don't require any permissions to decrypt business name - always show it in plaintext
    let plaintext_dis: Vec<DataIdentifier> = vec![BDK::Name.into()];
    let visible: HashMap<_, _> = plaintext_dis
        .into_iter()
        .flat_map(|di| vw.get_p_data(di.clone()).map(|p_data| (di, p_data.clone())))
        .collect();
    let vault_kind = vw.vault().kind;
    api_wire_types::Entity::from_db((dis, ob, sv, is_portable, vault_kind, visible))
}
