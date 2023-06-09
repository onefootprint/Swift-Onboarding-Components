use crate::{
    auth::{
        tenant::{TenantAuth, TenantGuardDsl},
        CanDecrypt, IsGuardMet,
    },
    utils::{
        db2api::DbToApi,
        vault_wrapper::{Any, TenantVw},
    },
};
use db::models::{
    scoped_vault::{ScopedVault, SerializableEntity},
    vault::Vault,
};
use std::collections::HashMap;

pub type EntityDetail<'a> = (SerializableEntity, &'a TenantVw<Any>, &'a Box<dyn TenantAuth>);

impl<'a> DbToApi<EntityDetail<'a>> for api_wire_types::Entity {
    fn from_db((entity, vw, auth): EntityDetail) -> Self {
        let (sv, watchlist_check, onboarding_info) = entity;
        let attributes = vw.get_visible_populated_fields();

        let auth_scopes = auth.scopes();
        let decryptable_attributes = vw.populated_dis()
            .into_iter()
            // Filter out the attributes that are not decryptable by the tenant at all
            .filter(|x| vw.can_decrypt(x.clone()))
            // Then, filter out attributes that the authed user doesn't have permissions to decrypt
            .filter(|x| CanDecrypt::single(x.clone()).or_admin().is_met(&auth_scopes))
            .collect();

        // Don't require any permissions to decrypt plaintext attributes - always show them
        let decrypted_attributes: HashMap<_, _> = vw
            .populated_dis()
            .into_iter()
            .filter(|di| di.store_plaintext())
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
            decryptable_attributes,
        }
    }
}
