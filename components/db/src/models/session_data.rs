use chrono::NaiveDateTime;
use diesel::serialize::Output;
use diesel::{
    pg::Pg,
    sql_types::Jsonb,
    types::{FromSql, ToSql},
};
use serde::{Deserialize, Serialize};
use serde_json;
use std::io::Write;

#[derive(FromSqlRow, AsExpression, Serialize, Deserialize, Debug, Clone)]
#[sql_type = "Jsonb"]
pub enum SessionState {
    Empty,
    OnboardingSession(OnboardingSessionData),
    IdentifySession(ChallengeData),
}

#[derive(Default, FromSqlRow, AsExpression, Serialize, Deserialize, Debug, Clone)]
pub struct OnboardingSessionData {
    pub user_ob_id: String,
    pub user_vault_id: String,
}

#[derive(FromSqlRow, AsExpression, Serialize, Deserialize, Debug, Clone)]
pub struct ChallengeData {
    pub tenant_id: String,
    pub challenge_type: ChallengeType,
    pub created_at: NaiveDateTime,
    pub h_challenge_code: Vec<u8>,
}

#[derive(FromSqlRow, AsExpression, Serialize, Deserialize, Debug, Clone)]
pub enum ChallengeType {
    Email,
    PhoneNumber,
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
