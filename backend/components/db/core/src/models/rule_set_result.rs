use super::data_lifetime::DataLifetime;
use crate::DbResult;
use crate::TxnPgConn;
use chrono::{DateTime, Utc};
use db_schema::schema::rule_set_result;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::RuleSetResultKind;
use newtypes::ScopedVaultId;
use newtypes::{DataLifetimeSeqno, ObConfigurationId, RuleAction, RuleSetResultId, WorkflowId};

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = rule_set_result)]
// TODO: description
pub struct RuleSetResult {
    pub id: RuleSetResultId,
    pub created_at: DateTime<Utc>,
    pub created_seqno: DataLifetimeSeqno,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub ob_configuration_id: ObConfigurationId, // might later one day be rule_set_id if we add an explicit rule_set table. At the moment, a playbook just have 1 implicit set of rules so for now we use obc_id here
    pub scoped_vault_id: ScopedVaultId,
    pub workflow_id: Option<WorkflowId>, // set if the rule evaluation was done within the context of a particular Workflow decision. This would be None for other cases like adhoc rule execution via internal endpoints or backtesting
    pub kind: RuleSetResultKind, // indicates the general purpose or insertion point for this evaluation of rules. Enables us to differentiate rule evalution done as part of the Kyc waterfall vs the final workflow decision vs stuff like backtesting/adhoc evaluations
    pub action_triggered: Option<RuleAction>, // the final chosen action based on the evaluation of all rules. None would indicate that no rules evaluated to true
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = rule_set_result)]
struct NewRuleSetResult {
    pub created_at: DateTime<Utc>,
    pub created_seqno: DataLifetimeSeqno,
    pub ob_configuration_id: ObConfigurationId,
    pub scoped_vault_id: ScopedVaultId,
    pub workflow_id: Option<WorkflowId>,
    pub kind: RuleSetResultKind,
    pub action_triggered: Option<RuleAction>,
}

#[derive(Debug, Clone)]
pub struct NewRuleSetResultArgs<'a> {
    pub ob_configuration_id: &'a ObConfigurationId,
    pub scoped_vault_id: &'a ScopedVaultId,
    pub workflow_id: Option<&'a WorkflowId>,
    pub kind: RuleSetResultKind,
    pub action_triggered: Option<RuleAction>,
}

impl RuleSetResult {
    #[tracing::instrument("RuleSetResult::create", skip_all)]
    pub fn create(conn: &mut TxnPgConn, args: NewRuleSetResultArgs) -> DbResult<Self> {
        let seqno = DataLifetime::get_current_seqno(conn)?;
        let new_rule_set_result = NewRuleSetResult {
            created_at: Utc::now(),
            created_seqno: seqno,
            ob_configuration_id: args.ob_configuration_id.clone(),
            scoped_vault_id: args.scoped_vault_id.clone(),
            workflow_id: args.workflow_id.cloned(),
            kind: args.kind,
            action_triggered: args.action_triggered,
        };

        let res = diesel::insert_into(rule_set_result::table)
            .values(new_rule_set_result)
            .get_result::<Self>(conn.conn())?;
        Ok(res)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tests::prelude::*;
    use fixtures::ob_configuration::ObConfigurationOpts;
    use macros::db_test;

    #[db_test]
    fn test_create(conn: &mut TestPgConn) {
        let t = tests::fixtures::tenant::create(conn);
        let obc = tests::fixtures::ob_configuration::create_with_opts(
            conn,
            &t.id,
            ObConfigurationOpts { ..Default::default() },
        );
        let uv = tests::fixtures::vault::create_person(conn, obc.is_live);
        let sv = tests::fixtures::scoped_vault::create(conn, &uv.id, &obc.id);

        let rule_set_result = RuleSetResult::create(
            conn,
            NewRuleSetResultArgs {
                ob_configuration_id: &obc.id,
                scoped_vault_id: &sv.id,
                workflow_id: None,
                kind: RuleSetResultKind::Adhoc,
                action_triggered: Some(RuleAction::ManualReview),
            },
        )
        .unwrap();

        assert_eq!(obc.id, rule_set_result.ob_configuration_id);
        assert_eq!(sv.id, rule_set_result.scoped_vault_id);
        assert_eq!(None, rule_set_result.workflow_id);
        assert_eq!(RuleSetResultKind::Adhoc, rule_set_result.kind);
        assert_eq!(Some(RuleAction::ManualReview), rule_set_result.action_triggered);
    }
}
