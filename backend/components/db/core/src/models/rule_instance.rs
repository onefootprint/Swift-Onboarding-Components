use std::collections::HashMap;

use super::{ob_configuration::ObConfiguration, rule_set_version::RuleSetVersion};
use crate::{DbError, DbResult, PgConn, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::{ob_configuration, rule_instance};
use diesel::{prelude::*, Insertable, Queryable};
use itertools::Itertools;
use newtypes::{
    DataLifetimeSeqno, DbActor, Locked, ObConfigurationId, RuleAction, RuleExpression, RuleId,
    RuleInstanceId, TenantId,
};

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
    pub name: Option<String>, // not used yet
    pub rule_expression: RuleExpression,
    pub action: RuleAction,
    pub is_shadow: bool, // not yet used
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = rule_instance)]
pub struct NewRuleInstance<'a> {
    pub created_at: DateTime<Utc>,
    pub created_seqno: DataLifetimeSeqno,
    pub rule_id: RuleId,
    pub ob_configuration_id: &'a ObConfigurationId,
    pub actor: &'a DbActor,
    pub name: Option<String>,
    pub rule_expression: RuleExpression,
    pub action: RuleAction,
    pub is_shadow: bool,
    // These two would only be set when inserting a new rule_instance, when a Rule is being deleted
    pub deactivated_at: Option<DateTime<Utc>>,
    pub deactivated_seqno: Option<DataLifetimeSeqno>,
}

#[derive(Debug, Clone)]
pub struct NewRule {
    pub rule_expression: RuleExpression,
    pub action: RuleAction,
    pub name: Option<String>,
}

#[derive(Debug, Clone)]
pub struct RuleInstanceUpdate {
    rule_id: RuleId,
    name: Option<Option<String>>, // TODO: remove, we don't actually use this currently
    rule_expression: Option<RuleExpression>,
    is_shadow: Option<bool>, // TODO: remove, we don't actually use this currently
    deactivate: bool,
}

impl RuleInstanceUpdate {
    pub fn update(
        rule_id: RuleId,
        name: Option<Option<String>>,
        rule_expression: Option<RuleExpression>,
        is_shadow: Option<bool>,
    ) -> Self {
        Self {
            rule_id,
            name,
            rule_expression,
            is_shadow,
            deactivate: false,
        }
    }

    pub fn delete(rule_id: RuleId) -> Self {
        Self {
            rule_id,
            name: None,
            rule_expression: None,
            is_shadow: None,
            deactivate: true,
        }
    }
}


#[derive(Debug, Clone)]
pub struct CreateRule {
    pub rule_expression: RuleExpression,
    pub rule_action: RuleAction,
}

#[derive(Debug, Clone)]
pub struct EditRule {
    pub rule_id: RuleId,
    pub rule_expression: RuleExpression,
}

#[derive(Debug, Clone)]
pub struct MultiRuleUpdate {
    pub expected_rule_set_version: Option<i32>, // can drop Option later once all clients start passing this
    pub new_rules: Vec<NewRule>,
    pub updates: Vec<RuleInstanceUpdate>,
}


impl RuleInstance {
    #[tracing::instrument("RuleInstance::bulk_edit", skip_all)]
    pub fn bulk_edit(
        conn: &mut TxnPgConn,
        obc: &Locked<ObConfiguration>,
        actor: &DbActor,
        update: MultiRuleUpdate,
    ) -> DbResult<Vec<RuleInstance>> {
        let MultiRuleUpdate {
            expected_rule_set_version,
            new_rules,
            updates,
        } = update;

        let (_, seqno, now) = RuleSetVersion::create(conn, obc, expected_rule_set_version, actor.clone())?;

        let mut new_rule_instances = vec![];
        if !new_rules.is_empty() {
            new_rule_instances.append(&mut Self::bulk_add(conn, obc, actor, new_rules, seqno, now)?);
        }

        if !updates.is_empty() {
            new_rule_instances.append(&mut Self::bulk_update(conn, obc, actor, updates, seqno, now)?);
        }

        Ok(new_rule_instances)
    }

    #[tracing::instrument("RuleInstance::bulk_add", skip_all)]
    fn bulk_add(
        conn: &mut TxnPgConn,
        obc: &Locked<ObConfiguration>,
        actor: &DbActor,
        new_rules: Vec<NewRule>,
        seqno: DataLifetimeSeqno,
        now: DateTime<Utc>,
    ) -> DbResult<Vec<Self>> {
        let new_rules: Vec<_> = new_rules
            .into_iter()
            .map(|r| NewRuleInstance {
                created_at: now,
                created_seqno: seqno,
                rule_id: RuleId::generate(),
                ob_configuration_id: &obc.id,
                actor,
                name: r.name,
                rule_expression: r.rule_expression,
                action: r.action,
                is_shadow: false,
                deactivated_at: None,
                deactivated_seqno: None,
            })
            .collect();

        let res = diesel::insert_into(rule_instance::table)
            .values(new_rules)
            .get_results::<Self>(conn.conn())?;
        Ok(res)
    }

    #[tracing::instrument("RuleInstance::bulk_update", skip_all)]
    fn bulk_update(
        conn: &mut TxnPgConn,
        obc: &Locked<ObConfiguration>,
        actor: &DbActor,
        updates: Vec<RuleInstanceUpdate>,
        seqno: DataLifetimeSeqno,
        now: DateTime<Utc>,
    ) -> DbResult<Vec<Self>> {
        let rule_ids = updates.iter().map(|u| &u.rule_id).collect_vec();

        // deactivate existing RuleInstance's for each rule_id
        let existing: Vec<RuleInstance> = diesel::update(rule_instance::table)
            .filter(rule_instance::ob_configuration_id.eq(&obc.id))
            .filter(rule_instance::rule_id.eq_any(rule_ids))
            .filter(rule_instance::deactivated_at.is_null())
            .set((
                rule_instance::deactivated_at.eq(now),
                rule_instance::deactivated_seqno.eq(seqno),
            ))
            .get_results(conn.conn())?;

        let mut existing: HashMap<RuleId, RuleInstance> =
            existing.into_iter().map(|ri| (ri.rule_id.clone(), ri)).collect();

        let existing_with_update: Vec<(RuleInstance, RuleInstanceUpdate)> = updates
            .into_iter()
            .map(|u| {
                existing
                    .remove(&u.rule_id)
                    .ok_or(DbError::RelatedObjectNotFound)
                    .map(|e| (e, u))
            })
            .collect::<Result<Vec<_>, _>>()?;

        // create new RuleInstance's for each update (both edits + deletes)
        let new_rule_instances = existing_with_update
            .into_iter()
            .map(|(existing, update)| NewRuleInstance {
                created_at: now,
                created_seqno: seqno,
                rule_id: update.rule_id.clone(),
                ob_configuration_id: &obc.id,
                actor,
                name: update.name.unwrap_or(existing.name),
                rule_expression: update.rule_expression.unwrap_or(existing.rule_expression),
                action: existing.action,
                is_shadow: update.is_shadow.unwrap_or(existing.is_shadow),
                deactivated_at: update.deactivate.then_some(now),
                deactivated_seqno: update.deactivate.then_some(seqno), // when we delete rules, we write a new rule_instance row which has deactivated_seqno set
            })
            .collect_vec();

        let res = diesel::insert_into(rule_instance::table)
            .values(new_rule_instances)
            .get_results::<Self>(conn.conn())?;
        Ok(res)
    }

    #[tracing::instrument("RuleInstance::create", skip_all)]
    pub fn create(
        conn: &mut TxnPgConn,
        obc: &Locked<ObConfiguration>,
        actor: &DbActor,
        name: Option<String>,
        rule_expression: RuleExpression,
        action: RuleAction,
    ) -> DbResult<Self> {
        Self::bulk_edit(
            conn,
            obc,
            actor,
            MultiRuleUpdate {
                expected_rule_set_version: None, // clients using this `create` method aren't yet sending this
                new_rules: vec![NewRule {
                    rule_expression,
                    action,
                    name,
                }],
                updates: vec![],
            },
        )?
        .pop()
        .ok_or(DbError::IncorrectNumberOfRowsUpdated)
    }

    #[tracing::instrument("RuleInstance::bulk_create", skip_all)]
    pub fn bulk_create(
        conn: &mut TxnPgConn,
        obc: &Locked<ObConfiguration>,
        actor: &DbActor,
        new_rules: Vec<NewRule>,
    ) -> DbResult<Vec<Self>> {
        Self::bulk_edit(
            conn,
            obc,
            actor,
            MultiRuleUpdate {
                expected_rule_set_version: None, // currently the only (non test) use of `bulk_create` is when default rules are created for a playbook. We could just probably just safely pass `0` in those cases and drop this option
                new_rules,
                updates: vec![],
            },
        )
    }

    #[tracing::instrument("RuleInstance::update", skip_all)]
    pub fn update(
        conn: &mut TxnPgConn,
        obc: &Locked<ObConfiguration>,
        actor: &DbActor,
        update: RuleInstanceUpdate,
    ) -> DbResult<Self> {
        Self::bulk_edit(
            conn,
            obc,
            actor,
            MultiRuleUpdate {
                expected_rule_set_version: None, // clients using this `update` method aren't yet sending this
                new_rules: vec![],
                updates: vec![update],
            },
        )?
        .pop()
        .ok_or(DbError::IncorrectNumberOfRowsUpdated)
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
    use std::collections::HashSet;

    #[db_test]
    fn test_create(conn: &mut TestPgConn) {
        let t = tests::fixtures::tenant::create(conn);
        let obc = tests::fixtures::ob_configuration::create_with_opts(
            conn,
            &t.id,
            ObConfigurationOpts { ..Default::default() },
        );
        let obc = ObConfiguration::lock(conn, &obc.id).unwrap();

        let expression = RuleExpression(vec![RuleExpressionCondition::RiskSignal {
            field: FRC::DocumentOcrDobDoesNotMatch,
            op: BooleanOperator::Equals,
            value: true,
        }]);
        let action = RuleAction::ManualReview;
        let rule =
            RuleInstance::create(conn, &obc, &DbActor::Footprint, None, expression.clone(), action).unwrap();
        assert_eq!(expression, rule.rule_expression);
        assert_eq!(action, rule.action);
        assert!(rule.deactivated_seqno.is_none());
        assert_eq!(
            1,
            RuleSetVersion::get_active(conn, &obc.id)
                .unwrap()
                .unwrap()
                .version
        );
    }

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

        let rules = RuleInstance::bulk_create(conn, &obc, &DbActor::Footprint, vec![r1, r2, r3]).unwrap();
        assert_eq!(3, rules.len());
        assert_eq!(
            1,
            RuleSetVersion::get_active(conn, &obc.id)
                .unwrap()
                .unwrap()
                .version
        );
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
            &DbActor::Footprint,
            Some("name1".to_owned()),
            tests::fixtures::rule::example_rule_expression(),
            RuleAction::Fail,
        )
        .unwrap();
        assert_eq!(
            1,
            RuleSetVersion::get_active(conn, &obc.id)
                .unwrap()
                .unwrap()
                .version
        );

        let updated_rule = RuleInstance::update(
            conn,
            &obc,
            &DbActor::Footprint,
            RuleInstanceUpdate {
                rule_id: rule.rule_id.clone(),
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
        assert_eq!(
            2,
            RuleSetVersion::get_active(conn, &obc.id)
                .unwrap()
                .unwrap()
                .version
        );
    }

    #[db_test]
    fn test_bulk_edit(conn: &mut TestPgConn) {
        let t = tests::fixtures::tenant::create(conn);
        let obc = tests::fixtures::ob_configuration::create_with_opts(
            conn,
            &t.id,
            ObConfigurationOpts { ..Default::default() },
        );
        let obc = ObConfiguration::lock(conn, &obc.id).unwrap();

        let rules = RuleInstance::bulk_edit(
            conn,
            &obc,
            &DbActor::Footprint,
            MultiRuleUpdate {
                expected_rule_set_version: Some(0),
                new_rules: (0..5)
                    .map(|_| NewRule {
                        rule_expression: tests::fixtures::rule::example_rule_expression(),
                        action: RuleAction::Fail,
                        name: None,
                    })
                    .collect(),
                updates: vec![],
            },
        )
        .unwrap();
        assert_eq!(
            1,
            RuleSetVersion::get_active(conn, &obc.id)
                .unwrap()
                .unwrap()
                .version
        );
        assert_eq!(5, rules.len());
        assert_eq!(
            5,
            RuleInstance::list(conn, &t.id, obc.is_live, &obc.id)
                .unwrap()
                .len()
        );

        // edit 2 rules
        // delete 2 rules
        // add 2 rules
        let edits = RuleInstance::bulk_edit(
            conn,
            &obc,
            &DbActor::Footprint,
            MultiRuleUpdate {
                expected_rule_set_version: Some(1),
                new_rules: (0..2) // create 2 new rules
                    .map(|_| NewRule {
                        rule_expression: tests::fixtures::rule::example_rule_expression(),
                        action: RuleAction::ManualReview,
                        name: None,
                    })
                    .collect(),
                updates: vec![
                    // edit rule0
                    RuleInstanceUpdate::update(
                        rules[0].rule_id.clone(),
                        None,
                        Some(tests::fixtures::rule::example_rule_expression2()),
                        None,
                    ),
                    // edit rule1
                    RuleInstanceUpdate::update(
                        rules[1].rule_id.clone(),
                        None,
                        Some(tests::fixtures::rule::example_rule_expression3()),
                        None,
                    ),
                    //delete rule2
                    RuleInstanceUpdate::delete(rules[2].rule_id.clone()),
                    //delete rule3
                    RuleInstanceUpdate::delete(rules[3].rule_id.clone()),
                ],
            },
        )
        .unwrap();
        assert_eq!(
            2,
            RuleSetVersion::get_active(conn, &obc.id)
                .unwrap()
                .unwrap()
                .version
        );
        assert_eq!(6, edits.len()); // 6 new RuleInstance's are returned (2 additions, 2 edits, 2 deletes)
        assert!(edits
            .iter()
            .map(|e| e.id.clone())
            .collect::<HashSet<_>>()
            .is_disjoint(&rules.iter().map(|e| e.id.clone()).collect::<HashSet<_>>())); // basic sanity check that a new set of RuleInstance's has been written

        let mut edits: HashMap<RuleId, RuleInstance> =
            edits.into_iter().map(|e| (e.rule_id.clone(), e)).collect();
        // rule0 was updated
        assert_eq!(
            tests::fixtures::rule::example_rule_expression2(),
            edits.remove(&rules[0].rule_id).unwrap().rule_expression
        );
        // rule1 was updated
        assert_eq!(
            tests::fixtures::rule::example_rule_expression3(),
            edits.remove(&rules[1].rule_id).unwrap().rule_expression
        );
        // rule2 was deleted
        assert!(edits
            .remove(&rules[2].rule_id)
            .unwrap()
            .deactivated_seqno
            .is_some());

        // rule3 was deleted
        assert!(edits
            .remove(&rules[3].rule_id)
            .unwrap()
            .deactivated_seqno
            .is_some());

        // remaining 2 RuleInstance's should be the 2 new rules we created
        let new_rules = edits.values().collect_vec();
        assert_eq!(2, new_rules.len());
        assert_eq!(RuleAction::ManualReview, new_rules[0].action);
        assert_eq!(RuleAction::ManualReview, new_rules[1].action);

        // list should return 5 rules. we started with 5, deleted 2, and added 2 (and edited 2)
        assert_eq!(
            5,
            RuleInstance::list(conn, &t.id, obc.is_live, &obc.id)
                .unwrap()
                .len()
        );
    }

    #[db_test]
    pub fn test_rule_action_is_backwards_compatible(conn: &mut TestPgConn) {
        let t = fixtures::tenant::create(conn);
        let obc = fixtures::ob_configuration::create(conn, &t.id, true);
        let obc = ObConfiguration::lock(conn, &obc.id).unwrap();

        let rule1 = RuleInstance::create(
            conn,
            &obc,
            &DbActor::Footprint,
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
            &DbActor::Footprint,
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
