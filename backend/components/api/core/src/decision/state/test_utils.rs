use std::sync::Arc;

use crate::decision::vendor::vendor_trait::MockVendorAPICall;
use crate::errors::ApiResult;
use crate::{decision::tests::test_helpers, State};
use db::models::fingerprint::Fingerprint;
use db::models::manual_review::ManualReview;
use db::models::onboarding::Onboarding;
use db::models::onboarding_decision::OnboardingDecision;
use db::models::risk_signal::RiskSignal;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow_event::WorkflowEvent;
use db::models::{
    ob_configuration::ObConfiguration, tenant::Tenant, tenant_user::TenantUser,
    tenant_vendor::TenantVendorControl, workflow::Workflow,
};
use db::tests::fixtures;
use feature_flag::MockFeatureFlagClient;
use idv::experian::ExperianCrossCoreRequest;
use idv::experian::ExperianCrossCoreResponse;
use idv::idology::IdologyExpectIDAPIResponse;
use idv::idology::IdologyExpectIDRequest;
use idv::incode::response::OnboardingStartResponse;
use idv::incode::watchlist::response::WatchlistResultResponse;
use idv::incode::watchlist::IncodeWatchlistCheckRequest;
use idv::incode::IncodeResponse;
use idv::incode::IncodeStartOnboardingRequest;
use idv::twilio::TwilioLookupV2APIResponse;
use idv::twilio::TwilioLookupV2Request;
use newtypes::{CipKind, ScopedVaultId, SealedVaultBytes, WorkflowId};
use newtypes::{CollectedDataOption as CDO, OnboardingStatus};
use webhooks::events::WebhookEvent;
use webhooks::MockWebhookClient;

#[derive(Clone, Copy, Debug)]
pub enum UserKind {
    Demo,
    Sandbox(&'static str),
    Live,
}
impl UserKind {
    pub fn phone_suffix(&self) -> Option<String> {
        match self {
            UserKind::Demo => None,
            UserKind::Sandbox(s) => Some(s.to_string()),
            UserKind::Live => None,
        }
    }
}

pub async fn setup_data(
    state: &State,
    user_kind: UserKind,
    cip_kind: Option<CipKind>,
    phone_suffix: Option<String>,
) -> (Workflow, Tenant, ObConfiguration, TenantUser) {
    // TODO: create sandbox vs demo vs real, diff sandbox fixues
    let is_live = matches!(user_kind, UserKind::Live | UserKind::Demo);
    let (tenant, ob, _, sv, _, obc) = test_helpers::create_user_and_onboarding(
        &state.db_pool,
        &state.enclave_client,
        Some(vec![CDO::FullAddress]), // so we can meet min req for kyc vendor calls
        cip_kind,
        is_live,
        phone_suffix,
    )
    .await;

    let tid = tenant.id.clone();
    let (wf, tu) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            // only enable Idology for this dummy test merchant
            let tvc = TenantVendorControl::create(conn, tid, true, false, None).unwrap();

            let tu = fixtures::tenant_user::create(conn);

            let wf = Workflow::get(conn, &ob.workflow_id.unwrap()).unwrap();
            Ok((wf, tu))
        })
        .await
        .unwrap();

    (wf, tenant, obc, tu)
}

pub async fn query_data(
    state: &State,
    sv_id: &ScopedVaultId,
    wf_id: &WorkflowId,
) -> (
    // TODO: probably make a struct for this output
    Onboarding,
    Workflow,
    Vec<WorkflowEvent>,
    Option<ManualReview>,
    Option<OnboardingDecision>,
    Vec<RiskSignal>,
    Vec<Fingerprint>,
) {
    let svid = sv_id.clone();
    let wfid = wf_id.clone();
    state
        .db_pool
        .db_query(move |conn| {
            let sv = ScopedVault::get(conn, &svid).unwrap();
            let (ob, _, mr, obd) = Onboarding::get(conn, (&sv.id, &sv.vault_id)).unwrap();

            let latest_obd = OnboardingDecision::latest_footprint_actor_decision(
                conn,
                &sv.fp_id,
                &sv.tenant_id,
                sv.is_live,
            )
            .unwrap();
            let rs = latest_obd
                .as_ref()
                .map(|obd| RiskSignal::list_by_onboarding_decision_id(conn, &obd.id).unwrap())
                .unwrap_or_default();

            let wf = Workflow::get(conn, &wfid).unwrap();
            let wfe = WorkflowEvent::list_for_workflow(conn, &wfid).unwrap();

            let fps = Fingerprint::_list_for_scoped_vault(conn, &svid).unwrap();

            (ob, wf, wfe, mr, obd, rs, fps)
        })
        .await
        .unwrap()
}

pub struct WithHit(pub bool);
pub fn mock_incode(state: &mut State, with_hit: WithHit) {
    let mut mock_incode_start_onboarding = MockVendorAPICall::<
        IncodeStartOnboardingRequest,
        IncodeResponse<OnboardingStartResponse>,
        idv::incode::error::Error,
    >::new();
    mock_incode_start_onboarding
        .expect_make_request()
        .times(1)
        .return_once(move |_| Ok(idv::tests::fixtures::incode::start_onboarding_response()));
    state.set_incode_start_onboarding(Arc::new(mock_incode_start_onboarding));

    let mut mock_incode_watchlist_check = MockVendorAPICall::<
        idv::incode::watchlist::IncodeWatchlistCheckRequest,
        IncodeResponse<idv::incode::watchlist::response::WatchlistResultResponse>,
        idv::incode::error::Error,
    >::new();

    let res = if with_hit.0 {
        idv::tests::fixtures::incode::watchlist_result_response_with_hit()
    } else {
        idv::tests::fixtures::incode::watchlist_result_response()
    };

    mock_incode_watchlist_check
        .expect_make_request()
        .times(1)
        .return_once(move |_| Ok(res));
    state.set_incode_watchlist_check(Arc::new(mock_incode_watchlist_check));
}

pub struct WithQualifier(pub Option<String>);
pub fn mock_idology(state: &mut State, with_qualifier: WithQualifier) {
    let mut mock_idology_expect_id = MockVendorAPICall::<
        IdologyExpectIDRequest,
        IdologyExpectIDAPIResponse,
        idv::idology::error::Error,
    >::new();
    mock_idology_expect_id
        .expect_make_request()
        .times(1)
        .return_once(move |_| {
            Ok(idv::tests::fixtures::idology::create_response(
                "result.match".to_string(),
                with_qualifier.0,
            ))
        });
    state.set_idology_expect_id(Arc::new(mock_idology_expect_id));
}

pub fn mock_twilio(state: &mut State) {
    let mut mock_twilio_lookup_v2 =
        MockVendorAPICall::<TwilioLookupV2Request, TwilioLookupV2APIResponse, idv::twilio::Error>::new();
    mock_twilio_lookup_v2
        .expect_make_request()
        .times(1)
        .return_once(move |_| Ok(idv::tests::fixtures::twilio::create_response()));
    state.set_twilio_lookup_v2(Arc::new(mock_twilio_lookup_v2));
}

#[derive(Clone)]
pub struct ExpectedStatus(pub OnboardingStatus);
#[derive(Clone)]
pub struct ExpectedRequiresManualReview(pub bool);
pub struct OnboardingCompleted(pub ExpectedStatus, pub ExpectedRequiresManualReview);
pub struct OnboardingStatusChanged(pub ExpectedStatus);

// TODO: I think since we are executing the webhook Task's spawned threads, it could be possible these expectations panic but don't necessarily fail the test
// need to check what CI would do that in situation. Possible fixes could be: wrap tests in a runtime we create with unhandled_panic OR wrap mock webhook client in a Mutex and call .checkpoint throughout test
pub fn mock_webhooks(
    state: &mut State,
    expected_ob_status_changed: Vec<OnboardingStatusChanged>,
    expected_ob_completed: Vec<OnboardingCompleted>,
) {
    let mut mock_webhook_client = MockWebhookClient::new();

    for e in expected_ob_status_changed.iter() {
        let expected_status = e.0.clone();

        mock_webhook_client
            .expect_send_event_to_tenant()
            .withf(move |_, w, _| match w {
                WebhookEvent::OnboardingStatusChanged(osc) => osc.new_status == expected_status.0,
                _ => false,
            })
            .times(1)
            .return_once(|_, _, _| Ok(()));
    }

    for e in expected_ob_completed.iter() {
        let expected_status = e.0.clone();
        let expected_requires_manual_review = e.1.clone();
        mock_webhook_client
            .expect_send_event_to_tenant()
            .withf(move |_, w, _| match w {
                WebhookEvent::OnboardingCompleted(obc) => {
                    obc.status == expected_status.0
                        && obc.requires_manual_review == expected_requires_manual_review.0
                }
                _ => false,
            })
            .times(1)
            .return_once(|_, _, _| Ok(()));
    }

    state.set_webhook_client(Arc::new(mock_webhook_client));
}
