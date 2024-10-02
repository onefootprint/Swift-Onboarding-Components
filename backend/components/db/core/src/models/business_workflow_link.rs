use crate::DbResult;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::business_workflow_link;
use diesel::prelude::*;
use diesel::Queryable;
use newtypes::BoId;
use newtypes::BusinessWorkflowLinkId;
use newtypes::WorkflowId;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = business_workflow_link)]
pub struct BusinessWorkflowLink {
    pub id: BusinessWorkflowLinkId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub business_owner_id: BoId,
    pub business_workflow_id: WorkflowId,
    pub user_workflow_id: WorkflowId,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = business_workflow_link)]
pub struct NewBusinessWorkflowLinkRow<'a> {
    pub business_owner_id: &'a BoId,
    pub business_workflow_id: &'a WorkflowId,
    pub user_workflow_id: &'a WorkflowId,
}

impl BusinessWorkflowLink {
    pub fn create(conn: &mut TxnPgConn, new: NewBusinessWorkflowLinkRow) -> DbResult<Self> {
        let result = diesel::insert_into(business_workflow_link::table)
            .values(new)
            .get_result::<Self>(conn.conn())?;
        Ok(result)
    }
}
