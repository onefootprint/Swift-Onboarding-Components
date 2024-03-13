use super::{ob_configuration::ObConfiguration, rule_set_version::RuleSetVersion};
use crate::{DbResult, PgConn, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::{ob_configuration, rule_instance};
use diesel::{prelude::*, Insertable, Queryable};
use newtypes::{
    DataLifetimeSeqno, DbActor, Locked, ObConfigurationId, RuleAction, RuleExpression, RuleId,
    RuleInstanceId, TenantId,
};
use rand::distributions::{Alphanumeric, DistString};

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = rule_instance)]
// We use an "immutable changelog" approach here. So what corresponds to 1 User-Facing Rule is actually represented under the hood by N RuleInstance rows in Postgres.
// When a User modifies a rule (changes rule_expression/is_shadow/name), we find the latest/active RuleInstance row in PG for that User-Facing Rule, we mark it as deactived, and clone a new version of it with the edit made.
// A single User-Facing Rule has a single `rule_id` (we use this as a stable identifier, because `name` can be changed). So all the N RuleInstance rows in PG for that User-Facing Rule will have the same `rule_id` (even though each would have a unique `id` which remains a true row-unique identifier in PG)
pub struct RuleInstance {
    pub id: RuleInstanceId,
    pub created_at: DateTime<Utc>,
    pub created_seqno: DataLifetimeSeqno,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub deactivated_seqno: Option<DataLifetimeSeqno>,
    pub rule_id: RuleId,
    pub ob_configuration_id: ObConfigurationId, // later to be replaced by rule_set_id which will in turn have a pointer to OBC
    pub actor: DbActor,
    pub name: Option<String>,
    pub rule_expression: RuleExpression,
    pub action: RuleAction,
    pub is_shadow: bool, // not yet used
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = rule_instance)]
pub struct NewRuleInstance {
    pub created_at: DateTime<Utc>,
    pub created_seqno: DataLifetimeSeqno,
    pub rule_id: RuleId,
    pub ob_configuration_id: ObConfigurationId,
    pub actor: DbActor,
    pub name: Option<String>,
    pub rule_expression: RuleExpression,
    pub action: RuleAction,
    pub is_shadow: bool,
    // These two would only be set when inserting a new rule_instance, when a Rule is being deleted
    pub deactivated_at: Option<DateTime<Utc>>,
    pub deactivated_seqno: Option<DataLifetimeSeqno>,
}

pub struct NewRule {
    pub rule_expression: RuleExpression,
    pub action: RuleAction,
    pub name: Option<String>,
}

#[derive(Debug, Clone)]
pub struct RuleInstanceUpdate {
    name: Option<Option<String>>,
    rule_expression: Option<RuleExpression>,
    is_shadow: Option<bool>,
    deactivate: bool,
}

impl RuleInstanceUpdate {
    pub fn update(
        name: Option<Option<String>>,
        rule_expression: Option<RuleExpression>,
        is_shadow: Option<bool>,
    ) -> Self {
        Self {
            name,
            rule_expression,
            is_shadow,
            deactivate: false,
        }
    }

    pub fn delete() -> Self {
        Self {
            name: None,
            rule_expression: None,
            is_shadow: None,
            deactivate: true,
        }
    }
}

impl RuleInstance {
    #[tracing::instrument("RuleInstance::create", skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        obc: &Locked<ObConfiguration>,
        actor: DbActor,
        name: Option<String>,
        rule_expression: RuleExpression,
        action: RuleAction,
    ) -> DbResult<Self> {
        let (_, seqno, now) = RuleSetVersion::create(conn, obc, actor.clone())?;

        let rule_id = format!("rule_{}", Alphanumeric.sample_string(&mut rand::thread_rng(), 22));
        let new_rule = NewRuleInstance {
            created_at: now,
            created_seqno: seqno,
            rule_id: rule_id.into(),
            ob_configuration_id: obc.id.clone(),
            actor,
            name,
            rule_expression,
            action,
            is_shadow: false, // we don't use this yet but in the near future may have new rules default to is_shadow=true
            deactivated_at: None,
            deactivated_seqno: None,
        };

        Self::insert(conn, new_rule)
    }

    #[tracing::instrument("RuleInstance::bulk_create", skip_all)]
    pub fn bulk_create(
        conn: &mut TxnPgConn,
        obc: &Locked<ObConfiguration>,
        actor: DbActor,
        new_rules: Vec<NewRule>,
    ) -> DbResult<Vec<Self>> {
        let (_, seqno, now) = RuleSetVersion::create(conn, obc, actor.clone())?;

        let new_rules: Vec<_> = new_rules
            .into_iter()
            .map(|r| {
                let rule_id = format!("rule_{}", Alphanumeric.sample_string(&mut rand::thread_rng(), 22));
                NewRuleInstance {
                    created_at: now,
                    created_seqno: seqno,
                    rule_id: rule_id.into(),
                    ob_configuration_id: obc.id.clone(),
                    actor: actor.clone(),
                    name: r.name,
                    rule_expression: r.rule_expression,
                    action: r.action,
                    is_shadow: false,
                    deactivated_at: None,
                    deactivated_seqno: None,
                }
            })
            .collect();

        let res = diesel::insert_into(rule_instance::table)
            .values(new_rules)
            .get_results::<Self>(conn.conn())?;
        Ok(res)
    }

    #[tracing::instrument("RuleInstance::insert", skip_all)]
    fn insert(conn: &mut PgConn, new_rule: NewRuleInstance) -> DbResult<Self> {
        let res = diesel::insert_into(rule_instance::table)
            .values(new_rule)
            .get_result::<Self>(conn)?;
        Ok(res)
    }

    #[tracing::instrument("RuleInstance::update", skip_all)]
    pub fn update(
        conn: &mut TxnPgConn,
        obc: &Locked<ObConfiguration>,
        actor: DbActor,
        rule_id: &RuleId,
        update: RuleInstanceUpdate,
    ) -> DbResult<Self> {
        let (_, seqno, now) = RuleSetVersion::create(conn, obc, actor.clone())?;

        // If we had 2 concurrent txn's trying to modify the same User-Facing Rule, then the second transaction would hit an error when trying to write the new Rule row below because it would violate the rule_one_active_per_rule_id constraint. Not a big deal and concurrent edits to the same Rule isn't something we need to try hard to gracefully support. If we used a 2 table representation here (ie Rule + RuleVersion), then row locking on Rule while writing new RuleVersion rows would allow both txn's to succeed.
        let current: RuleInstance = rule_instance::table
            .filter(rule_instance::ob_configuration_id.eq(&obc.id))
            .filter(rule_instance::rule_id.eq(rule_id))
            .filter(rule_instance::deactivated_at.is_null())
            .for_no_key_update()
            .get_result(conn.conn())?;

        // TODO: check if no changes are actually being made and error or no-op in that case? Not a huge deal to just write a new row tho
        let current: RuleInstance = diesel::update(rule_instance::table)
            .filter(rule_instance::id.eq(current.id))
            .set((
                rule_instance::deactivated_at.eq(now),
                rule_instance::deactivated_seqno.eq(seqno),
            ))
            .get_result(conn.conn())?;

        let new_rule = NewRuleInstance {
            created_at: now,
            created_seqno: seqno,
            rule_id: rule_id.clone(),
            ob_configuration_id: current.ob_configuration_id,
            actor,
            name: update.name.unwrap_or(current.name),
            rule_expression: update.rule_expression.unwrap_or(current.rule_expression),
            action: current.action,
            is_shadow: update.is_shadow.unwrap_or(current.is_shadow),
            deactivated_at: update.deactivate.then_some(now),
            deactivated_seqno: update.deactivate.then_some(seqno),
        };

        Self::insert(conn.conn(), new_rule)
    }

    #[tracing::instrument("RuleInstance::get", skip_all)]
    pub fn get(conn: &mut PgConn, rule_id: &RuleId) -> DbResult<Self> {
        let res = rule_instance::table
            .filter(rule_instance::rule_id.eq(rule_id))
            .filter(rule_instance::deactivated_at.is_null())
            .get_result(conn)?;

        Ok(res)
    }

    #[tracing::instrument("Rule::list", skip_all)]
    pub fn list(
        conn: &mut PgConn,
        tenant_id: &TenantId,
        is_live: bool,
        ob_config_id: &ObConfigurationId,
    ) -> DbResult<Vec<Self>> {
        let res = rule_instance::table
            .inner_join(ob_configuration::table)
            .filter(ob_configuration::tenant_id.eq(tenant_id))
            .filter(ob_configuration::is_live.eq(is_live))
            .filter(ob_configuration::id.eq(ob_config_id))
            .filter(rule_instance::deactivated_at.is_null())
            .select(rule_instance::all_columns)
            .order_by((rule_instance::created_at.asc(), rule_instance::id))
            .get_results(conn)?;
        Ok(res)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{models::rule_set_version::RuleSetVersion, tests::prelude::*};
    use fixtures::ob_configuration::ObConfigurationOpts;
    use macros::db_test;
    use newtypes::{BooleanOperator, FootprintReasonCode as FRC, RuleExpressionCondition, StepUpKind};


    #[db_test]
    fn test_bulk_create(conn: &mut TestPgConn) {
        let t = tests::fixtures::tenant::create(conn);
        let obc = tests::fixtures::ob_configuration::create_with_opts(
            conn,
            &t.id,
            ObConfigurationOpts { ..Default::default() },
        );
        let obc = ObConfiguration::lock(conn, &obc.id).unwrap();

        let r1 = NewRule {
            rule_expression: RuleExpression(vec![RuleExpressionCondition::RiskSignal {
                field: FRC::DocumentOcrDobDoesNotMatch,
                op: BooleanOperator::Equals,
                value: true,
            }]),
            action: RuleAction::ManualReview,
            name: None,
        };
        let r2 = NewRule {
            rule_expression: RuleExpression(vec![RuleExpressionCondition::RiskSignal {
                field: FRC::SubjectDeceased,
                op: BooleanOperator::Equals,
                value: true,
            }]),
            action: RuleAction::Fail,
            name: None,
        };
        let r3 = NewRule {
            rule_expression: RuleExpression(vec![RuleExpressionCondition::RiskSignal {
                field: FRC::DeviceHighRisk,
                op: BooleanOperator::Equals,
                value: true,
            }]),
            action: RuleAction::Fail,
            name: None,
        };

        let rules = RuleInstance::bulk_create(conn, &obc, DbActor::Footprint, vec![r1, r2, r3]).unwrap();
        assert_eq!(3, rules.len());
        assert_eq!(1, RuleSetVersion::get_current(conn, &obc.id).unwrap().version);
    }

    #[db_test]
    fn test_update(conn: &mut TestPgConn) {
        let t = tests::fixtures::tenant::create(conn);
        let obc = tests::fixtures::ob_configuration::create_with_opts(
            conn,
            &t.id,
            ObConfigurationOpts { ..Default::default() },
        );
        let obc = ObConfiguration::lock(conn, &obc.id).unwrap();

        let rule = RuleInstance::create(
            conn,
            &obc,
            DbActor::Footprint,
            Some("name1".to_owned()),
            tests::fixtures::rule::example_rule_expression(),
            RuleAction::Fail,
        )
        .unwrap();
        assert_eq!(1, RuleSetVersion::get_current(conn, &obc.id).unwrap().version);

        let updated_rule = RuleInstance::update(
            conn,
            &obc,
            DbActor::Footprint,
            &rule.rule_id,
            RuleInstanceUpdate {
                name: Some(Some("name2".to_owned())),
                rule_expression: Some(tests::fixtures::rule::example_rule_expression()),
                is_shadow: Some(false),
                deactivate: false,
            },
        )
        .unwrap();

        assert_eq!(rule.rule_id, updated_rule.rule_id);
        assert_eq!(rule.ob_configuration_id, updated_rule.ob_configuration_id);
        assert_eq!(rule.action, updated_rule.action);

        assert_eq!(Some("name2".to_owned()), updated_rule.name);
        assert_eq!(
            tests::fixtures::rule::example_rule_expression(),
            updated_rule.rule_expression
        );
        assert_eq!(false, updated_rule.is_shadow);

        assert_eq!(
            updated_rule.id,
            RuleInstance::get(conn, &rule.rule_id).unwrap().id
        );

        // new RSV has been written for this update
        assert_eq!(2, RuleSetVersion::get_current(conn, &obc.id).unwrap().version);
    }

    #[db_test]
    pub fn test_rule_action_is_backwards_compatible(conn: &mut TestPgConn) {
        let t = fixtures::tenant::create(conn);
        let obc = fixtures::ob_configuration::create(conn, &t.id, true);
        let obc = ObConfiguration::lock(conn, &obc.id).unwrap();

        let rule1 = RuleInstance::create(
            conn,
            &obc,
            DbActor::Footprint,
            Some("name1".to_owned()),
            tests::fixtures::rule::example_rule_expression(),
            RuleAction::StepUp(StepUpKind::Identity),
        )
        .unwrap();

        let reloaded_rule1 = RuleInstance::get(conn, &rule1.rule_id).unwrap();
        assert_eq!(reloaded_rule1.action, RuleAction::StepUp(StepUpKind::Identity));

        let rule2 = RuleInstance::create(
            conn,
            &obc,
            DbActor::Footprint,
            Some("name1".to_owned()),
            tests::fixtures::rule::example_rule_expression(),
            RuleAction::StepUp(StepUpKind::IdentityProofOfSsnProofOfAddress),
        )
        .unwrap();

        let reloaded_rule2 = RuleInstance::get(conn, &rule2.rule_id).unwrap();
        assert_eq!(
            reloaded_rule2.action,
            RuleAction::StepUp(StepUpKind::IdentityProofOfSsnProofOfAddress)
        );

        // Now check backwards compat for rule2
        diesel::sql_query(format!(
            "update rule_instance set action='step_up' where id = '{}';",
            reloaded_rule2.id
        ))
        .execute(conn.conn())
        .unwrap();

        let reloaded_rule2_after_update = RuleInstance::get(conn, &rule2.rule_id).unwrap();
        assert_eq!(
            reloaded_rule2_after_update.action,
            RuleAction::StepUp(StepUpKind::Identity)
        );
    }
}
