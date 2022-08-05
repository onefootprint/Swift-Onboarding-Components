use crate::schema::{ob_configurations, onboardings, tenants};
use crate::DbError;
use crate::DbPool;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
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
    key: ObConfigurationKey,
    name: String,
    tenant_id: TenantId,
    must_collect_data_kinds: Vec<DataKind>,
    can_access_data_kinds: Vec<DataKind>,
    is_live: bool,
    status: ApiKeyStatus,
    created_at: DateTime<Utc>,
}

#[derive(AsChangeset)]
#[diesel(table_name = ob_configurations)]
struct ObConfigurationUpdate {
    name: Option<String>,
    status: Option<ApiKeyStatus>,
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
            .order_by(ob_configurations::created_at.desc())
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

    pub fn get_enabled(
        conn: &mut PgConnection,
        key: ObConfigurationKey,
    ) -> Result<Option<(ObConfiguration, Tenant)>, crate::DbError> {
        let result: Option<(ObConfiguration, Tenant)> = ob_configurations::table
            .inner_join(tenants::table)
            .filter(ob_configurations::key.eq(key))
            .first(conn)
            .optional()?;
        if let Some((obc, _)) = &result {
            if obc.status != ApiKeyStatus::Enabled {
                return Err(DbError::ApiKeyDisabled);
            }
        }
        Ok(result)
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
            key: ObConfigurationKey::generate(is_live),
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

    pub fn update(
        conn: &mut PgConnection,
        id: ObConfigurationId,
        tenant_id: TenantId,
        is_live: bool,
        name: Option<String>,
        status: Option<ApiKeyStatus>,
    ) -> Result<usize, DbError> {
        let update = ObConfigurationUpdate { name, status };
        let num_updates = diesel::update(ob_configurations::table)
            .filter(ob_configurations::id.eq(id))
            .filter(ob_configurations::tenant_id.eq(tenant_id))
            .filter(ob_configurations::is_live.eq(is_live))
            .set(update)
            .execute(conn)?;

        if num_updates == 0 {
            return Err(DbError::UpdateTargetNotFound);
        }
        Ok(num_updates)
    }
}
