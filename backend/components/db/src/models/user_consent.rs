use crate::schema::user_consent;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, PgConnection, Queryable};
use newtypes::{InsightEventId, OnboardingId, UserConsentId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Queryable, Default, Serialize, Deserialize)]
#[diesel(table_name = user_consent)]
pub struct UserConsent {
    pub id: UserConsentId,
    pub timestamp: DateTime<Utc>,
    pub insight_event_id: InsightEventId,
    pub consent_language_text: String,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub onboarding_id: OnboardingId,
}

#[derive(Debug, Clone, Insertable, Default)]
#[diesel(table_name = user_consent)]
pub struct NewUserConsent {
    pub timestamp: DateTime<Utc>,
    pub insight_event_id: InsightEventId,
    pub consent_language_text: String,
    pub onboarding_id: OnboardingId,
}

impl UserConsent {
    pub fn create(
        conn: &mut PgConnection,
        timestamp: DateTime<Utc>,
        onboarding_id: OnboardingId,
        insight_event_id: InsightEventId,
        consent_language_text: String,
    ) -> Result<UserConsent, crate::DbError> {
        let new_user_consent = NewUserConsent {
            timestamp,
            insight_event_id,
            consent_language_text,
            onboarding_id,
        };

        let new_user_consent = diesel::insert_into(crate::schema::user_consent::table)
            .values(new_user_consent)
            .get_result::<UserConsent>(conn)?;

        Ok(new_user_consent)
    }
}
