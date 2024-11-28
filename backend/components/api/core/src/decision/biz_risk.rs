use crate::utils::vault_wrapper::Business;
use crate::utils::vault_wrapper::BusinessOwnerInfo;
use crate::utils::vault_wrapper::TenantVw;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpResult;
use crate::State;
use api_errors::BadRequest;
use api_errors::BadRequestInto;
use db::models::business_workflow_link::BusinessWorkflowLink;
use db::models::ob_configuration::ObConfiguration;
use db::models::onboarding_decision::OnboardingDecision;
use db::models::workflow::Workflow;
use db::PgConn;
use itertools::Itertools;
use newtypes::OnboardingStatus;
use newtypes::WorkflowId;

#[derive(derive_more::Deref)]
pub struct BoWithKycInfo(
    pub Option<(Workflow, Option<OnboardingDecision>)>,
    #[deref] pub BusinessOwnerInfo,
);

impl BoWithKycInfo {
    /// Unpacks the BoWithDecision into its underlying Workflow and OnboardingDecision, if there is
    /// a terminal OnboardingDecision for the BO.
    /// If not, returns an error with context on what is missing.
    pub fn try_get_ready_result(&self) -> FpResult<(&Workflow, &OnboardingDecision, &BusinessOwnerInfo)> {
        let Self(wf_obd, bo) = self;
        let (wf, obd) = wf_obd
            .as_ref()
            .ok_or(BadRequest("Beneficial owner hasn't started onboarding"))?;
        let obd = obd
            .as_ref()
            .ok_or(BadRequest("Beneficial owner hasn't finished onboarding"))?;
        if !OnboardingStatus::from(obd.status).is_terminal() {
            // This is only for verrrrry legacy OBDs that could have an OBD in status `step_up`
            return BadRequestInto("Beneficial owner's onboarding isn't complete");
        }
        Ok((wf, obd, bo))
    }

    pub fn has_kyc_result(&self) -> bool {
        self.try_get_ready_result().is_ok()
    }
}

#[derive(Default)]
pub struct KybBoFeatures {
    /// The decrypted BOs along with their KYC results. Empty if the playbook does not require KYC.
    pub bos: Vec<BoWithKycInfo>,
}

impl KybBoFeatures {
    pub async fn build(
        state: &State,
        biz_wf_id: &WorkflowId,
    ) -> FpResult<(Self, TenantVw<Business>, Workflow)> {
        let biz_wf_id = biz_wf_id.clone();
        let (bvw, biz_wf) = state
            .db_query(move |conn| {
                let biz_wf = Workflow::get(conn, &biz_wf_id)?;
                let bvw = VaultWrapper::<Business>::build_for_tenant(conn, &biz_wf.scoped_vault_id)?;
                Ok((bvw, biz_wf))
            })
            .await?;

        let dbos = bvw.decrypt_business_owners(state).await?;
        let (res, biz_wf) = state
            .db_query(move |conn| Self::build_with_bos(conn, dbos, &biz_wf.id))
            .await?;
        Ok((res, bvw, biz_wf))
    }

    pub fn build_with_bos(
        conn: &mut PgConn,
        dbos: Vec<BusinessOwnerInfo>,
        biz_wf_id: &WorkflowId,
    ) -> FpResult<(Self, Workflow)> {
        let biz_wf = Workflow::get(conn, biz_wf_id)?;
        let mut user_decisions = BusinessWorkflowLink::get_latest_user_decisions(conn, &biz_wf.id, true)?;
        let (_, obc) = ObConfiguration::get(conn, &biz_wf.id)?;

        let bos = if obc.verification_checks().skip_kyc() {
            vec![]
        } else {
            dbos.into_iter()
                .map(|bo| BoWithKycInfo(user_decisions.remove(&bo.bo.id), bo))
                .collect_vec()
        };

        Ok((Self { bos }, biz_wf))
    }

    /// Unpacks all BOs into their underlying Workflows and OnboardingDecisions.
    /// If any BO is missing a terminal OnboardingDecision, returns an error with context.
    pub fn try_get_ready_results(
        &self,
    ) -> FpResult<Vec<(&Workflow, &OnboardingDecision, &BusinessOwnerInfo)>> {
        self.bos.iter().map(|bo| bo.try_get_ready_result()).collect()
    }

    pub fn all_bos_have_kyc_results(&self) -> bool {
        self.try_get_ready_results().is_ok()
    }
}
