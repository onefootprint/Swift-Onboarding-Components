use diesel::serialize::Output;
use diesel::{
    pg::Pg,
    sql_types::Jsonb,
    types::{FromSql, ToSql},
};
use serde::{Deserialize, Serialize};
use serde_json;
use std::io::Write;

use self::challenge::ChallengeLastSentData;
use self::dashboard::TenantDashboardSessionData;
use self::my_one_footprint::MyOneFootprintSessionData;
use self::onboarding::OnboardingSessionData;

pub mod challenge;
pub mod dashboard;
pub mod my_one_footprint;
pub mod onboarding;

#[derive(FromSqlRow, AsExpression, Serialize, Deserialize, Debug, Clone)]
#[sql_type = "Jsonb"]
pub enum SessionState {
    Empty,
    OnboardingSession(OnboardingSessionData), // Used for onboarding on to the dashboard
    MyOneFootprintSession(MyOneFootprintSessionData), // Used for my.onefootprint.com
    ChallengeLastSent(ChallengeLastSentData), // Used to rate limit challenges sent to phone number
    TenantDashboardSession(TenantDashboardSessionData), // Used for auth to tenant dashboard
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
