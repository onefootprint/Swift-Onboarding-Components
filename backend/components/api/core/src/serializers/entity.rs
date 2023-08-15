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
use newtypes::{DataIdentifier, PiiString};
use std::collections::HashMap;

pub type EntityDetail<'a> = (SerializableEntity, &'a TenantVw<Any>, &'a Box<dyn TenantAuth>);

impl<'a> DbToApi<EntityDetail<'a>> for api_wire_types::Entity {
    fn from_db((entity, vw, auth): EntityDetail) -> Self {
        api_wire_types::Entity::from_db((entity, vw, auth, HashMap::new()))
    }
}

pub type EntityDetailMore<'a> = (
    SerializableEntity,
    &'a TenantVw<Any>,
    &'a Box<dyn TenantAuth>,
    HashMap<DataIdentifier, PiiString>,
);

impl<'a> DbToApi<EntityDetailMore<'a>> for api_wire_types::Entity {
    fn from_db((entity, vw, auth, decrypted_attrs): EntityDetailMore) -> Self {
        let (sv, watchlist_check, wfs) = entity;
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
            .chain(decrypted_attrs.into_iter())
            .collect();

        let Vault {
            is_portable,
            kind,
            sandbox_id,
            ..
        } = vw.vault.clone();

        let ScopedVault {
            fp_id,
            start_timestamp,
            ordering_id,
            status,
            ..
        } = sv;
        // TODO should we determine requires_manual_review in another way?
        let requires_manual_review = wfs.iter().any(|(_, _, mr)| mr.is_some());
        let insight_event = wfs
            .into_iter()
            .filter_map(|wf| wf.1.map(|ie| (wf.0, ie)))
            .max_by_key(|wf| wf.0.created_at)
            .map(|(_, ie)| ie);

        api_wire_types::Entity {
            id: fp_id,
            sandbox_id,
            is_portable,
            kind,
            attributes,
            start_timestamp,
            watchlist_check: watchlist_check.map(api_wire_types::WatchlistCheck::from_db),
            ordering_id,
            decrypted_attributes,
            decryptable_attributes,
            status,
            insight_event: insight_event.map(api_wire_types::InsightEvent::from_db),
            requires_manual_review,
        }
    }
}
