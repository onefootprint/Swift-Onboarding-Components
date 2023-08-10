use std::sync::Arc;

use chrono::Utc;
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
    PgConn, TxnPgConn,
};
use idv::incode::doc::response::FetchOCRResponse;
use newtypes::{
    DataIdentifier, DbActor, DecisionIntentId, DecisionStatus, IdentityDataKind,
    IdentityDocumentFixtureResult, IdentityDocumentId, OnboardingId, RiskSignalGroupKind, ScopedVaultId,
    TenantId, VaultKind, VendorAPI, WorkflowFixtureResult,
};

use super::{
    features::incode_docv::IncodeOcrComparisonDataFields,
    sandbox,
    vendor::{self, incode::states::parse_dob},
};
use crate::{
    errors::{onboarding::OnboardingError, ApiError, ApiErrorKind, ApiResult},
    utils::vault_wrapper::{Person, VaultWrapper},
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
    tenant_id: &TenantId,
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
        let ocr_data = if document_decision
            .map(|d| !matches!(d, IdentityDocumentFixtureResult::Real))
            .unwrap_or(false)
        {
            let vd = uvw
                .decrypt_unchecked(
                    &state.enclave_client,
                    &[
                        DataIdentifier::Id(IdentityDataKind::FirstName),
                        DataIdentifier::Id(IdentityDataKind::LastName),
                        DataIdentifier::Id(IdentityDataKind::Dob),
                        // TODO: address
                    ],
                )
                .await?;

            Some(IncodeOcrComparisonDataFields {
                first_name: vd.get_di(IdentityDataKind::FirstName)?,
                last_name: vd.get_di(IdentityDataKind::LastName)?,
                dob: vd.get_di(IdentityDataKind::Dob)?,
            })
        } else {
            None
        };

        let can_make_demo_incode_requests_in_sandbox = state
            .feature_flag_client
            .flag(BoolFlag::CanMakeDemoIncodeRequestsInSandbox(tenant_id));
        let should_initiate_sandbox = matches!(document_decision, Some(IdentityDocumentFixtureResult::Real))
            && can_make_demo_incode_requests_in_sandbox;

        return Ok((should_initiate_sandbox, ocr_data));
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
        // This isn't quite right, and will be ignored. We are running real rules on a real sandbox document vendor call
        // but this fn is used in a lot of places and we should have it return something
        WorkflowFixtureResult::DocumentDecision => (DecisionStatus::Pass, false),
    }
}

#[tracing::instrument(skip_all)]
pub fn write_kyb_fixture_vendor_result_and_risk_signals(
    conn: &mut TxnPgConn,
    biz_ob_id: &OnboardingId,
    fixture_decision: FixtureDecision,
) -> ApiResult<()> {
    let biz_ob_id = biz_ob_id.clone();

    // TODO update the rest of the business ob
    let biz_ob = Onboarding::lock(conn, &biz_ob_id)?;
    let (_, sb, _, _) = Onboarding::get(conn, &biz_ob.id)?;

    let update = OnboardingUpdate::idv_reqs_initiated();
    let wf_id = biz_ob.workflow_id(None).clone();
    Onboarding::update(biz_ob, conn, Some(&wf_id), update)?;

    let di = DecisionIntent::get_or_create_onboarding_kyb(conn, &sb.id)?;
    let uv = Vault::get(conn, &sb.id)?;
    let vreq = VerificationRequest::create(conn, &sb.id, &di.id, VendorAPI::MiddeskBusinessUpdateWebhook)?;
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
    Ok(())
}

#[tracing::instrument(skip_all)]
// TODO: merge with risk::save_final_decision / decision::biz_risk::make_kyb_decision
pub fn write_kyb_fixture_ob_decision(
    conn: &mut TxnPgConn,
    biz_ob_id: &OnboardingId,
    fixture_decision: FixtureDecision,
) -> ApiResult<()> {
    let biz_ob_id = biz_ob_id.clone();
    let biz_ob = Onboarding::lock(conn, &biz_ob_id)?;
    let (_, sb, _, _) = Onboarding::get(conn, &biz_ob.id)?;

    let (decision_status, _create_manual_review) = fixture_decision;

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

    OnboardingDecision::create(conn, new_decision)?;
    let update = OnboardingUpdate {
        authorized_at: None,
        idv_reqs_initiated_at: None,
        decision_made_at: Some(Some(Utc::now())),
        status: Some(decision_status.into()),
    };
    let wf_id = biz_ob.workflow_id(None).clone();
    Onboarding::update(biz_ob, conn, Some(&wf_id), update)?;
    Ok(())
}

pub fn fixture_ocr_response_for_incode(
    comparison_data: Option<IncodeOcrComparisonDataFields>,
) -> ApiResult<FetchOCRResponse> {
    let raw = if let Some(data) = comparison_data {
        idv::incode::doc::response::FetchOCRResponse::fixture_response(
            Some(data.first_name),
            Some(data.last_name),
            parse_dob(data.dob)?,
        )
    } else {
        idv::incode::doc::response::FetchOCRResponse::fixture_response(None, None, None)
    };

    let parsed = serde_json::from_value(raw)?;
    Ok(parsed)
}
