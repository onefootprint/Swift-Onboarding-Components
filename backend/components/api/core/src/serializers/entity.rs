use crate::{
    auth::tenant::TenantAuth,
    utils::{
        db2api::DbToApi,
        vault_wrapper::{Any, DecryptedData, TenantVw},
    },
};
use api_wire_types::{EntityAttribute, EntityStatus};
use chrono::{Duration, Utc};
use db::models::{
    scoped_vault::{ScopedVault, SerializableEntity},
    vault::Vault,
};
use itertools::Itertools;
use newtypes::OnboardingStatus;
use std::collections::HashMap;

pub type EntityDetail<'a> = (
    SerializableEntity,
    &'a TenantVw<Any>,
    &'a Box<dyn TenantAuth>,
    DecryptedData,
);

impl<'a> DbToApi<EntityDetail<'a>> for api_wire_types::Entity {
    fn from_db((entity, vw, auth, decrypted_attrs): EntityDetail) -> Self {
        let (sv, watchlist_check, mrs, wfs) = entity;

        // Don't require any permissions to decrypt plaintext attributes - always show them
        let plaintext_attrs = vw
            .populated_dis()
            .into_iter()
            .filter(|di| di.store_plaintext())
            .flat_map(|di| vw.get_p_data(di.clone()).map(|p_data| (di, p_data.clone())))
            .map(|(di, d)| (di.into(), d));
        let decrypted_attrs = decrypted_attrs
            .into_iter()
            .filter_map(|(op, d)| d.to_piistring().ok().map(|d| (op, d)));
        let mut attribute_values: HashMap<_, _> = plaintext_attrs.chain(decrypted_attrs).collect();

        // Assemble all metadata and possible decrypted values for each DI in the vault
        let data = vw
            .get_visible_populated_fields()
            .into_iter()
            .filter_map(|di| -> Option<_> {
                let lifetime = vw.get_lifetime(di.clone())?;
                // To be decryptable, two conditions must be met
                // - The tenant must be able to decrypt the attribute (via ob config permissions)
                // - The authed user principal at the tenant must be able to decrypt the attribute (via IAM)
                let can_decrypt = vw.tenant_can_decrypt(di.clone()) && auth.actor_can_decrypt(di.clone());
                let value = attribute_values.remove(&di.clone().into());
                let transforms = attribute_values
                    .iter()
                    .filter(|(op, _)| op.identifier == di)
                    // TODO this will display incorrectly if there are multiple transforms.
                    // But, nothing using this code path will provide multiple transforms today
                    .filter_map(|(op, v)| op.transforms.first().map(|t| (t.clone(), v.clone())))
                    .collect();
                let attribute = EntityAttribute {
                    identifier: di,
                    source: lifetime.source,
                    is_decryptable: can_decrypt,
                    value,
                    transforms,
                };
                Some(attribute)
            })
            .collect_vec();

        //
        // All of these are derivative of the much more descriptive `data`.
        // TODO: Remove these when the client has stopped reading them
        //
        let attributes = data.iter().map(|a| a.identifier.clone()).collect();
        let decryptable_attributes = data
            .iter()
            .filter(|a| a.is_decryptable)
            .map(|a| a.identifier.clone())
            .collect();
        use newtypes::{DataIdentifier::Id, IdentityDataKind as IDK};
        let decrypted_attributes = data
            .iter()
            // Don't show the decrypted first name value even though we have it
            // This will cause the client to start showing the first name decrypted, which will
            // look strange before the dashboard has been updated to show the last initial too
            .filter(|a| !matches!(a.identifier, Id(IDK::FirstName)))
            .filter_map(|a| a.value.as_ref().map(|v| (a.identifier.clone(), v.clone())))
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
            status,
            insight_event: insight_event.map(api_wire_types::InsightEvent::from_db),
            requires_manual_review,
            is_created_via_api,
            data,

            // TODO deprecate all of these
            attributes,
            decrypted_attributes,
            decryptable_attributes,
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
