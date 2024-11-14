use crate::errors::{DryRunResult, DryRunResultTrait, ValidationError};
use crate::utils::vault_wrapper::{
    Any, PieceOfData, PrefillData, TenantVw, ValidatedDataRequest, VaultWrapper,
};
use crate::{errors::ApiResult, State};
use chrono::Duration;
use db::models::contact_info::ContactInfo;
use db::models::data_lifetime::{DataLifetime, NewDataLifetime};
use db::models::fingerprint::Fingerprint;
use db::models::scoped_vault::ScopedVault;
use db::models::user_timeline::NewUserTimeline;
use db::models::vault_data::{NewVaultData, NewVaultDataRow, VaultData};
use db::models::workflow::Workflow;
use db::{DbError, DbResult, TxnPgConn};
use db_schema::schema::{data_lifetime, fingerprint, scoped_vault, user_timeline, vault, vault_data};
use diesel::dsl::{count, not};
use diesel::prelude::*;
use itertools::Itertools;
use newtypes::fingerprinter::GlobalFingerprintKind;
use newtypes::output::Csv;
use newtypes::{
    CollectedDataOption, DataCollectedInfo, DataIdentifier, DataLifetimeSource, DbUserTimelineEvent,
    FingerprintScopeKind, ScopedVaultId, VaultId,
};
use std::collections::{HashMap, HashSet};

#[tracing::instrument(skip_all)]
pub async fn run(
    state: &State,
    vault_ids: Option<Vec<VaultId>>,
    skip_vault_ids: Option<Vec<VaultId>>,
    is_live: bool,
    dry_run: bool,
    limit: usize,
) -> ApiResult<Vec<(VaultId, Vec<ScopedVaultId>)>> {
    // Gather the vaults that have multiple scoped_vaults
    let vault_ids = state
        .db_query(move |conn| -> ApiResult<_> {
            let svs_with_prefill_data = data_lifetime::table
                .filter(data_lifetime::source.eq(DataLifetimeSource::Prefill))
                .select(data_lifetime::scoped_vault_id);
            let mut query = scoped_vault::table
                .filter(scoped_vault::is_live.eq(is_live))
                // Filter out SVs that already have prefill data
                .filter(not(scoped_vault::id.eq_any(svs_with_prefill_data)))
                .select(scoped_vault::vault_id)
                // Only get vaults that have more than one scoped vault
                .group_by(scoped_vault::vault_id)
                .having(count(scoped_vault::id).gt(1))
                .order_by(scoped_vault::vault_id)
                .into_boxed();
            if let Some(vault_ids) = vault_ids {
                query = query.filter(scoped_vault::vault_id.eq_any(vault_ids))
            }
            if let Some(skip_vault_ids) = skip_vault_ids {
                query = query.filter(not(scoped_vault::vault_id.eq_any(skip_vault_ids)))
            }
            let vault_ids: Vec<VaultId> = query.get_results(conn).map_err(DbError::from)?;
            Ok(vault_ids)
        })
        .await?;
    tracing::info!(num_vaults=%vault_ids.len(), "Found vaults to maybe backfill");
    let mut rewritten = vec![];
    // Backfill each user in a separate transaction so we don't have a large, long-running txn
    // accumulating locks
    for vault_id in vault_ids {
        let rewritten_svs = backfill_portable_data_for_vault(state, vault_id.clone(), dry_run).await?;
        if !rewritten_svs.is_empty() {
            rewritten.push((vault_id, rewritten_svs))
        }
        if rewritten.len() > limit {
            break;
        }
    }
    Ok(rewritten)
}

#[tracing::instrument(skip(state))]
async fn backfill_portable_data_for_vault(
    state: &State,
    vault_id: VaultId,
    dry_run: bool,
) -> ApiResult<Vec<ScopedVaultId>> {
    let s = state.clone();
    let result = state
        .db_transaction(move |conn| -> DryRunResult<_> {
            // Lock the vault and scoped vaults we will be updating
            vault::table
                .filter(vault::id.eq(&vault_id))
                .for_no_key_update()
                .execute(conn.conn())
                .map_err(DbError::from)?;
            let svs = scoped_vault::table
                .filter(scoped_vault::vault_id.eq(&vault_id))
                .for_no_key_update()
                .get_results(conn.conn())
                .map_err(DbError::from)?;
            let mut rewritten = vec![];
            for sv in svs.iter() {
                if backfill_portable_data_for_sv(&s, conn, sv, &svs)? {
                    rewritten.push(sv.id.clone())
                }
            }

            if !rewritten.is_empty() {
                // Mark all "portable" timeline events as non-portable. This will hide the weird dashboard
                // experience that shows collapsed timeline events from other tenants
                diesel::update(user_timeline::table)
                    .filter(user_timeline::vault_id.eq(&vault_id))
                    .set(user_timeline::is_portable.eq(false))
                    .execute(conn.conn())
                    .map_err(DbError::from)?;
            }

            DryRunResult::ok_or_rollback(rewritten, dry_run)
        })
        .await;
    result.value()
}

#[tracing::instrument(skip_all, fields(sv_id=%sv.id))]
fn backfill_portable_data_for_sv(
    state: &State,
    conn: &mut TxnPgConn,
    sv: &ScopedVault,
    all_svs: &[ScopedVault],
) -> ApiResult<bool> {
    let vw: TenantVw<Any> = VaultWrapper::build_for_tenant(conn, &sv.id)?;
    let visible_data_from_other_tenants = vw
        .populated_dis()
        .into_iter()
        .filter(|di| vw.can_see(di.clone()))
        // Note: we're only looking if the most recent piece of data for this key was added by
        // another tenant.
        // In reality, this will create a slightly different view for the tenant _if_ the one-click
        // data was replaced by more recent data
        .filter_map(|di| vw.data(&di))
        .filter(|d| d.lifetime.scoped_vault_id != sv.id)
        .collect_vec();

    if visible_data_from_other_tenants.is_empty() {
        tracing::info!("No data to rewrite");
        return Ok(false);
    }

    // Before we change any data, build a view of all VWs for all tenants for this single vault
    let original_vws = build_all_vws(conn, all_svs)?;

    //
    // Backfill
    //

    // Similar to our normal prefill data codepath, here we generate prefill data off of what's
    // currently visible to the tenant but was added by another tenant
    let prefill_data = visible_data_from_other_tenants
        .iter()
        .filter_map(|d| {
            if let PieceOfData::Vd(d) = &d.data {
                Some(d)
            } else {
                None
            }
        })
        .collect_vec();
    let prefill_data_fut =
        vw.inner_get_data_to_prefill(&state.enclave_client, &state.db_pool, sv, prefill_data);
    // We normally don't like async in a transaction, but for the sake of the migration, we'll do it
    let prefill_data = futures::executor::block_on(prefill_data_fut)?;

    // Then, save that prefill data into data that is owned by the tenant.
    // This basically reimplements WriteableVw::prefill_portable_data with some custom behavior
    // for this backfill
    let PrefillData {
        data,
        fingerprints,
        old_ci,
        ..
    } = prefill_data;
    tracing::info!(dis=%Csv::from(data.iter().map(|d| d.kind.clone()).collect_vec()), num_fingerprints=%fingerprints.len(), num_old_ci=%old_ci.len(), "Saving data");
    let mut di_to_old_lifetime: HashMap<_, _> = visible_data_from_other_tenants
        .iter()
        .map(|d| (d.lifetime.kind.clone(), &d.lifetime))
        .collect();
    // Make each Vd individually with its seqno set to the seqno at which the data was portablized
    // at the source tenant.
    let vd = data
        .into_iter()
        .map(|d| -> ApiResult<_> {
            let lifetime = di_to_old_lifetime
                .remove(&d.kind)
                .ok_or(ValidationError(&format!("No lifetime for {}", d.kind)))?;
            Ok((d, lifetime))
        })
        .collect::<ApiResult<Vec<_>>>()?
        .into_iter()
        .map(|(d, lifetime)| create_backfilled_prefill_vd(conn, sv, d, lifetime))
        .collect::<ApiResult<Vec<_>>>()?;
    ValidatedDataRequest::inner_save(conn, &vd, fingerprints.into_iter().collect(), old_ci)?;

    // Create a timeline event showing data was prefilled
    create_prefill_timeline_event(conn, sv, vd.into_iter().map(|d| d.kind).collect())?;

    //
    // Assertions
    //

    // Rebuild all VWs for this vault across all tenants and make sure the visible data in the VW
    // hasn't changed
    let new_vws = build_all_vws(conn, all_svs)?;
    for (old, new) in original_vws.into_iter().zip(new_vws) {
        compare_vws(conn, old, new, &sv.id, false)?;
    }

    // For good measure, also use the newer logic to build the VW with only data owned by the SV
    // (that we're not yet using in prod) and make sure the data is the same
    let new_vw: TenantVw<Any> = VaultWrapper::build_owned(conn, &sv.id)?;

    // And, check that all fingerprintable DIs have the correctly-scoped fingerprints
    let lifetime_ids = new_vw
        .populated_dis()
        .into_iter()
        .filter_map(|di| new_vw.get_lifetime(di))
        .map(|l| &l.id)
        .collect_vec();
    let kind_to_fp_scopes = fingerprint::table
        .inner_join(data_lifetime::table)
        .filter(data_lifetime::id.eq_any(lifetime_ids))
        .get_results::<(Fingerprint, DataLifetime)>(conn.conn())
        .map_err(DbError::from)?
        .into_iter()
        .map(|(fp, dl)| (dl.kind, fp.scope))
        .into_group_map();
    let prefilled_dis = new_vw
        .populated_dis()
        .into_iter()
        .filter_map(|di| new_vw.get_lifetime(di))
        .filter(|l| l.source == DataLifetimeSource::Prefill)
        .map(|l| l.kind.clone());
    for di in prefilled_dis {
        // For each DI that was prefilled into this scoped vault, it should have all fingerprints
        // backfilled
        let fp_scopes: HashSet<_> = kind_to_fp_scopes
            .get(&di)
            .cloned()
            .unwrap_or_default()
            .into_iter()
            .collect();
        let expected_fp_scopes: HashSet<_> = vec![
            di.is_fingerprintable().then_some(FingerprintScopeKind::Tenant),
            GlobalFingerprintKind::try_from(&di)
                .ok()
                .map(|_| FingerprintScopeKind::Global),
        ]
        .into_iter()
        .flatten()
        .collect();
        if fp_scopes != expected_fp_scopes {
            return Err(ValidationError(&format!(
                "FP scopes don't match for {}. Actual: {:?}, Expected: {:?}",
                di, fp_scopes, expected_fp_scopes
            ))
            .into());
        }
    }

    compare_vws(conn, vw, new_vw, &sv.id, true)?;

    Ok(true)
}

#[tracing::instrument(skip(conn, old, new), fields(sv_id=%old.scoped_vault.id))]
fn compare_vws(
    conn: &mut TxnPgConn,
    old: TenantVw<Any>,
    new: TenantVw<Any>,
    target_sv_id: &ScopedVaultId,
    // Just for tracing
    _build_owned: bool,
) -> ApiResult<()> {
    if old.scoped_vault.id != new.scoped_vault.id {
        return Err(ValidationError("SV id doesn't match'").into());
    }
    let old_dis: HashSet<_> = old
        .populated_dis()
        .into_iter()
        .filter(|di| old.can_see(di.clone()))
        .collect();
    let new_dis: HashSet<_> = new
        .populated_dis()
        .into_iter()
        .filter(|di| new.can_see(di.clone()))
        .collect();
    if old_dis != new_dis {
        return Err(ValidationError(&format!(
            "Visible DIs changed, old: {:?}, new: {:?}",
            old_dis, new_dis,
        ))
        .into());
    }
    for di in old_dis {
        let old_data = old.get(di.clone()).ok_or(ValidationError("Old VW missing DI"))?;
        let new_data = new.get(di.clone()).ok_or(ValidationError("New VW missing DI"))?;
        if old_data.data() != new_data.data() {
            return Err(ValidationError(&format!(
                "Data doesn't match for {:?}. Old: {:?}, new: {:?}",
                di,
                old_data.data(),
                new_data.data()
            ))
            .into());
        }
        let old_dl = old
            .get_lifetime(di.clone())
            .ok_or(ValidationError("missing old lifetime"))?;
        let new_dl = new
            .get_lifetime(di)
            .ok_or(ValidationError("missing new lifetime"))?;
        if &old.scoped_vault.id == target_sv_id {
            // This is the SV whose data we rewrote - add some extra assertions about the data that
            // was rewritten
            if old_dl.scoped_vault_id != old.scoped_vault.id {
                // This is a DL that belonged to another SV in the old VW, so we expect that we
                // have rewritten it
                if new_dl.id == old_dl.id {
                    return Err(ValidationError("Expected DL rewrite").into());
                }
                // We should have prefilled this data
                if Some(new_dl.created_seqno) != old_dl.portablized_seqno {
                    return Err(ValidationError("Target VW created seqno mismatch").into());
                }
                if Some(new_dl.created_at) != old_dl.portablized_at {
                    return Err(ValidationError("Target VW created at mismatch").into());
                }
                if new_dl.source != DataLifetimeSource::Prefill {
                    return Err(ValidationError("Incorrect source on prefill data").into());
                }
            }
            if &new_dl.scoped_vault_id != target_sv_id {
                return Err(ValidationError("New VW has a DL that wasn't added by the current SV").into());
            }
        } else {
            // For SV whose VWs we did not rewrite, assert that the DLs didn't change one bit
            if old_dl.id != new_dl.id {
                return Err(ValidationError("Non-target VW had DL change").into());
            }
        }
    }
    // Compare that each CI's verification status is still the same
    let mut get_ci = |vw: TenantVw<Any>| -> DbResult<HashSet<(DataIdentifier, bool, bool)>> {
        Ok(vw
            .populated_dis()
            .into_iter()
            .filter(|di| di.is_contact_info())
            .filter_map(|di| vw.get_lifetime(di))
            .map(|l| ContactInfo::get(conn, &l.id).map(|ci| (l.kind.clone(), ci)))
            .collect::<DbResult<Vec<_>>>()?
            .into_iter()
            .map(|(di, ci)| (di, ci.is_otp_verified, ci.is_verified))
            .collect())
    };
    let old_ci = get_ci(old)?;
    let new_ci = get_ci(new)?;
    if old_ci != new_ci {
        return Err(ValidationError(&format!(
            "Contact info doesn't match: old: {:?}, new: {:?}",
            old_ci, new_ci,
        ))
        .into());
    }

    Ok(())
}

/// Instead of using the existing VaultData::bulk_create, a custom method to create a new DL and VD
/// for the prefill data where we use the old_lifetime's portablized seqno as the new lifetime's
/// created_seqno
fn create_backfilled_prefill_vd(
    conn: &mut TxnPgConn,
    sv: &ScopedVault,
    d: NewVaultData,
    old_lifetime: &DataLifetime,
) -> ApiResult<VaultData> {
    let source = DataLifetimeSource::Prefill;
    let seqno = old_lifetime
        .portablized_seqno
        .ok_or(ValidationError(&format!("No portablized_seqno for {}", d.kind)))?;
    let timestamp = old_lifetime
        .portablized_at
        .ok_or(ValidationError(&format!("No portablized_at for {}", d.kind)))?;
    // Some validation normally done when making a VaultData
    if d.kind.store_plaintext() != d.p_data.is_some() {
        return Err(ValidationError("Invalid plaintext").into());
    }
    if d.kind.storage_type() != newtypes::StorageType::VaultData {
        return Err(ValidationError("Invalid storage type").into());
    }
    let new_dl = NewDataLifetime {
        vault_id: sv.vault_id.clone(),
        scoped_vault_id: sv.id.clone(),
        // We'll use the portablized timestamp and seqno from the origin data here
        // Normally, we'll set the seqno of the prefill data to the seqno at which the new one-click
        // onboarding started, but we can't compute that... so, to be safe, set it to the portablized seqno
        created_at: timestamp,
        created_seqno: seqno,
        kind: d.kind.clone(),
        source,
        actor: None,
        origin_id: d.origin_id.clone(),
    };
    let dl = diesel::insert_into(data_lifetime::table)
        .values(new_dl)
        .get_result::<DataLifetime>(conn.conn())
        .map_err(DbError::from)?;
    let new_vd = NewVaultDataRow {
        lifetime_id: dl.id,
        kind: d.kind,
        e_data: d.e_data,
        p_data: d.p_data,
        format: d.format,
    };
    let vd: VaultData = diesel::insert_into(vault_data::table)
        .values(new_vd)
        .get_result(conn.conn())
        .map_err(DbError::from)?;
    tracing::info!(id=%vd.id, kind=%vd.kind, old_lifetime_id=%old_lifetime.id, "Created vd");
    Ok(vd)
}

/// Create a timeline event, specifically at the time that the onboarding workflow was created,
/// that shows prefill data being added to the vault
#[tracing::instrument(skip_all, fields(dis=%Csv::from(dis.clone())))]
fn create_prefill_timeline_event(
    conn: &mut TxnPgConn,
    sv: &ScopedVault,
    dis: Vec<DataIdentifier>,
) -> ApiResult<()> {
    let wf = Workflow::list(conn, &sv.id)?
        .into_iter()
        .min_by_key(|wf| wf.created_at)
        .ok_or(ValidationError("User with portable data that has no wf"))?;
    let event = DataCollectedInfo {
        attributes: CollectedDataOption::list_from(dis.clone()).into_iter().collect(),
        targets: dis,
        actor: None,
        is_prefill: true,
    };
    let event = DbUserTimelineEvent::from(event);
    let new = NewUserTimeline {
        event_kind: (&event).into(),
        event,
        scoped_vault_id: sv.id.clone(),
        vault_id: sv.vault_id.clone(),
        // Use the timestamp at which the workflow was created to mimic current behavior where
        // prefill data is added when the first workflow is made.
        // Add a litle buffer so the timeline event shows after the onboarding started event
        timestamp: wf.created_at + Duration::milliseconds(10),
        is_portable: false,
    };
    diesel::insert_into(user_timeline::table)
        .values(new)
        .execute(conn.conn())
        .map_err(DbError::from)?;
    Ok(())
}

#[tracing::instrument(skip_all, fields(num_svs=%all_svs.len()))]
fn build_all_vws(conn: &mut TxnPgConn, all_svs: &[ScopedVault]) -> ApiResult<Vec<TenantVw<Any>>> {
    let results = all_svs
        .iter()
        .map(|sv| VaultWrapper::build_for_tenant(conn, &sv.id))
        .collect::<ApiResult<Vec<TenantVw<Any>>>>()?
        .into_iter()
        .sorted_by_key(|vw| vw.scoped_vault.id.clone())
        .collect();
    Ok(results)
}
