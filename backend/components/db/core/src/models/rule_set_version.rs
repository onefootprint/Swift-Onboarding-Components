use super::{data_lifetime::DataLifetime, ob_configuration::ObConfiguration};
use crate::{DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::rule_set;
use diesel::{prelude::*, Insertable, Queryable};
use newtypes::{DataLifetimeSeqno, DbActor, Locked, ObConfigurationId, RuleSetVersionId};

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = rule_set)]
/// A marker for a particular edit/group of edit's done to a Playbook's rules.
/// A new Playbook starts with a default set of rules and an initial RuleSetVersion with version=1
/// When any edit(s) are made to rules (edit existing rule, delete a rule, add a new rule or a bulk combination of those done at once), the latest
/// RuleSetVersion is marked as deactivated and a new row is written with version+1
/// This enables a few things:
///  - We can use this table to easily query for different version of rules, and join in what the rules looked like at those rule_set.created_seqno (by cross referencing with rule_instance.created_seqno + rule_instance.deactivated_seqno) which is a likely feature we will expose to Tenant soon (and in the meantime is useful for us for debugging)
///  - For multi-rule editing, we can use this to mitigate concurrent rule edits which can be dangerous. A client would hold the current latest rule_set.version and send this up with the bulk rule edits it is making. We can then check if a newer rule_set.version exists, which would indicate that concurrenet edit(s) have occured since the client last retrieved the rules and we can error or perhaps in the future provide a way for the user to merge conflicting edits.
pub struct RuleSetVersion {
    pub id: RuleSetVersionId,
    pub created_at: DateTime<Utc>,
    pub created_seqno: DataLifetimeSeqno,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub deactivated_seqno: Option<DataLifetimeSeqno>, // when this RSV was replaced with a new RSV (eg version=2 being replaced with version=3). 1 active per OBC
    pub version: i32,
    pub ob_configuration_id: ObConfigurationId,
    pub actor: DbActor,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = rule_set)]
pub struct NewRuleSetVersion {
    created_at: DateTime<Utc>,
    created_seqno: DataLifetimeSeqno,
    version: i32,
    ob_configuration_id: ObConfigurationId,
    actor: DbActor,
}

impl RuleSetVersion {
    #[tracing::instrument("RuleSetVersion::create", skip_all)]
    pub fn create(conn: &mut TxnPgConn, obc: &Locked<ObConfiguration>, actor: DbActor) -> DbResult<Self> {
        let seqno = DataLifetime::get_next_seqno(conn)?; // may need to pass in depending how we integrate with RuleInstance::update and whatever new bulk update path
        let now = Utc::now();

        let current: Option<RuleSetVersion> = diesel::update(rule_set::table)
            .filter(rule_set::ob_configuration_id.eq(&obc.id))
            .filter(rule_set::deactivated_seqno.is_null())
            .set((
                rule_set::deactivated_at.eq(now),
                rule_set::deactivated_seqno.eq(seqno),
            ))
            .get_result(conn.conn())
            .optional()?;

        let new_rsv = NewRuleSetVersion {
            created_at: now,
            created_seqno: seqno,
            version: current.map(|c| c.version + 1).unwrap_or(1), // if no RSV exists already, we are creating the very first one which is version=1 (ie this is the first one being created during playbook creation of default rules)
            ob_configuration_id: obc.id.clone(),
            actor,
        };

        let res = diesel::insert_into(rule_set::table)
            .values(new_rsv)
            .get_result(conn.conn())?;
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
        let obc = ObConfiguration::lock(conn, &obc.id).unwrap();

        let rsv1 = RuleSetVersion::create(conn, &obc, DbActor::Footprint).unwrap();
        assert_eq!(1, rsv1.version);
        assert!(rsv1.deactivated_seqno.is_none());

        let rsv2 = RuleSetVersion::create(conn, &obc, DbActor::Footprint).unwrap();
        assert_eq!(2, rsv2.version);
        assert!(rsv2.deactivated_seqno.is_none());

        // reload rsv1 and confirm it is deactivated
        let rsv1: RuleSetVersion = rule_set::table
            .filter(rule_set::id.eq(rsv1.id))
            .get_result(conn.conn())
            .unwrap();
        assert_eq!(1, rsv1.version);
        assert!(rsv1.deactivated_at.is_some());
        assert!(rsv1.deactivated_seqno.is_some());
    }
}
