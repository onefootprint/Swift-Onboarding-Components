use crate::{DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::waterfall_step;
use newtypes::{
    Locked, VendorAPI, VerificationResultId, WaterfallExecutionId, WaterfallStepAction, WaterfallStepId,
};

use diesel::{prelude::*, Insertable, Queryable};

use super::waterfall_execution::WaterfallExecution;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = waterfall_step)]
pub struct WaterfallStep {
    pub id: WaterfallStepId,
    pub execution_id: WaterfallExecutionId,
    pub created_at: DateTime<Utc>,
    pub vendor_api: VendorAPI,
    // this is the index of the call in the WaterfallExecution flow
    pub step: i32,
    // Always set after we run vendor request, unless there's an unhandled error
    // denormalized for debugging
    pub verification_result_id: Option<VerificationResultId>,
    pub verification_result_is_error: Option<bool>,
    // for debugging
    pub rules_result: Option<serde_json::Value>,
    // rules or error based outcome for this step
    pub action: Option<WaterfallStepAction>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
    pub _updated_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
}


#[derive(Debug, Clone)]
pub struct NewWaterfallStepArgs {
    pub vendor_api: VendorAPI,
    pub execution_id: WaterfallExecutionId,
    pub step: i32,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = waterfall_step)]
pub struct NewWaterfallStepRow {
    vendor_api: VendorAPI,
    execution_id: WaterfallExecutionId,
    step: i32,
    created_at: DateTime<Utc>,
}


#[derive(Debug, AsChangeset, Default)]
#[diesel(table_name = waterfall_step)]
pub struct UpdateWaterfallStep {
    pub verification_result_id: Option<VerificationResultId>,
    pub verification_result_is_error: Option<bool>,
    // just for debugging
    #[allow(dead_code)]
    pub rules_result: Option<serde_json::Value>,
    pub action: Option<WaterfallStepAction>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
}

impl UpdateWaterfallStep {
    pub fn save_step_result(
        verification_result_id: Option<VerificationResultId>,
        verification_result_is_error: Option<bool>,
        action: Option<WaterfallStepAction>,
        rules_result: Option<serde_json::Value>,
    ) -> Self {
        Self {
            verification_result_id,
            verification_result_is_error,
            rules_result,
            action,
            completed_at: Some(Utc::now()),
            ..Default::default()
        }
    }
}

impl WaterfallStep {
    #[tracing::instrument("WaterfallStep::lock", skip_all)]
    pub fn lock(conn: &mut TxnPgConn, id: &WaterfallStepId) -> DbResult<Locked<Self>> {
        let result = waterfall_step::table
            .filter(waterfall_step::id.eq(id))
            .for_no_key_update()
            .get_result(conn.conn())?;
        Ok(Locked::new(result))
    }

    #[tracing::instrument("WaterfallStep::update", skip(conn, update))]
    pub fn update(
        locked: Locked<WaterfallExecution>,
        conn: &mut TxnPgConn,
        id: WaterfallStepId,
        update: UpdateWaterfallStep,
    ) -> DbResult<Self> {
        let res = diesel::update(waterfall_step::table)
            .filter(waterfall_step::id.eq(id))
            .set(update)
            .get_result(conn.conn())?;

        Ok(res)
    }

    #[tracing::instrument("WaterfallStep::create", , skip(conn))]
    pub(crate) fn create(conn: &mut TxnPgConn, args: NewWaterfallStepArgs) -> DbResult<Self> {
        let NewWaterfallStepArgs {
            vendor_api,
            execution_id,
            step,
        } = args;

        let new = NewWaterfallStepRow {
            vendor_api,
            execution_id,
            step,
            created_at: Utc::now(),
        };

        let res = diesel::insert_into(waterfall_step::table)
            .values(new)
            .get_result(conn.conn())?;

        Ok(res)
    }

    // TODO: figure this part out, get_or_create?
    #[tracing::instrument("WaterfallStep::get", skip(conn))]
    pub fn get(
        conn: &mut TxnPgConn,
        execution_id: &WaterfallExecutionId,
        step: i32,
        vendor_api: &VendorAPI,
    ) -> DbResult<Option<Self>> {
        let res: Option<Self> = waterfall_step::table
            .filter(waterfall_step::execution_id.eq(execution_id))
            .filter(waterfall_step::vendor_api.eq(vendor_api))
            .filter(waterfall_step::step.eq(step))
            .get_result(conn.conn())
            .optional()?;

        Ok(res)
    }
}
