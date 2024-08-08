use crate::DbError;
use crate::DbResult;
use crate::PgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::tenant_tag;
use diesel::prelude::*;
use diesel::Insertable;
use diesel::Queryable;
use newtypes::DbActor;
use newtypes::TenantId;
use newtypes::TenantTagId;
use newtypes::VaultKind;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = tenant_tag)]
pub struct TenantTag {
    pub id: TenantTagId,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub tenant_id: TenantId,
    pub created_by_actor: DbActor,
    pub kind: VaultKind,
    pub tag: String,
    pub is_live: bool,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub deactivated_by_actor: Option<DbActor>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = tenant_tag)]
pub struct NewTenantTag {
    pub created_at: DateTime<Utc>,
    pub tenant_id: TenantId,
    pub created_by_actor: DbActor,
    pub kind: VaultKind,
    pub tag: String,
    pub is_live: bool,
}

#[derive(Debug, AsChangeset, Default)]
#[diesel(table_name = tenant_tag)]
struct UpdateTenantTag {
    deactivated_at: Option<DateTime<Utc>>,
    deactivated_by_actor: Option<DbActor>,
}

impl UpdateTenantTag {
    pub fn set_deactivated_at(deactivated_by_actor: DbActor) -> Self {
        UpdateTenantTag {
            deactivated_at: Some(Utc::now()),
            deactivated_by_actor: Some(deactivated_by_actor),
        }
    }
}

impl TenantTag {
    #[tracing::instrument("TenantTag::create", skip_all)]
    pub fn create(
        conn: &mut PgConn,
        tenant_id: TenantId,
        created_by: DbActor,
        kind: VaultKind,
        tag: String,
        is_live: bool,
    ) -> DbResult<Self> {
        let new = NewTenantTag {
            created_at: Utc::now(),
            tenant_id,
            created_by_actor: created_by,
            kind,
            tag,
            is_live,
        };

        let result = diesel::insert_into(tenant_tag::table)
            .values(new)
            .get_result(conn)
            .map_err(DbError::from)?;

        Ok(result)
    }

    #[tracing::instrument("TenantTag::list", skip_all)]
    pub fn list(
        conn: &mut PgConn,
        tenant_id: &TenantId,
        kind: Option<VaultKind>,
        is_live: bool,
    ) -> DbResult<Vec<Self>> {
        let mut query = tenant_tag::table
            .filter(tenant_tag::tenant_id.eq(tenant_id))
            .filter(tenant_tag::deactivated_at.is_null())
            .filter(tenant_tag::is_live.eq(is_live))
            .into_boxed();

        if let Some(k) = kind {
            query = query.filter(tenant_tag::kind.eq(k))
        }
        let result = query.order_by(tenant_tag::created_at.desc()).get_results(conn)?;
        Ok(result)
    }

    #[tracing::instrument("TenantTag::deactivate", skip_all)]
    pub fn deactivate(
        conn: &mut PgConn,
        tenant_id: &TenantId,
        tt_id: &TenantTagId,
        deactivated_by_actor: DbActor,
    ) -> DbResult<()> {
        let update = UpdateTenantTag::set_deactivated_at(deactivated_by_actor);
        let count_updated = diesel::update(tenant_tag::table)
            .filter(tenant_tag::tenant_id.eq(tenant_id))
            .filter(tenant_tag::id.eq(tt_id))
            .filter(tenant_tag::deactivated_at.is_null())
            .set(update)
            .execute(conn)?;

        if count_updated == 0 {
            Err(DbError::ObjectNotFound)
        } else {
            Ok(())
        }
    }
}
