use db::{
    models::{onboarding_decision::OnboardingDecision, workflow::Workflow},
    DbPool,
};
use newtypes::WorkflowId;

use crate::{
    enclave_client::EnclaveClient,
    errors::{onboarding::OnboardingError, ApiResult},
    utils::vault_wrapper::{Business, DecryptedBusinessOwners, VaultWrapper},
    ApiError,
};

pub async fn get_bo_obds(
    db_pool: &DbPool,
    enclave_client: &EnclaveClient,
    biz_wf_id: &WorkflowId,
) -> Result<Vec<OnboardingDecision>, ApiError> {
    let wfid = biz_wf_id.clone();
    let (wf, sv, bvw) = db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let (wf, sv) = Workflow::get_all(conn, &wfid)?;
            let bvw = VaultWrapper::<Business>::build_for_tenant(conn, &sv.id)?;
            Ok((wf, sv, bvw))
        })
        .await?;

    let dbo = bvw
        .decrypt_business_owners(db_pool, enclave_client, &sv.tenant_id)
        .await?;

    let sv_ids = match dbo {
        DecryptedBusinessOwners::NoVaultedOrLinkedBos | DecryptedBusinessOwners::NoVaultedBos { .. } => {
            vec![]
        }
        DecryptedBusinessOwners::SingleKyc {
            primary_bo: _,
            primary_bo_vault,
            primary_bo_data: _,
            secondary_bos: _,
        } => vec![primary_bo_vault.0.id],
        DecryptedBusinessOwners::MultiKyc {
            primary_bo: _,
            primary_bo_vault,
            primary_bo_data: _,
            secondary_bos,
        } => {
            let mut v = vec![primary_bo_vault.0.id];
            let secondary_bo_wfs: Vec<_> = secondary_bos
                .into_iter()
                .map(|b| {
                    if let Some((sv, _)) = b.2 {
                        Ok(sv.id)
                    } else {
                        Err(ApiError::from(OnboardingError::MissingBoOnboarding))
                    }
                })
                .collect::<ApiResult<Vec<_>>>()?;
            v.extend(secondary_bo_wfs);
            v
        }
    };

    let obc_id = wf.ob_configuration_id.ok_or(OnboardingError::NoObcForWorkflow)?;
    let wfs = db_pool
        .db_query(move |conn| Workflow::get_with_decisions(conn, sv_ids, &obc_id))
        .await?;
    let wfs_without_decision: Vec<_> = wfs
        .iter()
        .filter(|(_, obd)| obd.is_none())
        .map(|(wf, _)| wf.id.clone())
        .collect();
    if !wfs_without_decision.is_empty() {
        return Err(ApiError::from(OnboardingError::MissingBoOnboardingDecision(
            wfs_without_decision.into(),
        )));
    }
    let obds = wfs.into_iter().flat_map(|(_, obd)| obd).collect();

    Ok(obds)
}
