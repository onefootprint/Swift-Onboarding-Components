use crate::PgConn;
use api_errors::FpResult;
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
struct NewRiskSignalGroup {
    pub created_at: DateTime<Utc>,
    pub scoped_vault_id: ScopedVaultId,
    pub kind: RiskSignalGroupKind,
    pub workflow_id: Option<WorkflowId>,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum RiskSignalGroupCreateOp {
    Create,
    GetOrCreate,
}

#[derive(Clone, Debug)]
pub enum RiskSignalGroupScope<'a> {
    // Risk signals are scoped to a ScopedVault. You almost certainly DO NOT want to use this.
    ScopedVaultId {
        id: &'a ScopedVaultId,
        op: RiskSignalGroupCreateOp,
    },
    // Risk Signals are scoped to a WorkflowId. You almost certainly want to use this.
    WorkflowId {
        id: &'a WorkflowId,
        sv_id: &'a ScopedVaultId,
    },
}

/// By default, we create a RiskSignalGroup for a ScopedVaultId
impl<'a> From<&'a ScopedVaultId> for RiskSignalGroupScope<'a> {
    fn from(value: &'a ScopedVaultId) -> RiskSignalGroupScope<'a> {
        RiskSignalGroupScope::ScopedVaultId {
            id: value,
            op: RiskSignalGroupCreateOp::Create,
        }
    }
}
impl<'a> From<(&'a WorkflowId, &'a ScopedVaultId)> for RiskSignalGroupScope<'a> {
    fn from(value: (&'a WorkflowId, &'a ScopedVaultId)) -> RiskSignalGroupScope<'a> {
        RiskSignalGroupScope::WorkflowId {
            id: value.0,
            sv_id: value.1,
        }
    }
}

impl<'a> RiskSignalGroupScope<'a> {
    pub fn scoped_vault_id(&self) -> ScopedVaultId {
        match &self {
            RiskSignalGroupScope::ScopedVaultId { id, .. } => (*id).clone(),
            RiskSignalGroupScope::WorkflowId { sv_id, .. } => (*sv_id).clone(),
        }
    }

    pub fn workflow_id(&self) -> Option<WorkflowId> {
        match &self {
            RiskSignalGroupScope::ScopedVaultId { .. } => None,
            RiskSignalGroupScope::WorkflowId { id, .. } => Some((*id).clone()),
        }
    }
}

impl RiskSignalGroup {
    #[tracing::instrument("RiskSignalGroup::get_or_create", skip(conn))]
    pub(crate) fn get_or_create<'a>(
        conn: &mut PgConn,
        scope: RiskSignalGroupScope<'a>,
        kind: RiskSignalGroupKind,
    ) -> FpResult<Self> {
        match &scope {
            RiskSignalGroupScope::ScopedVaultId {
                op: RiskSignalGroupCreateOp::Create,
                ..
            } => Self::create(conn, scope, kind),
            _ => {
                let existing = Self::latest_by_kind(conn, scope.clone(), kind)?;
                match existing {
                    Some(e) => Ok(e),
                    None => Self::create(conn, scope, kind),
                }
            }
        }
    }

    #[tracing::instrument("RiskSignalGroup::latest_by_kind", skip(conn))]
    pub fn latest_by_kind<'a>(
        conn: &mut PgConn,
        scope: RiskSignalGroupScope<'a>,
        kind: RiskSignalGroupKind,
    ) -> FpResult<Option<Self>> {
        let mut q = risk_signal_group::table
            .filter(risk_signal_group::scoped_vault_id.eq(scope.scoped_vault_id()))
            .filter(risk_signal_group::kind.eq(kind))
            .into_boxed();
        if let Some(wf_id) = scope.workflow_id() {
            q = q.filter(risk_signal_group::workflow_id.eq(wf_id));
        }
        let res = q
            .order_by(risk_signal_group::created_at.desc())
            .first(conn)
            .optional()?;

        Ok(res)
    }

    #[tracing::instrument("RiskSignalGroup::latest_by_kinds", skip(conn))]
    pub fn latest_by_kinds(conn: &mut PgConn, scoped_vault_id: &ScopedVaultId) -> FpResult<Vec<Self>> {
        let res = risk_signal_group::table
            .filter(risk_signal_group::scoped_vault_id.eq(scoped_vault_id))
            .order((risk_signal_group::kind, risk_signal_group::created_at.desc()))
            .distinct_on(risk_signal_group::kind)
            .get_results(conn)?;

        Ok(res)
    }
}

impl RiskSignalGroup {
    fn create(conn: &mut PgConn, scope: RiskSignalGroupScope, kind: RiskSignalGroupKind) -> FpResult<Self> {
        let sv_id = scope.scoped_vault_id();
        let wf_id = scope.workflow_id();
        let new = NewRiskSignalGroup {
            created_at: Utc::now(),
            scoped_vault_id: sv_id,
            workflow_id: wf_id,
            kind,
        };

        let res = diesel::insert_into(risk_signal_group::table)
            .values(new)
            .get_result::<Self>(conn)?;
        Ok(res)
    }
}
