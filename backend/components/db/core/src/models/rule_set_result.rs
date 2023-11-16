use super::data_lifetime::DataLifetime;
use super::rule_result::NewRuleResult;
use super::rule_result::RuleResult;
use crate::DbResult;
use crate::TxnPgConn;
use chrono::{DateTime, Utc};
use db_schema::schema::rule_set_result;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use itertools::Itertools;
use newtypes::RuleInstanceId;
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
    pub rule_results: Vec<NewRuleResultArgs<'a>>,
}

#[derive(Debug, Clone)]
pub struct NewRuleResultArgs<'a> {
    pub rule_instance_id: &'a RuleInstanceId,
    pub result: bool,
}

impl RuleSetResult {
    #[tracing::instrument("RuleSetResult::create", skip_all)]
    pub fn create(conn: &mut TxnPgConn, args: NewRuleSetResultArgs) -> DbResult<(Self, Vec<RuleResult>)> {
        let now = Utc::now();
        let seqno = DataLifetime::get_current_seqno(conn)?;
        let new_rule_set_result = NewRuleSetResult {
            created_at: now,
            created_seqno: seqno,
            ob_configuration_id: args.ob_configuration_id.clone(),
            scoped_vault_id: args.scoped_vault_id.clone(),
            workflow_id: args.workflow_id.cloned(),
            kind: args.kind,
            action_triggered: args.action_triggered,
        };

        let rule_set_result = diesel::insert_into(rule_set_result::table)
            .values(new_rule_set_result)
            .get_result::<Self>(conn.conn())?;

        let rule_results = RuleResult::bulk_create(
            conn,
            args.rule_results
                .iter()
                .map(|r| NewRuleResult {
                    created_at: now,
                    rule_instance_id: r.rule_instance_id.clone(),
                    rule_set_result_id: rule_set_result.id.clone(),
                    result: r.result,
                })
                .collect_vec(),
        )?;

        Ok((rule_set_result, rule_results))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::rule_instance::RuleInstance;
    use crate::test_helpers::assert_have_same_elements;
    use crate::tests::prelude::*;
    use fixtures::ob_configuration::ObConfigurationOpts;
    use macros::db_test;
    use newtypes::DbActor;

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

        let rule1 = RuleInstance::create(
            conn,
            obc.id.clone(),
            DbActor::Footprint,
            None,
            "".to_owned(),
            RuleAction::Fail,
        )
        .unwrap();

        let rule2 = RuleInstance::create(
            conn,
            obc.id.clone(),
            DbActor::Footprint,
            None,
            "".to_owned(),
            RuleAction::Fail,
        )
        .unwrap();

        let rule3 = RuleInstance::create(
            conn,
            obc.id.clone(),
            DbActor::Footprint,
            None,
            "".to_owned(),
            RuleAction::Fail,
        )
        .unwrap();

        let (rule_set_result, rule_results) = RuleSetResult::create(
            conn,
            NewRuleSetResultArgs {
                ob_configuration_id: &obc.id,
                scoped_vault_id: &sv.id,
                workflow_id: None,
                kind: RuleSetResultKind::Adhoc,
                action_triggered: Some(RuleAction::ManualReview),
                rule_results: vec![
                    NewRuleResultArgs {
                        rule_instance_id: &rule1.id,
                        result: true,
                    },
                    NewRuleResultArgs {
                        rule_instance_id: &rule2.id,
                        result: false,
                    },
                    NewRuleResultArgs {
                        rule_instance_id: &rule3.id,
                        result: true,
                    },
                ],
            },
        )
        .unwrap();

        assert_eq!(obc.id, rule_set_result.ob_configuration_id);
        assert_eq!(sv.id, rule_set_result.scoped_vault_id);
        assert_eq!(None, rule_set_result.workflow_id);
        assert_eq!(RuleSetResultKind::Adhoc, rule_set_result.kind);
        assert_eq!(Some(RuleAction::ManualReview), rule_set_result.action_triggered);

        assert_have_same_elements(
            vec![(rule1.id, true), (rule2.id, false), (rule3.id, true)],
            rule_results
                .into_iter()
                .map(|r| (r.rule_instance_id, r.result))
                .collect_vec(),
        );
    }
}
