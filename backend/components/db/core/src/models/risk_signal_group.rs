use crate::DbResult;
use crate::PgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::risk_signal_group;
use diesel::prelude::*;
use diesel::Insertable;
use diesel::Queryable;
use newtypes::RiskSignalGroupId;
use newtypes::RiskSignalGroupKind;
use newtypes::ScopedVaultId;
use newtypes::WorkflowId;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = risk_signal_group)]
pub struct RiskSignalGroup {
    pub id: RiskSignalGroupId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub scoped_vault_id: ScopedVaultId,
    pub kind: RiskSignalGroupKind,
    pub workflow_id: Option<WorkflowId>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = risk_signal_group)]
pub struct NewRiskSignalGroup {
    pub created_at: DateTime<Utc>,
    pub scoped_vault_id: ScopedVaultId,
    pub kind: RiskSignalGroupKind,
}

impl RiskSignalGroup {
    pub fn create(
        conn: &mut PgConn,
        scoped_vault_id: &ScopedVaultId,
        kind: RiskSignalGroupKind,
    ) -> DbResult<Self> {
        let new = NewRiskSignalGroup {
            created_at: Utc::now(),
            scoped_vault_id: scoped_vault_id.clone(),
            kind,
        };

        let res = diesel::insert_into(risk_signal_group::table)
            .values(new)
            .get_result::<Self>(conn)?;
        Ok(res)
    }

    #[tracing::instrument("RiskSignalGroup::get_or_create", skip(conn))]
    pub fn get_or_create(
        conn: &mut PgConn,
        scoped_vault_id: &ScopedVaultId,
        kind: RiskSignalGroupKind,
    ) -> DbResult<Self> {
        let existing = Self::latest_by_kind(conn, scoped_vault_id, kind)?;
        match existing {
            Some(e) => Ok(e),
            None => Self::create(conn, scoped_vault_id, kind),
        }
    }

    #[tracing::instrument("RiskSignalGroup::latest_by_kind", skip(conn))]
    pub fn latest_by_kind(
        conn: &mut PgConn,
        scoped_vault_id: &ScopedVaultId,
        kind: RiskSignalGroupKind,
    ) -> DbResult<Option<Self>> {
        let res = risk_signal_group::table
            .filter(risk_signal_group::scoped_vault_id.eq(scoped_vault_id))
            .filter(risk_signal_group::kind.eq(kind))
            .order_by(risk_signal_group::created_at.desc())
            .first(conn)
            .optional()?;

        Ok(res)
    }

    #[tracing::instrument("RiskSignalGroup::latest_by_kind", skip(conn))]
    pub fn latest_by_kinds(conn: &mut PgConn, scoped_vault_id: &ScopedVaultId) -> DbResult<Vec<Self>> {
        let res = risk_signal_group::table
            .filter(risk_signal_group::scoped_vault_id.eq(scoped_vault_id))
            .order((risk_signal_group::kind, risk_signal_group::created_at.desc()))
            .distinct_on(risk_signal_group::kind)
            .get_results(conn)?;

        Ok(res)
    }
}
