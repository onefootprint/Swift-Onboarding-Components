use crate::utils::vault_wrapper::Business;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpResult;
use crate::State;
use api_errors::AssertionError;
use api_errors::FpError;
use api_errors::ValidationError;
use db::models::business_workflow_link::BusinessWorkflowLink;
use db::models::ob_configuration::ObConfiguration;
use db::models::onboarding_decision::OnboardingDecision;
use db::models::workflow::Workflow;
use itertools::Itertools;
use newtypes::BusinessOwnerKind;
use newtypes::OnboardingStatus;
use newtypes::WorkflowId;

#[derive(Debug, derive_more::IsVariant)]
pub enum BoOnboardingResult {
    Ready(Vec<(Workflow, OnboardingDecision)>),
    NotReady(FpError),
}

pub async fn get_bo_obds(state: &State, biz_wf_id: &WorkflowId) -> FpResult<BoOnboardingResult> {
    let wfid = biz_wf_id.clone();
    let (mut user_decisions, bvw, obc) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let biz_wf = Workflow::get(conn, &wfid)?;
            let user_decisions = BusinessWorkflowLink::get_latest_user_decisions(conn, &biz_wf.id)?;
            let bvw = VaultWrapper::<Business>::build_for_tenant(conn, &biz_wf.scoped_vault_id)?;
            let (obc, _) = ObConfiguration::get(conn, &biz_wf.id)?;
            Ok((user_decisions, bvw, obc))
        })
        .await?;

    if obc.verification_checks().skip_kyc() {
        return Ok(BoOnboardingResult::Ready(vec![]));
    }

    let dbos = bvw.decrypt_business_owners(state).await?;
    let dbos_expecting_kyc = dbos
        .iter()
        .filter(|bo| {
            // We always KYC BOs from KycedBeneficialOwners.
            // And otherwise, we always KYC the primary BO if created via bifrost.
            bo.from_kyced_beneficial_owners
                || (bo.kind == BusinessOwnerKind::Primary && bo.linked_bo.is_some())
        })
        .collect_vec();

    let result = dbos_expecting_kyc
        .iter()
        .map(|bo| -> Result<_, &'static str> {
            let bo = (bo.linked_bo.as_ref()).ok_or("Beneficial owner doesn't have a linked user")?;
            let (wf, obd) =
                (user_decisions.remove(&bo.id)).ok_or("Beneficial owner hasn't started onboarding")?;
            let obd = obd.ok_or("Beneficial owner hasn't finished onboarding")?;
            if !OnboardingStatus::from(obd.status).is_terminal() {
                // This is only for verrrrry legacy OBDs that could have an OBD in status `step_up`
                return Err("Beneficial owner's onboarding isn't complete");
            }
            Ok((wf, obd))
        })
        .collect::<Result<Vec<_>, _>>();
    let user_decisions = match result {
        Ok(user_decisions) => user_decisions,
        Err(err) => return Ok(BoOnboardingResult::NotReady(ValidationError(err).into())),
    };
    if user_decisions.len() != dbos_expecting_kyc.len() {
        return AssertionError("Number of user decisions does not match number of BOs").into();
    }
    Ok(BoOnboardingResult::Ready(user_decisions))
}
