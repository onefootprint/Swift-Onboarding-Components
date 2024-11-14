use super::workflow::Workflow;
use crate::PgConn;
use crate::TxnPgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::decision_intent;
use diesel::prelude::*;
use newtypes::DecisionIntentId;
use newtypes::DecisionIntentKind;
use newtypes::ScopedVaultId;
use newtypes::WorkflowId;

#[derive(Debug, Clone, Queryable, Identifiable, QueryableByName, Eq, PartialEq)]
#[diesel(table_name = decision_intent)]
pub struct DecisionIntent {
    pub id: DecisionIntentId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub kind: DecisionIntentKind,
    pub scoped_vault_id: ScopedVaultId,
    pub workflow_id: Option<WorkflowId>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = decision_intent)]
struct NewDecisionIntent {
    pub created_at: DateTime<Utc>,
    pub kind: DecisionIntentKind,
    pub scoped_vault_id: ScopedVaultId,
    pub workflow_id: Option<WorkflowId>,
}

impl DecisionIntent {
    #[tracing::instrument("DecisionIntent::create", skip_all)]
    pub fn create(
        conn: &mut PgConn,
        kind: DecisionIntentKind,
        scoped_vault_id: &ScopedVaultId,
        workflow_id: Option<&WorkflowId>,
    ) -> FpResult<Self> {
        let new_di = NewDecisionIntent {
            created_at: Utc::now(),
            kind,
            scoped_vault_id: scoped_vault_id.clone(),
            workflow_id: workflow_id.cloned(),
        };
        let result = diesel::insert_into(decision_intent::table)
            .values(new_di)
            .get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument("DecisionIntent::get", skip_all)]
    pub fn get(conn: &mut PgConn, id: &DecisionIntentId) -> FpResult<Self> {
        let result = decision_intent::table
            .filter(decision_intent::id.eq(id))
            .get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument("DecisionIntent::get_or_create_for_workflow", skip_all)]
    pub fn get_or_create_for_workflow(
        conn: &mut TxnPgConn,
        sv_id: &ScopedVaultId,
        wf_id: &WorkflowId,
        kind: DecisionIntentKind,
    ) -> FpResult<Self> {
        Workflow::lock(conn, wf_id)?;
        let new_di = NewDecisionIntent {
            created_at: Utc::now(),
            kind,
            scoped_vault_id: sv_id.clone(),
            workflow_id: Some(wf_id.clone()),
        };

        let existing_di = decision_intent::table
            .filter(decision_intent::workflow_id.eq(wf_id))
            .filter(decision_intent::kind.eq(kind))
            .first(conn.conn())
            .optional()?;

        if let Some(existing_di) = existing_di {
            return Ok(existing_di);
        }

        let new_di = diesel::insert_into(decision_intent::table)
            .values(new_di)
            .get_result::<DecisionIntent>(conn.conn())?;

        Ok(new_di)
    }
}

#[cfg(test)]
#[allow(unused_must_use)]
mod tests {
    use super::*;
    use crate::tests::prelude::*;
    use macros::db_test;

    #[db_test]
    fn test_get_or_create_onboarding_kyc(conn: &mut TestPgConn) {
        let t = fixtures::tenant::create(conn);
        let obc = fixtures::ob_configuration::create(conn, &t.id, true);
        let uv = fixtures::vault::create_person(conn, true).into_inner();
        let sv = fixtures::scoped_vault::create(conn, &uv.id, &obc.id);
        let wf = fixtures::workflow::create(conn, &sv.id, &obc.id, None);
        let di1 = DecisionIntent::get_or_create_for_workflow(
            conn,
            &sv.id,
            &wf.id,
            DecisionIntentKind::OnboardingKyc,
        )
        .unwrap();
        let di2 = DecisionIntent::get_or_create_for_workflow(
            conn,
            &sv.id,
            &wf.id,
            DecisionIntentKind::OnboardingKyc,
        )
        .unwrap();
        assert_eq!(di1, di2);
    }
}
