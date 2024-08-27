use crate::models::data_lifetime::DataLifetime;
use crate::models::ob_configuration::IsLive;
use crate::DbResult;
use crate::PgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::data_lifetime;
use db_schema::schema::scoped_vault;
use db_schema::schema::vault_dr_blob;
use diesel::prelude::*;
use diesel::QueryDsl;
use newtypes::DataLifetimeSeqno;
use newtypes::FpId;
use newtypes::TenantId;
use newtypes::VaultDrConfigId;


// Load up to `batch_size` DataLifetime records for the given tenant/is_live that do not have
// corresponding blobs for the given config.
pub fn load_vault_dr_data_lifetime_batch(
    conn: &mut PgConn,
    tenant_id: &TenantId,
    is_live: IsLive,
    config_id: &VaultDrConfigId,
    batch_size: u32,
    fp_id_filter: Option<Vec<FpId>>,
) -> DbResult<Vec<DataLifetime>> {
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

pub fn get_latest_vault_dr_backup_record_timestamp(
    conn: &mut PgConn,
    config_id: &VaultDrConfigId,
) -> DbResult<Option<DateTime<Utc>>> {
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
    use newtypes::IdentityDataKind;

    #[db_test]
    fn test_vault_dr_batch_query(conn: &mut TestPgConn) {
        let tenant_id = fixtures::tenant::create(conn).id;
        let ob_config_id = fixtures::ob_configuration::create(conn, &tenant_id, true).id;
        let v1_id = fixtures::vault::create_person(conn, true).into_inner().id;
        let sv1 = fixtures::scoped_vault::create(conn, &v1_id, &ob_config_id);

        let new_ape = NewVaultDrAwsPreEnrollment {
            tenant_id: &tenant_id,
            is_live: true,
            aws_external_id: crypto::random::gen_rand_bytes(16).encode_hex::<String>().into(),
        };
        let ape = VaultDrAwsPreEnrollment::get_or_create(conn, new_ape).unwrap();

        let new_vdr_config = NewVaultDrConfig {
            created_at: Utc::now(),
            tenant_id: &tenant_id,
            is_live: true,
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
        let mut seqno_timeline = vec![];
        let mut dl_ids = vec![];
        for _ in 0..=5 {
            let seqno1 = DataLifetime::get_next_seqno(conn).unwrap();
            DataLifetime::bulk_deactivate_kinds(
                conn,
                &sv1,
                vec![DataIdentifier::Id(IdentityDataKind::Dob)],
                seqno1,
            )
            .unwrap();
            let dl =
                fixtures::data_lifetime::build(conn, &v1_id, &sv1, seqno1, None, None, IdentityDataKind::Dob);
            seqno_timeline.push(seqno1);
            dl_ids.push(dl.id);

            let seqno2 = DataLifetime::get_next_seqno(conn).unwrap();
            DataLifetime::bulk_deactivate_kinds(
                conn,
                &sv1,
                vec![DataIdentifier::Id(IdentityDataKind::Email)],
                seqno1,
            )
            .unwrap();
            let dl = fixtures::data_lifetime::build(
                conn,
                &v1_id,
                &sv1,
                seqno2,
                None,
                None,
                IdentityDataKind::Email,
            );
            seqno_timeline.push(seqno1);
            dl_ids.push(dl.id);

            // Create another DL at the same seqno.
            DataLifetime::bulk_deactivate_kinds(
                conn,
                &sv1,
                vec![DataIdentifier::Id(IdentityDataKind::FirstName)],
                seqno1,
            )
            .unwrap();
            let dl = fixtures::data_lifetime::build(
                conn,
                &v1_id,
                &sv1,
                seqno2,
                None,
                None,
                IdentityDataKind::FirstName,
            );
            seqno_timeline.push(seqno1);
            dl_ids.push(dl.id);
        }

        assert_eq!(seqno_timeline.len(), dl_ids.len());

        // Make sure we're triggering a condition where a batch doesn't contain all DLs for a
        // seqno.
        assert_eq!(seqno_timeline[batch_size - 1], seqno_timeline[batch_size]);

        let expected_batch_sizes = vec![batch_size, batch_size, batch_size, 3, 0, 0];
        assert_eq!(dl_ids.len(), expected_batch_sizes.iter().sum::<usize>());


        let mut dl_ids = dl_ids.into_iter();
        for (i, expected_batch_size) in expected_batch_sizes.into_iter().enumerate() {
            let batch = load_vault_dr_data_lifetime_batch(
                conn,
                &tenant_id,
                true,
                &vdr_config.id,
                batch_size as u32,
                Some(vec![sv1.fp_id.clone()]),
            )
            .unwrap();
            assert_eq!(batch.len(), expected_batch_size, "Batch {} size", i);

            let expected_dl_ids = (&mut dl_ids).take(expected_batch_size).collect_vec();
            assert_have_same_elements(
                batch.iter().map(|dl| dl.id.clone()).collect_vec(),
                expected_dl_ids,
            );

            write_fake_blobs(conn, &vdr_config.id, batch);
        }
    }

    fn write_fake_blobs(conn: &mut TestPgConn, config_id: &VaultDrConfigId, dls: Vec<DataLifetime>) {
        let new_blobs = dls
            .into_iter()
            .map(|dl| NewVaultDrBlob {
                created_at: Utc::now(),
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
}
