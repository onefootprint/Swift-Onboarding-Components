use crate::DbResult;
use crate::PgConn;
use chrono::{DateTime, Utc};
use db_schema::schema::onboarding;
use db_schema::schema::scoped_vault;
use db_schema::schema::user_consent;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::ScopedVaultId;
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
    pub ml_consent: bool,
}

#[derive(Debug, Clone, Insertable, Default)]
#[diesel(table_name = user_consent)]
pub struct NewUserConsent {
    pub timestamp: DateTime<Utc>,
    pub insight_event_id: InsightEventId,
    pub consent_language_text: String,
    pub onboarding_id: OnboardingId,
    pub ml_consent: bool,
}

impl UserConsent {
    #[tracing::instrument("UserConsent::create", skip_all)]
    pub fn create(
        conn: &mut PgConn,
        timestamp: DateTime<Utc>,
        onboarding_id: OnboardingId,
        insight_event_id: InsightEventId,
        consent_language_text: String,
        ml_consent: bool,
    ) -> Result<UserConsent, crate::DbError> {
        let new_user_consent = NewUserConsent {
            timestamp,
            insight_event_id,
            consent_language_text,
            onboarding_id,
            ml_consent,
        };

        let new_user_consent = diesel::insert_into(db_schema::schema::user_consent::table)
            .values(new_user_consent)
            .get_result::<UserConsent>(conn)?;

        Ok(new_user_consent)
    }

    #[tracing::instrument("UserConsent::latest_for_onboarding", skip_all)]
    pub fn latest_for_onboarding(
        conn: &mut PgConn,
        onboarding_id: &OnboardingId,
    ) -> DbResult<Option<UserConsent>> {
        let res = user_consent::table
            .filter(user_consent::onboarding_id.eq(onboarding_id))
            .order_by(user_consent::timestamp.desc())
            .first(conn)
            .optional()?;

        Ok(res)
    }

    #[tracing::instrument(skip_all)]
    pub fn latest_for_scoped_vault(
        conn: &mut PgConn,
        scoped_vault_id: &ScopedVaultId,
    ) -> DbResult<Option<UserConsent>> {
        let res = scoped_vault::table
            .filter(scoped_vault::id.eq(scoped_vault_id))
            .inner_join(onboarding::table.inner_join(user_consent::table))
            .order_by(user_consent::timestamp.desc())
            .select(user_consent::all_columns)
            .first(conn)
            .optional()?;

        Ok(res)
    }
}
