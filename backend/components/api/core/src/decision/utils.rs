use std::sync::Arc;

use db::{
    models::{
        decision_intent::DecisionIntent,
        insight_event::InsightEvent,
        risk_signal::RiskSignal,
        scoped_vault::ScopedVault,
        vault::Vault,
        verification_request::VerificationRequest,
        verification_result::VerificationResult,
        workflow::{Workflow, WorkflowUpdate},
        zip_code::ZipCode,
    },
    PgConn, TxnPgConn,
};
use newtypes::{
    DecisionIntentId, DecisionStatus, IdentityDocumentFixtureResult, IdentityDocumentId, OnboardingStatus,
    RiskSignalGroupKind, ScopedVaultId, TenantId, VaultKind, VendorAPI, WorkflowFixtureResult, WorkflowId,
};

use super::{
    features::incode_docv::IncodeOcrComparisonDataFields,
    sandbox,
    vendor::{self},
};
use crate::{
    errors::{onboarding::OnboardingError, ApiError, ApiErrorKind, ApiResult},
    utils::vault_wrapper::{Person, VaultWrapper},
    State,
};
use feature_flag::{BoolFlag, FeatureFlagClient};

pub type CreateManualReview = bool;
pub type FixtureDecision = (DecisionStatus, CreateManualReview);
use geoutils::{Distance, Location};

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

pub fn should_execute_rules_for_document_only(vault: &Vault, workflow: &Workflow) -> ApiResult<bool> {
    if !vault.is_live {
        let fixture_result = workflow
            .fixture_result
            // Ensure that each sandbox vault has a fixture result - we don't want to make real
            // requests for sandbox vaults
            .ok_or(OnboardingError::NoFixtureResultForSandboxUser)?;
        Ok(matches!(fixture_result, WorkflowFixtureResult::DocumentDecision))
    } else {
        // TODO based on OBC
        Ok(false)
    }
}

type ShouldInitiateRealDocumentRequests = bool;

/// Determines whether production identity document requests should be made, and if not, what the outcome should be
pub async fn should_initiate_requests_for_document(
    state: &State,
    uvw: &VaultWrapper<Person>,
    document_decision: Option<IdentityDocumentFixtureResult>,
) -> ApiResult<(
    ShouldInitiateRealDocumentRequests,
    Option<IncodeOcrComparisonDataFields>,
)> {
    // We allow identity documents to be tested in sandbox against incode demo environment, if a tenant is flagged in
    // We use a flag since not all tenants should have this enabled by default (they might need to sign incode terms and be advised that they can only do this for testing purposes)
    if !uvw.vault.is_live {
        // TODO: frontend not merged yet, enable this when it is
        // let d = document_decision
        //     // Ensure that each sandbox vault has a fixture result - we don't want to make real
        //     // requests for sandbox vaults
        //     .ok_or(OnboardingError::NoFixtureResultForSandboxUser)?;
        let fixture_ocr_data = if document_decision
            .map(|d| !matches!(d, IdentityDocumentFixtureResult::Real))
            .unwrap_or(false)
        {
            let vault_data = IncodeOcrComparisonDataFields::compose(&state.enclave_client, uvw).await?;
            Some(vault_data)
        } else {
            None
        };

        let should_initiate_sandbox = matches!(document_decision, Some(IdentityDocumentFixtureResult::Real));
        return Ok((should_initiate_sandbox, fixture_ocr_data));
    // guard against prod vaults from providing document fixtures (we prevent this in the API route that starts the flow, but double checking never hurt nobody)
    } else if document_decision.is_some() {
        return Err(OnboardingError::CannotCreateFixtureResultForNonSandbox.into());
    }

    Ok((true, None))
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
        Err(ApiErrorKind::AssertionError(msg))?;
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
    !matches!(vendor_api, VendorAPI::SocureIdPlus | VendorAPI::TwilioLookupV2)
}

pub fn decision_status(fixture_result: WorkflowFixtureResult) -> FixtureDecision {
    match fixture_result {
        WorkflowFixtureResult::Pass => (DecisionStatus::Pass, false),
        WorkflowFixtureResult::Fail => (DecisionStatus::Fail, false),
        WorkflowFixtureResult::ManualReview => (DecisionStatus::Fail, true),
        WorkflowFixtureResult::StepUp => (DecisionStatus::StepUp, false),
        // This isn't quite right, and will be ignored. We are running real rules on a real sandbox document vendor call
        // but this fn is used in a lot of places and we should have it return something
        WorkflowFixtureResult::DocumentDecision => (DecisionStatus::Pass, false),
    }
}

#[tracing::instrument(skip_all)]
pub fn write_kyb_fixture_vendor_result_and_risk_signals(
    conn: &mut TxnPgConn,
    biz_wf_id: &WorkflowId,
    fixture_decision: FixtureDecision,
) -> ApiResult<()> {
    let biz_wf = Workflow::lock(conn, biz_wf_id)?;
    let sb = ScopedVault::get(conn, biz_wf_id)?;
    // TODO should these state transitions be handled by the ww machines?
    let update = WorkflowUpdate::set_status(OnboardingStatus::Pending);
    Workflow::update(biz_wf, conn, update)?;

    let di = DecisionIntent::get_or_create_onboarding_kyb(conn, &sb.id)?;
    let uv = Vault::get(conn, &sb.id)?;
    let vreq = VerificationRequest::create(conn, &sb.id, &di.id, VendorAPI::MiddeskBusinessUpdateWebhook)?;
    let raw = idv::test_fixtures::middesk_business_response();
    let e_response = vendor::verification_result::encrypt_verification_result_response(
        &raw.clone().into(),
        &uv.public_key,
    )?;
    let vres = VerificationResult::create(conn, vreq.id, raw.into(), e_response, false)?;

    let signals = sandbox::get_fixture_reason_codes(fixture_decision, VaultKind::Business, None);
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
    Ok(())
}

pub fn is_in_radius_from_ip_to_zip(
    zip_code: &ZipCode,
    insight_event: &InsightEvent,
    radius_in_meters: i32,
) -> Option<bool> {
    let (ie_lat, ie_long) = insight_event
        .latitude
        .and_then(|lat| insight_event.longitude.map(|long| (lat, long)))?;
    let zip_code_location = Location::new(zip_code.latitude, zip_code.longitude);
    let insight_event_location = Location::new(ie_lat, ie_long);

    insight_event_location
        .is_in_circle(&zip_code_location, Distance::from_meters(radius_in_meters))
        .ok()
}
