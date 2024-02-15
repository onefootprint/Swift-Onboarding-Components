use crate::{DbError, DbResult, PgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::tenant_app_meta;
use diesel::{prelude::*, Insertable, Queryable};
use newtypes::{TenantAppKind, TenantAppMetaId, TenantId};

#[derive(Debug, Clone, Insertable, Queryable)]
#[diesel(table_name = tenant_app_meta)]
pub struct TenantAppMeta {
    pub id: TenantAppMetaId,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,

    pub tenant_id: TenantId,
    pub kind: TenantAppKind,
    pub name: String,
    pub ios_app_bundle_id: Option<String>,       // Only set for iOS
    pub ios_team_id: Option<String>,             // Only set for iOS
    pub android_package_name: Option<String>,    // Only set for Android
    pub android_apk_cert_sha256: Option<String>, // Only set for Android

    pub deactivated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = tenant_app_meta)]
pub struct NewTenantAppMeta {
    pub created_at: DateTime<Utc>,
    pub name: String,
    pub tenant_id: TenantId,
    pub kind: TenantAppKind,
    pub ios_app_bundle_id: Option<String>,       // Only set for iOS
    pub ios_team_id: Option<String>,             // Only set for iOS
    pub android_package_name: Option<String>,    // Only set for Android
    pub android_apk_cert_sha256: Option<String>, // Only set for Android
}

impl TenantAppMeta {
    #[tracing::instrument("TenantAppMeta::create", skip_all)]
    #[allow(clippy::too_many_arguments)]
    pub fn create(
        conn: &mut PgConn,
        tenant_id: TenantId,
        kind: TenantAppKind,
        name: String,
        ios_app_bundle_id: Option<String>,
        ios_team_id: Option<String>,
        android_package_name: Option<String>,
        android_apk_cert_sha256: Option<String>,
    ) -> DbResult<Self> {
        let new = NewTenantAppMeta {
            created_at: Utc::now(),
            tenant_id,
            name,
            kind,
            ios_app_bundle_id,
            ios_team_id,
            android_package_name,
            android_apk_cert_sha256,
        };

        let result = diesel::insert_into(tenant_app_meta::table)
            .values(new)
            .get_result(conn)?;

        Ok(result)
    }

    #[tracing::instrument("TenantAppMeta::list", skip_all)]
    pub fn list(conn: &mut PgConn, tenant_id: &TenantId, kind: TenantAppKind) -> DbResult<Vec<Self>> {
        let result = tenant_app_meta::table
            .filter(tenant_app_meta::tenant_id.eq(tenant_id))
            .filter(tenant_app_meta::kind.eq(kind))
            .filter(tenant_app_meta::deactivated_at.is_null())
            .order_by(tenant_app_meta::created_at.asc())
            .get_results(conn)?;
        Ok(result)
    }

    #[tracing::instrument("TenantAppMeta::deactivate", skip_all)]
    pub fn deactivate(conn: &mut PgConn, tenant_id: &TenantId, tam_id: &TenantAppMetaId) -> DbResult<()> {
        let count_updated = diesel::update(tenant_app_meta::table)
            .filter(tenant_app_meta::tenant_id.eq(tenant_id))
            .filter(tenant_app_meta::id.eq(tam_id))
            .filter(tenant_app_meta::deactivated_at.is_null())
            .set(tenant_app_meta::deactivated_at.eq(Utc::now()))
            .execute(conn)?;

        if count_updated == 0 {
            Err(DbError::ObjectNotFound)
        } else {
            Ok(())
        }
    }
}
