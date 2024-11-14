use crate::DbError;
use crate::NonNullVec;
use crate::PgConn;
use crate::TxnPgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::tenant_ios_app_meta;
use diesel::prelude::*;
use diesel::Insertable;
use diesel::Queryable;
use newtypes::SealedVaultBytes;
use newtypes::TenantId;
use newtypes::TenantIosAppMetaId;

#[derive(Debug, Clone, Insertable, Queryable)]
#[diesel(table_name = tenant_ios_app_meta)]
pub struct TenantIosAppMeta {
    pub id: TenantIosAppMetaId,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub tenant_id: TenantId,
    pub team_id: String,
    #[diesel(deserialize_as = NonNullVec<String>)]
    pub app_bundle_ids: Vec<String>,
    pub device_check_key_id: String,
    pub e_device_check_private_key: SealedVaultBytes,
    pub deactivated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = tenant_ios_app_meta)]
pub struct NewTenantIosAppMeta {
    pub created_at: DateTime<Utc>,
    pub tenant_id: TenantId,
    pub team_id: String,
    pub app_bundle_ids: Vec<String>,
    pub device_check_key_id: String,
    pub e_device_check_private_key: SealedVaultBytes,
}

#[derive(AsChangeset)]
#[diesel(table_name = tenant_ios_app_meta)]
pub struct TenantIosAppMetaUpdate {
    pub team_id: Option<String>,
    pub app_bundle_ids: Option<Vec<String>>,
    pub device_check_key_id: Option<String>,
    pub e_device_check_private_key: Option<SealedVaultBytes>,
}

pub struct TenantIosAppFilters {
    pub tenant_id: TenantId,
    pub app_bundle_id: Option<String>,
}

impl TenantIosAppMeta {
    #[tracing::instrument("TenantIosAppMeta::create", skip_all)]
    #[allow(clippy::too_many_arguments)]
    pub fn create(
        conn: &mut PgConn,
        tenant_id: TenantId,
        team_id: String,
        app_bundle_ids: Vec<String>,
        device_check_key_id: String,
        e_device_check_private_key: SealedVaultBytes,
    ) -> FpResult<Self> {
        let new = NewTenantIosAppMeta {
            created_at: Utc::now(),
            tenant_id,
            team_id,
            app_bundle_ids,
            device_check_key_id,
            e_device_check_private_key,
        };

        let meta = diesel::insert_into(tenant_ios_app_meta::table)
            .values(new)
            .get_result(conn)?;

        Ok(meta)
    }

    #[tracing::instrument("TenantIosAppMeta::update", skip_all)]
    #[allow(clippy::too_many_arguments)]
    pub fn update(
        conn: &mut TxnPgConn,
        id: TenantIosAppMetaId,
        tenant_id: TenantId,
        team_id: Option<String>,
        app_bundle_ids: Option<Vec<String>>,
        device_check_key_id: Option<String>,
        e_device_check_private_key: Option<SealedVaultBytes>,
    ) -> FpResult<Self> {
        let update = TenantIosAppMetaUpdate {
            team_id,
            app_bundle_ids,
            device_check_key_id,
            e_device_check_private_key,
        };
        let meta = Self::get(conn, id, &tenant_id)?;

        let results: Vec<Self> = diesel::update(tenant_ios_app_meta::table)
            .filter(tenant_ios_app_meta::id.eq(meta.id))
            .filter(tenant_ios_app_meta::tenant_id.eq(tenant_id))
            .set(update)
            .load(conn.conn())?;

        if results.len() > 1 {
            return Err(DbError::IncorrectNumberOfRowsUpdated.into());
        }
        let result = results.into_iter().next().ok_or(DbError::UpdateTargetNotFound)?;
        Ok(result)
    }

    #[tracing::instrument("TenantIosAppMeta::list", skip_all)]
    pub fn list(conn: &mut PgConn, filters: TenantIosAppFilters) -> FpResult<Vec<Self>> {
        let mut query = tenant_ios_app_meta::table
            .filter(tenant_ios_app_meta::tenant_id.eq(filters.tenant_id))
            .into_boxed();

        if let Some(app_bundle_id) = filters.app_bundle_id {
            query = query.filter(tenant_ios_app_meta::app_bundle_ids.contains(vec![app_bundle_id]))
        };

        let result = query
            .filter(tenant_ios_app_meta::deactivated_at.is_null())
            .order_by(tenant_ios_app_meta::created_at.asc())
            .get_results(conn)?;
        Ok(result)
    }

    #[tracing::instrument("TenantIosAppMeta::get", skip_all)]
    pub fn get(
        conn: &mut PgConn,
        id: TenantIosAppMetaId,
        tenant_id: &TenantId,
    ) -> FpResult<TenantIosAppMeta> {
        let query = tenant_ios_app_meta::table
            .filter(tenant_ios_app_meta::deactivated_at.is_null())
            .filter(tenant_ios_app_meta::id.eq(id))
            .filter(tenant_ios_app_meta::tenant_id.eq(tenant_id));
        let result = query.first(conn)?;
        Ok(result)
    }

    #[tracing::instrument("TenantIosAppMeta::deactivate", skip_all)]
    pub fn deactivate(conn: &mut PgConn, id: &TenantIosAppMetaId, tenant_id: &TenantId) -> FpResult<()> {
        let count_updated = diesel::update(tenant_ios_app_meta::table)
            .filter(tenant_ios_app_meta::id.eq(id))
            .filter(tenant_ios_app_meta::tenant_id.eq(tenant_id))
            .filter(tenant_ios_app_meta::deactivated_at.is_null())
            .set(tenant_ios_app_meta::deactivated_at.eq(Utc::now()))
            .execute(conn)?;

        if count_updated == 0 {
            Err(DbError::ObjectNotFound.into())
        } else {
            Ok(())
        }
    }
}
