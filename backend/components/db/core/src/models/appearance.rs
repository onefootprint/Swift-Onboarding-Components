use crate::DbResult;
use crate::PgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::appearance;
use diesel::prelude::*;
use newtypes::AppearanceId;
use newtypes::TenantId;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = appearance)]
/// Represents a tenant's custom appearance for the footprint flow. There may one day be multiple
/// appearances used by different ob configurations. It's generally a json blob defined by the
/// frontend
pub struct Appearance {
    pub id: AppearanceId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub tenant_id: TenantId,
    pub data: serde_json::Value,
}

// We don't yet have codepaths to add appearances - we will just do it manually in the DB
// NOTE: it doesn't seem anyone is even using this - there's only one row for a Composer sandbox
// playbook

impl Appearance {
    #[tracing::instrument("Appearance::get", skip_all)]
    pub fn get(conn: &mut PgConn, id: &AppearanceId, t_id: &TenantId) -> DbResult<Self> {
        let result = appearance::table
            .filter(appearance::id.eq(id))
            .filter(appearance::tenant_id.eq(t_id))
            .get_result(conn)?;
        Ok(result)
    }
}
