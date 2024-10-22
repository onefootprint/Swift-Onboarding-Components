use super::data_lifetime::DataLifetime;
use super::ob_configuration::IsLive;
use crate::errors::FpOptionalExtension;
use crate::DbResult;
use crate::NonNullVec;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::data_lifetime;
use db_schema::schema::vault_dr_aws_pre_enrollment;
use db_schema::schema::vault_dr_blob;
use db_schema::schema::vault_dr_config;
use db_schema::schema::vault_dr_manifest;
use diesel::prelude::*;
use diesel::Insertable;
use newtypes::DataLifetimeId;
use newtypes::DataLifetimeSeqno;
use newtypes::Locked;
use newtypes::PiiString;
use newtypes::ScopedVaultVersionId;
use newtypes::TenantId;
use newtypes::VaultDrAwsPreEnrollmentId;
use newtypes::VaultDrBlobId;
use newtypes::VaultDrConfigId;
use newtypes::VaultDrManifestId;

#[derive(Debug, Clone, Queryable, Selectable, Identifiable)]
#[diesel(table_name = vault_dr_aws_pre_enrollment)]
pub struct VaultDrAwsPreEnrollment {
    pub id: VaultDrAwsPreEnrollmentId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,

    pub tenant_id: TenantId,
    pub is_live: bool,
    pub aws_external_id: PiiString,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = vault_dr_aws_pre_enrollment)]
pub struct NewVaultDrAwsPreEnrollment<'a> {
    pub tenant_id: &'a TenantId,
    pub is_live: bool,
    pub aws_external_id: PiiString,
}

#[derive(Debug, Clone, derive_more::From)]
enum VaultDrAwsPreEnrollmentIdentifier<'a> {
    Id(&'a VaultDrAwsPreEnrollmentId),
    TenantIdIsLive(&'a TenantId, IsLive),
}

impl VaultDrAwsPreEnrollment {
    #[tracing::instrument("VaultDrAwsPreEnrollment::get", skip_all)]
    pub fn get<'a>(
        conn: &mut PgConn,
        id_ref: impl Into<VaultDrAwsPreEnrollmentIdentifier<'a>>,
    ) -> DbResult<Self> {
        let id_ref: VaultDrAwsPreEnrollmentIdentifier = id_ref.into();

        let row = match id_ref {
            VaultDrAwsPreEnrollmentIdentifier::Id(id) => vault_dr_aws_pre_enrollment::table
                .filter(vault_dr_aws_pre_enrollment::id.eq(id))
                .first(conn)?,
            VaultDrAwsPreEnrollmentIdentifier::TenantIdIsLive(tenant_id, is_live) => {
                vault_dr_aws_pre_enrollment::table
                    .filter(vault_dr_aws_pre_enrollment::tenant_id.eq(tenant_id))
                    .filter(vault_dr_aws_pre_enrollment::is_live.eq(is_live))
                    .first(conn)?
            }
        };

        Ok(row)
    }

    #[tracing::instrument("VaultDrAwsPreEnrollment::get_or_create", skip_all)]
    pub fn get_or_create(conn: &mut TxnPgConn, new: NewVaultDrAwsPreEnrollment) -> DbResult<Self> {
        if let Some(existing) = Self::get(conn.conn(), (new.tenant_id, new.is_live)).optional()? {
            return Ok(existing);
        };

        // Try to insert the new record.
        diesel::insert_into(vault_dr_aws_pre_enrollment::table)
            .values(&new)
            .on_conflict_do_nothing()
            .execute(conn.conn())?;

        // Re-fetch the record. May be a record inserted by a different transaction.
        let result = Self::get(conn.conn(), (new.tenant_id, new.is_live))?;

        Ok(result)
    }
}

#[derive(Debug, Clone, Queryable, Selectable, Identifiable)]
#[diesel(table_name = vault_dr_config)]
pub struct VaultDrConfig {
    pub id: VaultDrConfigId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,

    pub created_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,

    // There is at most one active VDR Config per (tenant_id, is_live), enforced by a DB unique
    // index.
    pub tenant_id: TenantId,
    pub is_live: bool,

    pub aws_pre_enrollment_id: VaultDrAwsPreEnrollmentId,
    pub aws_account_id: String,
    pub aws_role_name: String,
    pub s3_bucket_name: String,

    pub recovery_public_key: String,
    pub wrapped_recovery_key: String,
    #[diesel(deserialize_as = NonNullVec<String>)]
    pub org_public_keys: Vec<String>,
    pub bucket_path_namespace: String,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = vault_dr_config)]
pub struct NewVaultDrConfig<'a> {
    pub created_at: DateTime<Utc>,

    pub tenant_id: &'a TenantId,
    pub is_live: bool,

    pub aws_pre_enrollment_id: &'a VaultDrAwsPreEnrollmentId,
    pub aws_account_id: String,
    pub aws_role_name: String,
    pub s3_bucket_name: String,

    pub recovery_public_key: String,
    pub wrapped_recovery_key: String,
    pub org_public_keys: Vec<String>,
    pub bucket_path_namespace: String,
}

#[derive(Debug, Clone, derive_more::From)]
enum VaultDrConfigIdentifier<'a> {
    Id(&'a VaultDrConfigId),
    TenantIdIsLive(&'a TenantId, IsLive),
}

impl VaultDrConfig {
    #[tracing::instrument("VaultDrConfig::get", skip_all)]
    pub fn get<'a>(conn: &mut PgConn, id_ref: impl Into<VaultDrConfigIdentifier<'a>>) -> DbResult<Self> {
        let id_ref: VaultDrConfigIdentifier = id_ref.into();

        let row = match id_ref {
            VaultDrConfigIdentifier::Id(id) => vault_dr_config::table.find(id).first(conn)?,
            VaultDrConfigIdentifier::TenantIdIsLive(tenant_id, is_live) => vault_dr_config::table
                .filter(vault_dr_config::tenant_id.eq(tenant_id))
                .filter(vault_dr_config::is_live.eq(is_live))
                .filter(vault_dr_config::deactivated_at.is_null())
                .select(Self::as_select())
                .first(conn)?,
        };
        Ok(row)
    }

    #[tracing::instrument("VaultDrConfig::lock", skip_all)]
    pub fn lock(conn: &mut PgConn, tenant_id: &TenantId, is_live: bool) -> DbResult<Option<Locked<Self>>> {
        let result = vault_dr_config::table
            .filter(vault_dr_config::tenant_id.eq(tenant_id))
            .filter(vault_dr_config::is_live.eq(is_live))
            .filter(vault_dr_config::deactivated_at.is_null())
            .select(Self::as_select())
            .for_no_key_update()
            .first(conn)
            .optional()?;

        Ok(result.map(Locked::new))
    }

    #[tracing::instrument("VaultDrConfig::create", skip_all)]
    pub fn create(conn: &mut TxnPgConn, new: NewVaultDrConfig) -> DbResult<Locked<Self>> {
        let result = diesel::insert_into(vault_dr_config::table)
            .values(&new)
            .get_result(conn.conn())?;

        Ok(Locked::new(result))
    }

    #[tracing::instrument("VaultDrConfig::deactivate", skip_all)]
    pub fn deactivate(conn: &mut TxnPgConn, config: Locked<Self>) -> DbResult<()> {
        diesel::update(vault_dr_config::table)
            .filter(vault_dr_config::id.eq(&config.id))
            .filter(vault_dr_config::deactivated_at.is_null())
            .set(vault_dr_config::deactivated_at.eq(Utc::now()))
            .execute(conn.conn())?;

        Ok(())
    }

    #[tracing::instrument("VaultDrConfig::list", skip_all)]
    pub fn list(conn: &mut PgConn) -> DbResult<Vec<Self>> {
        Ok(vault_dr_config::table
            .filter(vault_dr_config::deactivated_at.is_null())
            .select(Self::as_select())
            .load(conn)?)
    }
}

#[derive(Debug, Clone, Queryable, Selectable, Identifiable)]
#[diesel(table_name = vault_dr_blob)]
pub struct VaultDrBlob {
    pub id: VaultDrBlobId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,

    pub config_id: VaultDrConfigId,
    pub data_lifetime_id: DataLifetimeId,
    pub dl_created_seqno: DataLifetimeSeqno,

    pub bucket_path: String,
    pub content_etag: String,
    pub wrapped_record_key: PiiString,
    pub content_length_bytes: i64,

    pub dl_created_at_svv_id: Option<ScopedVaultVersionId>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = vault_dr_blob)]
pub struct NewVaultDrBlob {
    pub config_id: VaultDrConfigId,
    pub data_lifetime_id: DataLifetimeId,
    pub dl_created_seqno: DataLifetimeSeqno,

    pub bucket_path: String,
    pub content_etag: String,
    pub wrapped_record_key: PiiString,
    pub content_length_bytes: i64,

    pub dl_created_at_svv_id: ScopedVaultVersionId,
}

impl VaultDrBlob {
    #[tracing::instrument("VaultDrBlob::bulk_create", skip_all)]
    pub fn bulk_create(conn: &mut TxnPgConn, new: Vec<NewVaultDrBlob>) -> DbResult<Vec<Self>> {
        let results = diesel::insert_into(vault_dr_blob::table)
            .values(new)
            .get_results(conn.conn())?;

        Ok(results)
    }

    #[tracing::instrument("VaultDrBlob::bulk_get", skip_all)]
    pub fn bulk_get(
        conn: &mut PgConn,
        config_id: &VaultDrConfigId,
        bucket_paths: Vec<String>,
    ) -> DbResult<Vec<(Self, DataLifetime)>> {
        let results = vault_dr_blob::table
            .inner_join(data_lifetime::table)
            .filter(vault_dr_blob::config_id.eq(config_id))
            .filter(vault_dr_blob::bucket_path.eq_any(bucket_paths))
            .select((VaultDrBlob::as_select(), DataLifetime::as_select()))
            .load(conn)?;

        Ok(results)
    }
}

#[derive(Debug, Clone, Queryable, Selectable, Identifiable)]
#[diesel(table_name = vault_dr_manifest)]
pub struct VaultDrManifest {
    pub id: VaultDrManifestId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,

    pub config_id: VaultDrConfigId,
    pub scoped_vault_version_id: ScopedVaultVersionId,

    pub bucket_path: String,
    pub content_etag: String,
    pub content_length_bytes: i64,

    pub seqno: DataLifetimeSeqno,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = vault_dr_manifest)]
pub struct NewVaultDrManifest {
    pub config_id: VaultDrConfigId,
    pub scoped_vault_version_id: ScopedVaultVersionId,

    pub bucket_path: String,
    pub content_etag: String,
    pub content_length_bytes: i64,

    pub seqno: DataLifetimeSeqno,
}

impl VaultDrManifest {
    #[tracing::instrument("VaultDrManifest::bulk_create", skip_all)]
    pub fn bulk_create(conn: &mut TxnPgConn, new: Vec<NewVaultDrManifest>) -> DbResult<Vec<Self>> {
        let results = diesel::insert_into(vault_dr_manifest::table)
            .values(new)
            .get_results(conn.conn())?;

        Ok(results)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::vault_dr::NewVaultDrAwsPreEnrollment;
    use crate::models::vault_dr::NewVaultDrConfig;
    use crate::models::vault_dr::VaultDrAwsPreEnrollment;
    use crate::models::vault_dr::VaultDrConfig;
    use crate::tests::fixtures;
    use crate::tests::prelude::*;
    use hex::ToHex;
    use macros::db_test_case;

    #[db_test_case(true)]
    #[db_test_case(false)]
    fn ensure_vault_dr_config_unique_for_tenant_is_live(conn: &mut TestPgConn, is_live: bool) {
        // Test that we didn't accidentally drop the uniqueness constraint on
        // vault_dr_config(tenant_id, is_live) since it's critical to the correctness of VDR. If
        // there were multiple active VDR configs for the same (tenant_id, is_live), the VDR batch
        // worker run for each config would overwrite each other's `backed_up_by_vdr_config_id`
        // progress markers, so the worker would not make progress on those configs.

        let tenant_id = fixtures::tenant::create(conn).id;

        for should_fail in [false, true] {
            let ape = NewVaultDrAwsPreEnrollment {
                tenant_id: &tenant_id,
                is_live,
                aws_external_id: crypto::random::gen_rand_bytes(16).encode_hex::<String>().into(),
            };
            let ape = VaultDrAwsPreEnrollment::get_or_create(conn, ape).unwrap();

            let new_vdr_cfg = NewVaultDrConfig {
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

            let failed = VaultDrConfig::create(conn, new_vdr_cfg).is_err();
            assert_eq!(failed, should_fail, "is_live={}", is_live);
        }
    }
}
