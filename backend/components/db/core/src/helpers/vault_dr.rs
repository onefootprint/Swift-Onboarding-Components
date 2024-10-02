use crate::models::data_lifetime::DataLifetime;
use crate::models::ob_configuration::IsLive;
use crate::models::scoped_vault_version::ScopedVaultVersion;
use crate::DbResult;
use crate::PgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::data_lifetime;
use db_schema::schema::scoped_vault;
use db_schema::schema::scoped_vault_version;
use db_schema::schema::vault_dr_blob;
use db_schema::schema::vault_dr_manifest;
use diesel::prelude::*;
use diesel::sql_types::Integer;
use diesel::QueryDsl;
use itertools::Itertools;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeSeqno;
use newtypes::FpId;
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

    let mut query = scoped_vault_version::table
        .inner_join(scoped_vault::table)
        .filter(scoped_vault_version::tenant_id.eq(tenant_id))
        .filter(scoped_vault_version::is_live.eq(is_live))
        // backed_up_by_vdr_config_id serves as the progress marker for the worker, indicating that
        // all blobs/DLs and manifests/SVVs with seqnos <= this SVV have been backed up.
        // The correctness of this filter relies on the fact that there is at most one active VDR
        // config ID per (tenant_id, is_live) pair.
        .filter(
            scoped_vault_version::backed_up_by_vdr_config_id.is_null()
                .or(scoped_vault_version::backed_up_by_vdr_config_id.ne(config_id))
        )
        .into_boxed();

    if let Some(fp_ids) = fp_id_filter {
        // It's valid to filter by fp_ids since the worker does not rely on any global ordering of
        // processed SVVs, only the ordering of the subsequences of SVVs for each scoped vault.
        // Filtering by fp_id selects SVV subsequences for the corresponding scoped vaults.
        query = query.filter(scoped_vault::fp_id.eq_any(fp_ids));
    }

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
    // if a SVV is skipped in one batch, there will be no greater SVV for the same vault in the
    // same batch. This is because a SELECT sees a snapshot of the database as of the instant the
    // query begins to run. In other words, by sorting the SVVs by seqno, we can be sure that for
    // all vaults present in the batch, those SVVs are the minimum non-backed up SVVs for those
    // vaults.
    //
    // Sorting by seqnos here does *NOT* imply that the batch represents the global minimum seqnos
    // for un-backed up SVVs, as inflight transactions may commit SVVs with lesser seqnos.
    let svv_batch = query
        .select(ScopedVaultVersion::as_select())
        .order(scoped_vault_version::seqno)
        .limit(batch_size as i64)
        .load(conn)?;

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

    // We select only DLs created at the svv_batch seqnos since:
    // a) DLs created before a SVV seqno would be captured by a prior SVV
    // b) DLs created after a SVV seqno would be captured by a later SVV
    // c) There's no need to filter on deactivated_seqno, since
    //    deactivated_seqno >= created_seqno, so if a SVV seqno equals
    //    the deactivated_seqno, the SVV would be captured by a prior
    //    SVV or the same SVV.

    let query = data_lifetime::table
        .inner_join(scoped_vault::table)
        .filter(scoped_vault::tenant_id.eq(tenant_id))
        .filter(scoped_vault::is_live.eq(is_live))
        .filter(diesel::dsl::exists(
            scoped_vault_version::table
                .filter(scoped_vault_version::id.eq_any(svv_ids))
                .filter(scoped_vault_version::scoped_vault_id.eq(scoped_vault::id))
                .filter(scoped_vault_version::seqno.eq(data_lifetime::created_seqno)),
        ))
        .filter(diesel::dsl::not(diesel::dsl::exists(
            vault_dr_blob::table
                .filter(vault_dr_blob::data_lifetime_id.eq(data_lifetime::id))
                .filter(vault_dr_blob::config_id.eq(config_id)),
        )))
        .into_boxed();

    // The sort order *doesn't* matter here since all blobs associated with the svv_batch must be
    // written before the manifests are eligible to be written. If the batch_size isn't large
    // enough to finish backing up all DLs associated with the svv_batch, then unfinished SVVs will
    // be present in the next batch, and the DL batch will continue to make progress.
    let dls = query
        .select(DataLifetime::as_select())
        .limit(batch_size as i64)
        .load(conn)?;

    Ok(dls)
}

#[tracing::instrument(skip_all)]
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
    //   Equivalently (and easier to express in SQL): where there does not exist a data_lifetime
    //   for the SVV with created_seqno <= svv.seqno that does not have a vault_dr_blob written for
    //   this config...

    let complete_svvs = scoped_vault_version::table
        .filter(scoped_vault_version::id.eq_any(svv_ids))
        .filter(diesel::dsl::not(diesel::dsl::exists(
            data_lifetime::table
                .filter(data_lifetime::scoped_vault_id.eq(scoped_vault_version::scoped_vault_id))
                .filter(data_lifetime::created_seqno.le(scoped_vault_version::seqno))
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


// Load up to `batch_size` DataLifetime records for the given tenant/is_live that do not have
// corresponding blobs for the given config.
#[tracing::instrument(skip_all, fields(
    tenant_id = %tenant_id,
    is_live = %is_live,
    config_id = %config_id,
    batch_size = %batch_size,
    fp_id_filter = ?fp_id_filter,
))]
pub fn incorrect_get_vault_dr_data_lifetime_batch(
    conn: &mut PgConn,
    tenant_id: &TenantId,
    is_live: IsLive,
    config_id: &VaultDrConfigId,
    batch_size: u32,
    fp_id_filter: Option<Vec<FpId>>,
) -> DbResult<Vec<DataLifetime>> {
    // This is incorrect.
    //
    // Query performance optimization:
    //
    // We know that we process records in order of ascending created_seqno and transactionally
    // commit entire successfully-processed batches of DLs as vault_dr_blob rows, so we can bound
    // the search space for the next batch of DLs by the maximum processed seqno.
    //
    // With the Read Committed isolation level, this seqno may be a bit stale (e.g. if more records
    // are processed after finding this seqno and before the following batch query). However, the
    // DL batch query will still return the correct records. The seqno search bound will just be low.
    let max_processed_seqno = vault_dr_blob::table
        .filter(vault_dr_blob::config_id.eq(config_id))
        .select(diesel::dsl::max(vault_dr_blob::dl_created_seqno))
        .first::<Option<DataLifetimeSeqno>>(conn)?
        .unwrap_or(DataLifetimeSeqno::from(0));

    let mut query = data_lifetime::table
        .inner_join(scoped_vault::table)
        .filter(scoped_vault::tenant_id.eq(tenant_id))
        .filter(scoped_vault::is_live.eq(is_live))
        .filter(data_lifetime::created_seqno.ge(max_processed_seqno))
        .filter(diesel::dsl::not(diesel::dsl::exists(
            vault_dr_blob::table
                .filter(vault_dr_blob::data_lifetime_id.eq(data_lifetime::id))
                .filter(vault_dr_blob::config_id.eq(config_id)),
        )))
        .into_boxed();

    if let Some(fp_ids) = fp_id_filter {
        query = query.filter(scoped_vault::fp_id.eq_any(fp_ids));
    }

    let dls = query
        .select(DataLifetime::as_select())
        .order(data_lifetime::created_seqno)
        .limit(batch_size as i64)
        .load(conn)?;

    Ok(dls)
}

// Fetch up to `batch_size` ScopedVaultVersion records that have all corresponding VaultDrBlobs
// written.
#[tracing::instrument(skip_all, fields(
    tenant_id = %tenant_id,
    is_live = %is_live,
    config_id = %config_id,
    batch_size = %batch_size,
    fp_id_filter = ?fp_id_filter,
))]
pub fn incorrect_get_vault_dr_scoped_vault_version_batch(
    conn: &mut PgConn,
    tenant_id: &TenantId,
    is_live: IsLive,
    config_id: &VaultDrConfigId,
    batch_size: u32,
    fp_id_filter: Option<Vec<FpId>>,
) -> DbResult<Vec<ScopedVaultVersion>> {
    // This is incorrect.
    //
    // Query performance optimization:
    //
    // We know that we process ScopedVaultVersions in order of ascending seqno and transactionally
    // commit entire successfully-processed batches of SVVs as vault_dr_manifest rows, so we can
    // bound the search space for the next batch of SVVs by the maximum processed seqno.
    //
    // With the Read Committed isolation level, this seqno may be a bit stale (e.g. if more SVVs
    // are processed after finding this seqno and before the following batch query). However, the
    // SVV batch query will still return the correct rows. The seqno search bound will just be low.
    let max_processed_seqno = vault_dr_manifest::table
        .filter(vault_dr_manifest::config_id.eq(config_id))
        .select(diesel::dsl::max(vault_dr_manifest::seqno))
        .first::<Option<DataLifetimeSeqno>>(conn)?
        .unwrap_or(DataLifetimeSeqno::from(0));

    let query = scoped_vault_version::table
            .inner_join(scoped_vault::table)
            .filter(scoped_vault_version::tenant_id.eq(tenant_id))
            .filter(scoped_vault_version::is_live.eq(is_live))
            .filter(scoped_vault_version::seqno.ge(max_processed_seqno))
            // Where there is no matching manifest:
            .filter(diesel::dsl::not(diesel::dsl::exists(
                vault_dr_manifest::table
                    .filter(vault_dr_manifest::scoped_vault_version_id.eq(scoped_vault_version::id))
                    .filter(vault_dr_manifest::config_id.eq(config_id.clone())),
            )))
            // Where all corresponding data_lifetimes have a vault_dr_blob written:
            .filter(
                // The `exists()`, `SELECT 1`, `GROUP BY 1`, and `having()` are effectively doing:
                //   SELECT
                //      COUNT(DISTINCT data_lifetime.id) = COUNT(DISTINCT vault_dr_blob.data_lifetime)
                //   FROM ...
                // but Diesel doesn't support using a single-row `SELECT <bool>` as a filter
                // expression. The group aggregation yields roughly the same inner query plan.
                diesel::dsl::exists(
                    data_lifetime::table
                        .left_join(vault_dr_blob::table)
                        .filter(data_lifetime::scoped_vault_id.eq(scoped_vault_version::scoped_vault_id))
                        .filter(
                            scoped_vault_version::seqno.eq(data_lifetime::created_seqno).or(
                                data_lifetime::deactivated_seqno
                                    .assume_not_null()
                                    .eq(scoped_vault_version::seqno),
                            ),
                        )
                        .select(1.into_sql::<Integer>())
                        .group_by(1.into_sql::<Integer>())
                        .having(diesel::dsl::count_distinct(data_lifetime::id).eq(
                            diesel::dsl::count_distinct(vault_dr_blob::data_lifetime_id.assume_not_null()),
                        )),
                ),
            )
            .select(ScopedVaultVersion::as_select())
            .order(scoped_vault_version::seqno)
            .limit(batch_size as i64)
            .into_boxed();

    let query = match fp_id_filter {
        Some(fp_ids) => query.filter(scoped_vault::fp_id.eq_any(fp_ids)),
        None => query,
    };

    let svvs = query.load(conn)?;

    Ok(svvs)
}

#[derive(Debug, Clone, derive_more::From, derive_more::Into)]
pub struct VdrBlobKey(String);

#[tracing::instrument(skip_all)]
pub fn bulk_get_vdr_blob_keys_active_at(
    conn: &mut PgConn,
    config_id: &VaultDrConfigId,
    svv_ids: Vec<&ScopedVaultVersionId>,
) -> DbResult<HashMap<ScopedVaultVersionId, HashMap<DataIdentifier, VdrBlobKey>>> {
    let svvid_di_blobkey: Vec<(ScopedVaultVersionId, (DataIdentifier, String))> = scoped_vault_version::table
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
        .filter(scoped_vault_version::id.eq_any(svv_ids))
        .select((
            scoped_vault_version::id,
            (data_lifetime::kind, vault_dr_blob::bucket_path),
        ))
        .load(conn)?;

    let grouped = svvid_di_blobkey
        .into_iter()
        .into_group_map()
        .into_iter()
        .map(|(svv_id, di_blobkey)| {
            let di_to_blobkey = di_blobkey
                .into_iter()
                .map(|(di, blob_key)| (di, blob_key.into()))
                .collect();
            (svv_id, di_to_blobkey)
        })
        .collect();

    Ok(grouped)
}


#[tracing::instrument(skip_all)]
pub fn get_latest_vault_dr_backup_record_timestamp(
    conn: &mut PgConn,
    config_id: &VaultDrConfigId,
) -> DbResult<Option<DateTime<Utc>>> {
    // TODO: After backfilling manifests, query based on committed manifests, not just blobs.
    let ts = vault_dr_blob::table
        .inner_join(data_lifetime::table)
        .filter(vault_dr_blob::config_id.eq(config_id))
        .select(data_lifetime::created_at)
        .order(vault_dr_blob::dl_created_seqno.desc())
        .first(conn)
        .optional()?;
    Ok(ts)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::vault_dr::NewVaultDrAwsPreEnrollment;
    use crate::models::vault_dr::NewVaultDrBlob;
    use crate::models::vault_dr::NewVaultDrConfig;
    use crate::models::vault_dr::NewVaultDrManifest;
    use crate::models::vault_dr::VaultDrAwsPreEnrollment;
    use crate::models::vault_dr::VaultDrBlob;
    use crate::models::vault_dr::VaultDrConfig;
    use crate::models::vault_dr::VaultDrManifest;
    use crate::test_helpers::assert_have_same_elements;
    use crate::tests::fixtures;
    use crate::tests::prelude::*;
    use hex::ToHex;
    use itertools::Itertools;
    use macros::db_test;
    use newtypes::DataIdentifier;
    use newtypes::IdentityDataKind;
    use newtypes::ScopedVaultVersionNumber;

    #[db_test]
    fn test_incorrect_vault_dr_batch_query(conn: &mut TestPgConn) {
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

        let batch_size: usize = 5;
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

        // Make sure we're triggering a condition where a batch of blobs doesn't contain all DLs
        // for a seqno.
        assert_eq!(dls[batch_size - 1].created_seqno, dls[batch_size].created_seqno);

        // Deactivate the last DL.
        let deactivate_txn = DataLifetime::new_sv_txn(conn, &sv1).unwrap();
        DataLifetime::bulk_deactivate_kinds(
            conn,
            &deactivate_txn,
            vec![DataIdentifier::Id(IdentityDataKind::FirstName)],
        )
        .unwrap();
        let deactivate_seqno = deactivate_txn.seqno();

        let expected_batch_sizes = vec![
            // (blob count, svv/manifest count)
            (batch_size, 3),
            (batch_size, 4),
            (batch_size, 3),
            (3, 3),
            (0, 0),
            (0, 0),
        ];

        assert_eq!(
            // We should be writing one blob per DL.
            expected_batch_sizes.iter().map(|s| s.0).sum::<usize>(),
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
            expected_batch_sizes.iter().map(|s| s.1).sum::<usize>(),
            unique_seqnos.len(),
        );

        let mut expected_svvns = (1..=(unique_seqnos.len() as i64)).map(ScopedVaultVersionNumber::from);
        let mut expected_svv_seqnos = unique_seqnos.into_iter();
        let mut dl_created_seqnos = dls.iter().map(|dl| dl.created_seqno);

        for (i, (expected_batch_size, expected_svv_count)) in expected_batch_sizes.into_iter().enumerate() {
            let got_dl_batch = incorrect_get_vault_dr_data_lifetime_batch(
                conn,
                &tenant_id,
                is_live,
                &vdr_config.id,
                batch_size as u32,
                Some(vec![sv1.fp_id.clone()]),
            )
            .unwrap();
            assert_eq!(got_dl_batch.len(), expected_batch_size, "Batch {} size", i);

            // We can't predict the DL IDs in the batch, since DLs created at the same
            // seqno may not all be contained in the same batch. However, we can check
            // that the seqnos in the batch match the expected seqnos, and we can check that all
            // DL IDs in the batch correspond with the expected seqnos.
            let expected_seqnos = (&mut dl_created_seqnos).take(expected_batch_size).collect_vec();
            assert_have_same_elements(
                got_dl_batch.iter().map(|dl| dl.created_seqno).collect_vec(),
                expected_seqnos.clone(),
            );

            let candidate_dl_ids_for_seqnos = dls
                .iter()
                .filter(|dl| expected_seqnos.contains(&dl.created_seqno))
                .map(|dl| dl.id.clone())
                .collect_vec();
            for dl in got_dl_batch.iter() {
                assert!(candidate_dl_ids_for_seqnos.contains(&dl.id));
            }

            write_fake_blobs(conn, &vdr_config.id, got_dl_batch);

            let svv_batch = incorrect_get_vault_dr_scoped_vault_version_batch(
                conn,
                &tenant_id,
                is_live,
                &vdr_config.id,
                batch_size as u32,
                Some(vec![sv1.fp_id.clone()]),
            )
            .unwrap();
            assert_eq!(svv_batch.len(), expected_svv_count, "Batch {} size", i);

            let expected_svvns = (&mut expected_svvns).take(expected_svv_count).collect_vec();
            assert_have_same_elements(
                svv_batch.iter().map(|svv| svv.version).collect_vec(),
                expected_svvns,
            );

            let expected_seqnos = (&mut expected_svv_seqnos).take(expected_svv_count).collect_vec();
            assert_have_same_elements(
                svv_batch.iter().map(|svv| svv.seqno).collect_vec(),
                expected_seqnos,
            );

            assert!(svv_batch.iter().all(|svv| svv.scoped_vault_id == sv1.id));
            assert!(svv_batch.iter().all(|svv| svv.scoped_vault_id == sv1.id));

            write_fake_manifests(conn, &vdr_config.id, svv_batch);
        }
    }

    fn write_fake_blobs(conn: &mut TestPgConn, config_id: &VaultDrConfigId, dls: Vec<DataLifetime>) {
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

        VaultDrBlob::bulk_create(conn, new_blobs).unwrap();
    }

    fn write_fake_manifests(
        conn: &mut TestPgConn,
        config_id: &VaultDrConfigId,
        svvs: Vec<ScopedVaultVersion>,
    ) {
        let new_manifests = svvs
            .into_iter()
            .map(|svv| NewVaultDrManifest {
                config_id: config_id.clone(),
                scoped_vault_version_id: svv.id,
                bucket_path: crypto::random::gen_rand_bytes(32).encode_hex(),
                content_etag: "content-etag".to_owned(),
                content_length_bytes: 123,
                seqno: svv.seqno,
            })
            .collect_vec();

        VaultDrManifest::bulk_create(conn, new_manifests).unwrap();
    }
}
