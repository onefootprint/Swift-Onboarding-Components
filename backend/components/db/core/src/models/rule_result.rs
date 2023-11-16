use crate::DbResult;
use crate::TxnPgConn;
use chrono::{DateTime, Utc};
use db_schema::schema::rule_result;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::RuleInstanceId;
use newtypes::RuleResultId;
use newtypes::RuleSetResultId;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = rule_result)]
// Result of evaluating a single user-facing Rule as part of some evaluation of all Rule's. For a single RuleSetResult row, there are multiple RuleResult rows. And a given Rule will only have one corresponding RuleResult per RuleSetResult
pub struct RuleResult {
    pub id: RuleResultId,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub rule_instance_id: RuleInstanceId,
    pub rule_set_result_id: RuleSetResultId,
    pub result: bool,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = rule_result)]
pub(crate) struct NewRuleResult {
    pub created_at: DateTime<Utc>,
    pub rule_instance_id: RuleInstanceId,
    pub rule_set_result_id: RuleSetResultId,
    pub result: bool,
}

impl RuleResult {
    #[tracing::instrument("RuleResult::create", skip_all)]
    pub(crate) fn bulk_create(
        conn: &mut TxnPgConn,
        new_rule_results: Vec<NewRuleResult>,
    ) -> DbResult<Vec<Self>> {
        let res = diesel::insert_into(rule_result::table)
            .values(new_rule_results)
            .get_results::<Self>(conn.conn())?;
        Ok(res)
    }
}
