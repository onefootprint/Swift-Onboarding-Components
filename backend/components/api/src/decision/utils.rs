use db::{
    models::{
        manual_review::ManualReview,
        ob_configuration::ObConfiguration,
        onboarding::{Onboarding, OnboardingUpdate},
        onboarding_decision::{OnboardingDecision, OnboardingDecisionCreateArgs},
        risk_signal::RiskSignal,
        scoped_user::ScopedUser,
        verification_request::VerificationRequest,
        verification_result::VerificationResult,
    },
    PgConnection,
};
use newtypes::{
    DbActor, DecisionStatus, FootprintReasonCode, IdentityDocumentId, ObConfigurationKey, OnboardingId,
    TenantId, Vendor, VendorAPI,
};

use crate::{
    errors::{onboarding::OnboardingError, ApiError, ApiResult},
    feature_flag::FeatureFlagClient,
    utils::user_vault_wrapper::{UserVaultWrapper, UvwCommitData},
    State,
};

type ShouldInitiateVerificationRequests = bool;
// Logic to figure out test status from some of the identity data we collected during onboarding
// As of 2022-10-15 we do this by looking at the phone number
pub async fn should_initiate_idv_or_else_setup_test_fixtures(
    state: &State,
    uvw: UserVaultWrapper,
    ob_id: OnboardingId,
    should_setup_test_fixtures: bool,
) -> ApiResult<ShouldInitiateVerificationRequests> {
    // Check if the user is a sandbox user. Sandbox users have the final KYC state encoded in their
    // phone number's sandbox suffix
    let decrypted_phone = if !uvw.user_vault.is_live {
        let phone_number = uvw.get_decrypted_primary_phone(state).await?;
        Some(phone_number)
    } else {
        None
    };

    let (decision_status, create_manual_review) = if let Some(decrypted_phone) = decrypted_phone {
        // This is a sandbox user vault. Check for pre-set validation cases
        if decrypted_phone.suffix.starts_with("idv") {
            // ALERT ALERT - This triggers real idv requests
            // All other cases (ironically including non-sandbox users) end up triggering the fixture code path
            return Ok(true);
        } else if decrypted_phone.suffix.starts_with("fail") {
            (DecisionStatus::Fail, false)
        } else if decrypted_phone.suffix.starts_with("manualreview") {
            (DecisionStatus::Fail, true)
        } else {
            (DecisionStatus::Pass, false)
        }
    } else {
        // Decide to send prod request based on FFs for tenant_id OR ob_config id
        let obid = ob_id.clone();

        let (scoped_user, ob_config_key) = state
            .db_pool
            .db_query(
                move |conn| -> Result<(ScopedUser, ObConfigurationKey), ApiError> {
                    let su = ScopedUser::get_by_onboarding_id(conn, &obid)?;
                    let ob_key = ObConfiguration::get_by_onboarding_id(conn, &obid)?.key;

                    Ok((su, ob_key))
                },
            )
            .await??;

        if should_send_prod_idv_requests(
            state.feature_flag_client.clone(),
            &scoped_user.tenant_id,
            &ob_config_key,
        )
        .await?
        {
            return Ok(true);
        }

        // BIG TODO: This controls whether or not we send actual verification requests, we need to revisit and remove the feature flag at some point
        (DecisionStatus::Pass, false)
    };

    // Create the test fixture data
    if should_setup_test_fixtures {
        state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let ob = Onboarding::lock(conn, &ob_id)?;
                if ob.idv_reqs_initiated {
                    return Err(OnboardingError::IdvReqsAlreadyInitiated.into());
                }

                // Create ManualReview row if requested
                if create_manual_review {
                    ManualReview::create(conn, ob.id.clone())?;
                }

                // Create some mock verification request and results
                let request =
                    VerificationRequest::bulk_create(conn, ob.id.clone(), vec![VendorAPI::IdologyExpectID])?
                        .pop()
                        .ok_or(ApiError::ResourceNotFound)?;
                let raw_response = idv::test_fixtures::idology_fake_data_expectid_response();
                // NOTE: the raw fixture response we create here won't necessarily match the risk signals we create
                let result = VerificationResult::create(conn, request.id, raw_response)?;

                // If the decision is a pass, mark all data as verified for the onboarding
                let seqno = if decision_status == DecisionStatus::Pass {
                    let uvw = UserVaultWrapper::lock_for_onboarding(conn, &ob.scoped_user_id)?;
                    let seqno = uvw.commit_identity_data(conn)?;
                    Some(seqno)
                } else {
                    None
                };

                // Create the decision itself
                // TODO should we move the creation of the decision onto the locked UVW since we also
                // commit the data there? Would dedupe this logic between tests + prod
                let new_decision = OnboardingDecisionCreateArgs {
                    user_vault_id: uvw.user_vault.id.clone(),
                    onboarding: &ob,
                    logic_git_hash: crate::GIT_HASH.to_string(),
                    status: decision_status,
                    result_ids: vec![result.id],
                    annotation_id: None,
                    actor: DbActor::Footprint,
                    seqno,
                };
                let decision = OnboardingDecision::create(conn, new_decision)?;

                ob.into_inner().update(
                    conn,
                    OnboardingUpdate::idv_reqs_and_has_final_decision(true, true),
                )?;

                // Create some mock risk signals that are somewhat consistent with the mock decision
                let reason_codes = match (decision_status, create_manual_review) {
                    // Straight out rejection
                    (DecisionStatus::Fail, false) => vec![
                        FootprintReasonCode::SubjectDeceased,
                        FootprintReasonCode::SsnIssuedPriorToDob,
                    ],
                    // Manual review
                    (DecisionStatus::Fail, true) => vec![
                        FootprintReasonCode::SsnDoesNotMatchWithinTolerance,
                        FootprintReasonCode::LastNameDoesNotMatch,
                    ],
                    // Approved
                    (DecisionStatus::Pass, _) => vec![
                        FootprintReasonCode::MobileNumber,
                        FootprintReasonCode::CorporateEmailDomain,
                    ],
                    _ => vec![],
                };
                let signals = reason_codes
                    .into_iter()
                    .map(|r| (r, vec![Vendor::Idology]))
                    .collect();
                RiskSignal::bulk_create(conn, decision.id, signals)?;
                Ok(())
            })
            .await?;
    }
    Ok(false)
}

/// Helper to do some sanity checks when creating document verification requests
pub fn create_document_verification_request(
    conn: &mut PgConnection,
    vendor_api: VendorAPI,
    onboarding_id: OnboardingId,
    identity_document_id: IdentityDocumentId,
) -> Result<VerificationRequest, ApiError> {
    // As of now, we only support 1 vendor for sending documents too
    if vendor_api != VendorAPI::IdologyScanOnboarding {
        let msg = format!("cannot send document request to {}", vendor_api);
        return Err(ApiError::AssertionError(msg));
    }

    VerificationRequest::create_document_verification_request(
        conn,
        vendor_api,
        onboarding_id,
        identity_document_id,
    )
    .map_err(ApiError::from)
}

/// Logic to determine if we should send IDV requests for a tenant in production. Separated out for testing
pub(self) async fn should_send_prod_idv_requests(
    feature_flag_client: FeatureFlagClient,
    tenant_id: &TenantId,
    ob_config_key: &ObConfigurationKey,
) -> Result<bool, ApiError> {
    let should_send_tenant = feature_flag_client
        .bool_flag_by_tenant_id("EnableProductionIdvCallsByTenant", tenant_id)
        .unwrap_or(false);
    let should_send_ob_config = feature_flag_client
        .bool_flag_by_ob_configuration_key("EnableProductionIdvCallsByObConfig", ob_config_key)
        .unwrap_or(false);

    if should_send_tenant || should_send_ob_config {
        return Ok(true);
    };

    Ok(false)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[ignore]
    #[tokio::test]
    async fn test_should_send_prod_idv() {
        // It is hard to unit test this, so I manually toggled flags on and off in the launch darkly UI and tested the correct
        // assertions.
        let ld_key = dotenv::var("LAUNCH_DARKLY_SDK_KEY").unwrap();
        let feature_flag_client = FeatureFlagClient::new();
        let feature_flag_client = feature_flag_client.init(&ld_key).await.unwrap();
        let test_tenant_id: TenantId = "DEV_TESTING_TENANT_ID".to_string().into();
        let test_ob_config_key: ObConfigurationKey = "DEV_TESTING_OB_CONFIG_KEY".to_string().into();

        assert!(
            should_send_prod_idv_requests(feature_flag_client, &test_tenant_id, &test_ob_config_key)
                .await
                .unwrap()
        );
    }
}
