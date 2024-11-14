use super::rule_instance::RuleInstance;
use crate::PgConn;
use crate::TxnPgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::rule_instance;
use db_schema::schema::rule_result;
use diesel::prelude::*;
use diesel::Insertable;
use diesel::Queryable;
use newtypes::RuleInstanceId;
use newtypes::RuleResultId;
use newtypes::RuleSetResultId;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = rule_result)]
// Result of evaluating a single user-facing Rule as part of some evaluation of all Rule's. For a
// single RuleSetResult row, there are multiple RuleResult rows. And a given Rule will only have one
// corresponding RuleResult per RuleSetResult
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
    ) -> FpResult<Vec<Self>> {
        let res = diesel::insert_into(rule_result::table)
            .values(new_rule_results)
            .get_results::<Self>(conn.conn())?;
        Ok(res)
    }

    #[tracing::instrument("RuleResult::list", skip_all)]
    pub(crate) fn list(
        conn: &mut PgConn,
        rule_set_result_id: &RuleSetResultId,
    ) -> FpResult<Vec<(RuleResult, RuleInstance)>> {
        let res = rule_result::table
            .filter(rule_result::rule_set_result_id.eq(rule_set_result_id))
            .inner_join(rule_instance::table)
            .order_by(rule_instance::created_at.asc())
            .get_results(conn)?;
        Ok(res)
    }
}
