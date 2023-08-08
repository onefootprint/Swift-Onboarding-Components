use db::{
    models::{onboarding::Onboarding, onboarding_decision::OnboardingDecision, risk_signal::RiskSignal},
    DbPool,
};
use idv::middesk::response::business::BusinessResponse;
use newtypes::{OnboardingId, RiskSignalGroupKind, VendorAPI, VerificationResultId};

use super::{
    engine,
    features::{self, kyb_features::KybFeatureVector},
};
use crate::decision::onboarding::FeatureVector;
use crate::{
    enclave_client::EnclaveClient,
    errors::{onboarding::OnboardingError, ApiResult},
    utils::vault_wrapper::{Business, DecryptedBusinessOwners, VaultWrapper},
    ApiError,
};

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

    let reason_codes = features::middesk::reason_codes(business_response);
    let fv = KybFeatureVector::new(reason_codes.clone(), obds);
    let rules_output = fv.evaluate()?;

    let svid = ob.scoped_vault_id.clone();
    let vresid = vres_id.clone();
    db_pool
        .db_transaction(move |conn| -> ApiResult<()> {
            let risk_signals = reason_codes
                .into_iter()
                .map(|rc| (rc, vendor_api, vresid.clone()))
                .collect();
            let _rs = RiskSignal::bulk_create(conn, &svid, risk_signals, RiskSignalGroupKind::Kyb, false)?;

            engine::save_onboarding_decision(
                conn,
                &ob,
                rules_output,
                vec![vresid.clone()],
                true,
                false,
                None,
                vec![],
            )?;
            Ok(())
        })
        .await?;
    Ok(())
}
