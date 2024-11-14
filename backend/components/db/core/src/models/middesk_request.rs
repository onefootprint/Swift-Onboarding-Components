use crate::PgConn;
use crate::TxnPgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::middesk_request;
use diesel::prelude::*;
use newtypes::DecisionIntentId;
use newtypes::MiddeskRequestId;
use newtypes::MiddeskRequestState;
use newtypes::WorkflowId;

#[derive(Debug, Clone, Queryable, Identifiable, QueryableByName, Eq, PartialEq)]
#[diesel(table_name = middesk_request)]
pub struct MiddeskRequest {
    pub id: MiddeskRequestId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
    pub decision_intent_id: DecisionIntentId,
    pub business_id: Option<String>,
    pub state: MiddeskRequestState,
    pub completed_at: Option<DateTime<Utc>>,
    pub workflow_id: WorkflowId,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = middesk_request)]
struct NewMiddeskRequest {
    created_at: DateTime<Utc>,
    decision_intent_id: DecisionIntentId,
    state: MiddeskRequestState,
    workflow_id: WorkflowId,
}

#[derive(Debug, AsChangeset, Default)]
#[diesel(table_name = middesk_request)]
pub struct UpdateMiddeskRequest {
    pub business_id: Option<Option<String>>,
    pub state: Option<MiddeskRequestState>,
    pub completed_at: Option<Option<DateTime<Utc>>>,
}

impl UpdateMiddeskRequest {
    pub fn set_state(state: MiddeskRequestState) -> Self {
        Self {
            state: Some(state),
            completed_at: (state == MiddeskRequestState::Complete).then_some(Some(Utc::now())),
            ..Self::default()
        }
    }

    pub fn set_business_id_and_state(business_id: String, state: MiddeskRequestState) -> Self {
        Self {
            business_id: Some(Some(business_id)),
            state: Some(state),
            completed_at: (state == MiddeskRequestState::Complete).then_some(Some(Utc::now())),
        }
    }
}

impl MiddeskRequest {
    #[tracing::instrument("MiddeskRequest::create", skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        workflow_id: WorkflowId,
        decision_intent_id: DecisionIntentId,
        state: MiddeskRequestState,
    ) -> FpResult<Self> {
        let new_req = NewMiddeskRequest {
            created_at: Utc::now(),
            decision_intent_id,
            state,
            workflow_id,
        };

        let res = diesel::insert_into(middesk_request::table)
            .values(new_req)
            .get_result(conn.conn())?;

        Ok(res)
    }

    #[tracing::instrument("MiddeskRequest::update", skip_all)]
    pub fn update(conn: &mut PgConn, id: MiddeskRequestId, update: UpdateMiddeskRequest) -> FpResult<Self> {
        let res = diesel::update(middesk_request::table)
            .filter(middesk_request::id.eq(&id))
            .set(update)
            .get_result(conn)?;

        Ok(res)
    }

    #[tracing::instrument("MiddeskRequest::get_by_business_id", skip_all)]
    pub fn get_by_business_id(conn: &mut PgConn, business_id: String) -> FpResult<Self> {
        let res: MiddeskRequest = middesk_request::table
            .filter(middesk_request::business_id.eq(business_id))
            .get_result(conn)?;

        Ok(res)
    }
}
