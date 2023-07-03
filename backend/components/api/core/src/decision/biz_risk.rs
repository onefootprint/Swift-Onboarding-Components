use db::{
    models::{onboarding::Onboarding, onboarding_decision::OnboardingDecision},
    DbPool,
};
use idv::middesk::response::business::BusinessResponse;
use newtypes::{OnboardingId, VendorAPI, VerificationResultId};

use crate::{
    enclave_client::EnclaveClient,
    errors::{onboarding::OnboardingError, ApiResult},
    utils::vault_wrapper::{Business, DecryptedBusinessOwners, VaultWrapper},
    ApiError,
};

use super::{engine, features::kyb_features::KybFeatureVector};

pub async fn make_kyb_decision(
    db_pool: &DbPool,
    enclave_client: &EnclaveClient,
    ob_id: OnboardingId,
    business_response: &BusinessResponse,
    vres_id: &VerificationResultId,
    vendor_api: VendorAPI,
) -> Result<(), ApiError> {
    let (ob, bvw) = db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let (ob, _, _, _) = Onboarding::get(conn, &ob_id)?;
            let bvw = VaultWrapper::<Business>::build_for_tenant(conn, &ob.scoped_vault_id)?;
            Ok((ob, bvw))
        })
        .await??;

    let ob_conf_id = ob.ob_configuration_id.clone();

    let dbo = bvw
        .decrypt_business_owners(db_pool, enclave_client, Some(ob_conf_id))
        .await?;

    let onboarding_ids = match dbo {
        DecryptedBusinessOwners::KYBStart {
            primary_bo: _,
            primary_bo_vault: _,
        } => Err(ApiError::from(OnboardingError::BusinessOwnersNotSet)),
        DecryptedBusinessOwners::SingleKYC {
            primary_bo: _,
            primary_bo_vault,
            primary_bo_data: _,
            secondary_bos: _,
        } => Ok(vec![primary_bo_vault.2.id]),
        DecryptedBusinessOwners::MultiKYC {
            primary_bo: _,
            primary_bo_vault,
            primary_bo_data: _,
            secondary_bos,
        } => {
            let mut v = vec![primary_bo_vault.2.id];
            let secondary_bo_onboardings: Vec<_> = secondary_bos
                .into_iter()
                .map(|b| {
                    if let Some((_, _, ob)) = b.2 {
                        Ok(ob.id)
                    } else {
                        Err(ApiError::from(OnboardingError::MissingBoOnboarding))
                    }
                })
                .collect::<ApiResult<Vec<_>>>()?;
            v.extend(secondary_bo_onboardings);
            Ok(v)
        }
    }?;

    let ob_ids = onboarding_ids.clone();
    let obds: Vec<OnboardingDecision> = db_pool
        .db_query(move |conn| OnboardingDecision::bulk_get_active(conn, &ob_ids))
        .await??;

    let onboardings_without_obd: Vec<_> = onboarding_ids
        .into_iter()
        .filter(|id| !obds.iter().any(|obd| obd.onboarding_id == *id))
        .collect();

    if !onboardings_without_obd.is_empty() {
        return Err(ApiError::from(OnboardingError::MissingBoOnboardingDecision(
            onboardings_without_obd.into(),
        )));
    }

    let fv = KybFeatureVector::new(business_response, obds, vendor_api);
    engine::make_onboarding_decision(&ob, fv, db_pool, vec![vres_id.clone()]).await
}
