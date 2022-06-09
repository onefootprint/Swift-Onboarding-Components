use std::io::Write;

use crate::diesel::ExpressionMethods;
use crate::diesel::QueryDsl;
use crate::diesel::RunQueryDsl;
use crate::schema::ob_configurations;
use crate::DbPool;
use chrono::NaiveDateTime;
use diesel::pg::Pg;
use diesel::serialize::Output;
use diesel::{
    sql_types::Jsonb,
    types::{FromSql, ToSql},
};
use diesel::{Insertable, Queryable};
use newtypes::{DataKind, ObConfigurationId, TenantId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "ob_configurations"]
pub struct ObConfiguration {
    pub id: ObConfigurationId,
    pub name: String,
    pub description: Option<String>,
    pub tenant_id: TenantId,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
    pub required_user_data: Vec<DataKind>,
    pub settings: ObConfigurationSettings,
}

#[derive(FromSqlRow, AsExpression, Serialize, Deserialize, Debug, Clone)]
#[sql_type = "Jsonb"]
pub enum ObConfigurationSettings {
    Empty,
}

impl diesel::deserialize::FromSql<diesel::sql_types::Jsonb, Pg> for ObConfigurationSettings {
    fn from_sql(
        bytes: Option<&<Pg as diesel::backend::Backend>::RawValue>,
    ) -> diesel::deserialize::Result<Self> {
        let value = <serde_json::Value as FromSql<Jsonb, Pg>>::from_sql(bytes)?;
        Ok(serde_json::from_value(value)?)
    }
}

impl ToSql<Jsonb, Pg> for ObConfigurationSettings {
    fn to_sql<W: Write>(&self, out: &mut Output<W, Pg>) -> diesel::serialize::Result {
        let value = serde_json::to_value(self)?;
        <serde_json::Value as ToSql<Jsonb, Pg>>::to_sql(&value, out)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "ob_configurations"]
pub struct NewOnboardingConfiguration {
    pub name: String,
    pub description: Option<String>,
    pub tenant_id: TenantId,
    pub settings: ObConfigurationSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable, AsChangeset)]
#[table_name = "ob_configurations"]
pub struct UpdateOnboardingConfiguration {
    pub id: ObConfigurationId,
    pub tenant_id: TenantId,
    pub name: Option<String>,
    pub description: Option<String>,
    pub required_user_data: Option<Vec<DataKind>>,
    pub settings: Option<ObConfigurationSettings>,
}

impl NewOnboardingConfiguration {
    pub async fn default(pool: &DbPool, tenant_id: TenantId) -> Result<ObConfiguration, crate::DbError> {
        let default = Self {
            name: "Default".to_string(),
            description: None,
            tenant_id,
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

impl UpdateOnboardingConfiguration {
    pub async fn update(self, pool: &DbPool) -> Result<(), crate::DbError> {
        let _ = pool
            .get()
            .await?
            .interact(move |conn| -> Result<(), crate::DbError> {
                let _ = diesel::update(
                    ob_configurations::table
                        .filter(ob_configurations::id.eq(self.id.clone()))
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
    pub async fn get(
        pool: &DbPool,
        id: ObConfigurationId,
        tenant_id: TenantId,
    ) -> Result<ObConfiguration, crate::DbError> {
        let id = pool
            .get()
            .await?
            .interact(move |conn| -> Result<ObConfiguration, crate::DbError> {
                let obc = ob_configurations::table
                    .filter(ob_configurations::id.eq(id))
                    .filter(ob_configurations::tenant_id.eq(tenant_id))
                    .first(conn)?;
                Ok(obc)
            })
            .await??;
        Ok(id)
    }
}
