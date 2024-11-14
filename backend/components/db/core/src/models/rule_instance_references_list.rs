use crate::TxnPgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::rule_instance_references_list;
use diesel::prelude::*;
use diesel::Insertable;
use diesel::Queryable;
use newtypes::ListId;
use newtypes::RuleInstanceId;
use newtypes::RuleInstanceReferencesListId;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = rule_instance_references_list)]
/// Junction table to manage the many:many rule_instance:list relationship
/// one rule can reference 0,1,or more List's and a List can be reference by 0,1,or more rule's
pub struct RuleInstanceReferencesList {
    pub id: RuleInstanceReferencesListId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub rule_instance_id: RuleInstanceId,
    pub list_id: ListId,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = rule_instance_references_list)]
pub struct NewRuleInstanceReferencesList {
    pub rule_instance_id: RuleInstanceId,
    pub list_id: ListId,
}

impl RuleInstanceReferencesList {
    #[tracing::instrument("RuleInstanceReferencesList::bulk_create", skip_all)]
    pub fn bulk_create(conn: &mut TxnPgConn, new: Vec<NewRuleInstanceReferencesList>) -> FpResult<Vec<Self>> {
        let res = diesel::insert_into(rule_instance_references_list::table)
            .values(new)
            .get_results::<Self>(conn.conn())?;
        Ok(res)
    }

    #[cfg(test)]
    #[tracing::instrument("RuleInstanceReferencesList::list", skip_all)]
    pub fn list(conn: &mut TxnPgConn, list_id: &ListId) -> FpResult<Vec<Self>> {
        let res = rule_instance_references_list::table
            .filter(rule_instance_references_list::list_id.eq(list_id))
            .get_results(conn.conn())?;
        Ok(res)
    }
}
