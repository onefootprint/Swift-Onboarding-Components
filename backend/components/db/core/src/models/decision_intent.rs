use crate::{DbResult, PgConn, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::decision_intent;
use diesel::prelude::*;
use newtypes::{DecisionIntentId, DecisionIntentKind, ScopedVaultId, WorkflowId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable, QueryableByName, Eq, PartialEq)]
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

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
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
    ) -> DbResult<Self> {
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

    #[tracing::instrument("DecisionIntent::get_or_create_for_kind_by_workflow_id", skip_all)]
    fn get_or_create_for_kind_by_workflow_id(
        conn: &mut TxnPgConn,
        sv_id: &ScopedVaultId,
        wf_id: &WorkflowId,
        kind: DecisionIntentKind,
    ) -> DbResult<Self> {
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

    // Legacy query now just used for KYB since this has not been migrated to Workflows yet
    #[tracing::instrument("DecisionIntent::get_or_create_for_kind_by_scoped_vault_id", skip_all)]
    fn get_or_create_for_kind_by_scoped_vault_id(
        conn: &mut TxnPgConn,
        scoped_vault_id: &ScopedVaultId,
        kind: DecisionIntentKind,
    ) -> DbResult<Self> {
        let new_di = NewDecisionIntent {
            created_at: Utc::now(),
            kind,
            scoped_vault_id: scoped_vault_id.clone(),
            workflow_id: None,
        };

        let existing_di = decision_intent::table
            .filter(decision_intent::scoped_vault_id.eq(scoped_vault_id))
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

    #[tracing::instrument("DecisionIntent::get_or_create_onboarding_kyc", skip_all)]
    pub fn get_or_create_onboarding_kyc(
        conn: &mut TxnPgConn,
        scoped_vault_id: &ScopedVaultId,
        workflow_id: &WorkflowId,
    ) -> DbResult<Self> {
        Self::get_or_create_for_kind_by_workflow_id(
            conn,
            scoped_vault_id,
            workflow_id,
            DecisionIntentKind::OnboardingKyc,
        )
    }

    #[tracing::instrument("DecisionIntent::get_or_create_onboarding_kyb", skip_all)]
    pub fn get_or_create_onboarding_kyb(
        conn: &mut TxnPgConn,
        scoped_vault_id: &ScopedVaultId,
    ) -> DbResult<Self> {
        Self::get_or_create_for_kind_by_scoped_vault_id(
            conn,
            scoped_vault_id,
            DecisionIntentKind::OnboardingKyb,
        )
    }
}

#[cfg(test)]
#[allow(unused_must_use)]
mod tests {
    use super::*;
    use crate::tests::prelude::*;
    use macros::db_test;
    use std::str::FromStr;

    #[db_test]
    fn test_get_or_create_onboarding_kyc(conn: &mut TestPgConn) {
        let sv_id = ScopedVaultId::from_str("123").unwrap();
        let wf_id = WorkflowId::from_str("456").unwrap();
        let di1 = DecisionIntent::get_or_create_onboarding_kyc(conn, &sv_id, &wf_id).unwrap();
        let di2 = DecisionIntent::get_or_create_onboarding_kyc(conn, &sv_id, &wf_id).unwrap();
        assert_eq!(di1, di2);
    }
}
