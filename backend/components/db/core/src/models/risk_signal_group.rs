use crate::DbResult;
use crate::PgConn;
use chrono::{DateTime, Utc};
use db_schema::schema::risk_signal_group;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::RiskSignalGroupId;
use newtypes::RiskSignalGroupKind;
use newtypes::ScopedVaultId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = risk_signal_group)]
pub struct RiskSignalGroup {
    pub id: RiskSignalGroupId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub scoped_vault_id: ScopedVaultId,
    pub kind: RiskSignalGroupKind,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
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
}
