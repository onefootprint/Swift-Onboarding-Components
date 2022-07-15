use crate::diesel::ExpressionMethods;
use crate::diesel::QueryDsl;
use crate::diesel::RunQueryDsl;
use crate::schema::{ob_configurations, tenants};
use crate::DbPool;
use chrono::{DateTime, Utc};
use diesel::{Insertable, Queryable};
use newtypes::ObConfigurationSettings;
use newtypes::{DataKind, ObConfigurationId, ObConfigurationKey, TenantId};
use serde::{Deserialize, Serialize};

use super::tenants::Tenant;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = ob_configurations)]
pub struct ObConfiguration {
    pub id: ObConfigurationId,
    pub key: ObConfigurationKey,
    pub name: String,
    pub description: Option<String>,
    pub tenant_id: TenantId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub must_collect_data_kinds: Vec<DataKind>,
    pub settings: ObConfigurationSettings,
    pub is_disabled: bool,
    pub can_access_data_kinds: Vec<DataKind>,
    pub is_live: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = ob_configurations)]
pub struct NewObConfiguration {
    pub name: String,
    pub description: Option<String>,
    pub tenant_id: TenantId,
    pub must_collect_data_kinds: Vec<DataKind>,
    pub can_access_data_kinds: Vec<DataKind>,
    pub settings: ObConfigurationSettings,
    pub is_live: bool,
}

impl NewObConfiguration {
    pub async fn save(self, pool: &DbPool) -> Result<ObConfiguration, crate::DbError> {
        let obc = pool
            .db_query(move |conn| {
                diesel::insert_into(ob_configurations::table)
                    .values(self)
                    .get_result::<ObConfiguration>(conn)
            })
            .await??;
        Ok(obc)
    }
}

impl ObConfiguration {
    pub async fn get_by_id(pool: &DbPool, id: ObConfigurationId) -> Result<ObConfiguration, crate::DbError> {
        let id = pool
            .db_query(move |conn| -> Result<ObConfiguration, crate::DbError> {
                let obc = ob_configurations::table
                    .filter(ob_configurations::id.eq(id))
                    .first(conn)?;
                Ok(obc)
            })
            .await??;
        Ok(id)
    }

    pub async fn get(pool: &DbPool, key: ObConfigurationKey) -> Result<ObConfiguration, crate::DbError> {
        let id = pool
            .db_query(move |conn| -> Result<ObConfiguration, crate::DbError> {
                let obc = ob_configurations::table
                    .filter(ob_configurations::key.eq(key))
                    .first(conn)?;
                Ok(obc)
            })
            .await??;
        Ok(id)
    }

    pub async fn get_with_tenant(
        pool: &DbPool,
        key: ObConfigurationKey,
    ) -> Result<(ObConfiguration, Tenant), crate::DbError> {
        let id = pool
            .db_query(move |conn| -> Result<(ObConfiguration, Tenant), crate::DbError> {
                let obc: ObConfiguration = ob_configurations::table
                    .filter(ob_configurations::key.eq(key))
                    .first(conn)?;
                let tenant: Tenant = tenants::table
                    .filter(tenants::id.eq(&obc.tenant_id))
                    .first(conn)?;
                Ok((obc, tenant))
            })
            .await??;
        Ok(id)
    }

    pub async fn get_for_tenant(
        pool: &DbPool,
        key: ObConfigurationKey,
        tenant_id: TenantId,
    ) -> Result<ObConfiguration, crate::DbError> {
        let id = pool
            .db_query(move |conn| -> Result<ObConfiguration, crate::DbError> {
                let obc = ob_configurations::table
                    .filter(ob_configurations::key.eq(key))
                    .filter(ob_configurations::tenant_id.eq(tenant_id))
                    .first(conn)?;
                Ok(obc)
            })
            .await??;
        Ok(id)
    }
}
