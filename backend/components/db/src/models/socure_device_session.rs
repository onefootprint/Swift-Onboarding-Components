use chrono::{DateTime, Utc};
use diesel::prelude::*;
use crate::PgConnection;
use diesel::{Insertable};
use newtypes::{OnboardingId, SocureDeviceSessionId};
use serde::{Deserialize, Serialize};
use crate::schema::socure_device_session;
use crate::{DbError, DbResult};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = socure_device_session)]
pub struct SocureDeviceSession {
    pub id: SocureDeviceSessionId,
    pub onboarding_id: OnboardingId,
    pub device_session_id: String,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = socure_device_session)]
struct NewSocureDeviceSession {
    pub onboarding_id: OnboardingId,
    pub device_session_id: String,
    pub created_at: DateTime<Utc>,
}

impl SocureDeviceSession {
    pub fn create(
        conn: &mut PgConnection,
        device_session_id: String, //TODO: make this a wrapped type?
        onboarding_id: OnboardingId,
    ) -> Result<SocureDeviceSession, DbError> {
        let new_result = NewSocureDeviceSession {
            onboarding_id,
            device_session_id,
            created_at: Utc::now(),
        };
        let result = diesel::insert_into(socure_device_session::table)
            .values(new_result)
            .get_result(conn)?;
        Ok(result)
    }

    pub fn latest_for_onboarding(
        conn: &mut PgConnection,
        onboarding_id: &OnboardingId,
    ) -> DbResult<Option<SocureDeviceSession>> {
        let res = socure_device_session::table
            .filter(socure_device_session::onboarding_id.eq(onboarding_id))
            .order_by(socure_device_session::created_at.desc())
            .first(conn)
            .optional()?;

        Ok(res)
    }
}
