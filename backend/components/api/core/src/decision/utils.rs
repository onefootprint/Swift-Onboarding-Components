use std::sync::Arc;

use db::{
    models::{
        onboarding::{Onboarding, OnboardingUpdate},
        onboarding_decision::{OnboardingDecision, OnboardingDecisionCreateArgs},
        risk_signal::{NewRiskSignals, RiskSignal},
        vault::Vault,
        verification_request::VerificationRequest,
    },
    PgConn,
};
use newtypes::{
    DbActor, DecisionIntentId, DecisionStatus, IdentityDocumentId, OnboardingId, ScopedVaultId, TenantId,
    VaultKind, VendorAPI,
};

use super::sandbox;
use crate::{
    errors::{ApiError, ApiResult},
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
    !matches!(vendor_api, VendorAPI::SocureIDPlus | VendorAPI::TwilioLookupV2)
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

            let signals = sandbox::get_fixture_reason_codes(fixture_decision, VaultKind::Business);
            RiskSignal::bulk_create(
                conn,
                NewRiskSignals::LegacyObd {
                    onboarding_decision_id: biz_obd.id,
                    signals,
                },
            )?;
            Ok(())
        })
        .await
}
