use std::sync::Arc;

use db::{
    models::{
        decision_intent::DecisionIntent,
        manual_review::ManualReview,
        onboarding::{Onboarding, OnboardingUpdate},
        onboarding_decision::{OnboardingDecision, OnboardingDecisionCreateArgs},
        risk_signal::RiskSignal,
        vault::Vault,
        verification_request::VerificationRequest,
        verification_result::VerificationResult,
    },
    PgConn,
};
use newtypes::{
    DbActor, DecisionIntentId, DecisionStatus, IdentityDocumentId, OnboardingId, ScopedVaultId, TenantId,
    VaultKind, VendorAPI,
};

use super::{sandbox, vendor};
use crate::{
    errors::{onboarding::OnboardingError, ApiError, ApiResult},
    utils::vault_wrapper::VaultWrapper,
    State,
};
use feature_flag::{BoolFlag, FeatureFlagClient};

pub type CreateManualReview = bool;
pub type FixtureDecision = (DecisionStatus, CreateManualReview);

#[tracing::instrument(skip_all)]
/// Determines whether production IDV requests should be made.
/// Returns None if we should make production IDV reqs, otherwise returns Some with the desired
/// fixture status
pub fn get_fixture_data_decision(
    ff_client: Arc<dyn FeatureFlagClient>, // Pass in ff_client directly to make it easier to test
    vault: &Vault,
    tenant_id: &TenantId,
) -> ApiResult<Option<FixtureDecision>> {
    let is_demo_tenant = ff_client.flag(BoolFlag::IsDemoTenant(tenant_id));
    if let Some(sandbox_id) = vault.sandbox_id.as_ref() {
        // Sandbox users have the final KYC state encoded in their phone number's sandbox suffix
        let fixture_decision = decision_status_from_sandbox_id(sandbox_id);
        return Ok(Some(fixture_decision));
    }

    if is_demo_tenant {
        // For our tenant we use for demos, always make a fixture pass
        let fixture_decision = (DecisionStatus::Pass, false);
        Ok(Some(fixture_decision))
    } else {
        // If this is a prod user vault, we always send prod requests
        // In order to create production UVs, customers need us to flip a bit for them in PG on `tenant` (sandbox_restricted -> false)
        Ok(None)
    }
}

/// Helper to do some sanity checks when creating document verification requests
pub fn create_document_verification_request(
    conn: &mut PgConn,
    vendor_api: VendorAPI,
    scoped_user_id: ScopedVaultId,
    identity_document_id: IdentityDocumentId,
    decision_intent_id: &DecisionIntentId,
) -> Result<VerificationRequest, ApiError> {
    // As of now, we only support 1 vendor for sending documents too
    if vendor_api != VendorAPI::IdologyScanOnboarding {
        let msg = format!("cannot send document request to {}", vendor_api);
        return Err(ApiError::AssertionError(msg));
    }

    VerificationRequest::create_document_verification_request(
        conn,
        vendor_api,
        scoped_user_id,
        identity_document_id,
        decision_intent_id,
    )
    .map_err(ApiError::from)
}

// If socure fails, we shouldn't fail the DE run
pub fn should_throw_error_in_decision_engine_if_error_in_request(vendor_api: &VendorAPI) -> bool {
    // Socure plus and Experian isn't used by anyone except Footprint (at this time)
    !matches!(vendor_api, VendorAPI::SocureIDPlus)
}

pub fn decision_status_from_sandbox_id(sandbox_id: &str) -> FixtureDecision {
    if sandbox_id.starts_with("fail") {
        (DecisionStatus::Fail, false)
    } else if sandbox_id.starts_with("manualreview") {
        (DecisionStatus::Fail, true)
    } else if sandbox_id.starts_with("stepup") {
        (DecisionStatus::StepUp, false)
    } else {
        (DecisionStatus::Pass, false)
    }
}

#[tracing::instrument(skip_all)]
pub async fn setup_kyc_test_fixtures(
    state: &State,
    ob_id: OnboardingId,
    fixture_decision: FixtureDecision,
) -> ApiResult<()> {
    let (decision_status, create_manual_review) = fixture_decision;
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let ob = Onboarding::lock(conn, &ob_id)?;
            let (_, su, _, _) = Onboarding::get(conn, &ob.id)?;
            if ob.idv_reqs_initiated_at.is_some() {
                return Err(OnboardingError::IdvReqsAlreadyInitiated.into());
            }

            // Create ManualReview row if requested
            if create_manual_review {
                ManualReview::create(conn, ob.id.clone(), vec![])?;
            }

            let decision_intent = DecisionIntent::get_or_create_onboarding_kyc(conn, &ob.scoped_vault_id)?;
            // Create some mock verification request and results
            let request = VerificationRequest::bulk_create(
                conn,
                ob.scoped_vault_id.clone(),
                vec![VendorAPI::IdologyExpectID],
                &decision_intent.id,
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
            let result =
                VerificationResult::create(conn, request.id, raw_response.into(), e_response, false)?;
            // If the decision is a pass, mark all data as verified for the onboarding
            let seqno = if decision_status == DecisionStatus::Pass {
                let uvw = VaultWrapper::lock_for_onboarding(conn, &su.id)?;
                let seqno = uvw.portablize_identity_data(conn)?;
                Some(seqno)
            } else {
                None
            };

            // Create the decision itself
            // TODO should we move the creation of the decision onto the locked UVW since we also
            // commit the data there? Would dedupe this logic between tests + prod
            let new_decision = OnboardingDecisionCreateArgs {
                vault_id: su.vault_id.clone(),
                onboarding: &ob,
                logic_git_hash: crate::GIT_HASH.to_string(),
                status: decision_status,
                result_ids: vec![result.id],
                annotation_id: None,
                actor: DbActor::Footprint,
                seqno,
                workflow_id: None,
            };
            let decision = OnboardingDecision::create(conn, new_decision)?;

            Onboarding::update(
                ob,
                conn,
                OnboardingUpdate::idv_reqs_and_has_final_decision_and_is_authorized(decision_status),
            )?;
            let signals = sandbox::get_fixture_reason_codes(fixture_decision, VaultKind::Person);
            RiskSignal::bulk_create(conn, decision.id, signals)?;
            Ok(())
        })
        .await?;

    Ok(())
}

#[tracing::instrument(skip_all)]
pub async fn setup_kyb_test_fixtures(
    state: &State,
    biz_ob_id: &OnboardingId,
    fixture_decision: FixtureDecision,
) -> ApiResult<()> {
    let biz_ob_id = biz_ob_id.clone();
    let (decision_status, _create_manual_review) = fixture_decision;
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            // TODO update the rest of the business ob
            let biz_ob = Onboarding::lock(conn, &biz_ob_id)?;
            let (_, sb, _, _) = Onboarding::get(conn, &biz_ob.id)?;
            let new_decision = OnboardingDecisionCreateArgs {
                vault_id: sb.vault_id,
                onboarding: &biz_ob,
                logic_git_hash: crate::GIT_HASH.to_string(),
                status: decision_status,
                result_ids: vec![],
                annotation_id: None,
                actor: DbActor::Footprint,
                seqno: None,
                workflow_id: None,
            };
            let biz_obd = OnboardingDecision::create(conn, new_decision)?;

            Onboarding::update(
                biz_ob,
                conn,
                OnboardingUpdate::idv_reqs_and_has_final_decision_and_is_authorized(decision_status),
            )?;

            let biz_risk_signals = sandbox::get_fixture_reason_codes(fixture_decision, VaultKind::Business);
            RiskSignal::bulk_create(conn, biz_obd.id, biz_risk_signals)?;
            Ok(())
        })
        .await
}
