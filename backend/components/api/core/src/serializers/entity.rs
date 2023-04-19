use crate::utils::{
    db2api::DbToApi,
    vault_wrapper::{Any, TenantUvw},
};
use db::models::{
    scoped_vault::{ScopedVault, SerializableEntity},
    vault::Vault,
};
use newtypes::{BusinessDataKind as BDK, DataIdentifier};
use std::collections::HashMap;

pub type EntityDetail<'a> = (SerializableEntity, &'a TenantUvw<Any>);

impl<'a> DbToApi<EntityDetail<'a>> for api_wire_types::Entity {
    fn from_db((entity, vw): EntityDetail) -> Self {
        let (sv, watchlist_check, onboarding_info) = entity;
        // We only allow tenants to see data in the vault that they have requested to collected and ob config has been authorized
        let attributes = vw.get_visible_populated_fields();

        // Don't require any permissions to decrypt business name - always show it in plaintext
        let plaintext_dis: Vec<DataIdentifier> = vec![BDK::Name.into()];
        let decrypted_attributes: HashMap<_, _> = plaintext_dis
            .into_iter()
            .flat_map(|di| vw.get_p_data(di.clone()).map(|p_data| (di, p_data.clone())))
            .collect();

        let Vault {
            is_portable, kind, ..
        } = vw.vault.clone();

        let ScopedVault {
            fp_id,
            start_timestamp,
            ordering_id,
            ..
        } = sv;

        api_wire_types::Entity {
            id: fp_id,
            is_portable,
            kind,
            attributes,
            start_timestamp,
            watchlist_check: watchlist_check.map(api_wire_types::WatchlistCheck::from_db),
            onboarding: onboarding_info.map(api_wire_types::Onboarding::from_db),
            ordering_id,
            decrypted_attributes,
        }
    }
}
