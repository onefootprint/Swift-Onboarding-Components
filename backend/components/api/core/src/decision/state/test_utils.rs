use std::sync::Arc;

use crate::decision::features::risk_signals::risk_signal_group_struct::Doc;
use crate::decision::features::risk_signals::{save_risk_signals, RiskSignalGroupStruct};
use crate::decision::vendor;
use crate::decision::vendor::vendor_trait::MockVendorAPICall;
use crate::errors::ApiResult;
use crate::ApiError;
use crate::{decision::tests::test_helpers, State};
use db::models::decision_intent::DecisionIntent;
use db::models::document_request::{DocumentRequest, NewDocumentRequestArgs};
use db::models::fingerprint::Fingerprint;
use db::models::manual_review::ManualReview;
use db::models::onboarding_decision::OnboardingDecision;
use db::models::risk_signal::{IncludeHidden, RiskSignal};
use db::models::vault::Vault;
use db::models::verification_request::VerificationRequest;
use db::models::verification_result::VerificationResult;
use db::models::workflow_event::WorkflowEvent;
use db::models::{
    ob_configuration::ObConfiguration, tenant::Tenant, tenant_user::TenantUser,
    tenant_vendor::TenantVendorControl, workflow::Workflow,
};
use db::tests::fixtures;
use db::tests::fixtures::ob_configuration::ObConfigurationOpts;
use db::TxnPgConn;
use idv::experian::{ExperianCrossCoreRequest, ExperianCrossCoreResponse};
use idv::idology::IdologyExpectIDAPIResponse;
use idv::idology::IdologyExpectIDRequest;
use idv::incode::response::OnboardingStartResponse;

use idv::incode::IncodeResponse;
use idv::incode::IncodeStartOnboardingRequest;
use idv::middesk::{MiddeskCreateBusinessRequest, MiddeskCreateBusinessResponse};
use idv::twilio::TwilioLookupV2APIResponse;
use idv::twilio::TwilioLookupV2Request;
use newtypes::OnboardingStatus;
use newtypes::{
    DecisionIntentKind, FootprintReasonCode, RiskSignalGroupKind, ScopedVaultId, VendorAPI,
    WorkflowFixtureResult, WorkflowId,
};
use webhooks::events::WebhookEvent;
use webhooks::MockWebhookClient;

#[derive(Clone, Copy, Debug)]
pub enum UserKind {
    Demo,
    Sandbox(WorkflowFixtureResult),
    Live,
}
impl UserKind {
    pub fn fixture_result(&self) -> Option<WorkflowFixtureResult> {
        match self {
            UserKind::Demo => None,
            UserKind::Sandbox(s) => Some(*s),
            UserKind::Live => None,
        }
    }

    pub fn is_live(&self) -> bool {
        match self {
            UserKind::Demo => true,
            UserKind::Sandbox(_) => false,
            UserKind::Live => true,
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum DocumentOutcome {
    Success,
    Failure,
    DocUploadFailed,
}
impl DocumentOutcome {
    pub fn footprint_reason_code(&self) -> Option<FootprintReasonCode> {
        match &self {
            DocumentOutcome::Success => Some(FootprintReasonCode::DocumentVerified),
            DocumentOutcome::Failure => Some(FootprintReasonCode::DocumentNotVerified),
            DocumentOutcome::DocUploadFailed => None,
        }
    }

    pub fn doc_upload_failed(&self) -> bool {
        matches!(self, Self::DocUploadFailed)
    }

    pub fn doc_failed_for_some_reason(&self) -> bool {
        matches!(self, Self::DocUploadFailed | Self::Failure)
    }
}
#[derive(Clone, Copy, Debug)]
pub enum DocumentCollectionKind {
    DocumentRequested(DocumentOutcome),
    DocumentNotRequested,
}

impl DocumentCollectionKind {
    pub fn doc_requested(self) -> Option<DocumentOutcome> {
        match self {
            DocumentCollectionKind::DocumentRequested(outcome) => Some(outcome),
            DocumentCollectionKind::DocumentNotRequested => None,
        }
    }
}

pub async fn setup_data(
    state: &State,
    obc_opts: ObConfigurationOpts,
    fixture_result: Option<WorkflowFixtureResult>,
) -> (Workflow, Tenant, ObConfiguration, TenantUser) {
    let (tenant, wf, _, _, obc) =
        test_helpers::create_kyc_user_and_wf(&state.db_pool, &state.enclave_client, obc_opts, fixture_result)
            .await;

    let tid = tenant.id.clone();
    let tu = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            // only enable Idology for this dummy test merchant
            TenantVendorControl::create(conn, tid, true, false, None, None).unwrap();
            let tu = fixtures::tenant_user::create(conn);
            Ok(tu)
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
            let rs = RiskSignal::latest_by_risk_signal_group_kinds(conn, &svid, IncludeHidden(false))
                .unwrap()
                .into_iter()
                .map(|(_, rs)| rs)
                .collect();

            let wf = Workflow::get(conn, &wfid).unwrap();
            let obd = OnboardingDecision::get_active(conn, &wfid).unwrap();
            let mr = ManualReview::get_active(conn, &wfid).unwrap();
            let wfe = WorkflowEvent::list_for_workflow(conn, &wfid).unwrap();

            let fps = Fingerprint::_list_for_scoped_vault(conn, &svid).unwrap();

            (wf, wfe, mr, obd, rs, fps)
        })
        .await
        .unwrap()
}

pub async fn query_risk_signals(
    state: &State,
    sv_id: &ScopedVaultId,
    kind: RiskSignalGroupKind,
) -> Vec<RiskSignal> {
    let s = sv_id.clone();
    state
        .db_pool
        .db_query(move |conn| RiskSignal::latest_by_risk_signal_group_kind(conn, &s, kind).unwrap())
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

pub fn mock_idology_error(state: &mut State) {
    let mut mock_idology_expect_id = MockVendorAPICall::<
        IdologyExpectIDRequest,
        IdologyExpectIDAPIResponse,
        idv::idology::error::Error,
    >::new();
    mock_idology_expect_id
        .expect_make_request()
        .times(1)
        .return_once(move |_| Err(idv::idology::error::Error::UnknownError("oops".to_owned())));
    state.set_idology_expect_id(Arc::new(mock_idology_expect_id));
}

pub fn mock_experian(state: &mut State) {
    let mut mock_experian = MockVendorAPICall::<
        ExperianCrossCoreRequest,
        ExperianCrossCoreResponse,
        idv::experian::error::Error,
    >::new();
    mock_experian
        .expect_make_request()
        .times(1)
        .return_once(move |_| Ok(idv::tests::fixtures::experian::create_response()));
    state.set_experian_cross_core(Arc::new(mock_experian));
}

pub fn mock_experian_error(state: &mut State) {
    let mut mock_experian = MockVendorAPICall::<
        ExperianCrossCoreRequest,
        ExperianCrossCoreResponse,
        idv::experian::error::Error,
    >::new();
    mock_experian
        .expect_make_request()
        .times(1)
        .return_once(move |_| Err(idv::experian::error::Error::UserNamePasswordError));
    state.set_experian_cross_core(Arc::new(mock_experian));
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

pub fn mock_middesk(state: &mut State, business_id: &str) {
    let business_id = business_id.to_owned();
    let mut mock_middesk_create_business = MockVendorAPICall::<
        MiddeskCreateBusinessRequest,
        MiddeskCreateBusinessResponse,
        idv::middesk::Error,
    >::new();
    mock_middesk_create_business
        .expect_make_request()
        .times(1)
        .return_once(move |_| {
            Ok(idv::tests::fixtures::middesk::create_business_response(
                &business_id,
            ))
        });
    state.set_middesk_create_business(Arc::new(mock_middesk_create_business));
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

pub fn save_vres_for_doc_fixture_risk_signals(
    conn: &mut TxnPgConn,
    sv_id: &ScopedVaultId,
    vault: &Vault,
    response: serde_json::Value,
    vendor_api: VendorAPI,
    wf_id: &WorkflowId,
) -> Result<VerificationResult, ApiError> {
    let di = DecisionIntent::get_or_create_for_workflow(conn, sv_id, wf_id, DecisionIntentKind::DocScan)?;
    let vreq = VerificationRequest::create(conn, sv_id, &di.id, vendor_api)?;
    let e_response = vendor::verification_result::encrypt_verification_result_response(
        &response.clone().into(),
        &vault.public_key,
    )?;
    let vres = VerificationResult::create(conn, vreq.id, response.into(), e_response, false)?;

    Ok(vres)
}

// TODO: we need to simulate actually collecting a document, but incode machine is not currently mockable.
pub async fn mock_incode_doc_collection(
    state: &State,
    scoped_vault_id: ScopedVaultId,
    document_outcome: DocumentOutcome,
    wf_id: WorkflowId,
    create_doc_request: bool,
) {
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let vault = Vault::get(conn.conn(), &scoped_vault_id).unwrap();

            if create_doc_request {
                // we need a doc request in order to indicate to the decision engine that we should include document rules in decisioning
                let args = NewDocumentRequestArgs {
                    scoped_vault_id: scoped_vault_id.clone(),
                    ref_id: None,
                    workflow_id: wf_id.clone(),
                    should_collect_selfie: false,
                    global_doc_types_accepted: None,
                    country_restrictions: vec![],
                    country_doc_type_restrictions: None,
                };
                DocumentRequest::create(conn, args).unwrap();
            }

            let vres = save_vres_for_doc_fixture_risk_signals(
                conn,
                &scoped_vault_id,
                &vault,
                serde_json::to_value(
                    idv::incode::doc::response::FetchScoresResponse::fixture_response(None).unwrap(),
                )
                .unwrap(),
                VendorAPI::IncodeFetchScores,
                &wf_id,
            )
            .unwrap();

            // If we are simulating document not being able to be uploaded, we won't have risk signals saved
            if let Some(frc) = document_outcome.footprint_reason_code() {
                let rsg = RiskSignalGroupStruct::<Doc> {
                    footprint_reason_codes: vec![(frc, VendorAPI::IncodeFetchScores, vres.id)],
                    group: Doc,
                };
                // incode state machine defaults this to not hidden
                save_risk_signals(conn, &scoped_vault_id, &rsg, false).unwrap();
            }

            Ok(())
        })
        .await
        .unwrap();
}
