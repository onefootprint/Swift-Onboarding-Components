use super::insight_event::InsightEvent;
use crate::DbError;
use crate::DbResult;
use crate::PgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema;
use db_schema::schema::liveness_event;
use db_schema::schema::scoped_vault;
use diesel::prelude::*;
use diesel::Insertable;
use diesel::Queryable;
use newtypes::FpId;
use newtypes::InsightEventId;
use newtypes::LivenessAttributes;
use newtypes::LivenessEventId;
use newtypes::LivenessSource;
use newtypes::ScopedVaultId;
use newtypes::SkipLivenessContext;
use newtypes::TenantId;
use newtypes::VaultId;
use std::collections::HashMap;

#[derive(Debug, Clone, Queryable, Insertable)]
#[diesel(table_name = liveness_event)]
pub struct LivenessEvent {
    pub id: LivenessEventId,
    pub scoped_vault_id: ScopedVaultId,
    pub liveness_source: LivenessSource,
    pub attributes: Option<LivenessAttributes>,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub insight_event_id: Option<InsightEventId>,
    pub skip_context: Option<SkipLivenessContext>,
}

impl LivenessEvent {
    #[tracing::instrument("LivenessEvent::get_by_user_vault_id", skip_all)]
    pub fn get_by_user_vault_id(
        conn: &mut PgConn,
        vault_id: &VaultId,
    ) -> Result<Vec<(Self, Option<InsightEvent>)>, DbError> {
        use schema::insight_event;
        let results = liveness_event::table
            .inner_join(scoped_vault::table)
            .left_join(insight_event::table)
            .filter(scoped_vault::vault_id.eq(vault_id))
            .select((liveness_event::all_columns, insight_event::all_columns.nullable()))
            .load(conn)?;
        Ok(results)
    }

    #[tracing::instrument("LivenessEvent::get_by_scoped_vault_id", skip_all)]
    pub fn get_by_scoped_vault_id(
        conn: &mut PgConn,
        scoped_vault_id: &ScopedVaultId,
    ) -> Result<Vec<LivenessEvent>, DbError> {
        let results = liveness_event::table
            .filter(liveness_event::scoped_vault_id.eq(scoped_vault_id))
            .get_results(conn)?;
        Ok(results)
    }

    #[tracing::instrument("LivenessEvent::get_for_scoped_user", skip_all)]
    pub fn get_for_scoped_user(
        conn: &mut PgConn,
        fp_id: &FpId,
        tenant_id: &TenantId,
        is_live: bool,
    ) -> Result<Vec<(Self, Option<InsightEvent>)>, DbError> {
        use schema::insight_event;
        let results = liveness_event::table
            .inner_join(scoped_vault::table)
            .left_join(insight_event::table)
            .filter(scoped_vault::tenant_id.eq(tenant_id))
            .filter(scoped_vault::fp_id.eq(fp_id))
            .filter(scoped_vault::is_live.eq(is_live))
            .select((
                liveness_event::all_columns,
                schema::insight_event::all_columns.nullable(),
            ))
            .load(conn)?;
        Ok(results)
    }

    #[tracing::instrument("LivenessEvent::get_bulk", skip_all)]
    pub fn get_bulk(
        conn: &mut PgConn,
        ids: Vec<&LivenessEventId>,
    ) -> DbResult<HashMap<LivenessEventId, (Self, InsightEvent)>> {
        let results = liveness_event::table
            .inner_join(schema::insight_event::table)
            .filter(liveness_event::id.eq_any(ids))
            .get_results::<(Self, InsightEvent)>(conn)?
            .into_iter()
            .map(|e| (e.0.id.clone(), e))
            .collect();

        Ok(results)
    }
}

#[derive(Debug, Insertable)]
#[diesel(table_name = liveness_event)]
pub struct NewLivenessEvent {
    pub scoped_vault_id: ScopedVaultId,
    pub liveness_source: LivenessSource,
    pub attributes: Option<LivenessAttributes>,
    pub insight_event_id: Option<InsightEventId>,
    pub skip_context: Option<SkipLivenessContext>,
}

impl NewLivenessEvent {
    #[tracing::instrument("NewLivenessEvent::insert", skip_all)]
    pub fn insert(self, conn: &mut PgConn) -> Result<LivenessEvent, DbError> {
        let ev = diesel::insert_into(db_schema::schema::liveness_event::table)
            .values(self)
            .get_result(conn)?;
        Ok(ev)
    }
}
