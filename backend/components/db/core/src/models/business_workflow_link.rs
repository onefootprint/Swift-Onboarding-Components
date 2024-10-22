use super::business_owner::BusinessOwner;
use super::onboarding_decision::OnboardingDecision;
use super::workflow::Workflow;
use crate::DbResult;
use crate::PgConn;
use crate::TxnPgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::business_owner;
use db_schema::schema::business_workflow_link;
use db_schema::schema::workflow;
use diesel::prelude::*;
use diesel::Queryable;
use itertools::Itertools;
use newtypes::BoId;
use newtypes::BusinessWorkflowLinkId;
use newtypes::BusinessWorkflowLinkSource;
use newtypes::DbActor;
use newtypes::ObConfigurationId;
use newtypes::VaultId;
use newtypes::WorkflowId;
use std::collections::HashMap;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = business_workflow_link)]
pub struct BusinessWorkflowLink {
    pub id: BusinessWorkflowLinkId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub business_owner_id: BoId,
    pub business_workflow_id: WorkflowId,
    pub user_workflow_id: WorkflowId,
    pub source: BusinessWorkflowLinkSource,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = business_workflow_link)]
pub struct NewBusinessWorkflowLinkRow<'a> {
    pub business_owner_id: &'a BoId,
    pub business_workflow_id: &'a WorkflowId,
    pub user_workflow_id: &'a WorkflowId,
    pub source: BusinessWorkflowLinkSource,
}

impl BusinessWorkflowLink {
    #[tracing::instrument("BusinessWorkflowLink::bulk_create", skip_all)]
    pub fn bulk_create(conn: &mut TxnPgConn, new: Vec<NewBusinessWorkflowLinkRow>) -> DbResult<Vec<Self>> {
        let results = diesel::insert_into(business_workflow_link::table)
            .values(new)
            .get_results::<Self>(conn.conn())?;
        Ok(results)
    }

    #[tracing::instrument("BusinessWorkflowLink::get_latest_user_decisions", skip_all)]
    /// Returns the user workflows and decisions that are constituent of the business workflow's
    /// decision.
    pub fn get_latest_user_decisions(
        conn: &mut PgConn,
        biz_wf_id: &WorkflowId,
    ) -> DbResult<HashMap<BoId, (Workflow, Option<OnboardingDecision>)>> {
        use db_schema::schema::onboarding_decision;
        use db_schema::schema::workflow;
        let res = business_workflow_link::table
            .filter(business_workflow_link::business_workflow_id.eq(biz_wf_id))
            .inner_join(workflow::table.on(workflow::id.eq(business_workflow_link::user_workflow_id)))
            .get_results::<(Self, Workflow)>(conn)?;
        let wf_ids = res.iter().map(|(_, wf)| &wf.id).collect_vec();

        // NOTE: we retrieve the Footprint decision for a workflow even if it's deactivated (by a manual
        // review) since we only use Footprint decisions on users to determine the KYB status.
        // There could also be multiple Footprint decisions per workflow in the step-up case.
        let decisions = onboarding_decision::table
            .filter(onboarding_decision::workflow_id.eq_any(wf_ids))
            .filter(onboarding_decision::actor.eq(DbActor::Footprint))
            .get_results::<OnboardingDecision>(conn)?;
        let mut decisions = decisions.into_iter().into_group_map_by(|d| d.workflow_id.clone());
        let res = res
            .into_iter()
            .map(|(bo, wf)| {
                let decisions = decisions.remove(&wf.id).unwrap_or_default();
                let latest_decision = decisions.into_iter().max_by_key(|d| d.created_at);
                (bo.business_owner_id, (wf, latest_decision))
            })
            .collect();

        Ok(res)
    }

    /// Returns the latest BWFL per business owner for (1) workflows onto the provided playbook for
    /// (2) the business owners of the provided business vault.
    #[tracing::instrument("BusinessWorkflowLink::get_latest_complete_per_bo", skip_all)]
    pub fn get_latest_complete_per_bo(
        conn: &mut PgConn,
        bv_id: &VaultId,
        obc_id: &ObConfigurationId,
    ) -> DbResult<Vec<(BusinessOwner, Workflow)>> {
        let results = business_workflow_link::table
            .inner_join(business_owner::table)
            .inner_join(workflow::table.on(workflow::id.eq(business_workflow_link::user_workflow_id)))
            .filter(business_owner::business_vault_id.eq(bv_id))
            .filter(workflow::ob_configuration_id.eq(obc_id))
            .filter(workflow::completed_at.is_not_null())
            .order((business_owner::id, workflow::created_at.desc()))
            .distinct_on(business_owner::id)
            .select((business_owner::all_columns, workflow::all_columns))
            .get_results::<(BusinessOwner, Workflow)>(conn)?;
        Ok(results)
    }
}
