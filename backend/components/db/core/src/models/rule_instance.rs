use super::list::List;
use super::ob_configuration::ObConfiguration;
use super::rule_instance_references_list::{
    NewRuleInstanceReferencesList,
    RuleInstanceReferencesList,
};
use super::rule_set_version::RuleSetVersion;
use crate::{
    DbError,
    DbResult,
    PgConn,
    TxnPgConn,
};
use chrono::{
    DateTime,
    Utc,
};
use db_schema::schema::{
    ob_configuration,
    rule_instance,
    rule_instance_references_list,
};
use diesel::prelude::*;
use diesel::{
    Insertable,
    Queryable,
};
use itertools::Itertools;
use newtypes::output::Csv;
use newtypes::{
    DataLifetimeSeqno,
    DbActor,
    ListId,
    Locked,
    ObConfigurationId,
    RuleAction,
    RuleExpression,
    RuleId,
    RuleInstanceId,
    RuleInstanceKind,
    TenantId,
};
use std::collections::{
    HashMap,
    HashSet,
};
use strum::IntoEnumIterator;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = rule_instance)]
// We use an "immutable changelog" approach here. So what corresponds to 1 User-Facing Rule is
// actually represented under the hood by N RuleInstance rows in Postgres. When a User modifies a
// rule (changes rule_expression/is_shadow/name), we find the latest/active RuleInstance row in PG
// for that User-Facing Rule, we mark it as deactived, and clone a new version of it with the edit
// made. A single User-Facing Rule has a single `rule_id` (we use this as a stable identifier,
// because `name` can be changed). So all the N RuleInstance rows in PG for that User-Facing Rule
// will have the same `rule_id` (even though each would have a unique `id` which remains a true
// row-unique identifier in PG)
pub struct RuleInstance {
    pub id: RuleInstanceId,
    pub created_at: DateTime<Utc>,
    pub created_seqno: DataLifetimeSeqno,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub deactivated_seqno: Option<DataLifetimeSeqno>,
    pub rule_id: RuleId,
    pub ob_configuration_id: ObConfigurationId, /* later to be replaced by rule_set_id which will in turn
                                                 * have a pointer to OBC */
    pub actor: DbActor,
    pub name: Option<String>, // not used yet
    pub rule_expression: RuleExpression,
    pub action: RuleAction,
    pub is_shadow: bool, // not yet used
    pub kind: RuleInstanceKind,
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
    pub kind: RuleInstanceKind,
}

#[derive(Debug, Clone)]
pub struct NewRule {
    pub rule_expression: RuleExpression,
    pub action: RuleAction,
    pub name: Option<String>,
    pub kind: RuleInstanceKind,
    pub is_shadow: bool,
}

#[derive(Debug, Clone)]
pub struct RuleInstanceUpdate {
    rule_id: RuleId,
    name: Option<Option<String>>, // TODO: remove, we don't actually use this currently
    rule_expression: Option<RuleExpression>,
    is_shadow: Option<bool>, // TODO: remove, we don't actually use this currently
    deactivate: bool,
    kind: Option<RuleInstanceKind>,
}

impl RuleInstanceUpdate {
    pub fn update(
        rule_id: RuleId,
        name: Option<Option<String>>,
        rule_expression: Option<RuleExpression>,
        is_shadow: Option<bool>,
        kind: Option<RuleInstanceKind>,
    ) -> Self {
        Self {
            rule_id,
            name,
            rule_expression,
            is_shadow,
            deactivate: false,
            kind,
        }
    }

    pub fn delete(rule_id: RuleId) -> Self {
        Self {
            rule_id,
            name: None,
            rule_expression: None,
            is_shadow: None,
            deactivate: true,
            kind: None,
        }
    }
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

        let list_ids = new_rules
            .iter()
            .map(|nr| nr.rule_expression.clone())
            .chain(updates.iter().filter_map(|u| u.rule_expression.clone()))
            .flat_map(|re| re.0)
            .filter_map(|re| re.list_id().cloned())
            .collect_vec();
        let lists = List::bulk_get(conn, &obc.tenant_id, obc.is_live, &list_ids)?;
        let deactivated_lists = lists
            .iter()
            .filter_map(|(id, list)| list.deactivated_seqno.map(|_| id.clone()))
            .collect_vec();
        if !deactivated_lists.is_empty() {
            return Err(DbError::ValidationError(format!(
                "Cannot use deactivated lists in rules: {}",
                Csv::from(deactivated_lists)
            )));
        }

        let unknown_list_ids = list_ids
            .into_iter()
            .filter(|l| !lists.contains_key(l))
            .collect_vec();
        if !unknown_list_ids.is_empty() {
            return Err(DbError::ValidationError(format!(
                "Unknown list_ids: {}",
                Csv::from(unknown_list_ids)
            )));
        }

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
        let new_rule_instances: Vec<_> = new_rules
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
                kind: r.kind,
            })
            .collect();

        Self::insert_rule_instances(conn, new_rule_instances)
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
                deactivated_seqno: update.deactivate.then_some(seqno), /* when we delete rules, we write a
                                                                        * new rule_instance row which has
                                                                        * deactivated_seqno set, */
                kind: update.kind.unwrap_or(existing.kind),
            })
            .collect_vec();

        Self::insert_rule_instances(conn, new_rule_instances)
    }

    fn insert_rule_instances(
        conn: &mut TxnPgConn,
        new_rule_instances: Vec<NewRuleInstance<'_>>,
    ) -> DbResult<Vec<RuleInstance>> {
        let rule_instances = diesel::insert_into(rule_instance::table)
            .values(new_rule_instances)
            .get_results::<Self>(conn.conn())?;

        let new_list_refs: Vec<_> = rule_instances
            .iter()
            .flat_map(|ri| {
                ri.rule_expression
                    .0
                    .iter()
                    .flat_map(|c| c.list_id().map(|lid| (ri.id.clone(), lid)))
            })
            .unique()
            .map(|(rid, lid)| NewRuleInstanceReferencesList {
                rule_instance_id: rid,
                list_id: lid.clone(),
            })
            .collect();

        if !new_list_refs.is_empty() {
            RuleInstanceReferencesList::bulk_create(conn, new_list_refs)?;
        }
        Ok(rule_instances)
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
                expected_rule_set_version: None, /* currently the only (non test) use of `bulk_create` is
                                                  * when default rules are created for a playbook. We could
                                                  * just probably just safely pass `0` in those cases and
                                                  * drop this option */
                new_rules,
                updates: vec![],
            },
        )
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
        include_rules: IncludeRules,
    ) -> DbResult<Vec<Self>> {
        let kinds = match include_rules {
            IncludeRules::All => RuleInstanceKind::iter().collect(),
            IncludeRules::Kind(k) => vec![k, RuleInstanceKind::Any],
        };

        let res = rule_instance::table
            .inner_join(ob_configuration::table)
            .filter(ob_configuration::tenant_id.eq(tenant_id))
            .filter(ob_configuration::is_live.eq(is_live))
            .filter(ob_configuration::id.eq(ob_config_id))
            .filter(rule_instance::kind.eq_any(kinds))
            .filter(rule_instance::deactivated_at.is_null())
            .select(rule_instance::all_columns)
            .order_by((rule_instance::created_at.asc(), rule_instance::id))
            .get_results(conn)?;
        Ok(res)
    }

    // Returns (Obc, Vec<RuleInstance>) for any (active) RuleInstance that contains a condition that
    // uses the input list_id
    #[tracing::instrument("Rule::list_using_list", skip_all)]
    pub fn list_using_list(
        conn: &mut PgConn,
        list_id: &ListId,
    ) -> DbResult<Vec<(ObConfiguration, Vec<Self>)>> {
        let rules: Vec<(ObConfigurationId, RuleInstance)> = rule_instance_references_list::table
            .inner_join(rule_instance::table)
            .filter(rule_instance_references_list::list_id.eq(list_id))
            .filter(rule_instance::deactivated_at.is_null())
            .select((rule_instance::ob_configuration_id, rule_instance::all_columns))
            .order_by((
                rule_instance::ob_configuration_id,
                rule_instance::created_at.desc(),
                rule_instance::id,
            ))
            .limit(300)
            .get_results(conn)?;

        let mut obcs = ObConfiguration::get_bulk(conn, rules.iter().map(|(obc, _)| obc.clone()).collect())?;
        let res = rules
            .into_iter()
            .into_group_map()
            .into_iter()
            .map(|(obc_id, rules)| {
                obcs.remove(&obc_id)
                    .ok_or(DbError::RelatedObjectNotFound)
                    .map(|o| (o, rules))
            })
            .collect::<Result<Vec<_>, _>>()?
            .into_iter()
            .sorted_by_key(|(obc, _)| -obc.created_at.timestamp_millis())
            .collect();

        Ok(res)
    }

    // takes in a list of list_id's and returns those which are used in at least 1 (active) rule in 1
    // playbook
    #[tracing::instrument("Rule::get_is_used_in_some_playbook", skip_all)]
    pub fn get_is_used_in_some_playbook(conn: &mut PgConn, list_ids: &[ListId]) -> DbResult<HashSet<ListId>> {
        let res = rule_instance_references_list::table
            .inner_join(rule_instance::table)
            .filter(rule_instance_references_list::list_id.eq_any(list_ids))
            .filter(rule_instance::deactivated_at.is_null())
            .select(rule_instance_references_list::list_id)
            .distinct()
            .get_results(conn)?
            .into_iter()
            .collect();
        Ok(res)
    }
}

#[derive(Clone, Copy)]
pub enum IncludeRules {
    All,
    Kind(RuleInstanceKind),
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::rule_set_version::RuleSetVersion;
    use crate::tests::prelude::*;
    use fixtures::ob_configuration::ObConfigurationOpts;
    use macros::db_test;
    use newtypes::{
        BooleanOperator,
        DataIdentifier as DI,
        FootprintReasonCode as FRC,
        IdentityDataKind as IDK,
        IsIn,
        RuleExpressionCondition,
        RuleExpressionCondition as REC,
        StepUpKind,
        VaultOperation,
    };
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
        let rule = NewRule {
            name: None,
            rule_expression: expression.clone(),
            action,
            kind: RuleInstanceKind::Person,
            is_shadow: false,
        };
        let rule = RuleInstance::bulk_create(conn, &obc, &DbActor::Footprint, vec![rule])
            .unwrap()
            .pop()
            .unwrap();
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
            kind: RuleInstanceKind::Person,
            is_shadow: false,
        };
        let r2 = NewRule {
            rule_expression: RuleExpression(vec![RuleExpressionCondition::RiskSignal {
                field: FRC::SubjectDeceased,
                op: BooleanOperator::Equals,
                value: true,
            }]),
            action: RuleAction::Fail,
            name: None,
            kind: RuleInstanceKind::Person,
            is_shadow: false,
        };
        let r3 = NewRule {
            rule_expression: RuleExpression(vec![RuleExpressionCondition::RiskSignal {
                field: FRC::DeviceHighRisk,
                op: BooleanOperator::Equals,
                value: true,
            }]),
            action: RuleAction::Fail,
            name: None,
            kind: RuleInstanceKind::Person,
            is_shadow: false,
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
    fn test_rule_instance_references_list(conn: &mut TestPgConn) {
        let t = tests::fixtures::tenant::create(conn);
        let obc = tests::fixtures::ob_configuration::create_with_opts(
            conn,
            &t.id,
            ObConfigurationOpts { ..Default::default() },
        );
        let obc = ObConfiguration::lock(conn, &obc.id).unwrap();
        let list1 = tests::fixtures::list::create(conn, &t.id, obc.is_live);
        let list2 = tests::fixtures::list::create(conn, &t.id, obc.is_live);

        // r1 references both list1 and list2
        let r1 = NewRule {
            rule_expression: RuleExpression(vec![
                REC::VaultData(VaultOperation::IsIn {
                    field: DI::Id(IDK::Ssn9),
                    op: IsIn::IsIn,
                    value: list1.id.clone(),
                }),
                REC::VaultData(VaultOperation::IsIn {
                    field: DI::Id(IDK::Ssn9),
                    op: IsIn::IsIn,
                    value: list2.id.clone(),
                }),
            ]),
            action: RuleAction::ManualReview,
            name: None,
            kind: RuleInstanceKind::Person,
            is_shadow: false,
        };
        // r2 references list2
        let r2 = NewRule {
            rule_expression: RuleExpression(vec![
                REC::VaultData(VaultOperation::IsIn {
                    field: DI::Id(IDK::Ssn9),
                    op: IsIn::IsIn,
                    value: list2.id.clone(),
                }),
                REC::VaultData(VaultOperation::IsIn {
                    // contrived, but test that even if a single rule references a list multiple times we
                    // still only create 1 junction row
                    field: DI::Id(IDK::Ssn4),
                    op: IsIn::IsIn,
                    value: list2.id.clone(),
                }),
            ]),
            action: RuleAction::Fail,
            name: None,
            kind: RuleInstanceKind::Person,
            is_shadow: false,
        };
        // r3 references no list
        let r3 = NewRule {
            rule_expression: RuleExpression(vec![RuleExpressionCondition::RiskSignal {
                field: FRC::DeviceHighRisk,
                op: BooleanOperator::Equals,
                value: true,
            }]),
            action: RuleAction::Fail,
            name: None,
            kind: RuleInstanceKind::Person,
            is_shadow: false,
        };

        RuleInstance::bulk_create(conn, &obc, &DbActor::Footprint, vec![r1, r2, r3]).unwrap();

        assert_eq!(
            1,
            RuleInstanceReferencesList::list(conn, &list1.id).unwrap().len()
        );
        assert_eq!(
            2,
            RuleInstanceReferencesList::list(conn, &list2.id).unwrap().len()
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

        let rule = NewRule {
            name: Some("name1".to_owned()),
            rule_expression: tests::fixtures::rule::example_rule_expression(),
            action: RuleAction::Fail,
            kind: RuleInstanceKind::Person,
            is_shadow: false,
        };
        let rule = RuleInstance::bulk_create(conn, &obc, &DbActor::Footprint, vec![rule])
            .unwrap()
            .pop()
            .unwrap();
        assert_eq!(
            1,
            RuleSetVersion::get_active(conn, &obc.id)
                .unwrap()
                .unwrap()
                .version
        );

        let update = RuleInstanceUpdate {
            rule_id: rule.rule_id.clone(),
            name: Some(Some("name2".to_owned())),
            rule_expression: Some(tests::fixtures::rule::example_rule_expression()),
            is_shadow: Some(false),
            deactivate: false,
            kind: None,
        };
        let updated_rule = RuleInstance::bulk_edit(
            conn,
            &obc,
            &DbActor::Footprint,
            MultiRuleUpdate {
                expected_rule_set_version: None, // clients using this `update` method aren't yet sending this
                new_rules: vec![],
                updates: vec![update],
            },
        )
        .unwrap()
        .pop()
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
                        kind: RuleInstanceKind::Person,
                        is_shadow: false,
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
            RuleInstance::list(conn, &t.id, obc.is_live, &obc.id, IncludeRules::All)
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
                        kind: RuleInstanceKind::Person,
                        is_shadow: false,
                    })
                    .collect(),
                updates: vec![
                    // edit rule0
                    RuleInstanceUpdate::update(
                        rules[0].rule_id.clone(),
                        None,
                        Some(tests::fixtures::rule::example_rule_expression2()),
                        None,
                        None,
                    ),
                    // edit rule1
                    RuleInstanceUpdate::update(
                        rules[1].rule_id.clone(),
                        None,
                        Some(tests::fixtures::rule::example_rule_expression3()),
                        None,
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
            RuleInstance::list(conn, &t.id, obc.is_live, &obc.id, IncludeRules::All)
                .unwrap()
                .len()
        );
    }

    #[db_test]
    pub fn test_rule_action_is_backwards_compatible(conn: &mut TestPgConn) {
        let t = fixtures::tenant::create(conn);
        let obc = fixtures::ob_configuration::create(conn, &t.id, true);
        let obc = ObConfiguration::lock(conn, &obc.id).unwrap();

        let rule1 = NewRule {
            name: Some("name1".to_owned()),
            rule_expression: tests::fixtures::rule::example_rule_expression(),
            action: RuleAction::StepUp(StepUpKind::Identity),
            kind: RuleInstanceKind::Person,
            is_shadow: false,
        };
        let rule1 = RuleInstance::bulk_create(conn, &obc, &DbActor::Footprint, vec![rule1])
            .unwrap()
            .pop()
            .unwrap();

        let reloaded_rule1 = RuleInstance::get(conn, &rule1.rule_id).unwrap();
        assert_eq!(reloaded_rule1.action, RuleAction::StepUp(StepUpKind::Identity));

        let rule2 = NewRule {
            name: Some("name1".to_owned()),
            rule_expression: tests::fixtures::rule::example_rule_expression(),
            action: RuleAction::StepUp(StepUpKind::IdentityProofOfSsnProofOfAddress),
            kind: RuleInstanceKind::Person,
            is_shadow: false,
        };
        let rule2 = RuleInstance::bulk_create(conn, &obc, &DbActor::Footprint, vec![rule2])
            .unwrap()
            .pop()
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
