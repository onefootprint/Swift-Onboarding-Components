use super::waterfall_step::NewWaterfallStepArgs;
use super::waterfall_step::WaterfallStep;
use crate::NonNullVec;
use crate::PgConn;
use crate::TxnPgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::waterfall_execution;
use diesel::prelude::*;
use diesel::Insertable;
use diesel::Queryable;
use newtypes::DecisionIntentId;
use newtypes::Locked;
use newtypes::VendorAPI;
use newtypes::WaterfallExecutionId;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = waterfall_execution)]
pub struct WaterfallExecution {
    pub id: WaterfallExecutionId,
    pub created_at: DateTime<Utc>,
    pub decision_intent_id: DecisionIntentId,
    /// Ordered list of available APIs for this waterfall execution
    #[diesel(deserialize_as = NonNullVec<VendorAPI>)]
    pub available_vendor_apis: Vec<VendorAPI>,
    pub completed_at: Option<DateTime<Utc>>,
    pub latest_step: i32,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

#[derive(Debug, AsChangeset, Default)]
#[diesel(table_name = waterfall_execution)]
pub struct UpdateWaterfallExecution {
    pub completed_at: Option<DateTime<Utc>>,
    pub latest_step: Option<i32>,
}

impl UpdateWaterfallExecution {
    pub fn set_completed_at() -> Self {
        Self {
            completed_at: Some(Utc::now()),
            ..Default::default()
        }
    }

    pub fn set_latest_step(step: i32) -> Self {
        Self {
            latest_step: Some(step),
            ..Default::default()
        }
    }
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = waterfall_execution)]
pub struct NewWaterfallExecutionRow {
    available_vendor_apis: Vec<VendorAPI>,
    decision_intent_id: DecisionIntentId,
    latest_step: i32,
    created_at: DateTime<Utc>,
}

impl WaterfallExecution {
    #[tracing::instrument("WaterfallExecution::get_or_create", skip_all)]
    pub fn get_or_create(
        conn: &mut PgConn,
        available_vendor_apis: Vec<VendorAPI>,
        decision_intent_id: &DecisionIntentId,
    ) -> FpResult<Self> {
        let existing: Option<Self> = waterfall_execution::table
            .filter(waterfall_execution::decision_intent_id.eq(decision_intent_id))
            .filter(waterfall_execution::completed_at.is_null())
            .get_result(conn)
            .optional()?;
        if let Some(res) = existing {
            return Ok(res);
        };

        let row = NewWaterfallExecutionRow {
            available_vendor_apis,
            decision_intent_id: decision_intent_id.clone(),
            latest_step: 0,
            created_at: Utc::now(),
        };
        let res = diesel::insert_into(waterfall_execution::table)
            .values(row)
            .get_result(conn)?;

        Ok(res)
    }

    #[tracing::instrument("WaterfallExecution::lock", skip_all)]
    pub fn lock(conn: &mut TxnPgConn, id: &WaterfallExecutionId) -> FpResult<Locked<Self>> {
        let result = waterfall_execution::table
            .filter(waterfall_execution::id.eq(id))
            .for_no_key_update()
            .get_result(conn.conn())?;
        Ok(Locked::new(result))
    }

    #[tracing::instrument("WaterfallExecution::update", skip_all)]
    pub fn update(
        locked: Locked<Self>,
        conn: &mut TxnPgConn,
        update: UpdateWaterfallExecution,
    ) -> FpResult<Self> {
        let res = diesel::update(waterfall_execution::table)
            .filter(waterfall_execution::id.eq(&locked.id))
            .set(update)
            .get_result(conn.conn())?;

        Ok(res)
    }

    #[tracing::instrument("WaterfallExecution::get_or_create_step", skip_all)]
    pub fn create_step(
        execution: Locked<Self>,
        conn: &mut TxnPgConn,
        vendor_api: VendorAPI,
    ) -> FpResult<WaterfallStep> {
        let next = execution.latest_step + 1;
        let args = NewWaterfallStepArgs {
            vendor_api,
            execution_id: execution.id.clone(),
            step: next,
        };

        let res = WaterfallStep::create(conn, args)?;
        let execution_update = UpdateWaterfallExecution::set_latest_step(next);
        let _ = Self::update(execution, conn, execution_update)?;

        Ok(res)
    }

    #[tracing::instrument("WaterfallExecution::list", skip_all)]
    pub fn list(conn: &mut PgConn, di_id: &DecisionIntentId) -> FpResult<Vec<Self>> {
        let res = waterfall_execution::table
            .filter(waterfall_execution::decision_intent_id.eq(di_id))
            .order_by(waterfall_execution::_created_at.asc())
            .get_results(conn)?;

        Ok(res)
    }
}
