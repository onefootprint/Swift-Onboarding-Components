use crate::PgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::user_consent;
use diesel::prelude::*;
use diesel::Insertable;
use diesel::Queryable;
use newtypes::InsightEventId;
use newtypes::UserConsentId;
use newtypes::WorkflowId;
use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Clone, Queryable, Default, Serialize, Deserialize)]
#[diesel(table_name = user_consent)]
pub struct UserConsent {
    pub id: UserConsentId,
    pub timestamp: DateTime<Utc>,
    pub insight_event_id: InsightEventId,
    pub consent_language_text: String,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub ml_consent: bool,
    pub workflow_id: WorkflowId,
}

#[derive(Debug, Clone, Insertable, Default)]
#[diesel(table_name = user_consent)]
pub struct NewUserConsent {
    pub timestamp: DateTime<Utc>,
    pub insight_event_id: InsightEventId,
    pub consent_language_text: String,
    pub ml_consent: bool,
    pub workflow_id: WorkflowId,
}

impl UserConsent {
    #[tracing::instrument("UserConsent::create", skip_all)]
    pub fn create(
        conn: &mut PgConn,
        timestamp: DateTime<Utc>,
        insight_event_id: InsightEventId,
        consent_language_text: String,
        ml_consent: bool,
        workflow_id: WorkflowId,
    ) -> FpResult<UserConsent> {
        let new_user_consent = NewUserConsent {
            timestamp,
            insight_event_id,
            consent_language_text,
            ml_consent,
            workflow_id,
        };

        let new_user_consent = diesel::insert_into(db_schema::schema::user_consent::table)
            .values(new_user_consent)
            .get_result::<UserConsent>(conn)?;

        Ok(new_user_consent)
    }

    #[tracing::instrument("UserConsent::get_for_workflow", skip_all)]
    pub fn get_for_workflow(conn: &mut PgConn, workflow_id: &WorkflowId) -> FpResult<Option<UserConsent>> {
        let res = user_consent::table
            .filter(user_consent::workflow_id.eq(workflow_id))
            .get_result(conn)
            .optional()?;

        Ok(res)
    }
}
