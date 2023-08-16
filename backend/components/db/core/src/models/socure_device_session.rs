use crate::PgConn;
use crate::{DbError, DbResult};
use chrono::{DateTime, Utc};
use db_schema::schema::socure_device_session;
use diesel::prelude::*;
use diesel::Insertable;
use newtypes::{OnboardingId, SocureDeviceSessionId, WorkflowId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = socure_device_session)]
pub struct SocureDeviceSession {
    pub id: SocureDeviceSessionId,
    pub onboarding_id: Option<OnboardingId>,
    pub device_session_id: String,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub workflow_id: WorkflowId,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = socure_device_session)]
struct NewSocureDeviceSession {
    pub onboarding_id: OnboardingId,
    pub device_session_id: String,
    pub created_at: DateTime<Utc>,
    pub workflow_id: WorkflowId,
}

impl SocureDeviceSession {
    #[tracing::instrument("SocureDeviceSession::create", skip_all)]
    pub fn create(
        conn: &mut PgConn,
        device_session_id: String, //TODO: make this a wrapped type?
        wf_id: WorkflowId,
    ) -> Result<SocureDeviceSession, DbError> {
        // TODO migrate
        use db_schema::schema::{onboarding, workflow};
        let onboarding_id = onboarding::table
            .inner_join(workflow::table.on(workflow::scoped_vault_id.eq(onboarding::scoped_vault_id)))
            .filter(workflow::id.eq(&wf_id))
            .select(onboarding::id)
            .get_result(conn)?;
        let new_result = NewSocureDeviceSession {
            onboarding_id,
            device_session_id,
            created_at: Utc::now(),
            workflow_id: wf_id,
        };
        let result = diesel::insert_into(socure_device_session::table)
            .values(new_result)
            .get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument("SocureDeviceSession::latest_for_onboarding", skip_all)]
    pub fn latest(conn: &mut PgConn, wf_id: &WorkflowId) -> DbResult<Option<SocureDeviceSession>> {
        let res = socure_device_session::table
            .filter(socure_device_session::workflow_id.eq(wf_id))
            .order_by(socure_device_session::created_at.desc())
            .first(conn)
            .optional()?;

        Ok(res)
    }
}
