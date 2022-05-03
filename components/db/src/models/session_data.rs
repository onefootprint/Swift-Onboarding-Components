use chrono::{NaiveDateTime, Utc};
use crypto::sha256;
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
    pub challenge_data: ChallengeData,
}

#[derive(FromSqlRow, AsExpression, Serialize, Deserialize, Debug, Clone)]
pub struct ChallengeData {
    pub challenge_type: ChallengeType,
    pub created_at: NaiveDateTime,
    pub h_challenge_code: Vec<u8>,
    // TODO add h_data
    // TODO add tennat_id for fun
}

impl Default for ChallengeData {
    fn default() -> Self {
        Self {
            challenge_type: ChallengeType::default(),
            created_at: Utc::now().naive_utc(),
            h_challenge_code: sha256("".to_string().as_bytes()).to_vec(),
        }
    }
}

#[derive(FromSqlRow, AsExpression, Serialize, Deserialize, Debug, Clone)]
pub enum ChallengeType {
    NotSet,
    Email(String),
    PhoneNumber(String),
}

impl Default for ChallengeType {
    fn default() -> Self {
        Self::NotSet
    }
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
