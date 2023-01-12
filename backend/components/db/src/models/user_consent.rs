use crate::schema::user_consent;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, PgConnection, Queryable};
use newtypes::{DocumentRequestId, InsightEventId, ScopedUserId, UserConsentId, UserVaultId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Queryable, Default, Serialize, Deserialize)]
#[diesel(table_name = user_consent)]
pub struct UserConsent {
    pub id: UserConsentId,
    pub timestamp: DateTime<Utc>,
    pub user_vault_id: UserVaultId,
    pub scoped_user_id: ScopedUserId,
    pub document_request_id: DocumentRequestId,
    pub insight_event_id: InsightEventId,
    pub consent_language_text: String,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Insertable, Default)]
#[diesel(table_name = user_consent)]
pub struct NewUserConsent {
    pub user_vault_id: UserVaultId,
    pub scoped_user_id: ScopedUserId,
    pub timestamp: DateTime<Utc>,
    pub document_request_id: DocumentRequestId,
    pub insight_event_id: InsightEventId,
    pub consent_language_text: String,
}

impl UserConsent {
    pub fn create(
        conn: &mut PgConnection,
        user_vault_id: UserVaultId,
        scoped_user_id: ScopedUserId,
        timestamp: DateTime<Utc>,
        document_request_id: DocumentRequestId,
        insight_event_id: InsightEventId,
        consent_language_text: String,
    ) -> Result<UserConsent, crate::DbError> {
        let new_user_consent = NewUserConsent {
            user_vault_id,
            scoped_user_id,
            timestamp,
            document_request_id,
            insight_event_id,
            consent_language_text,
        };

        let new_user_consent = diesel::insert_into(crate::schema::user_consent::table)
            .values(new_user_consent)
            .get_result::<UserConsent>(conn)?;

        Ok(new_user_consent)
    }
}
