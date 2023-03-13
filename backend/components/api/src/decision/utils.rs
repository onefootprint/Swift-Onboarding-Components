use db::{
    models::{
        manual_review::ManualReview,
        onboarding::{Onboarding, OnboardingUpdate},
        onboarding_decision::{OnboardingDecision, OnboardingDecisionCreateArgs},
        risk_signal::RiskSignal,
        scoped_vault::ScopedVault,
        verification_request::VerificationRequest,
        verification_result::VerificationResult,
    },
    PgConn,
};
use newtypes::{
    DbActor, DecisionStatus, FootprintReasonCode, IdentityDocumentId, OnboardingId, PhoneNumber,
    ScopedVaultId, TenantId, Vendor, VendorAPI,
};

use super::vendor;
use crate::{
    errors::{onboarding::OnboardingError, ApiError, ApiResult},
    utils::vault_wrapper::{Person, VaultWrapper},
    State,
};
use feature_flag::{BoolFlag, FeatureFlagClient};

type ShouldInitiateVerificationRequests = bool;

#[tracing::instrument(skip_all)]
pub async fn should_initiate_idv_or_else_setup_test_fixtures(
    state: &State,
    uvw: VaultWrapper<Person>,
    ob_id: OnboardingId,
    should_setup_test_fixtures: bool,
) -> ApiResult<ShouldInitiateVerificationRequests> {
    // Check if the user is a sandbox user. Sandbox users have the final KYC state encoded in their
    // phone number's sandbox suffix
    let is_sandbox = !uvw.vault.is_live;

    if is_sandbox {
        let phone_number = uvw.get_decrypted_primary_phone(state).await?;
        should_initiate_sandbox_and_setup(state, ob_id, uvw, phone_number, should_setup_test_fixtures).await
    } else {
        let obid = ob_id.clone();
        let scoped_user = state
            .db_pool
            .db_query(move |conn| -> Result<ScopedVault, ApiError> {
                ScopedVault::get(conn, &obid).map_err(ApiError::from)
            })
            .await??;

        should_initiate_prod_and_setup(
            state,
            ob_id,
            uvw,
            scoped_user.tenant_id,
            &state.feature_flag_client,
            should_setup_test_fixtures,
        )
        .await
    }
}

/// Helper to do some sanity checks when creating document verification requests
pub fn create_document_verification_request(
    conn: &mut PgConn,
    vendor_api: VendorAPI,
    onboarding_id: OnboardingId,
    scoped_user_id: ScopedVaultId,
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
        scoped_user_id,
        identity_document_id,
    )
    .map_err(ApiError::from)
}

// If socure fails, we shouldn't fail the DE run
pub fn should_throw_error_in_decision_engine_if_error_in_request(vendor_api: &VendorAPI) -> bool {
    // Socure plus isn't used by anyone except Footprint (at this time)
    !matches!(vendor_api, VendorAPI::SocureIDPlus)
}

#[tracing::instrument(skip_all)]
/// If the user vault is a sandbox vault, we take the desired status from the phone number suffix
pub async fn should_initiate_sandbox_and_setup(
    state: &State,
    ob_id: OnboardingId,
    uvw: VaultWrapper<Person>,
    phone_number: PhoneNumber,
    should_setup_test_fixtures: bool,
) -> ApiResult<bool> {
    let (decision_status, create_manual_review) = decision_status_from_sandbox_suffix(phone_number);

    if should_setup_test_fixtures {
        setup_test_fixtures(state, ob_id, create_manual_review, decision_status, uvw).await?;
    }

    Ok(false)
}

pub fn decision_status_from_sandbox_suffix(phone_number: PhoneNumber) -> (DecisionStatus, bool) {
    if phone_number.sandbox_suffix.starts_with("fail") {
        (DecisionStatus::Fail, false)
    } else if phone_number.sandbox_suffix.starts_with("manualreview") {
        (DecisionStatus::Fail, true)
    } else {
        (DecisionStatus::Pass, false)
    }
}

#[tracing::instrument(skip_all)]
pub async fn should_initiate_prod_and_setup(
    state: &State,
    ob_id: OnboardingId,
    uvw: VaultWrapper<Person>,
    tenant_id: TenantId,
    ff_client: &impl FeatureFlagClient,
    should_setup_test_fixtures: bool,
) -> ApiResult<bool> {
    if ff_client.flag(BoolFlag::IsDemoTenant(&tenant_id)) {
        if should_setup_test_fixtures {
            setup_test_fixtures(state, ob_id, false, DecisionStatus::Pass, uvw).await?;
        }

        Ok(false)
    } else {
        // If this is a prod user vault, we always send prod requests
        // In order to create production UVs, customers need us to flip a bit for them in PG on `tenant` (sandbox_restricted -> false)
        Ok(true)
    }
}

#[tracing::instrument(skip_all)]
async fn setup_test_fixtures(
    state: &State,
    ob_id: OnboardingId,
    create_manual_review: bool,
    decision_status: DecisionStatus,
    uvw: VaultWrapper<Person>,
) -> ApiResult<()> {
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let ob = Onboarding::lock(conn, &ob_id)?;
            if ob.idv_reqs_initiated_at.is_some() {
                return Err(OnboardingError::IdvReqsAlreadyInitiated.into());
            }

            // Create ManualReview row if requested
            if create_manual_review {
                ManualReview::create(conn, ob.id.clone())?;
            }

            // Create some mock verification request and results
            let request = VerificationRequest::bulk_create(
                conn,
                ob.id.clone(),
                ob.scoped_user_id.clone(),
                vec![VendorAPI::IdologyExpectID],
            )?
            .pop()
            .ok_or(ApiError::ResourceNotFound)?;
            let raw_response = idv::test_fixtures::idology_fake_data_expectid_response();

            // Verification result response is encrypted
            let uv = VerificationRequest::get_user_vault(conn.conn(), request.id.clone())?;
            let e_response = vendor::verification_result::encrypt_verification_result_response(
                &raw_response.clone().into(),
                &uv.public_key,
            )?;

            // NOTE: the raw fixture response we create here won't necessarily match the risk signals we create
            let result = VerificationResult::create(conn, request.id, raw_response.into(), e_response)?;
            // If the decision is a pass, mark all data as verified for the onboarding
            let seqno = if decision_status == DecisionStatus::Pass {
                let uvw = VaultWrapper::lock_for_onboarding(conn, &ob.scoped_user_id)?;
                let seqno = uvw.commit_identity_data(conn)?;
                Some(seqno)
            } else {
                None
            };

            // Create the decision itself
            // TODO should we move the creation of the decision onto the locked UVW since we also
            // commit the data there? Would dedupe this logic between tests + prod
            let new_decision = OnboardingDecisionCreateArgs {
                user_vault_id: uvw.vault.id.clone(),
                onboarding: &ob,
                logic_git_hash: crate::GIT_HASH.to_string(),
                status: decision_status,
                result_ids: vec![result.id],
                annotation_id: None,
                actor: DbActor::Footprint,
                seqno,
            };
            let decision = OnboardingDecision::create(conn, new_decision)?;

            let ob = ob.into_inner().update(
                conn,
                OnboardingUpdate::idv_reqs_and_has_final_decision(true, true),
            )?;
            // also move to authorized
            ob.update(conn, OnboardingUpdate::is_authorized(true))?;

            // Create some mock risk signals that are somewhat consistent with the mock decision
            let reason_codes = match (decision_status, create_manual_review) {
                // Straight out rejection
                (DecisionStatus::Fail, false) => vec![
                    FootprintReasonCode::SubjectDeceased,
                    FootprintReasonCode::SsnIssuedPriorToDob,
                ],
                // Manual review
                (DecisionStatus::Fail, true) => vec![
                    FootprintReasonCode::SsnDoesNotMatchWithin1Digit,
                    FootprintReasonCode::NameLastDoesNotMatch,
                ],
                // Approved
                (DecisionStatus::Pass, _) => vec![
                    FootprintReasonCode::PhoneNumberLocatedIsVoip,
                    FootprintReasonCode::EmailDomainCorporate,
                ],
            };
            let signals = reason_codes
                .into_iter()
                .map(|r| (r, vec![Vendor::Idology]))
                .collect();
            RiskSignal::bulk_create(conn, decision.id, signals)?;
            Ok(())
        })
        .await?;

    Ok(())
}
