use crate::diesel::ExpressionMethods;
use crate::diesel::QueryDsl;
use crate::diesel::RunQueryDsl;
use crate::schema::{ob_configurations, onboardings, tenants};
use crate::DbError;
use crate::DbPool;
use chrono::{DateTime, Utc};
use diesel::PgConnection;
use diesel::{Insertable, Queryable};
use newtypes::ApiKeyStatus;
use newtypes::ScopedUserId;
use newtypes::{DataKind, ObConfigurationId, ObConfigurationKey, TenantId};
use serde::{Deserialize, Serialize};

use super::tenants::Tenant;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = ob_configurations)]
pub struct ObConfiguration {
    pub id: ObConfigurationId,
    pub key: ObConfigurationKey,
    pub name: String,
    pub tenant_id: TenantId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub must_collect_data_kinds: Vec<DataKind>,
    pub can_access_data_kinds: Vec<DataKind>,
    pub is_live: bool,
    pub status: ApiKeyStatus,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = ob_configurations)]
struct NewObConfiguration {
    name: String,
    tenant_id: TenantId,
    must_collect_data_kinds: Vec<DataKind>,
    can_access_data_kinds: Vec<DataKind>,
    is_live: bool,
    status: ApiKeyStatus,
    created_at: DateTime<Utc>,
}

impl ObConfiguration {
    pub fn list_for_tenant(
        conn: &mut PgConnection,
        tenant_id: &TenantId,
        is_live: bool,
    ) -> Result<Vec<ObConfiguration>, DbError> {
        let results = ob_configurations::table
            .filter(ob_configurations::tenant_id.eq(tenant_id))
            .filter(ob_configurations::is_live.eq(is_live))
            .get_results(conn)?;
        Ok(results)
    }

    pub async fn list_for_scoped_user(
        pool: &DbPool,
        scoped_user_id: ScopedUserId,
    ) -> Result<Vec<ObConfiguration>, crate::DbError> {
        let id = pool
            .db_query(move |conn| -> Result<Vec<ObConfiguration>, crate::DbError> {
                let obcs = ob_configurations::table
                    .inner_join(onboardings::table)
                    .filter(onboardings::scoped_user_id.eq(scoped_user_id))
                    // TODO filter on active onboardings
                    // https://linear.app/footprint/issue/FP-644/move-insight-event-id-status-onto-onboardinglink
                    .select(ob_configurations::all_columns)
                    .get_results(conn)?;
                Ok(obcs)
            })
            .await??;
        Ok(id)
    }

    pub async fn get_enabled(
        pool: &DbPool,
        key: ObConfigurationKey,
    ) -> Result<(ObConfiguration, Tenant), crate::DbError> {
        let id = pool
            .db_query(move |conn| -> Result<(ObConfiguration, Tenant), crate::DbError> {
                let obc: ObConfiguration = ob_configurations::table
                    .filter(ob_configurations::key.eq(key))
                    .filter(ob_configurations::status.eq(ApiKeyStatus::Enabled))
                    .first(conn)?;
                let tenant: Tenant = tenants::table
                    .filter(tenants::id.eq(&obc.tenant_id))
                    .first(conn)?;
                Ok((obc, tenant))
            })
            .await??;
        Ok(id)
    }

    pub async fn create(
        pool: &DbPool,
        name: String,
        tenant_id: TenantId,
        must_collect_data_kinds: Vec<DataKind>,
        can_access_data_kinds: Vec<DataKind>,
        is_live: bool,
    ) -> Result<ObConfiguration, crate::DbError> {
        let config = NewObConfiguration {
            name,
            tenant_id,
            must_collect_data_kinds,
            can_access_data_kinds,
            is_live,
            status: ApiKeyStatus::Enabled,
            created_at: Utc::now(),
        };
        let obc = pool
            .db_query(move |conn| {
                diesel::insert_into(ob_configurations::table)
                    .values(config)
                    .get_result::<ObConfiguration>(conn)
            })
            .await??;
        Ok(obc)
    }
}
