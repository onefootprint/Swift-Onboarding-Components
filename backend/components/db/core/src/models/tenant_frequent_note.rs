use crate::DbError;
use crate::PgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::tenant_frequent_note;
use diesel::prelude::*;
use diesel::Insertable;
use diesel::Queryable;
use newtypes::DbActor;
use newtypes::TenantFrequentNoteId;
use newtypes::TenantFrequentNoteKind;
use newtypes::TenantId;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = tenant_frequent_note)]
pub struct TenantFrequentNote {
    pub id: TenantFrequentNoteId,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,

    pub tenant_id: TenantId,
    pub created_by_actor: DbActor,
    pub kind: TenantFrequentNoteKind,
    pub content: String,

    pub deactivated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = tenant_frequent_note)]
pub struct NewTenantFrequentNote {
    pub created_at: DateTime<Utc>,
    pub tenant_id: TenantId,
    pub created_by_actor: DbActor,
    pub kind: TenantFrequentNoteKind,
    pub content: String,
}

impl TenantFrequentNote {
    #[tracing::instrument("TenantFrequentNote::create", skip_all)]
    pub fn create(
        conn: &mut PgConn,
        tenant_id: TenantId,
        created_by: DbActor,
        kind: TenantFrequentNoteKind,
        content: String,
    ) -> FpResult<Self> {
        let new = NewTenantFrequentNote {
            created_at: Utc::now(),
            tenant_id,
            created_by_actor: created_by,
            kind,
            content,
        };

        let result = diesel::insert_into(tenant_frequent_note::table)
            .values(new)
            .get_result(conn)?;

        Ok(result)
    }

    #[tracing::instrument("TenantFrequentNote::list", skip_all)]
    pub fn list(
        conn: &mut PgConn,
        tenant_id: &TenantId,
        kind: TenantFrequentNoteKind,
    ) -> FpResult<Vec<Self>> {
        let result = tenant_frequent_note::table
            .filter(tenant_frequent_note::tenant_id.eq(tenant_id))
            .filter(tenant_frequent_note::kind.eq(kind))
            .filter(tenant_frequent_note::deactivated_at.is_null())
            .order_by(tenant_frequent_note::created_at.asc())
            .get_results(conn)?;
        Ok(result)
    }

    #[tracing::instrument("TenantFrequentNote::deactivate", skip_all)]
    pub fn deactivate(conn: &mut PgConn, tenant_id: &TenantId, fn_id: &TenantFrequentNoteId) -> FpResult<()> {
        let count_updated = diesel::update(tenant_frequent_note::table)
            .filter(tenant_frequent_note::tenant_id.eq(tenant_id))
            .filter(tenant_frequent_note::id.eq(fn_id))
            .filter(tenant_frequent_note::deactivated_at.is_null())
            .set(tenant_frequent_note::deactivated_at.eq(Utc::now()))
            .execute(conn)?;

        if count_updated == 0 {
            Err(DbError::ObjectNotFound.into())
        } else {
            Ok(())
        }
    }
}
