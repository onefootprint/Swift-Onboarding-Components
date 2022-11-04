use crate::schema::ob_configuration::BoxedQuery;
use crate::schema::{ob_configuration, onboarding, tenant};
use crate::{DbError, DbResult};
use crate::{DbPool, TxnPgConnection};
use chrono::{DateTime, Utc};
use diesel::pg::Pg;
use diesel::prelude::*;
use diesel::PgConnection;
use diesel::{Insertable, Queryable};
use newtypes::ApiKeyStatus;
use newtypes::ScopedUserId;
use newtypes::{CollectedDataOption, ObConfigurationId, ObConfigurationKey, TenantId};
use serde::{Deserialize, Serialize};

use super::tenant::Tenant;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Default)]
#[diesel(table_name = ob_configuration)]
pub struct ObConfiguration {
    pub id: ObConfigurationId,
    pub key: ObConfigurationKey,
    pub name: String,
    pub tenant_id: TenantId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub is_live: bool,
    pub status: ApiKeyStatus,
    pub created_at: DateTime<Utc>,
    pub must_collect_data: Vec<CollectedDataOption>,
    pub can_access_data: Vec<CollectedDataOption>,
    pub must_collect_identity_document: bool,
    pub can_access_identity_document_images: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable, Default)]
#[diesel(table_name = ob_configuration)]
struct NewObConfiguration {
    key: ObConfigurationKey,
    name: String,
    tenant_id: TenantId,
    is_live: bool,
    status: ApiKeyStatus,
    created_at: DateTime<Utc>,

    must_collect_data: Vec<CollectedDataOption>,
    can_access_data: Vec<CollectedDataOption>,

    must_collect_identity_document: bool,
    can_access_identity_document_images: bool,
}

#[derive(Debug)]
pub enum ObConfigIdentifier {
    Id(ObConfigurationId),
    Key(ObConfigurationKey),
    Tenant {
        id: ObConfigurationId,
        tenant_id: TenantId,
        is_live: bool,
    },
}

#[derive(AsChangeset)]
#[diesel(table_name = ob_configuration)]
struct ObConfigurationUpdate {
    name: Option<String>,
    status: Option<ApiKeyStatus>,
}

#[derive(Debug, Clone)]
pub struct ObConfigurationQuery {
    pub tenant_id: TenantId,
    pub is_live: bool,
}

impl ObConfiguration {
    fn list_query(query: &ObConfigurationQuery) -> BoxedQuery<Pg> {
        ob_configuration::table
            .filter(ob_configuration::tenant_id.eq(&query.tenant_id))
            .filter(ob_configuration::is_live.eq(query.is_live))
            .into_boxed()
    }

    pub fn list(
        conn: &mut PgConnection,
        query: &ObConfigurationQuery,
        cursor: Option<DateTime<Utc>>,
        page_size: i64,
    ) -> DbResult<Vec<Self>> {
        let mut query = Self::list_query(query)
            .order_by(ob_configuration::created_at.desc())
            .limit(page_size);

        if let Some(cursor) = cursor {
            query = query.filter(ob_configuration::created_at.le(cursor))
        }
        let results = query.load::<Self>(conn)?;
        Ok(results)
    }

    pub fn count(conn: &mut PgConnection, query: &ObConfigurationQuery) -> DbResult<i64> {
        let count = Self::list_query(query).count().get_result(conn)?;
        Ok(count)
    }

    pub fn list_authorized_for_user(
        conn: &mut PgConnection,
        scoped_user_id: ScopedUserId,
    ) -> DbResult<Vec<Self>> {
        let obcs = ob_configuration::table
            .inner_join(onboarding::table)
            .filter(onboarding::scoped_user_id.eq(scoped_user_id))
            .filter(onboarding::is_authorized.eq(true))
            .select(ob_configuration::all_columns)
            .get_results(conn)?;
        Ok(obcs)
    }

    pub fn get_enabled(conn: &mut PgConnection, identifier: ObConfigIdentifier) -> DbResult<(Self, Tenant)> {
        let mut query = ob_configuration::table.inner_join(tenant::table).into_boxed();

        match identifier {
            ObConfigIdentifier::Id(id) => query = query.filter(ob_configuration::id.eq(id)),
            ObConfigIdentifier::Key(key) => query = query.filter(ob_configuration::key.eq(key)),
            ObConfigIdentifier::Tenant {
                id,
                tenant_id,
                is_live,
            } => {
                query = query
                    .filter(ob_configuration::id.eq(id))
                    .filter(ob_configuration::tenant_id.eq(tenant_id))
                    .filter(ob_configuration::is_live.eq(is_live))
            }
        }

        let result: (ObConfiguration, Tenant) = query.first(conn)?;
        if result.0.status != ApiKeyStatus::Enabled {
            return Err(DbError::ApiKeyDisabled);
        }
        Ok(result)
    }

    pub async fn create(
        pool: &DbPool,
        name: String,
        tenant_id: TenantId,
        must_collect_data: Vec<CollectedDataOption>,
        can_access_data: Vec<CollectedDataOption>,
        must_collect_identity_document: bool,
        can_access_identity_document_images: bool,
        is_live: bool,
    ) -> DbResult<Self> {
        let config = NewObConfiguration {
            key: ObConfigurationKey::generate(is_live),
            name,
            tenant_id,
            must_collect_data,
            must_collect_identity_document,
            can_access_identity_document_images,
            can_access_data,
            is_live,
            status: ApiKeyStatus::Enabled,
            created_at: Utc::now(),
        };
        let obc = pool
            .db_query(move |conn| {
                diesel::insert_into(ob_configuration::table)
                    .values(config)
                    .get_result::<ObConfiguration>(conn)
            })
            .await??;
        Ok(obc)
    }

    pub fn update(
        conn: &mut TxnPgConnection,
        id: ObConfigurationId,
        tenant_id: TenantId,
        is_live: bool,
        name: Option<String>,
        status: Option<ApiKeyStatus>,
    ) -> DbResult<Self> {
        let update = ObConfigurationUpdate { name, status };
        let results: Vec<Self> = diesel::update(ob_configuration::table)
            .filter(ob_configuration::id.eq(id))
            .filter(ob_configuration::tenant_id.eq(tenant_id))
            .filter(ob_configuration::is_live.eq(is_live))
            .set(update)
            .load(conn.conn())?;

        if results.len() > 1 {
            return Err(DbError::IncorrectNumberOfRowsUpdated);
        }
        let result = results.into_iter().next().ok_or(DbError::UpdateTargetNotFound)?;
        Ok(result)
    }
}
