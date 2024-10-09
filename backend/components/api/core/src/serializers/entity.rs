use crate::auth::tenant::TenantAuth;
use crate::auth::CanDecrypt;
use crate::auth::IsGuardMet;
use crate::utils::db2api::DbToApi;
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::DecryptedData;
use crate::utils::vault_wrapper::TenantVw;
use api_wire_types::DataAttributeKind;
use api_wire_types::EntityAttribute;
use api_wire_types::EntityStatus;
use chrono::Duration;
use chrono::Utc;
use db::models::insight_event::InsightEvent;
use db::models::scoped_vault::ScopedVault;
use db::models::scoped_vault::SerializableEntity;
use db::models::vault::Vault;
use db::models::workflow::Workflow;
use db::VaultedData;
use itertools::Itertools;
use newtypes::OnboardingStatus;
use newtypes::TenantScope;
use std::collections::HashMap;

pub type EntityDetail<'a> = (
    SerializableEntity,
    &'a TenantVw<Any>,
    &'a Box<dyn TenantAuth>,
    DecryptedData,
);

impl<'a> DbToApi<EntityDetail<'a>> for api_wire_types::Entity {
    fn from_db((entity, vw, auth, decrypted_attrs): EntityDetail) -> Self {
        let (sv, watchlist_check, wr, label, mrs, wfs, tags) = entity;

        let data = entity_attributes(vw, &auth.scopes(), decrypted_attrs);

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
        use newtypes::DataIdentifier::Id;
        use newtypes::IdentityDataKind as IDK;
        let decrypted_attributes = data
            .iter()
            // Don't show the decrypted first name value even though we have it
            // This will cause the client to start showing the first name decrypted, which will
            // look strange before the dashboard has been updated to show the last initial too
            .filter(|a| !matches!(a.identifier, Id(IDK::FirstName)))
            .filter_map(|a| a.value.as_ref().map(|v| (a.identifier.clone(), v.clone())))
            .collect();

        let Vault {
            id: v_id,
            is_portable,
            is_identifiable,
            kind,
            sandbox_id,
            is_created_via_api,
            ..
        } = vw.vault.clone();

        let status = status_from_sv(&sv);

        let ScopedVault {
            id: sv_id,
            fp_id,
            start_timestamp,
            ordering_id,
            external_id,
            last_activity_at,
            ..
        } = sv;

        let requires_manual_review = !mrs.is_empty();
        let manual_review_kinds = mrs.iter().map(|mr| mr.kind).collect();

        let workflows = wfs
            .into_iter()
            .map(api_wire_types::EntityWorkflow::from_db)
            .collect_vec();

        api_wire_types::Entity {
            sv_id: auth.is_firm_employee().then_some(sv_id),
            v_id: auth.is_firm_employee().then_some(v_id),
            id: fp_id,
            sandbox_id,
            is_portable,
            is_identifiable,
            kind,
            start_timestamp,
            last_activity_at,
            watchlist_check: watchlist_check.map(api_wire_types::WatchlistCheck::from_db),
            ordering_id,
            status,
            requires_manual_review,
            manual_review_kinds,
            is_created_via_api,
            data,
            workflows,
            has_outstanding_workflow_request: wr.is_some(),
            label: label.map(|l| l.kind),
            tags: tags.into_iter().map(api_wire_types::UserTag::from_db).collect(),

            // TODO deprecate all of these
            attributes,
            decrypted_attributes,
            decryptable_attributes,
            external_id,
        }
    }
}

pub fn status_from_sv(sv: &ScopedVault) -> EntityStatus {
    match sv.status {
        OnboardingStatus::None => EntityStatus::None,
        OnboardingStatus::Pass => EntityStatus::Pass,
        OnboardingStatus::Fail => EntityStatus::Fail,
        OnboardingStatus::Pending => EntityStatus::Pending,
        OnboardingStatus::Incomplete => {
            if Utc::now() - sv.last_heartbeat_at < Duration::minutes(5) {
                EntityStatus::InProgress
            } else {
                EntityStatus::Incomplete
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

impl DbToApi<(Workflow, Option<InsightEvent>)> for api_wire_types::EntityWorkflow {
    fn from_db((wf, insight_event): (Workflow, Option<InsightEvent>)) -> Self {
        let Workflow {
            status,
            created_at,
            ob_configuration_id,
            ..
        } = wf;
        let insight_event = insight_event.map(api_wire_types::InsightEvent::from_db);
        Self {
            status,
            created_at,
            playbook_id: ob_configuration_id,
            insight_event,
        }
    }
}

#[allow(clippy::borrowed_box)]
pub fn entity_attributes<'a>(
    vw: &'a TenantVw<Any>,
    scopes: &'a [TenantScope],
    decrypted_data: DecryptedData,
) -> Vec<EntityAttribute> {
    // Don't require any permissions to decrypt plaintext attributes - always show them
    let plaintext_attrs = vw
        .populated_dis()
        .into_iter()
        .filter(|di| di.store_plaintext())
        .flat_map(|di| vw.get_p_data(&di).map(|p_data| (di, p_data.clone())))
        .map(|(di, d)| (di.into(), d));
    let decrypted_attrs = decrypted_data
        .into_iter()
        .filter_map(|(op, d)| d.to_piistring().ok().map(|d| (op, d)));
    let mut attribute_values: HashMap<_, _> = plaintext_attrs.chain(decrypted_attrs).collect();

    // Assemble all metadata and possible decrypted values for each DI in the vault
    vw.populated_dis()
        .into_iter()
        .filter_map(|di| -> Option<_> {
            let lifetime = vw.get_lifetime(&di)?;
            // To be decryptable, two conditions must be met
            // - The tenant must be able to decrypt the attribute (via ob config permissions)
            // - The authed user principal at the tenant must be able to decrypt the attribute (via IAM)
            let can_decrypt =
                vw.tenant_can_decrypt(di.clone()) && CanDecrypt::single(di.clone()).is_met(scopes);

            let value = attribute_values.remove(&di.clone().into());
            let transforms = attribute_values
            .iter()
            .filter(|(op, _)| op.identifier == di)
            // TODO this will display incorrectly if there are multiple transforms.
            // But, nothing using this code path will provide multiple transforms today
            .filter_map(|(op, v)| op.transforms.first().map(|t| (t.clone(), v.clone())))
            .collect();

            let data_kind = match vw.get(&di)?.data() {
                VaultedData::Sealed(..) | VaultedData::NonPrivate(..) => DataAttributeKind::VaultData,
                VaultedData::LargeSealed(..) => DataAttributeKind::DocumentData,
            };

            let attribute = EntityAttribute {
                identifier: di,
                source: lifetime.source,
                is_decryptable: can_decrypt,
                value,
                data_kind,
                transforms,
            };
            Some(attribute)
        })
        .collect_vec()
}
