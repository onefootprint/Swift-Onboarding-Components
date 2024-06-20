use crate::DbError;
use crate::DbResult;
use crate::PgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::socure_device_session;
use diesel::prelude::*;
use diesel::Insertable;
use newtypes::SocureDeviceSessionId;
use newtypes::WorkflowId;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = socure_device_session)]
pub struct SocureDeviceSession {
    pub id: SocureDeviceSessionId,
    pub device_session_id: String,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub workflow_id: WorkflowId,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = socure_device_session)]
struct NewSocureDeviceSession {
    pub device_session_id: String,
    pub created_at: DateTime<Utc>,
    pub workflow_id: WorkflowId,
}

impl SocureDeviceSession {
    #[tracing::instrument("SocureDeviceSession::create", skip_all)]
    pub fn create(
        conn: &mut PgConn,
        device_session_id: String, //TODO: make this a wrapped type?
        workflow_id: WorkflowId,
    ) -> Result<SocureDeviceSession, DbError> {
        let new_result = NewSocureDeviceSession {
            device_session_id,
            created_at: Utc::now(),
            workflow_id,
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
