use super::tenant::Tenant;
use crate::NextPage;
use crate::OffsetPagination;
use crate::PgConn;
use crate::TxnPgConn;
use crate::{DbError, DbResult};
use chrono::{DateTime, Utc};
use db_schema::schema::ob_configuration::BoxedQuery;
use db_schema::schema::{ob_configuration, tenant};
use diesel::pg::Pg;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::AppearanceId;
use newtypes::DocumentCdoInfo;
use newtypes::WorkflowId;
use newtypes::{ApiKeyStatus, CipKind, DataIdentifierDiscriminant, DbActor};
use newtypes::{CollectedDataOption as CDO, ObConfigurationId, ObConfigurationKey, TenantId};

pub type IsLive = bool;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = ob_configuration)]
pub struct ObConfiguration {
    pub id: ObConfigurationId,
    pub key: ObConfigurationKey,
    pub name: String,
    pub tenant_id: TenantId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub is_live: IsLive,
    pub status: ApiKeyStatus,
    pub created_at: DateTime<Utc>,
    pub must_collect_data: Vec<CDO>,
    pub can_access_data: Vec<CDO>,
    pub appearance_id: Option<AppearanceId>,
    pub cip_kind: Option<CipKind>,
    pub optional_data: Vec<CDO>,
    // DO NOT REORDER THESE FIELDS
    pub is_no_phone_flow: bool,
    pub is_doc_first: bool,
    pub allow_international_residents: bool,
    pub international_country_restrictions: Option<Vec<String>>,
    pub author: Option<DbActor>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = ob_configuration)]
struct NewObConfiguration {
    key: ObConfigurationKey,
    name: String,
    tenant_id: TenantId,
    is_live: bool,
    status: ApiKeyStatus,
    created_at: DateTime<Utc>,

    must_collect_data: Vec<CDO>,
    can_access_data: Vec<CDO>,
    cip_kind: Option<CipKind>,
    optional_data: Vec<CDO>,
    is_no_phone_flow: bool,
    is_doc_first: bool,
    allow_international_residents: bool,
    international_country_restrictions: Option<Vec<String>>,
    author: DbActor,
}

#[derive(Debug)]
pub enum ObConfigIdentifier<'a> {
    Id(&'a ObConfigurationId),
    Key(&'a ObConfigurationKey),
    Tenant {
        id: &'a ObConfigurationId,
        tenant_id: &'a TenantId,
        is_live: bool,
    },
    Workflow(&'a WorkflowId),
}

impl<'a> From<&'a ObConfigurationId> for ObConfigIdentifier<'a> {
    fn from(id: &'a ObConfigurationId) -> Self {
        Self::Id(id)
    }
}

impl<'a> From<&'a ObConfigurationKey> for ObConfigIdentifier<'a> {
    fn from(key: &'a ObConfigurationKey) -> Self {
        Self::Key(key)
    }
}

impl<'a> From<(&'a ObConfigurationId, &'a TenantId, bool)> for ObConfigIdentifier<'a> {
    fn from((id, tenant_id, is_live): (&'a ObConfigurationId, &'a TenantId, bool)) -> Self {
        Self::Tenant {
            id,
            tenant_id,
            is_live,
        }
    }
}

impl<'a> From<&'a WorkflowId> for ObConfigIdentifier<'a> {
    fn from(id: &'a WorkflowId) -> Self {
        Self::Workflow(id)
    }
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
    pub status: Option<ApiKeyStatus>,
    pub search: Option<String>,
}

impl ObConfiguration {
    fn list_query(filters: &ObConfigurationQuery) -> BoxedQuery<Pg> {
        let mut query = ob_configuration::table
            .filter(ob_configuration::tenant_id.eq(&filters.tenant_id))
            .filter(ob_configuration::is_live.eq(filters.is_live))
            .into_boxed();
        if let Some(status) = filters.status.as_ref() {
            query = query.filter(ob_configuration::status.eq(status))
        }
        if let Some(search) = filters.search.as_ref() {
            query = query.filter(ob_configuration::name.ilike(format!("%{}%", search)));
        }
        query
    }

    #[tracing::instrument("ObConfiguration::list", skip_all)]
    pub fn list(
        conn: &mut PgConn,
        query: &ObConfigurationQuery,
        pagination: OffsetPagination,
    ) -> DbResult<(Vec<Self>, NextPage)> {
        let mut query = Self::list_query(query)
            .order_by(ob_configuration::created_at.desc())
            .limit(pagination.limit());

        if let Some(offset) = pagination.offset() {
            query = query.offset(offset)
        }
        let results = query.load::<Self>(conn)?;
        Ok(pagination.results(results))
    }

    #[tracing::instrument("ObConfiguration::count", skip_all)]
    pub fn count(conn: &mut PgConn, query: &ObConfigurationQuery) -> DbResult<i64> {
        let count = Self::list_query(query).count().get_result(conn)?;
        Ok(count)
    }

    #[tracing::instrument("ObConfiguration::get", skip_all)]
    pub fn get<'a, T>(conn: &mut PgConn, id: T) -> DbResult<(Self, Tenant)>
    where
        T: Into<ObConfigIdentifier<'a>>,
    {
        let mut query = ob_configuration::table.inner_join(tenant::table).into_boxed();

        match id.into() {
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
            ObConfigIdentifier::Workflow(id) => {
                use db_schema::schema::workflow;
                let obc_ids = workflow::table
                    .filter(workflow::id.eq(id))
                    .select(workflow::ob_configuration_id);
                query = query.filter(ob_configuration::id.nullable().eq_any(obc_ids))
            }
        }

        let result: (ObConfiguration, Tenant) = query.first(conn)?;
        Ok(result)
    }

    #[tracing::instrument("ObConfiguration::get_enabled", skip_all)]
    pub fn get_enabled<'a, T>(conn: &mut PgConn, id: T) -> DbResult<(Self, Tenant)>
    where
        T: Into<ObConfigIdentifier<'a>>,
    {
        let result = Self::get(conn, id)?;
        if result.0.status != ApiKeyStatus::Enabled {
            return Err(DbError::ApiKeyDisabled);
        }
        Ok(result)
    }

    #[allow(clippy::too_many_arguments)]
    #[tracing::instrument("ObConfiguration::create", skip_all)]
    pub fn create(
        conn: &mut PgConn,
        name: String,
        tenant_id: TenantId,
        must_collect_data: Vec<CDO>,
        optional_data: Vec<CDO>,
        can_access_data: Vec<CDO>,
        is_live: bool,
        cip_kind: Option<CipKind>,
        is_no_phone_flow: bool,
        is_doc_first: bool,
        allow_international_residents: bool,
        international_country_restrictions: Option<Vec<String>>,
        author: DbActor,
    ) -> DbResult<Self> {
        let config = NewObConfiguration {
            key: ObConfigurationKey::generate(is_live),
            name,
            tenant_id,
            must_collect_data,
            can_access_data,
            is_live,
            status: ApiKeyStatus::Enabled,
            created_at: Utc::now(),
            cip_kind,
            optional_data,
            is_no_phone_flow,
            is_doc_first,
            allow_international_residents,
            international_country_restrictions,
            author,
        };
        let obc = diesel::insert_into(ob_configuration::table)
            .values(config)
            .get_result::<ObConfiguration>(conn)?;
        Ok(obc)
    }

    #[tracing::instrument("ObConfiguration::update", skip_all)]
    pub fn update(
        conn: &mut TxnPgConn,
        id: &ObConfigurationId,
        tenant_id: &TenantId,
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

impl ObConfiguration {
    pub fn document_cdo(&self) -> Option<&DocumentCdoInfo> {
        self.must_collect_data
            .iter()
            .filter_map(|cdo| match cdo {
                CDO::Document(doc_info) => Some(doc_info),
                _ => None,
            })
            .next()
    }
    pub fn can_access_document(&self) -> bool {
        self.can_access_data
            .iter()
            .any(|cdo| matches!(cdo, CDO::Document(_)))
    }

    /// Returns true if this ob config requires collecting any CDO with the provided DataIdentifier kind
    pub fn must_collect(&self, di_kind: DataIdentifierDiscriminant) -> bool {
        self.must_collect_data
            .iter()
            .any(|cdo| cdo.parent().data_identifier_kind() == di_kind)
    }
}
