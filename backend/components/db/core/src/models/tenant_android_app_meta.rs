use crate::DbError;
use crate::DbResult;
use crate::NonNullVec;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::tenant_android_app_meta;
use diesel::prelude::*;
use diesel::Insertable;
use diesel::Queryable;
use newtypes::SealedVaultBytes;
use newtypes::TenantAndroidAppMetaId;
use newtypes::TenantId;

#[derive(Debug, Clone, Insertable, Queryable)]
#[diesel(table_name = tenant_android_app_meta)]
pub struct TenantAndroidAppMeta {
    pub id: TenantAndroidAppMetaId,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub tenant_id: TenantId,
    #[diesel(deserialize_as = NonNullVec<String>)]
    pub package_names: Vec<String>,
    #[diesel(deserialize_as = NonNullVec<String>)]
    pub apk_cert_sha256s: Vec<String>,
    pub e_integrity_verification_key: SealedVaultBytes,
    pub e_integrity_decryption_key: SealedVaultBytes,
    pub deactivated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = tenant_android_app_meta)]
pub struct NewTenantAndroidAppMeta {
    pub created_at: DateTime<Utc>,
    pub tenant_id: TenantId,
    pub package_names: Vec<String>,
    pub apk_cert_sha256s: Vec<String>,
    pub e_integrity_verification_key: SealedVaultBytes,
    pub e_integrity_decryption_key: SealedVaultBytes,
}

#[derive(AsChangeset)]
#[diesel(table_name = tenant_android_app_meta)]
pub struct TenantAndroidAppMetaUpdate {
    pub package_names: Option<Vec<String>>,
    pub apk_cert_sha256s: Option<Vec<String>>,
    pub e_integrity_verification_key: Option<SealedVaultBytes>,
    pub e_integrity_decryption_key: Option<SealedVaultBytes>,
}

pub struct TenantAndroidAppFilters {
    pub tenant_id: TenantId,
    pub package_name: Option<String>,
}

impl TenantAndroidAppMeta {
    #[tracing::instrument("TenantAndroidAppMeta::create", skip_all)]
    #[allow(clippy::too_many_arguments)]
    pub fn create(
        conn: &mut PgConn,
        tenant_id: TenantId,
        package_names: Vec<String>,
        apk_cert_sha256s: Vec<String>,
        e_integrity_verification_key: SealedVaultBytes,
        e_integrity_decryption_key: SealedVaultBytes,
    ) -> DbResult<Self> {
        let new = NewTenantAndroidAppMeta {
            created_at: Utc::now(),
            tenant_id,
            package_names,
            apk_cert_sha256s,
            e_integrity_verification_key,
            e_integrity_decryption_key,
        };

        let meta = diesel::insert_into(tenant_android_app_meta::table)
            .values(new)
            .get_result(conn)?;

        Ok(meta)
    }

    #[tracing::instrument("TenantAndroidAppMeta::update", skip_all)]
    #[allow(clippy::too_many_arguments)]
    pub fn update(
        conn: &mut TxnPgConn,
        id: TenantAndroidAppMetaId,
        tenant_id: TenantId,
        package_names: Option<Vec<String>>,
        apk_cert_sha256s: Option<Vec<String>>,
        e_integrity_verification_key: Option<SealedVaultBytes>,
        e_integrity_decryption_key: Option<SealedVaultBytes>,
    ) -> DbResult<Self> {
        let update = TenantAndroidAppMetaUpdate {
            package_names,
            apk_cert_sha256s,
            e_integrity_verification_key,
            e_integrity_decryption_key,
        };
        let meta = Self::get(conn, id, &tenant_id)?;

        let results: Vec<Self> = diesel::update(tenant_android_app_meta::table)
            .filter(tenant_android_app_meta::id.eq(meta.id))
            .filter(tenant_android_app_meta::tenant_id.eq(tenant_id))
            .set(update)
            .load(conn.conn())?;

        if results.len() > 1 {
            return Err(DbError::IncorrectNumberOfRowsUpdated);
        }
        let result = results.into_iter().next().ok_or(DbError::UpdateTargetNotFound)?;
        Ok(result)
    }

    #[tracing::instrument("TenantAndroidAppMeta::list", skip_all)]
    pub fn list(conn: &mut PgConn, filters: TenantAndroidAppFilters) -> DbResult<Vec<Self>> {
        let mut query = tenant_android_app_meta::table
            .filter(tenant_android_app_meta::tenant_id.eq(filters.tenant_id))
            .into_boxed();

        if let Some(package_name) = filters.package_name {
            query = query.filter(tenant_android_app_meta::package_names.contains(vec![package_name]))
        };

        let result = query
            .filter(tenant_android_app_meta::deactivated_at.is_null())
            .order_by(tenant_android_app_meta::created_at.asc())
            .get_results(conn)?;
        Ok(result)
    }

    #[tracing::instrument("TenantAndroidAppMeta::get", skip_all)]
    pub fn get(
        conn: &mut PgConn,
        id: TenantAndroidAppMetaId,
        tenant_id: &TenantId,
    ) -> DbResult<TenantAndroidAppMeta> {
        let query = tenant_android_app_meta::table
            .filter(tenant_android_app_meta::deactivated_at.is_null())
            .filter(tenant_android_app_meta::id.eq(id))
            .filter(tenant_android_app_meta::tenant_id.eq(tenant_id));
        let result = query.first(conn)?;
        Ok(result)
    }

    #[tracing::instrument("TenantAndroidAppMeta::deactivate", skip_all)]
    pub fn deactivate(conn: &mut PgConn, id: &TenantAndroidAppMetaId, tenant_id: &TenantId) -> DbResult<()> {
        let count_updated = diesel::update(tenant_android_app_meta::table)
            .filter(tenant_android_app_meta::id.eq(id))
            .filter(tenant_android_app_meta::tenant_id.eq(tenant_id))
            .filter(tenant_android_app_meta::deactivated_at.is_null())
            .set(tenant_android_app_meta::deactivated_at.eq(Utc::now()))
            .execute(conn)?;

        if count_updated == 0 {
            Err(DbError::ObjectNotFound)
        } else {
            Ok(())
        }
    }
}
