use chrono::{DateTime, Utc};
use diesel::prelude::*;
use newtypes::{DecisionIntentId, DecisionIntentKind, ScopedVaultId};
use serde::{Deserialize, Serialize};

use crate::{schema::decision_intent, DbResult, PgConn, TxnPgConn};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable, QueryableByName, Eq, PartialEq)]
#[diesel(table_name = decision_intent)]
pub struct DecisionIntent {
    pub id: DecisionIntentId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub kind: DecisionIntentKind,
    pub scoped_vault_id: ScopedVaultId,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = decision_intent)]
struct NewDecisionIntent {
    pub created_at: DateTime<Utc>,
    pub kind: DecisionIntentKind,
    pub scoped_vault_id: ScopedVaultId,
}

impl DecisionIntent {
    #[tracing::instrument(skip_all)]
    pub fn create(
        conn: &mut PgConn,
        kind: DecisionIntentKind,
        scoped_vault_id: &ScopedVaultId,
    ) -> DbResult<Self> {
        let new_di = NewDecisionIntent {
            created_at: Utc::now(),
            kind,
            scoped_vault_id: scoped_vault_id.clone(),
        };
        let result = diesel::insert_into(decision_intent::table)
            .values(new_di)
            .get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument(skip_all)]
    pub fn get_or_create_onboarding_kyc(
        conn: &mut TxnPgConn,
        scoped_vault_id: &ScopedVaultId,
    ) -> DbResult<Self> {
        let new_di = NewDecisionIntent {
            created_at: Utc::now(),
            kind: DecisionIntentKind::OnboardingKyc,
            scoped_vault_id: scoped_vault_id.clone(),
        };

        let existing_di = decision_intent::table
            .filter(decision_intent::scoped_vault_id.eq(scoped_vault_id))
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
    use std::str::FromStr;

    #[db_test]
    fn test_get_or_create_onboarding_kyc(conn: &mut TestPgConn) {
        let sv_id = ScopedVaultId::from_str("123").unwrap();
        let di1 = DecisionIntent::get_or_create_onboarding_kyc(conn, &sv_id).unwrap();
        let di2 = DecisionIntent::get_or_create_onboarding_kyc(conn, &sv_id).unwrap();
        assert_eq!(di1, di2);
    }
}
