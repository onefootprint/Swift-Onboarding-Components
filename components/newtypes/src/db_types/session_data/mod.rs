use self::{
    email::email_verify::EmailVerifySession,
    tenant::workos::WorkOsSession,
    user::{d2p::D2pSession, my_fp::MyFootprintSession, onboarding::OnboardingSession},
};
use diesel::serialize::Output;
use diesel::{
    pg::Pg,
    sql_types::Jsonb,
    types::{FromSql, ToSql},
};
use diesel::{AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use serde::{Deserialize, Serialize};
use serde_json;
use std::io::Write;
use thiserror::Error;
pub mod email;
pub mod tenant;
pub mod user;

#[derive(Debug, Error)]
pub enum TypeError {
    #[error("bad session type")]
    BadSessionType,
}

#[derive(FromSqlRow, AsExpression, Serialize, Deserialize, Debug, Clone, Apiv2Schema)]
#[sql_type = "Jsonb"]
pub enum ServerSession {
    Empty,
    // Tenant Auth
    WorkOs(WorkOsSession), // workos login to tenant admin dashboardn
    // User Auth
    Onboarding(OnboardingSession),   // onboarding a user to a tenant
    MyFootprint(MyFootprintSession), // my.onefootprint.com
    D2p(D2pSession),                 // desktop 2 phone transfer session
    // Misc
    ChallengeLastSent { sent_at: chrono::NaiveDateTime }, // Used to rate limit challenges sent to phone number
    EmailVerify(EmailVerifySession),                      // Used for validating email challenges
}

pub enum ApiAccessType {
    PublicKey,
    SecretKey,
}

pub trait HeaderName {
    fn header_name() -> String;
}

impl Default for ServerSession {
    fn default() -> Self {
        Self::Empty
    }
}

impl diesel::deserialize::FromSql<diesel::sql_types::Jsonb, Pg> for ServerSession {
    fn from_sql(
        bytes: Option<&<Pg as diesel::backend::Backend>::RawValue>,
    ) -> diesel::deserialize::Result<Self> {
        let value = <serde_json::Value as FromSql<Jsonb, Pg>>::from_sql(bytes)?;
        Ok(serde_json::from_value(value)?)
    }
}

impl ToSql<Jsonb, Pg> for ServerSession {
    fn to_sql<W: Write>(&self, out: &mut Output<W, Pg>) -> diesel::serialize::Result {
        let value = serde_json::to_value(self)?;
        <serde_json::Value as ToSql<Jsonb, Pg>>::to_sql(&value, out)
    }
}

pub trait UserVaultPermissions {
    fn can_decrypt(&self) -> bool;
    fn can_modify(&self) -> bool;
}
