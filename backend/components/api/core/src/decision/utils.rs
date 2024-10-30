use super::onboarding::RulesOutcome;
use super::sandbox;
use super::vendor::middesk::MiddeskResponseDerivedVaultData;
use super::vendor::{
    self,
};
use crate::errors::onboarding::OnboardingError;
use crate::FpResult;
use db::models::decision_intent::DecisionIntent;
use db::models::insight_event::InsightEvent;
use db::models::risk_signal::RiskSignal;
use db::models::risk_signal_group::RiskSignalGroup;
use db::models::risk_signal_group::RiskSignalGroupScope;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use db::models::verification_request::VerificationRequest;
use db::models::verification_result::VerificationResult;
use db::models::workflow::Workflow;
use db::models::zip_code::ZipCode;
use db::TxnPgConn;
use feature_flag::BoolFlag;
use feature_flag::FeatureFlagClient;
use geoutils::Distance;
use geoutils::Location;
use newtypes::DecisionIntentKind;
use newtypes::DecisionStatus;
use newtypes::DocumentFixtureResult;
use newtypes::OnboardingStatus;
use newtypes::RiskSignalGroupKind;
use newtypes::RuleAction;
use newtypes::TenantId;
use newtypes::VendorAPI;
use newtypes::WorkflowFixtureResult;
use newtypes::WorkflowId;
use std::sync::Arc;

#[tracing::instrument(skip_all)]
/// Determines whether production IDV requests should be made.
/// Returns None if we should make production IDV reqs, otherwise returns Some with the desired
/// fixture result
pub fn get_fixture_result(
    ff_client: Arc<dyn FeatureFlagClient>, // Pass in ff_client directly to make it easier to test
    vault: &Vault,
    workflow: &Workflow,
    tenant_id: &TenantId,
) -> FpResult<Option<WorkflowFixtureResult>> {
    let is_demo_tenant = ff_client.flag(BoolFlag::IsDemoTenant(tenant_id));
    if !vault.is_live {
        // Ensure that each sandbox vault has a fixture result - we don't want to make real
        // requests for sandbox vaults
        let fixture_result = workflow.fixture_result.unwrap_or_else(|| {
            // TODO error here with OnboardingError::NoFixtureResultForSandboxUser.
            // Temporarily setting this to Pass until the frontend allows choosing result on auth flows
            tracing::warn!("No fixture result provided");
            WorkflowFixtureResult::Pass
        });
        return Ok(Some(fixture_result));
    }

    if is_demo_tenant {
        // For our tenant we use for demos, always make a fixture pass
        Ok(Some(WorkflowFixtureResult::Pass))
    } else {
        // If this is a prod user vault, we always send prod requests
        // In order to create production UVs, customers need us to flip a bit for them in PG on `tenant`
        // (sandbox_restricted -> false)
        Ok(None)
    }
}

/// Determines whether to use the output of the rules engine or a fixture output.
/// Creates a fixture RulesOutcome for the provided fixture_result if any, otherwise returns the
/// actual outcome of running rules.
pub(super) fn get_final_rules_outcome(
    fixture_result: Option<WorkflowFixtureResult>,
    rules_outcome: RulesOutcome,
) -> RulesOutcome {
    let fixture_result = match fixture_result {
        None | Some(WorkflowFixtureResult::UseRulesOutcome) => {
            // Use the real outcome of running the rules engine
            return rules_outcome;
        }
        Some(fr) => fr,
    };

    // Otherwise, parse the desired outcome from the fixture_result and assemble a fixture RulesOutcome
    let (decision_status, create_manual_review) = fixture_result.decision_status();
    let action = match decision_status {
        DecisionStatus::Fail => Some(RuleAction::Fail),
        DecisionStatus::StepUp => Some(RuleAction::identity_stepup()),
        DecisionStatus::Pass => None,
        DecisionStatus::None => return RulesOutcome::RulesNotExecuted,
    };

    RulesOutcome::RulesExecuted {
        should_commit: decision_status == DecisionStatus::Pass,
        create_manual_review,
        action,
        rule_action: action.map(|a| a.to_rule_action()),
    }
}


type ShouldInitiateRealDocumentRequests = bool;

/// Determines whether production identity document requests should be made, and if not, what the
/// outcome should be
pub async fn should_initiate_requests_for_document(
    vault: &Vault,
    document_decision: Option<DocumentFixtureResult>,
) -> FpResult<ShouldInitiateRealDocumentRequests> {
    // We allow identity documents to be tested in sandbox against incode demo environment, if a tenant
    // is flagged in We use a flag since not all tenants should have this enabled by default (they
    // might need to sign incode terms and be advised that they can only do this for testing purposes)
    if !vault.is_live {
        // TODO: ADD this assertion in main index.rs and remove fixture stuff from here
        // let d = document_decision
        //     // Ensure that each sandbox vault has a fixture result - we don't want to make real
        //     // requests for sandbox vaults
        //     .ok_or(OnboardingError::NoFixtureResultForSandboxUser)?;
        Ok(matches!(document_decision, Some(DocumentFixtureResult::Real)))
    // guard against prod vaults from providing document fixtures (we prevent this in the API route
    // that starts the flow, but double checking never hurt nobody)
    } else if document_decision.is_some() {
        Err(OnboardingError::CannotCreateFixtureResultForNonSandbox.into())
    } else {
        Ok(true)
    }
}

// If socure fails, we shouldn't fail the DE run
pub fn should_throw_error_in_decision_engine_if_error_in_request(vendor_api: &VendorAPI) -> bool {
    // Socure plus and Experian isn't used by anyone except Footprint (at this time)
    !matches!(vendor_api, VendorAPI::SocureIdPlus | VendorAPI::TwilioLookupV2)
}

#[tracing::instrument(skip_all)]
pub fn write_kyb_fixture_vendor_result_and_risk_signals(
    conn: &mut TxnPgConn,
    biz_wf_id: &WorkflowId,
    fixture_result: WorkflowFixtureResult,
) -> FpResult<()> {
    let biz_wf = Workflow::lock(conn, biz_wf_id)?;
    let sb = ScopedVault::get(conn, biz_wf_id)?;
    // TODO should these state transitions be handled by the ww machines?
    let (biz_wf, _, _) = Workflow::update_status_if_valid(biz_wf, conn, OnboardingStatus::Pending)?;

    let di = DecisionIntent::get_or_create_for_workflow(
        conn,
        &sb.id,
        &biz_wf.id,
        DecisionIntentKind::OnboardingKyb,
    )?;
    let uv = Vault::get(conn, &sb.id)?;
    let vreq = VerificationRequest::create(
        conn,
        (&sb.id, &di.id, VendorAPI::MiddeskBusinessUpdateWebhook).into(),
    )?;
    let raw = idv::test_fixtures::middesk_business_update_webhook_response();
    let e_response = vendor::verification_result::encrypt_verification_result_response(
        &raw.clone().into(),
        &uv.public_key,
    )?;
    let vres = VerificationResult::create(conn, vreq.id, raw.into(), e_response, false)?;

    let signals = sandbox::get_fixture_kyb_reason_codes(fixture_result);
    let scope = RiskSignalGroupScope::WorkflowId {
        id: &biz_wf.id,
        sv_id: &sb.id,
    };
    let rsg = RiskSignalGroup::get_or_create(conn, scope, RiskSignalGroupKind::Kyb)?;
    let rses = signals
        .into_iter()
        .map(|s| (s.0, s.1, vres.id.clone()))
        .collect::<Vec<_>>();
    RiskSignal::bulk_add(conn, rses, false, rsg.id)?;

    // write fixture derived vault data
    // if the decision likely would result in real derived data
    if matches!(
        fixture_result,
        WorkflowFixtureResult::Pass | WorkflowFixtureResult::ManualReview
    ) {
        let derived_vault_data = MiddeskResponseDerivedVaultData::fixture(&biz_wf.scoped_vault_id);
        derived_vault_data.write(conn)?;
    }

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
