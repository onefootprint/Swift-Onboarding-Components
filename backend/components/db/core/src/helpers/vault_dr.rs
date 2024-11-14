use crate::models::data_lifetime::DataLifetime;
use crate::models::ob_configuration::IsLive;
use crate::models::scoped_vault_version::ScopedVaultVersion;
use crate::models::vault_dr::VaultDrConfig;
use crate::DbError;
use crate::DbResult;
use crate::PgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::data_lifetime;
use db_schema::schema::scoped_vault;
use db_schema::schema::scoped_vault_version;
use db_schema::schema::vault_dr_blob;
use db_schema::schema::vault_dr_config;
use diesel::prelude::*;
use diesel::QueryDsl;
use itertools::Itertools;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeSeqno;
use newtypes::FpId;
use newtypes::ScopedVaultId;
use newtypes::ScopedVaultVersionId;
use newtypes::TenantId;
use newtypes::VaultDrConfigId;
use std::collections::HashMap;

#[tracing::instrument(skip_all, fields(
    tenant_id = %tenant_id,
    is_live = %is_live,
    config_id = %config_id,
    batch_size = %batch_size,
    fp_id_filter = ?fp_id_filter,
))]
pub fn get_scoped_vault_version_batch(
    conn: &mut PgConn,
    tenant_id: &TenantId,
    is_live: IsLive,
    config_id: &VaultDrConfigId,
    batch_size: usize,
    fp_id_filter: Option<Vec<FpId>>,
) -> DbResult<Vec<ScopedVaultVersion>> {
    // Implementation is based on GetVaultVersionBatch in
    // backend/formal_methods/vault_disaster_recovery/vdr.tla

    // backed_up_by_vdr_config_id serves as the progress marker for the worker, indicating that
    // all blobs/DLs and manifests/SVVs with seqnos <= this SVV have been backed up. The
    // correctness of these queries relies on the fact that there is at most one active VDR
    // config ID per (tenant_id, is_live) pair.
    //
    // The basic approach is to get the seqno-sorted & row-count-limited batches of two
    // complimentary and exhaustive sets of SVVs for the current VDR config:
    // a) SVVs for the tenant/is_live with backed_up_by_vdr_config_id == NULL
    // b) SVVs for the tenant/is_live with a backed_up_by_vdr_config_id equal to a deactivated
    //    config ID for the tenant_id/is_live.
    // and then union those together, sort the combined result by seqno, and limit again to the
    // batch size.
    //
    // Ordering by seqno here means we process ScopedVaultVersions *for each ScopedVault* in order
    // of creation. There is no implied global ordering.
    //
    // For a SVV to be considered complete, all DLs/blobs for the vault <= svv.seqno must be
    // written. If we choose SVVs with prerequisites that haven't been written and aren't present
    // in the batch, the SVVs in each batch will never be considered complete. Iterating in seqno
    // order ensures that we make progress.
    //
    // However, if a seqno is skipped due to out-of-order or delayed API commits (see
    // VaultApiInstance comment block), we still don't lose consistency in VDR. The SVV will be
    // completed in a later batch. With read-committed isolation in Postgres, we can be sure that
    // if a SVV is skipped in one batch, there will be no SVV for the same vault with a greater
    // seqno in the same batch. This is because a SELECT sees a snapshot of the database as of the
    // instant the query begins to run. In other words, by sorting the SVVs by seqno, we can be
    // sure that for all vaults present in the batch, those SVVs are the minimum non-backed up SVVs
    // for those vaults.
    //
    // In summary, ordering by seqno is important to ensure we make progress, but the ordering does
    // not affect correctness.
    //
    // Sorting by seqnos here does *NOT* imply that the batch represents the global minimum seqnos
    // for un-backed up SVVs, as inflight transactions may commit SVVs with lesser seqnos.


    // It's much faster to filter on a small set of known VDR config IDs than to filter on != the
    // current config ID. Pre-fetch the deactivated VDR config IDs that could be present on SVVs
    // for the current tenant/is_live.
    //
    // Doing this using a subquery or join is far slower than pre-fetching the configs.
    let deactivated_vdr_config_ids: Vec<VaultDrConfigId> = vault_dr_config::table
        .filter(vault_dr_config::tenant_id.eq(tenant_id))
        .filter(vault_dr_config::is_live.eq(is_live))
        .filter(vault_dr_config::deactivated_at.is_not_null())
        .select(vault_dr_config::id)
        .load(conn)?;

    let base_batch_query = scoped_vault_version::table
        .filter(scoped_vault_version::tenant_id.eq(tenant_id))
        .filter(scoped_vault_version::is_live.eq(is_live))
        .select(ScopedVaultVersion::as_select())
        .order(scoped_vault_version::seqno)
        .limit(batch_size as i64);

    let mut batch_vdr_config_is_null = base_batch_query
        .filter(scoped_vault_version::backed_up_by_vdr_config_id.is_null())
        .into_boxed();
    let mut batch_vdr_config_is_deactivated = base_batch_query
        .filter(scoped_vault_version::backed_up_by_vdr_config_id.is_not_null())
        .filter(scoped_vault_version::backed_up_by_vdr_config_id.eq_any(deactivated_vdr_config_ids))
        .into_boxed();

    // It's valid to filter by sv_ids/fp_ids since the worker does not rely on any global ordering of
    // processed SVVs, only the ordering of the subsequences of SVVs for each scoped vault.
    // Filtering by fp_id selects SVV subsequences for the corresponding scoped vaults.
    if let Some(fp_ids) = fp_id_filter {
        let sv_ids: Vec<ScopedVaultId> = scoped_vault::table
            .filter(scoped_vault::fp_id.eq_any(fp_ids))
            .select(scoped_vault::id)
            .load(conn)?;

        batch_vdr_config_is_null =
            batch_vdr_config_is_null.filter(scoped_vault_version::scoped_vault_id.eq_any(sv_ids.clone()));
        batch_vdr_config_is_deactivated =
            batch_vdr_config_is_deactivated.filter(scoped_vault_version::scoped_vault_id.eq_any(sv_ids));
    }

    // Until https://github.com/diesel-rs/diesel/pull/4245 is merged, we can't order and limit on
    // the union directly, so we have to do it client side. The union has at most 2 * batch_size
    // rows and in practice only batch_size rows, since batch_vdr_config_is_deactivated will
    // usually be empty except for right after re-enrolling.
    let combined_batches = batch_vdr_config_is_null
        .union(batch_vdr_config_is_deactivated)
        .load(conn)?;

    let svv_batch = combined_batches
        .into_iter()
        .sorted_by_key(|svv| svv.seqno)
        .take(batch_size)
        .collect();

    Ok(svv_batch)
}

#[tracing::instrument(skip_all, fields(
    tenant_id = %tenant_id,
    is_live = %is_live,
    config_id = %config_id,
    batch_size = %batch_size,
))]
pub fn get_dl_batch_for_svv_batch(
    conn: &mut PgConn,
    tenant_id: &TenantId,
    is_live: IsLive,
    config_id: &VaultDrConfigId,
    svv_batch: &[ScopedVaultVersion],
    batch_size: usize,
) -> DbResult<Vec<DataLifetime>> {
    // Implementation is based on GetDlBatch in
    // backend/formal_methods/vault_disaster_recovery/vdr.tla

    let svv_ids = svv_batch.iter().map(|svv| &svv.id).collect_vec();

    // Select DLs created at or before the svv_batch versions. Normally, it's only necessary to
    // select DLs equal to a svv_batch seqnos, but some backfills may create DLs retroactively at an
    // earlier scoped vault version. We need to back up these retroactively added DLs as well for
    // the SVV to be completely complete in get_complete_svvs_for_svv_batch.
    //
    // The sort order *doesn't* matter here since all blobs associated with the svv_batch must be
    // written before the manifests are eligible to be written. If the batch_size isn't large
    // enough to finish backing up all DLs associated with the svv_batch, then unfinished SVVs will
    // be present in the next batch, and the DL batch will continue to make progress.
    //
    // We sort by created_seqno for determinism, to assist with testing.

    // Joining through svvs_for_same_sv <= version and then through data_lifetime on =
    // created_seqno seems to produce better plans than joining directly to data_lifetime on <=
    // seqno.
    let svvs_for_same_sv = alias!(scoped_vault_version as svvs_for_same_sv);

    let dls = scoped_vault_version::table
        .inner_join(
            svvs_for_same_sv.on(scoped_vault_version::scoped_vault_id
                .eq(svvs_for_same_sv.field(scoped_vault_version::scoped_vault_id))),
        )
        .inner_join(
            data_lifetime::table.on(data_lifetime::scoped_vault_id.eq(scoped_vault_version::scoped_vault_id)),
        )
        .filter(scoped_vault_version::id.eq_any(&svv_ids))
        .filter(
            svvs_for_same_sv
                .field(scoped_vault_version::version)
                .le(scoped_vault_version::version),
        )
        .filter(data_lifetime::created_seqno.eq(svvs_for_same_sv.field(scoped_vault_version::seqno)))
        .filter(diesel::dsl::not(diesel::dsl::exists(
            vault_dr_blob::table
                .filter(vault_dr_blob::data_lifetime_id.eq(data_lifetime::id))
                .filter(vault_dr_blob::config_id.eq(config_id)),
        )))
        .select(DataLifetime::as_select())
        .distinct()
        .order(data_lifetime::created_seqno)
        .limit(batch_size as i64)
        .load(conn)?;

    Ok(dls)
}

#[tracing::instrument(skip_all, fields(
    config_id = %config_id,
))]
pub fn get_complete_svvs_for_svv_batch(
    conn: &mut PgConn,
    config_id: &VaultDrConfigId,
    svv_batch: &[ScopedVaultVersion],
) -> DbResult<Vec<ScopedVaultVersion>> {
    // Implementation is based on GetCompleteVaultVersionBatch in
    // backend/formal_methods/vault_disaster_recovery/vdr.tla

    let svv_ids = svv_batch.iter().map(|svv| &svv.id).collect_vec();

    // Get SVVs from svv_batch such that:
    //   All data_lifetimes present on the vault at or before the SVV
    //   have a vault_dr_blob written for this config...
    //
    //   Equivalently (and easier to express in SQL): where there does not exist an un-backed-up DL
    //   that is created at another SVV with the same or older version for the same scoped vaults.

    // Joining through svvs_for_same_sv <= version and then through data_lifetime on =
    // created_seqno seems to perform better than joining directly to data_lifetime on <= seqno.
    let svvs_for_same_sv = alias!(scoped_vault_version as svvs_for_same_sv);

    let complete_svvs = scoped_vault_version::table
        .filter(scoped_vault_version::id.eq_any(&svv_ids))
        .filter(diesel::dsl::not(diesel::dsl::exists(
            svvs_for_same_sv
                .inner_join(
                    data_lifetime::table.on(svvs_for_same_sv
                        .field(scoped_vault_version::scoped_vault_id)
                        .eq(data_lifetime::scoped_vault_id)
                        .and(
                            svvs_for_same_sv
                                .field(scoped_vault_version::seqno)
                                .eq(data_lifetime::created_seqno),
                        )),
                )
                .filter(
                    svvs_for_same_sv
                        .field(scoped_vault_version::scoped_vault_id)
                        .eq(scoped_vault_version::scoped_vault_id),
                )
                .filter(
                    svvs_for_same_sv
                        .field(scoped_vault_version::version)
                        .le(scoped_vault_version::version),
                )
                .filter(diesel::dsl::not(diesel::dsl::exists(
                    vault_dr_blob::table
                        .filter(vault_dr_blob::data_lifetime_id.eq(data_lifetime::id))
                        .filter(vault_dr_blob::config_id.eq(config_id)),
                ))),
        )))
        .select(ScopedVaultVersion::as_select())
        .load(conn)?;

    Ok(complete_svvs)
}


#[derive(Debug, Clone, derive_more::From, derive_more::Into, PartialEq, Eq)]
pub struct VdrBlobKey(String);

/// Returns a map from the given SVV IDs to the DIs and corresponding blob keys for the DLs active
/// at each SVV. If no DLs are active at an SVV for the vault, the map values will be empty.
#[tracing::instrument(skip_all, fields(
    config_id = %config_id,
))]
pub fn bulk_get_vdr_blob_keys_active_at(
    conn: &mut PgConn,
    config_id: &VaultDrConfigId,
    svv_ids: Vec<&ScopedVaultVersionId>,
) -> DbResult<HashMap<ScopedVaultVersionId, HashMap<DataIdentifier, VdrBlobKey>>> {
    let svvid_blob_keys: Vec<(ScopedVaultVersionId, (DataIdentifier, DataLifetimeSeqno, String))> =
        scoped_vault_version::table
            .inner_join(
                // Join with DLs that are active at the SVV's seqno.
                data_lifetime::table.on(data_lifetime::scoped_vault_id
                    .eq(scoped_vault_version::scoped_vault_id)
                    .and(data_lifetime::created_seqno.le(scoped_vault_version::seqno))
                    .and(
                        data_lifetime::deactivated_seqno
                            .gt(scoped_vault_version::seqno.nullable())
                            .or(data_lifetime::deactivated_seqno.is_null()),
                    )),
            )
            .inner_join(
                // Join with blobs that are written for the active DLs.
                vault_dr_blob::table.on(vault_dr_blob::data_lifetime_id
                    .eq(data_lifetime::id)
                    .and(vault_dr_blob::config_id.eq(config_id))),
            )
            .filter(scoped_vault_version::id.eq_any(&svv_ids))
            .select((
                scoped_vault_version::id,
                (
                    data_lifetime::kind,
                    data_lifetime::created_seqno,
                    vault_dr_blob::bucket_path,
                ),
            ))
            .load(conn)?;

    let mut grouped: HashMap<ScopedVaultVersionId, HashMap<DataIdentifier, VdrBlobKey>> = svvid_blob_keys
        .into_iter()
        .into_group_map()
        .into_iter()
        .map(|(svv_id, di_created_seqno_blobkey)| {
            let di_to_blobkeys = di_created_seqno_blobkey
                .into_iter()
                .map(|(di, created_seqno, blob_key)| (di, (created_seqno, blob_key)))
                .into_group_map();

            // In most cases, there should only be one active DL (blob) for a given data identifier
            // at this scoped vault version. This is enforced by the database constraint on the DL
            // table `unique_active_data_lifetime_per_scoped_vault_kind`.
            //
            // However, some historical data prior to the introduction of this constraint has
            // multiple active DLs at a given scoped vault version for a given DI. The vault
            // wrapper handles this by giving precedence to the DL with the greatest seqno. To
            // ensure VDR's data matches the API's view of the data, we do the same here.
            let di_to_latest_blobkey = di_to_blobkeys
                .into_iter()
                .filter_map(|(di, created_seqno_blobkeys)| {
                    let latest_blobkey = created_seqno_blobkeys
                        .into_iter()
                        .max_by_key(|(created_seqno, _)| *created_seqno)
                        .map(|(_, blobkey)| blobkey)?; // This will always be Some(_) since the list
                                                       // is a grouping.

                    Some((di, VdrBlobKey(latest_blobkey)))
                })
                .collect();

            (svv_id, di_to_latest_blobkey)
        })
        .collect();

    for svv_id in svv_ids {
        if !grouped.contains_key(svv_id) {
            grouped.insert(svv_id.clone(), HashMap::new());
        }
    }

    Ok(grouped)
}

/// Returns the greatest timestamp associated with the given SVV, determined by way of connected
/// DLs.
#[tracing::instrument(skip_all)]
fn get_greatest_dl_timestamp_for_svv(conn: &mut PgConn, svv: &ScopedVaultVersion) -> DbResult<DateTime<Utc>> {
    let dls: Vec<DataLifetime> = data_lifetime::table
        .filter(data_lifetime::scoped_vault_id.eq(&svv.scoped_vault_id))
        .filter(
            data_lifetime::created_seqno
                .eq(svv.seqno)
                .or(data_lifetime::deactivated_seqno.eq(svv.seqno)),
        )
        .select(DataLifetime::as_select())
        .load(conn)?;

    let ts = dls
        .into_iter()
        .map(|dl| {
            let ts = if dl.created_seqno == svv.seqno {
                dl.created_at
            } else if dl.deactivated_seqno == Some(svv.seqno) {
                dl.deactivated_at.ok_or(DbError::AssertionError(format!(
                    "Found deactivated DL without deactivated_at: {:?}",
                    dl.id
                )))?
            } else {
                return Err(DbError::AssertionError(
                    "Got DL that shouldn't match get_latest_backup_record_timestamp query".to_owned(),
                ));
            };

            Ok(ts)
        })
        .collect::<DbResult<Vec<_>>>()?
        .into_iter()
        .max();

    let ts = ts.ok_or(DbError::AssertionError(
        "Got no DLs for SVV in get_latest_backup_record_timestamp query".to_owned(),
    ))?;

    Ok(ts)
}

/// Gets the timestamp of the latest record backed up by the given VDR config. The timestamp is
/// approximate since it is not guaranteed to be monotonic. This is because we're using the
/// DataLifetime seqnos as an approximate global sort order, and timestamps are not monotonic with
/// respect to seqnos. In practice, any decreases should be small (<= the duration of the longest
/// transaction that commits new DLs).
#[tracing::instrument(skip_all)]
pub fn get_approximate_latest_backup_record_timestamp(
    conn: &mut PgConn,
    config: &VaultDrConfig,
) -> DbResult<Option<DateTime<Utc>>> {
    let latest_backed_up_svv: Option<ScopedVaultVersion> = scoped_vault_version::table
        // tenant_id/is_live are included so we can use the index
        // svv_tenant_id_is_live_vdr_cfg_id_seqno
        .filter(scoped_vault_version::tenant_id.eq(&config.tenant_id))
        .filter(scoped_vault_version::is_live.eq(config.is_live))
        .filter(scoped_vault_version::backed_up_by_vdr_config_id.eq(&config.id))
        .select(ScopedVaultVersion::as_select())
        .order(scoped_vault_version::seqno.desc())
        .first(conn)
        .optional()?;

    let Some(svv) = latest_backed_up_svv else {
        return Ok(None);
    };

    let ts = get_greatest_dl_timestamp_for_svv(conn, &svv)?;

    Ok(Some(ts))
}

/// Gets the timestamp of the next record that would be backed up by the given VDR config. See
/// docs for get_approximate_latest_backup_record_timestamp for caveats.
#[tracing::instrument(skip_all)]
pub fn get_approximate_next_backup_record_timestamp(
    conn: &mut PgConn,
    config: &VaultDrConfig,
) -> DbResult<Option<DateTime<Utc>>> {
    let next_svv_batch =
        get_scoped_vault_version_batch(conn, &config.tenant_id, config.is_live, &config.id, 1, None)?;

    let Some(svv) = next_svv_batch.first() else {
        return Ok(None);
    };

    let ts = get_greatest_dl_timestamp_for_svv(conn, svv)?;

    Ok(Some(ts))
}


#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::vault_dr::NewVaultDrAwsPreEnrollment;
    use crate::models::vault_dr::NewVaultDrBlob;
    use crate::models::vault_dr::NewVaultDrConfig;
    use crate::models::vault_dr::VaultDrAwsPreEnrollment;
    use crate::models::vault_dr::VaultDrBlob;
    use crate::models::vault_dr::VaultDrConfig;
    use crate::test_helpers::assert_have_same_elements;
    use crate::tests::fixtures;
    use crate::tests::prelude::*;
    use hex::ToHex;
    use itertools::Itertools;
    use macros::db_test;
    use newtypes::DataIdentifier;
    use newtypes::DataLifetimeSeqno;
    use newtypes::DataLifetimeSource;
    use newtypes::IdentityDataKind;
    use newtypes::ScopedVaultVersionNumber;
    use newtypes::VaultId;

    #[derive(Debug, Clone, derive_more::Constructor)]
    struct ExpectedBatchSizes {
        expected_num_svvs: usize,
        expected_num_dls: usize,
        expected_num_complete_svvs: usize,
    }

    #[db_test]
    fn test_vault_dr_batch_query(conn: &mut TestPgConn) {
        let tenant_id = fixtures::tenant::create(conn).id;
        let is_live = true;
        let ob_config_id = fixtures::ob_configuration::create(conn, &tenant_id, is_live).id;
        let v1_id = fixtures::vault::create_person(conn, is_live).into_inner().id;
        let sv1 = fixtures::scoped_vault::create(conn, &v1_id, &ob_config_id);

        let new_ape = NewVaultDrAwsPreEnrollment {
            tenant_id: &tenant_id,
            is_live,
            aws_external_id: crypto::random::gen_rand_bytes(16).encode_hex::<String>().into(),
        };
        let ape = VaultDrAwsPreEnrollment::get_or_create(conn, new_ape).unwrap();

        let mut dls = vec![];
        for _ in 0..=5 {
            let sv1_txn1 = DataLifetime::new_sv_txn(conn, &sv1).unwrap();
            DataLifetime::bulk_deactivate_kinds(
                conn,
                &sv1_txn1,
                vec![DataIdentifier::Id(IdentityDataKind::Dob)],
            )
            .unwrap();
            let (dl, _) = DataLifetime::create(
                conn,
                &sv1_txn1,
                IdentityDataKind::Dob.into(),
                newtypes::DataLifetimeSource::LikelyHosted,
                None,
            )
            .unwrap();
            dls.push(dl);

            let sv1_txn2 = DataLifetime::new_sv_txn(conn, &sv1).unwrap();
            DataLifetime::bulk_deactivate_kinds(
                conn,
                &sv1_txn2,
                vec![DataIdentifier::Id(IdentityDataKind::Email)],
            )
            .unwrap();
            let (dl, _) = DataLifetime::create(
                conn,
                &sv1_txn2,
                IdentityDataKind::Email.into(),
                newtypes::DataLifetimeSource::LikelyHosted,
                None,
            )
            .unwrap();
            dls.push(dl);

            // Create another DL at the same seqno.
            DataLifetime::bulk_deactivate_kinds(
                conn,
                &sv1_txn2,
                vec![DataIdentifier::Id(IdentityDataKind::FirstName)],
            )
            .unwrap();
            let (dl, _) = DataLifetime::create(
                conn,
                &sv1_txn2,
                IdentityDataKind::FirstName.into(),
                newtypes::DataLifetimeSource::LikelyHosted,
                None,
            )
            .unwrap();
            dls.push(dl);
        }

        let manifest_batch_size: usize = 5;
        let blob_batch_size: usize = 5;

        // Deactivate the last DL.
        let deactivate_txn = DataLifetime::new_sv_txn(conn, &sv1).unwrap();
        DataLifetime::bulk_deactivate_kinds(
            conn,
            &deactivate_txn,
            vec![DataIdentifier::Id(IdentityDataKind::FirstName)],
        )
        .unwrap();
        let deactivate_seqno = deactivate_txn.seqno();


        let expected_batch_sizes_each_run = vec![
            ExpectedBatchSizes::new(manifest_batch_size, blob_batch_size, 3),
            ExpectedBatchSizes::new(manifest_batch_size, blob_batch_size, 4),
            ExpectedBatchSizes::new(manifest_batch_size, blob_batch_size, 3),
            ExpectedBatchSizes::new(3, 3, 3),
            ExpectedBatchSizes::new(0, 0, 0),
            ExpectedBatchSizes::new(0, 0, 0),
        ];

        // Make sure we're triggering a condition where a batch of blobs doesn't contain all DLs
        // for a seqno.
        let first_batch_num_dls = expected_batch_sizes_each_run[0].expected_num_dls;
        assert_eq!(
            dls[first_batch_num_dls - 1].created_seqno,
            dls[first_batch_num_dls].created_seqno
        );

        assert_eq!(
            // We should be writing one blob per DL.
            expected_batch_sizes_each_run
                .iter()
                .map(|r| r.expected_num_dls)
                .sum::<usize>(),
            dls.len()
        );

        let unique_seqnos = dls
            .iter()
            .map(|dl| dl.created_seqno)
            .chain(Some(deactivate_seqno).into_iter())
            .unique()
            .collect_vec();
        assert_eq!(
            // We should be writing one manifest per seqno.
            expected_batch_sizes_each_run
                .iter()
                .map(|r| r.expected_num_complete_svvs)
                .sum::<usize>(),
            unique_seqnos.len(),
        );

        let mut last_vdr_config = None;
        for enrollment_num in 0..=2 {
            // Test for the first enrollment as well as re-enrollments.

            if let Some(last_vdr_config) = last_vdr_config.take() {
                VaultDrConfig::deactivate(conn, last_vdr_config).unwrap();
            }

            let new_vdr_config = NewVaultDrConfig {
                created_at: Utc::now(),
                tenant_id: &tenant_id,
                is_live,
                aws_pre_enrollment_id: &ape.id,
                aws_account_id: "12345678".to_owned(),
                aws_role_name: "my-role".to_owned(),
                s3_bucket_name: "my-bucket".to_owned(),
                recovery_public_key: "pub-key".to_owned(),
                wrapped_recovery_key: "wrapped-recovery-key".to_owned(),
                org_public_keys: vec!["org-pub-key".to_owned()],
                bucket_path_namespace: format!("the-namespace-{}", enrollment_num),
            };
            let vdr_config = VaultDrConfig::create(conn, new_vdr_config).unwrap();
            println!("VDR enrollment {}: {:?}", enrollment_num, vdr_config.id);

            let mut expected_svvns = (1..=(unique_seqnos.len() as i64)).map(ScopedVaultVersionNumber::from);
            let mut expected_svv_seqnos = unique_seqnos.iter().copied();
            let mut dl_created_seqnos = dls.iter().map(|dl| dl.created_seqno);

            for (i, expected_batch_sizes) in expected_batch_sizes_each_run.clone().into_iter().enumerate() {
                let ExpectedBatchSizes {
                    expected_num_svvs,
                    expected_num_dls,
                    expected_num_complete_svvs,
                } = expected_batch_sizes;


                let got_svv_batch = get_scoped_vault_version_batch(
                    conn,
                    &tenant_id,
                    is_live,
                    &vdr_config.id,
                    manifest_batch_size,
                    Some(vec![sv1.fp_id.clone()]),
                )
                .unwrap();
                assert_eq!(
                    got_svv_batch.len(),
                    expected_num_svvs,
                    "Run {}: SVV batch size",
                    i
                );

                let got_dls = get_dl_batch_for_svv_batch(
                    conn,
                    &tenant_id,
                    is_live,
                    &vdr_config.id,
                    &got_svv_batch,
                    blob_batch_size,
                )
                .unwrap();
                assert_eq!(got_dls.len(), expected_num_dls, "Run {}: DL batch size", i);

                // We can't predict the DL IDs in the batch, since DLs created at the same
                // seqno may not all be contained in the same batch. However, we can check
                // that the seqnos in the batch match the expected seqnos, and we can check that all
                // DL IDs in the batch correspond with the expected seqnos.
                let expected_seqnos = (&mut dl_created_seqnos).take(expected_num_dls).collect_vec();
                assert_have_same_elements(
                    got_dls.iter().map(|dl| dl.created_seqno).collect_vec(),
                    expected_seqnos.clone(),
                );

                let candidate_dl_ids_for_seqnos = dls
                    .iter()
                    .filter(|dl| expected_seqnos.contains(&dl.created_seqno))
                    .map(|dl| dl.id.clone())
                    .collect_vec();
                for dl in got_dls.iter() {
                    assert!(candidate_dl_ids_for_seqnos.contains(&dl.id));
                }

                write_fake_blobs(conn, &vdr_config.id, got_dls);


                let got_complete_svvs =
                    get_complete_svvs_for_svv_batch(conn, &vdr_config.id, &got_svv_batch).unwrap();
                assert_eq!(
                    got_complete_svvs.len(),
                    expected_num_complete_svvs,
                    "Run {}: complete SVV batch size",
                    i
                );

                let expected_svvns = (&mut expected_svvns)
                    .take(expected_num_complete_svvs)
                    .collect_vec();
                assert_have_same_elements(
                    got_complete_svvs.iter().map(|svv| svv.version).collect_vec(),
                    expected_svvns,
                );

                let expected_seqnos = (&mut expected_svv_seqnos)
                    .take(expected_num_complete_svvs)
                    .collect_vec();
                assert_have_same_elements(
                    got_complete_svvs.iter().map(|svv| svv.seqno).collect_vec(),
                    expected_seqnos,
                );

                let batch_svv_ids = got_svv_batch.iter().map(|svv| svv.id.clone()).collect_vec();
                let complete_svv_ids = got_complete_svvs.iter().map(|svv| svv.id.clone()).collect_vec();
                assert!(
                    complete_svv_ids.iter().all(|id| batch_svv_ids.contains(id)),
                    "Run {}: complete SVVs are a subset of the SVV batch",
                    i
                );

                ScopedVaultVersion::bulk_update_backed_up_by_vdr_config_id(
                    conn,
                    &complete_svv_ids,
                    &vdr_config.id,
                )
                .unwrap();
            }

            last_vdr_config = Some(vdr_config);
        }
    }

    fn write_fake_blobs(
        conn: &mut TestPgConn,
        config_id: &VaultDrConfigId,
        dls: Vec<DataLifetime>,
    ) -> Vec<VaultDrBlob> {
        let new_blobs = dls
            .into_iter()
            .map(|dl| NewVaultDrBlob {
                config_id: config_id.clone(),
                data_lifetime_id: dl.id,
                dl_created_seqno: dl.created_seqno,
                bucket_path: crypto::random::gen_rand_bytes(32).encode_hex(),
                content_etag: "content-etag".to_owned(),
                wrapped_record_key: "wrapped-record-key".into(),
                content_length_bytes: 123,
            })
            .collect_vec();

        VaultDrBlob::bulk_create(conn, new_blobs).unwrap()
    }

    #[derive(Clone, Insertable)]
    #[diesel(table_name = data_lifetime)]
    struct NewUnsafeDataLifetime {
        vault_id: VaultId,
        scoped_vault_id: ScopedVaultId,
        created_at: DateTime<Utc>,
        created_seqno: DataLifetimeSeqno,
        kind: DataIdentifier,
        source: DataLifetimeSource,
        deactivated_seqno: Option<DataLifetimeSeqno>,
    }

    #[db_test]
    fn test_bulk_get_vdr_blob_keys_active_at_for_multiple_active_dls(conn: &mut TestPgConn) {
        // Some historical data prior to the introduction of the constraint
        // `unique_active_data_lifetime_per_scoped_vault_kind` has multiple active DLs at a given
        // scoped vault version for a given DI. Test that bulk_get_vdr_blob_keys_active_at
        // correctly disambiguates between DLs in this case.

        let tenant_id = fixtures::tenant::create(conn).id;
        let is_live = true;

        let new_ape = NewVaultDrAwsPreEnrollment {
            tenant_id: &tenant_id,
            is_live,
            aws_external_id: crypto::random::gen_rand_bytes(16).encode_hex::<String>().into(),
        };
        let ape = VaultDrAwsPreEnrollment::get_or_create(conn, new_ape).unwrap();
        let new_vdr_config = NewVaultDrConfig {
            created_at: Utc::now(),
            tenant_id: &tenant_id,
            is_live,
            aws_pre_enrollment_id: &ape.id,
            aws_account_id: "12345678".to_owned(),
            aws_role_name: "my-role".to_owned(),
            s3_bucket_name: "my-bucket".to_owned(),
            recovery_public_key: "pub-key".to_owned(),
            wrapped_recovery_key: "wrapped-recovery-key".to_owned(),
            org_public_keys: vec!["org-pub-key".to_owned()],
            bucket_path_namespace: "the-namespace".to_owned(),
        };
        let vdr_config = VaultDrConfig::create(conn, new_vdr_config).unwrap();

        let ob_config_id = fixtures::ob_configuration::create(conn, &tenant_id, is_live).id;
        let v_id = fixtures::vault::create_person(conn, is_live).into_inner().id;
        let sv = fixtures::scoped_vault::create(conn, &v_id, &ob_config_id);

        let sv_txn1 = DataLifetime::new_sv_txn(conn, &sv).unwrap();
        let svv1 = ScopedVaultVersion::get_or_create(conn, &sv_txn1).unwrap();

        let sv_txn2 = DataLifetime::new_sv_txn(conn, &sv).unwrap();
        let svv2 = ScopedVaultVersion::get_or_create(conn, &sv_txn2).unwrap();

        let sv_txn3 = DataLifetime::new_sv_txn(conn, &sv).unwrap();
        let svv3 = ScopedVaultVersion::get_or_create(conn, &sv_txn3).unwrap();

        assert_eq!(svv1.version + 1.into(), svv2.version);
        assert_eq!(svv2.version + 1.into(), svv3.version);

        assert!(svv1.seqno < svv2.seqno);
        assert!(svv2.seqno < svv3.seqno);

        // We can't use model helpers since we have to construct a timeline that would violate the
        // unique_active_data_lifetime_per_scoped_vault_kind constraint.
        let new_dls = vec![
            NewUnsafeDataLifetime {
                vault_id: v_id.clone(),
                scoped_vault_id: sv.id.clone(),
                created_at: Utc::now(),
                created_seqno: svv1.seqno,
                kind: IdentityDataKind::Ssn9.into(),
                source: DataLifetimeSource::LikelyHosted,
                deactivated_seqno: Some(svv3.seqno),
            },
            NewUnsafeDataLifetime {
                vault_id: v_id.clone(),
                scoped_vault_id: sv.id.clone(),
                created_at: Utc::now(),
                created_seqno: svv1.seqno,
                kind: IdentityDataKind::FirstName.into(),
                source: DataLifetimeSource::LikelyHosted,
                deactivated_seqno: None,
            },
            NewUnsafeDataLifetime {
                vault_id: v_id.clone(),
                scoped_vault_id: sv.id.clone(),
                created_at: Utc::now(),
                created_seqno: svv2.seqno,
                kind: IdentityDataKind::Ssn9.into(),
                source: DataLifetimeSource::LikelyHosted,
                deactivated_seqno: Some(svv3.seqno),
            },
            NewUnsafeDataLifetime {
                vault_id: v_id.clone(),
                scoped_vault_id: sv.id.clone(),
                created_at: Utc::now(),
                created_seqno: svv3.seqno,
                kind: IdentityDataKind::Ssn9.into(),
                source: DataLifetimeSource::LikelyHosted,
                deactivated_seqno: None,
            },
        ];

        let num_ssn9_active_at_svv2 = new_dls
            .iter()
            .filter(|dl| {
                dl.kind == IdentityDataKind::Ssn9.into()
                    && dl.created_seqno <= svv2.seqno
                    && dl
                        .deactivated_seqno
                        .map_or(true, |deactivated_seqno| deactivated_seqno > svv2.seqno)
            })
            .count();
        // The constraint unique_active_data_lifetime_per_scoped_vault_kind would have prevented
        // this timeline from being created using first-class models.
        assert_eq!(num_ssn9_active_at_svv2, 2);

        let dls: Vec<DataLifetime> = new_dls
            .into_iter()
            .map(|new_dl| {
                diesel::insert_into(data_lifetime::table)
                    .values(&new_dl)
                    .get_result(conn.conn())
                    .unwrap()
            })
            .collect();

        let mut blobs = dls.into_iter().map(|dl| {
            let blobs = write_fake_blobs(conn, &vdr_config.id, vec![dl]);
            assert_eq!(blobs.len(), 1);
            blobs.into_iter().next().unwrap()
        });
        let blob1 = blobs.next().unwrap();
        let blob2 = blobs.next().unwrap();
        let blob3 = blobs.next().unwrap();
        let blob4 = blobs.next().unwrap();
        assert!(blobs.next().is_none());

        let result =
            bulk_get_vdr_blob_keys_active_at(conn, &vdr_config.id, vec![&svv1.id, &svv2.id, &svv3.id])
                .unwrap();
        assert_eq!(
            result,
            HashMap::from([
                (
                    svv1.id.clone(),
                    HashMap::from([
                        (IdentityDataKind::Ssn9.into(), blob1.bucket_path.clone().into()),
                        (
                            IdentityDataKind::FirstName.into(),
                            blob2.bucket_path.clone().into()
                        ),
                    ])
                ),
                (
                    svv2.id.clone(),
                    HashMap::from([
                        (IdentityDataKind::Ssn9.into(), blob3.bucket_path.clone().into()),
                        (
                            IdentityDataKind::FirstName.into(),
                            blob2.bucket_path.clone().into()
                        ),
                    ])
                ),
                (
                    svv3.id.clone(),
                    HashMap::from([
                        (IdentityDataKind::Ssn9.into(), blob4.bucket_path.clone().into()),
                        (
                            IdentityDataKind::FirstName.into(),
                            blob2.bucket_path.clone().into()
                        ),
                    ])
                )
            ])
        );
    }
}
