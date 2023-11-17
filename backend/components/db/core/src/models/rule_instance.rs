use super::data_lifetime::DataLifetime;
use crate::DbResult;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::{DateTime, Utc};
use db_schema::schema::ob_configuration;
use db_schema::schema::rule_instance;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::DataLifetimeSeqno;
use newtypes::DbActor;
use newtypes::RuleAction;
use newtypes::RuleExpression;
use newtypes::{ObConfigurationId, RuleId, RuleInstanceId, TenantId};
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
    pub is_shadow: bool,
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
}

pub struct NewRule {
    pub rule_expression: RuleExpression,
    pub action: RuleAction,
    pub name: Option<String>,
}

#[derive(Debug, Clone)]
pub struct RuleInstanceUpdate {
    pub name: Option<Option<String>>,
    pub rule_expression: Option<RuleExpression>,
    pub is_shadow: Option<bool>,
}

impl RuleInstance {
    #[tracing::instrument("RuleInstance::create", skip_all)]
    pub fn create(
        conn: &mut PgConn,
        ob_configuration_id: ObConfigurationId,
        actor: DbActor,
        name: Option<String>,
        rule_expression: RuleExpression,
        action: RuleAction,
    ) -> DbResult<Self> {
        let seqno = DataLifetime::get_current_seqno(conn)?;
        let rule_id = format!("rule_{}", Alphanumeric.sample_string(&mut rand::thread_rng(), 22));
        let new_rule = NewRuleInstance {
            created_at: Utc::now(),
            created_seqno: seqno,
            rule_id: rule_id.into(),
            ob_configuration_id,
            actor,
            name,
            rule_expression,
            action,
            is_shadow: true, // all rules start in shadow until explicitly promoted to livemode lets say
        };

        Self::insert(conn, new_rule)
    }

    #[tracing::instrument("RuleInstance::bulk_create", skip_all)]
    pub fn bulk_create(
        conn: &mut TxnPgConn,
        ob_configuration_id: &ObConfigurationId,
        actor: DbActor,
        new_rules: Vec<NewRule>,
    ) -> DbResult<Vec<Self>> {
        let seqno = DataLifetime::get_current_seqno(conn)?;

        let new_rules: Vec<_> = new_rules
            .into_iter()
            .map(|r| {
                let rule_id = format!("rule_{}", Alphanumeric.sample_string(&mut rand::thread_rng(), 22));
                NewRuleInstance {
                    created_at: Utc::now(), //actually nicer to let each rule have a slightly different created_at so we get consistent ordering when we order by created_at. that being said..  not sure what granularity this clock will have and if subsequent rules here will even have a different created_at :thinkies:
                    created_seqno: seqno,
                    rule_id: rule_id.into(),
                    ob_configuration_id: ob_configuration_id.clone(),
                    actor: actor.clone(),
                    name: r.name,
                    rule_expression: r.rule_expression,
                    action: r.action,
                    is_shadow: false,
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
        ob_configuration_id: &ObConfigurationId,
        actor: DbActor,
        rule_id: &RuleId,
        update: RuleInstanceUpdate,
    ) -> DbResult<Self> {
        // If we had 2 concurrent txn's trying to modify the same User-Facing Rule, then the second transaction would hit an error when trying to write the new Rule row below because it would violate the rule_one_active_per_rule_id constraint. Not a big deal and concurrent edits to the same Rule isn't something we need to try hard to gracefully support. If we used a 2 table representation here (ie Rule + RuleVersion), then row locking on Rule while writing new RuleVersion rows would allow both txn's to succeed.
        let current: RuleInstance = rule_instance::table
            .filter(rule_instance::ob_configuration_id.eq(ob_configuration_id))
            .filter(rule_instance::rule_id.eq(rule_id))
            .filter(rule_instance::deactivated_at.is_null())
            .for_no_key_update()
            .get_result(conn.conn())?;

        // TODO: check if no changes are actually being made and error or no-op in that case? Not a huge deal to just write a new row tho
        let now = Utc::now();
        let seqno = DataLifetime::get_current_seqno(conn)?;
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
            .order_by(rule_instance::created_at.asc())
            .get_results(conn)?;
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
    fn test_update(conn: &mut TestPgConn) {
        let t = tests::fixtures::tenant::create(conn);
        let obc = tests::fixtures::ob_configuration::create_with_opts(
            conn,
            &t.id,
            ObConfigurationOpts { ..Default::default() },
        );

        let rule = RuleInstance::create(
            conn,
            obc.id.clone(),
            DbActor::Footprint,
            Some("name1".to_owned()),
            tests::fixtures::rule::example_rule_expression(),
            RuleAction::Fail,
        )
        .unwrap();

        let updated_rule = RuleInstance::update(
            conn,
            &obc.id,
            DbActor::Footprint,
            &rule.rule_id,
            RuleInstanceUpdate {
                name: Some(Some("name2".to_owned())),
                rule_expression: Some(tests::fixtures::rule::example_rule_expression()),
                is_shadow: Some(false),
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
    }
}
