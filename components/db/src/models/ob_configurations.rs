use crate::diesel::ExpressionMethods;
use crate::diesel::QueryDsl;
use crate::diesel::RunQueryDsl;
use crate::schema::{ob_configurations, tenants};
use crate::DbPool;
use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable};
use newtypes::ObConfigurationSettings;
use newtypes::{DataKind, ObConfigurationId, ObConfigurationKey, TenantId};
use serde::{Deserialize, Serialize};

use super::tenants::Tenant;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "ob_configurations"]
pub struct ObConfiguration {
    pub id: ObConfigurationId,
    pub key: ObConfigurationKey,
    pub name: String,
    pub description: Option<String>,
    pub tenant_id: TenantId,
    pub _created_at: NaiveDateTime,
    pub _updated_at: NaiveDateTime,
    pub required_user_data: Vec<DataKind>,
    pub settings: ObConfigurationSettings,
    pub is_disabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "ob_configurations"]
pub struct NewObConfiguration {
    pub name: String,
    pub description: Option<String>,
    pub tenant_id: TenantId,
    pub required_user_data: Vec<DataKind>,
    pub settings: ObConfigurationSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable, AsChangeset)]
#[table_name = "ob_configurations"]
pub struct UpdateObConfiguration {
    pub key: ObConfigurationKey,
    pub tenant_id: TenantId,
    pub name: Option<String>,
    pub description: Option<String>,
    pub required_user_data: Option<Vec<DataKind>>,
    pub settings: Option<ObConfigurationSettings>,
}

impl NewObConfiguration {
    pub async fn default(pool: &DbPool, tenant_id: TenantId) -> Result<ObConfiguration, crate::DbError> {
        let default = Self {
            name: "Default".to_string(),
            description: None,
            tenant_id,
            required_user_data: vec![
                DataKind::FirstName,
                DataKind::LastName,
                DataKind::Dob,
                DataKind::Ssn,
                DataKind::StreetAddress,
                DataKind::StreetAddress2,
                DataKind::City,
                DataKind::State,
                DataKind::Zip,
                DataKind::Country,
                DataKind::Email,
                DataKind::PhoneNumber,
            ],
            settings: ObConfigurationSettings::Empty,
        };
        let obc = pool
            .get()
            .await?
            .interact(move |conn| {
                diesel::insert_into(ob_configurations::table)
                    .values(&default)
                    .get_result::<ObConfiguration>(conn)
            })
            .await??;
        Ok(obc)
    }
}

impl UpdateObConfiguration {
    pub async fn update(self, pool: &DbPool) -> Result<(), crate::DbError> {
        let _ = pool
            .get()
            .await?
            .interact(move |conn| -> Result<(), crate::DbError> {
                let _ = diesel::update(
                    ob_configurations::table
                        .filter(ob_configurations::key.eq(self.key.clone()))
                        .filter(ob_configurations::tenant_id.eq(self.tenant_id.clone())),
                )
                .set(self)
                .execute(conn)?;
                Ok(())
            })
            .await??;
        Ok(())
    }
}

impl ObConfiguration {
    pub async fn get(pool: &DbPool, key: ObConfigurationKey) -> Result<ObConfiguration, crate::DbError> {
        let id = pool
            .get()
            .await?
            .interact(move |conn| -> Result<ObConfiguration, crate::DbError> {
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
            .get()
            .await?
            .interact(move |conn| -> Result<(ObConfiguration, Tenant), crate::DbError> {
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
            .get()
            .await?
            .interact(move |conn| -> Result<ObConfiguration, crate::DbError> {
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
