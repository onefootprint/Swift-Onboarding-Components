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
use api_wire_types::{EntityAttribute, EntityStatus};
use chrono::{Duration, Utc};
use db::models::{
    scoped_vault::{ScopedVault, SerializableEntity},
    vault::Vault,
};
use newtypes::{DataIdentifier, OnboardingStatus, PiiString};
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
        let (sv, watchlist_check, mrs, wfs) = entity;
        let attributes = vw.get_visible_populated_fields();
        let attribute_sources = vw
            .get_visible_populated_fields()
            .into_iter()
            .filter_map(|di| vw.get_lifetime(di.clone()).map(|l| (di, l)))
            .map(|(di, l)| EntityAttribute {
                identifier: di,
                source: l.source,
            })
            .collect();

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
            .chain(decrypted_attrs)
            .collect();

        let Vault {
            is_portable,
            kind,
            sandbox_id,
            is_created_via_api,
            ..
        } = vw.vault.clone();

        let status = status_from_sv(&sv);

        let ScopedVault {
            fp_id,
            start_timestamp,
            ordering_id,
            ..
        } = sv;

        // If the latest Workflow has an uncompleted review
        let requires_manual_review = !mrs.is_empty();

        let insight_event = wfs
            .into_iter()
            .filter_map(|wf| wf.1.map(|ie| (wf.0, ie)))
            .max_by_key(|wf| wf.0.created_at)
            .map(|(_, ie)| ie);

        api_wire_types::Entity {
            id: fp_id,
            sandbox_id,
            // TODO does the client read this?
            is_portable,
            kind,
            start_timestamp,
            watchlist_check: watchlist_check.map(api_wire_types::WatchlistCheck::from_db),
            ordering_id,
            attributes,
            attribute_sources,
            decrypted_attributes,
            decryptable_attributes,
            status,
            insight_event: insight_event.map(api_wire_types::InsightEvent::from_db),
            requires_manual_review,
            is_created_via_api,
        }
    }
}

fn status_from_sv(sv: &ScopedVault) -> Option<EntityStatus> {
    match sv.status {
        None => None,
        Some(OnboardingStatus::Pass) => Some(EntityStatus::Pass),
        Some(OnboardingStatus::Fail) => Some(EntityStatus::Fail),
        Some(OnboardingStatus::Pending) => Some(EntityStatus::Pending),
        Some(OnboardingStatus::Incomplete) => {
            if Utc::now() - sv.last_heartbeat_at < Duration::minutes(5) {
                Some(EntityStatus::InProgress)
            } else {
                Some(EntityStatus::Incomplete)
            }
        }
    }
}

impl DbToApi<ScopedVault> for api_wire_types::SuperAdminEntity {
    fn from_db(target: ScopedVault) -> Self {
        let ScopedVault {
            fp_id,
            is_live,
            tenant_id,
            ..
        } = target;
        Self {
            id: fp_id,
            is_live,
            tenant_id,
        }
    }
}
