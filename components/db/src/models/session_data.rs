use diesel::serialize::Output;
use diesel::{
    pg::Pg,
    sql_types::Jsonb,
    types::{FromSql, ToSql},
};
use newtypes::UserVaultId;
use serde::{Deserialize, Serialize};
use serde_json;
use std::io::Write;

#[derive(FromSqlRow, AsExpression, Serialize, Deserialize, Debug, Clone)]
#[sql_type = "Jsonb"]
pub enum SessionState {
    Empty,
    LoggedInSession(LoggedInSessionData), // Used for user-specific auth
    ChallengeLastSent(ChallengeLastSentData), // Used to rate limit challenges sent to phone number
    TenantDashboardSession(TenantDashboardSessionData), // Used for auth to tenant dashboard
}

#[derive(Default, FromSqlRow, AsExpression, Serialize, Deserialize, Debug, Clone)]
pub struct TenantDashboardSessionData {
    pub email: String,
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub workos_id: String,
}

#[derive(Default, FromSqlRow, AsExpression, Serialize, Deserialize, Debug, Clone)]
pub struct LoggedInSessionData {
    pub user_vault_id: UserVaultId,
}

#[derive(FromSqlRow, AsExpression, Serialize, Deserialize, Debug, Clone)]
pub struct ChallengeLastSentData {
    pub sent_at: chrono::NaiveDateTime,
}

impl Default for SessionState {
    fn default() -> Self {
        Self::Empty
    }
}

impl diesel::deserialize::FromSql<diesel::sql_types::Jsonb, Pg> for SessionState {
    fn from_sql(
        bytes: Option<&<Pg as diesel::backend::Backend>::RawValue>,
    ) -> diesel::deserialize::Result<Self> {
        let value = <serde_json::Value as FromSql<Jsonb, Pg>>::from_sql(bytes)?;
        Ok(serde_json::from_value(value)?)
    }
}

impl ToSql<Jsonb, Pg> for SessionState {
    fn to_sql<W: Write>(&self, out: &mut Output<W, Pg>) -> diesel::serialize::Result {
        let value = serde_json::to_value(self)?;
        <serde_json::Value as ToSql<Jsonb, Pg>>::to_sql(&value, out)
    }
}
