use super::TenantVw;
use crate::errors::AssertionError;
use crate::utils::vault_wrapper::batch_execute_decrypt_requests;
use crate::utils::vault_wrapper::decrypt::EnclaveDecryptOperation;
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::DecryptUncheckedResult;
use crate::utils::vault_wrapper::Pii;
use crate::utils::vault_wrapper::VwDecryptRequest;
use crate::FpResult;
use crate::State;
use db::models::access_event::AccessEvent;
use db::models::access_event::NewAccessEventRow;
use db::models::audit_event::AuditEvent;
use db::models::audit_event::NewAuditEvent;
use db::models::data_lifetime::DataLifetime;
use db::models::document_data::DocumentData;
use db::models::insight_event::CreateInsightEvent;
use db::models::ob_configuration::IsLive;
use db::models::scoped_vault::ScopedVault;
use db::models::vault_data::VaultData;
use db::HasLifetime;
use itertools::Itertools;
use newtypes::output::Csv;
use newtypes::AccessEventKind;
use newtypes::AuditEventDetail;
use newtypes::AuditEventId;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeId;
use newtypes::DbActor;
use newtypes::DecryptionContext;
use newtypes::PiiJsonValue;
use newtypes::PiiString;
use newtypes::TenantId;
use std::collections::HashMap;

/// Represents a request to decrypt targets for a specific VaultWrapper instance. Use the key to
/// uniquely identify the VW
pub struct BulkDecryptReq<'a, T = Any> {
    pub vw: &'a TenantVw<T>,
    pub targets: Vec<EnclaveDecryptOperation>,
}

const EVENT_CREATE_BATCH_SIZE: usize = 500;

/// Represents all the info needed to make an access event during decryption
#[allow(clippy::large_enum_variant)]
pub enum DecryptAccessEventInfo {
    // Could use an Option<>, but this forces the caller to explicitly consent to NoAccessEvent
    AccessEvent {
        insight: CreateInsightEvent,
        reason: String,
        principal: DbActor,
        purpose: DecryptionContext,
    },
    NoAccessEvent,
}

pub type DecryptedData = HashMap<EnclaveDecryptOperation, PiiJsonValue>;

#[tracing::instrument(skip_all)]
pub async fn bulk_decrypt<'a, TKey, T>(
    state: &State,
    requests: HashMap<TKey, BulkDecryptReq<'a, T>>,
    // maybe unchecked too so it doesn't error if the user can't decrypt???
    // integration test for user with role that can't decrypt
    access_event: DecryptAccessEventInfo,
) -> FpResult<Vec<(TKey, DecryptedData)>>
where
    TKey: Eq + std::hash::Hash + 'static + Clone,
{
    let requests = requests
        .into_iter()
        .map(|(k, r)| -> FpResult<_> {
            let BulkDecryptReq { vw, targets } = r;
            let targets = r.vw.check_ob_config_access(targets)?;
            let req = BulkDecryptReq { vw, targets };
            Ok((k, req))
        })
        .collect::<FpResult<Vec<_>>>()?;

    let decrypt_requests = requests
        .iter()
        .flat_map(|(key, r)| {
            r.vw.decrypt_requests(r.targets.clone())
                .into_iter()
                .map(|result| (key.clone(), result))
        })
        .collect();
    let key_to_sv: HashMap<_, _> = requests
        .iter()
        .map(|(key, r)| (key.clone(), r.vw.scoped_vault.clone()))
        .collect();
    let targets = requests.iter().flat_map(|(_, r)| &r.targets).unique().collect();
    tracing::info!(targets=?Csv(targets), "Bulk decrypting, across potentially multiple VWs");

    let results = batch_execute_decrypt_requests(&state.enclave_client, decrypt_requests).await?;

    // Separate the results into access events and decrypted results
    let (access_events, decrypted_results): (Vec<_>, Vec<_>) = results
        .into_iter()
        .map(|(key, res)| -> FpResult<_> {
            let DecryptUncheckedResult::<PiiJsonValue> {
                decrypted_dis,
                results,
            } = res.map_to_piijsonvalues()?;
            let decrypted_dis = decrypted_dis.into_iter().map(|t| t.identifier).collect_vec();
            let sv = key_to_sv
                .get(&key)
                .ok_or(AssertionError("No ScopedVault for key"))?;
            let access_event = (sv.fp_id.clone(), decrypted_dis);
            let decrypted_result = (key, results);
            Ok((access_event, decrypted_result))
        })
        .collect::<FpResult<Vec<_>>>()?
        .into_iter()
        .unzip();

    let access_events = access_events.into_iter().into_group_map();
    let mut fp_id_to_sv: HashMap<_, _> = key_to_sv.into_values().map(|sv| (sv.fp_id.clone(), sv)).collect();

    // Bulk save all new access events in the DB. We'll use only one insight event for all of the
    // access events
    if let DecryptAccessEventInfo::AccessEvent {
        reason,
        principal,
        purpose: context,
        insight,
    } = access_event
    {
        state
            .db_pool
            .db_transaction(move |conn| -> FpResult<_> {
                let insight = insight.insert_with_conn(conn)?;

                let access_and_audit_events = access_events
                    .into_iter()
                    .map(|(fp_id, targets)| -> FpResult<_> {
                        let sv = fp_id_to_sv
                            .remove(&fp_id)
                            .ok_or(AssertionError("No ScopedVault for key"))?;
                        // Combine decrypts for one fp_id into a single access event
                        let targets: Vec<DataIdentifier> = targets.into_iter().flatten().unique().collect();
                        // NOTE: If we add any more fields to the access event, we might have to lower
                        // the chunk size below or we'll hit a max size for an insert statement.
                        let aeid = AuditEventId::generate();
                        let access_event = NewAccessEventRow {
                            id: aeid.clone().into_correlated_access_event_id(),
                            scoped_vault_id: sv.id.clone(),
                            tenant_id: sv.tenant_id.clone(),
                            is_live: sv.is_live,
                            // TODO: also store the transforms!
                            targets: targets.clone(),
                            insight_event_id: insight.id.clone(),
                            reason: Some(reason.clone()),
                            principal: principal.clone(),
                            kind: AccessEventKind::Decrypt,
                            purpose: context,
                        };

                        let audit_event = NewAuditEvent {
                            id: aeid,
                            tenant_id: sv.tenant_id,
                            principal_actor: principal.clone(),
                            insight_event_id: insight.id.clone(),
                            detail: AuditEventDetail::DecryptUserData {
                                is_live: sv.is_live,
                                scoped_vault_id: sv.id,
                                reason: reason.clone(),
                                context: Some(context),
                                decrypted_fields: targets,
                            },
                        };

                        Ok((access_event, audit_event))
                    })
                    .collect::<FpResult<Vec<_>>>()?;

                for chunk in access_and_audit_events
                    .into_iter()
                    .chunks(EVENT_CREATE_BATCH_SIZE)
                    .into_iter()
                {
                    let (access_events, audit_events) = chunk.into_iter().unzip();
                    AccessEvent::bulk_create(conn, access_events)?;
                    AuditEvent::bulk_create(conn, audit_events)?;
                }
                Ok(())
            })
            .await?;
    }

    Ok(decrypted_results)
}

pub struct MimeTypedPii {
    pub pii: Pii,
    // None if the PII is not a document.
    pub document_mime_type: Option<PiiString>,
}

/// Decrypt DLs for a tenant without checking permissions or creating audit logs.
#[tracing::instrument(skip_all)]
pub async fn bulk_decrypt_dls_unchecked(
    state: &State,
    tenant_id: &TenantId,
    is_live: IsLive,
    dls: &HashMap<DataLifetimeId, DataLifetime>,
) -> FpResult<HashMap<DataLifetimeId, MimeTypedPii>> {
    let tenant_id = tenant_id.clone();

    let dl_ids = dls.iter().map(|(_, dl)| dl.id.clone()).collect_vec();
    let sv_ids = dls
        .iter()
        .map(|(_, dl)| dl.scoped_vault_id.clone())
        .unique()
        .collect_vec();

    let (sv_vaults, vault_data_by_dl, document_data_by_dl) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            // Fetch Vaults and group by Scoped Vault ID.
            let sv_vaults = ScopedVault::bulk_get(conn, sv_ids.iter().collect_vec(), &tenant_id, is_live)?;

            // Fetch the vaulted data related to the data lifetimes.
            let vault_data_by_dl = VaultData::get_for(conn, &dl_ids)?
                .into_iter()
                .into_group_map_by(|d| d.lifetime_id.clone());
            let document_data_by_dl = DocumentData::get_for(conn, &dl_ids)?
                .into_iter()
                .into_group_map_by(|d| d.lifetime_id.clone());

            Ok((sv_vaults, vault_data_by_dl, document_data_by_dl))
        })
        .await?;

    let sv_vault_by_sv_id: HashMap<_, _> = sv_vaults
        .into_iter()
        .map(|(sv, vault)| (sv.id.clone(), (sv, vault)))
        .collect();


    let mut requests = vec![];
    let mut doc_mime_types_by_dl_id = HashMap::new();
    for (dl_id, dl) in dls.iter() {
        let (_, vault) = sv_vault_by_sv_id
            .get(&dl.scoped_vault_id)
            .ok_or(AssertionError("No vault fetched for DL"))?;

        let vault_data = vault_data_by_dl.get(&dl.id).into_iter().flatten();
        for vd in vault_data {
            let req = VwDecryptRequest(
                &vault.e_private_key,
                EnclaveDecryptOperation {
                    identifier: dl.kind.clone(),
                    transforms: vec![],
                },
                vd.data(),
            );
            requests.push((dl_id.clone(), req));
        }

        let document_data = document_data_by_dl.get(&dl.id).into_iter().flatten();
        for dd in document_data {
            let req = VwDecryptRequest(
                &vault.e_private_key,
                EnclaveDecryptOperation {
                    identifier: dl.kind.clone(),
                    transforms: vec![],
                },
                dd.data(),
            );
            requests.push((dl_id.clone(), req));

            doc_mime_types_by_dl_id.insert(dl_id.clone(), dd.mime_type.clone());
        }
    }

    let decrypted_batch = batch_execute_decrypt_requests(&state.enclave_client, requests).await?;

    let mut pii_by_dl = HashMap::new();
    for (dl_id, decrypt_result) in decrypted_batch {
        let mut decrypt_ops = decrypt_result.results.into_iter();

        if let Some((_, pii)) = decrypt_ops.next() {
            let pii = MimeTypedPii {
                pii,
                document_mime_type: doc_mime_types_by_dl_id.get(&dl_id).cloned(),
            };
            pii_by_dl.insert(dl_id, pii);
        } else {
            return AssertionError("Expected at least one decryption result per DL").into();
        }

        if decrypt_ops.next().is_some() {
            return AssertionError("Expected only one decryption result per DL").into();
        }
    }

    Ok(pii_by_dl)
}
