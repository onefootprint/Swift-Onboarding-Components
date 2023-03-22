use chrono::{DateTime, Utc};
use diesel::prelude::*;
use newtypes::{DecisionIntentId, DecisionIntentKind, ScopedVaultId};
use serde::{Deserialize, Serialize};

use crate::{schema::decision_intent, DbResult, PgConn};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable, QueryableByName)]
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
        scoped_vault_id: ScopedVaultId,
    ) -> DbResult<Self> {
        let new_di = NewDecisionIntent {
            created_at: Utc::now(),
            kind,
            scoped_vault_id,
        };
        let result = diesel::insert_into(decision_intent::table)
            .values(new_di)
            .get_result(conn)?;
        Ok(result)
    }
}
