use std::sync::Arc;

use db::{
    models::{
        decision_intent::DecisionIntent,
        onboarding::{Onboarding, OnboardingUpdate},
        onboarding_decision::{OnboardingDecision, OnboardingDecisionCreateArgs},
        risk_signal::RiskSignal,
        vault::Vault,
        verification_request::VerificationRequest,
        verification_result::VerificationResult,
        workflow::Workflow,
    },
    PgConn,
};
use newtypes::{
    DbActor, DecisionIntentId, DecisionStatus, IdentityDocumentId, OnboardingId, RiskSignalGroupKind,
    ScopedVaultId, TenantId, VaultKind, VendorAPI, WorkflowFixtureResult,
};

use super::{sandbox, vendor};
use crate::{
    errors::{onboarding::OnboardingError, ApiError, ApiErrorKind, ApiResult},
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
    workflow: &Workflow,
    tenant_id: &TenantId,
) -> ApiResult<Option<FixtureDecision>> {
    let is_demo_tenant = ff_client.flag(BoolFlag::IsDemoTenant(tenant_id));
    if !vault.is_live {
        let fixture_result = workflow
            .fixture_result
            // Ensure that each sandbox vault has a fixture result - we don't want to make real
            // requests for sandbox vaults
            .ok_or(OnboardingError::NoFixtureResultForSandboxUser)?;
        let fixture_decision = decision_status(fixture_result);
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
        return Err(ApiErrorKind::AssertionError(msg))?;
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
    !matches!(vendor_api, VendorAPI::SocureIDPlus | VendorAPI::TwilioLookupV2)
}

pub fn decision_status(fixture_result: WorkflowFixtureResult) -> FixtureDecision {
    match fixture_result {
        WorkflowFixtureResult::Pass => (DecisionStatus::Pass, false),
        WorkflowFixtureResult::Fail => (DecisionStatus::Fail, false),
        WorkflowFixtureResult::ManualReview => (DecisionStatus::Fail, true),
        WorkflowFixtureResult::StepUp => (DecisionStatus::StepUp, false),
    }
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

            let di = DecisionIntent::get_or_create_onboarding_kyb(conn, &sb.id)?;
            let uv = Vault::get(conn, &sb.id)?;
            let vreq =
                VerificationRequest::create(conn, &sb.id, &di.id, VendorAPI::MiddeskBusinessUpdateWebhook)?;
            let raw = idv::test_fixtures::middesk_business_response();
            let e_response = vendor::verification_result::encrypt_verification_result_response(
                &raw.clone().into(),
                &uv.public_key,
            )?;
            let vres = VerificationResult::create(conn, vreq.id, raw.into(), e_response, false)?;

            let signals = sandbox::get_fixture_reason_codes(fixture_decision, VaultKind::Business);
            RiskSignal::bulk_create(
                conn,
                &sb.id,
                signals
                    .into_iter()
                    .map(|s| (s.0, s.1, vres.id.clone()))
                    .collect::<Vec<_>>(),
                RiskSignalGroupKind::Kyb,
                false,
            )?;

            let _biz_obd = OnboardingDecision::create(conn, new_decision)?;
            Onboarding::update(
                biz_ob,
                conn,
                OnboardingUpdate::idv_reqs_and_has_final_decision_and_is_authorized(decision_status),
            )?;

            Ok(())
        })
        .await
}
