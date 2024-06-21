use crate::errors::onboarding::OnboardingError;
use crate::utils::vault_wrapper::Business;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpResult;
use crate::State;
use api_errors::FpError;
use db::models::ob_configuration::ObConfiguration;
use db::models::onboarding_decision::OnboardingDecision;
use db::models::workflow::Workflow;
use itertools::Itertools;
use newtypes::BusinessOwnerKind;
use newtypes::WorkflowId;

pub async fn get_bo_obds(state: &State, biz_wf_id: &WorkflowId) -> FpResult<Vec<OnboardingDecision>> {
    let wfid = biz_wf_id.clone();
    let (wf, sv, bvw, obc) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let (wf, sv) = Workflow::get_all(conn, &wfid)?;
            let bvw = VaultWrapper::<Business>::build_for_tenant(conn, &sv.id)?;
            let (obc, _) = ObConfiguration::get(conn, &wf.id)?;
            Ok((wf, sv, bvw, obc))
        })
        .await?;

    if obc.skip_kyc {
        return Ok(vec![]);
    }

    let dbos = bvw.decrypt_business_owners(state, &sv.tenant_id).await?;
    let dbos_expecting_kyc = dbos
        .into_iter()
        .filter(|bo| {
            // We always KYC BOs from KycedBeneficialOwners.
            // And otherwise, we always KYC the primary BO.
            bo.from_kyced_beneficial_owners
                || (bo.kind == BusinessOwnerKind::Primary && bo.linked_bo.is_some())
        })
        .collect_vec();

    if dbos_expecting_kyc.iter().any(|bo| bo.scoped_user.is_none()) {
        // A user whose KYC we need hasn't even started onboarding yet
        return Err(OnboardingError::MissingBoOnboarding.into());
    }
    let sv_ids = dbos_expecting_kyc
        .into_iter()
        .flat_map(|bo| bo.scoped_user)
        .map(|sv| sv.id)
        .collect();

    let wfs = state
        .db_pool
        .db_query(move |conn| Workflow::get_with_decisions(conn, sv_ids, &wf.ob_configuration_id))
        .await?;
    let wfs_without_decision: Vec<_> = wfs
        .iter()
        .filter(|(_, obd)| obd.is_none())
        .map(|(wf, _)| wf.id.clone())
        .collect();
    if !wfs_without_decision.is_empty() {
        return Err(FpError::from(OnboardingError::MissingBoOnboardingDecision(
            wfs_without_decision.into(),
        )));
    }
    let obds = wfs.into_iter().flat_map(|(_, obd)| obd).collect();

    Ok(obds)
}
