use crate::decision::features::risk_signals::risk_signal_group_struct::Doc;
use crate::decision::features::risk_signals::RiskSignalGroupStruct;
use crate::decision::tests::test_helpers::FixtureData;
use crate::decision::tests::test_helpers::{
    self,
};
use crate::decision::vendor::vendor_trait::MockVendorAPICall;
use crate::decision::vendor::{
    self,
};
use crate::FpResult;
use crate::State;
use db::models::data_lifetime::DataLifetime;
use db::models::decision_intent::DecisionIntent;
use db::models::document::Document;
use db::models::document::DocumentUpdate;
use db::models::document::NewDocumentArgs;
use db::models::document_request::DocumentRequest;
use db::models::document_request::NewDocumentRequestArgs;
use db::models::insight_event::CreateInsightEvent;
use db::models::manual_review::ManualReview;
use db::models::manual_review::ManualReviewFilters;
use db::models::ob_configuration::ObConfiguration;
use db::models::onboarding_decision::OnboardingDecision;
use db::models::risk_signal::AtSeqno;
use db::models::risk_signal::RiskSignal;
use db::models::rule_instance::RuleInstance;
use db::models::rule_result::RuleResult;
use db::models::rule_set_result::RuleSetResult;
use db::models::tenant::Tenant;
use db::models::tenant_user::TenantUser;
use db::models::tenant_vendor::TenantVendorControl;
use db::models::tenant_vendor::UpdateTenantVendorControlArgs;
use db::models::user_timeline::UserTimeline;
use db::models::user_timeline::UserTimelineInfo;
use db::models::vault::Vault;
use db::models::verification_request::VerificationRequest;
use db::models::verification_result::VerificationResult;
use db::models::workflow::Workflow;
use db::models::workflow_event::WorkflowEvent;
use db::tests::fixtures::ob_configuration::ObConfigurationOpts;
use db::tests::fixtures::{
    self,
};
use db::DbError;
use db::DbResult;
use db::TxnPgConn;
use db_schema::schema::document_request;
use diesel::prelude::*;
use idv::experian::ExperianCrossCoreRequest;
use idv::experian::ExperianCrossCoreResponse;
use idv::idology::IdologyExpectIDAPIResponse;
use idv::idology::IdologyExpectIDRequest;
use idv::incode::response::OnboardingStartResponse;
use idv::incode::IncodeResponse;
use idv::incode::IncodeStartOnboardingRequest;
use idv::middesk::MiddeskCreateBusinessRequest;
use idv::middesk::MiddeskCreateBusinessResponse;
use idv::twilio::TwilioLookupV2APIResponse;
use idv::twilio::TwilioLookupV2Request;
use itertools::Itertools;
use mockall::predicate::always;
use newtypes::DataLifetimeSeqno;
use newtypes::DbUserTimelineEventKind;
use newtypes::DecisionIntentKind;
use newtypes::DocumentKind;
use newtypes::DocumentRequestConfig;
use newtypes::DocumentRequestKind;
use newtypes::DocumentReviewStatus;
use newtypes::DocumentStatus;
use newtypes::FootprintReasonCode;
use newtypes::OnboardingStatus;
use newtypes::PiiJsonValue;
use newtypes::RiskSignalGroupKind;
use newtypes::ScopedVaultId;
use newtypes::VendorAPI;
use newtypes::WorkflowFixtureResult;
use newtypes::WorkflowId;
use newtypes::WorkflowKind;
use std::sync::Arc;
use strum_macros::EnumIter;
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
    PassWithManualReview,
}
impl DocumentOutcome {
    pub fn footprint_reason_codes(&self) -> Vec<FootprintReasonCode> {
        match &self {
            DocumentOutcome::Success => vec![FootprintReasonCode::DocumentVerified],
            DocumentOutcome::Failure => vec![FootprintReasonCode::DocumentNotVerified],
            DocumentOutcome::DocUploadFailed => vec![FootprintReasonCode::DocumentUploadFailed],
            DocumentOutcome::PassWithManualReview => {
                vec![FootprintReasonCode::DocumentIsPermitOrProvisionalLicense]
            }
        }
    }

    pub fn doc_upload_failed(&self) -> bool {
        matches!(self, Self::DocUploadFailed)
    }

    pub fn doc_failed_for_some_reason(&self) -> bool {
        matches!(self, Self::DocUploadFailed | Self::Failure)
    }

    pub fn expected_onboarding_decision(&self) -> OnboardingStatus {
        match self {
            DocumentOutcome::Success => OnboardingStatus::Pass,
            DocumentOutcome::Failure => OnboardingStatus::Fail,
            DocumentOutcome::DocUploadFailed => OnboardingStatus::Fail,
            DocumentOutcome::PassWithManualReview => OnboardingStatus::Pass,
        }
    }

    pub fn expect_manual_review(&self) -> bool {
        match self {
            DocumentOutcome::Success => false,
            DocumentOutcome::Failure => false,
            DocumentOutcome::DocUploadFailed => true,
            DocumentOutcome::PassWithManualReview => true,
        }
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

#[derive(EnumIter, PartialEq, Eq, Debug)]
pub enum AmlKind {
    Ofac,
    Pep,
    Am,
}

pub async fn setup_data(
    state: &State,
    obc_opts: ObConfigurationOpts,
    fixture_result: Option<WorkflowFixtureResult>,
) -> (Workflow, Tenant, ObConfiguration, TenantUser) {
    let FixtureData {
        t: tenant, wf, obc, ..
    } = test_helpers::create_kyc_user_and_wf(state, obc_opts, fixture_result, None).await;

    let tid = tenant.id.clone();
    let tu = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            // only enable Idology for this dummy test merchant
            let args = UpdateTenantVendorControlArgs {
                idology_enabled: Some(true),
                ..Default::default()
            };
            TenantVendorControl::update_or_create(conn, &tid, args).unwrap();
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
    Vec<ManualReview>,
    Option<OnboardingDecision>,
    Vec<RiskSignal>,
) {
    let svid = sv_id.clone();
    let wfid = wf_id.clone();
    state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let rs = RiskSignal::latest_by_risk_signal_group_kinds(conn, &svid, AtSeqno(None))
                .unwrap()
                .into_iter()
                .map(|(_, rs)| rs)
                .collect();

            let wf = Workflow::get(conn, &wfid)?;
            let obd = OnboardingDecision::get_active(conn, &wfid)?;
            let mr_filters = ManualReviewFilters::get_active();
            let mrs = ManualReview::get(conn, &svid, mr_filters)?;
            let wfe = WorkflowEvent::list_for_workflow(conn, &wfid)?;

            Ok((wf, wfe, mrs, obd, rs))
        })
        .await
        .unwrap()
}

pub async fn query_portablized_seqno(state: &State, sv_id: &ScopedVaultId) -> Option<DataLifetimeSeqno> {
    let sv_id = sv_id.clone();
    let dls = state
        .db_pool
        .db_query(move |conn| {
            let seqno = DataLifetime::get_current_seqno(conn).unwrap();
            DataLifetime::bulk_get_active_at(conn, vec![&sv_id], seqno)
        })
        .await
        .unwrap();
    let portablized_seqnos = dls.iter().filter_map(|dl| dl.portablized_seqno).collect_vec();
    if !portablized_seqnos.is_empty() {
        // Make sure data is portablized together
        assert_eq!(portablized_seqnos.iter().unique().count(), 1);
    }
    portablized_seqnos.into_iter().next()
}

pub async fn query_risk_signals(
    state: &State,
    sv_id: &ScopedVaultId,
    kind: RiskSignalGroupKind,
) -> Vec<RiskSignal> {
    let s = sv_id.clone();
    state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            Ok(RiskSignal::latest_by_risk_signal_group_kind(conn, &s, kind)?)
        })
        .await
        .unwrap()
}

pub async fn query_doc_requests(state: &State, wf_id: &WorkflowId) -> Vec<DocumentRequest> {
    let w = wf_id.clone();
    state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            document_request::table
                .filter(document_request::workflow_id.eq(w))
                .get_results(conn)
                .map_err(DbError::from)
        })
        .await
        .unwrap()
}

pub async fn query_rule_set_result(
    state: &State,
    sv_id: &ScopedVaultId,
) -> Option<(RuleSetResult, Vec<(RuleResult, RuleInstance)>)> {
    let s = sv_id.clone();
    state
        .db_pool
        .db_query(move |conn| RuleSetResult::latest_workflow_decision(conn, &s).map_err(DbError::from))
        .await
        .unwrap()
}

pub async fn query_timeline_events(
    state: &State,
    sv_id: &ScopedVaultId,
    kinds: Vec<DbUserTimelineEventKind>,
) -> Vec<UserTimelineInfo> {
    let svid = sv_id.clone();
    state
        .db_pool
        .db_query(move |conn| -> DbResult<_> { UserTimeline::list(conn, &svid, kinds) })
        .await
        .unwrap()
}

pub struct WithHit(pub Vec<AmlKind>);
pub fn mock_incode(state: &mut State, with_hit: WithHit) {
    let lists: Vec<String> = with_hit
        .0
        .into_iter()
        .map(|k| match k {
            AmlKind::Ofac => "sanction".to_owned(),
            AmlKind::Pep => "pep-class-1".to_owned(),
            AmlKind::Am => "adverse-media".to_owned(),
        })
        .collect::<Vec<_>>();
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

    let res = idv::tests::fixtures::incode::watchlist_result_response(lists);

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
                None,
            ))
        });
    state.set_idology_expect_id(Arc::new(mock_idology_expect_id));
}

pub fn mock_idology_pa_hit(state: &mut State, aml_kinds: Vec<AmlKind>) {
    let pa_lists = aml_kinds
        .into_iter()
        .map(|k| match k {
            AmlKind::Ofac => "Office of Foreign Asset Control".to_owned(),
            AmlKind::Pep => "Politically Exposed Persons".to_owned(),
            AmlKind::Am => panic!("idology cannot return adverse media hits"),
        })
        .collect();
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
                "result.match.restricted".to_owned(),
                None,
                Some(pa_lists),
            ))
        });
    state.set_idology_expect_id(Arc::new(mock_idology_expect_id));
}

fn mock_idology_error(state: &mut State, error: idv::idology::error::Error) {
    let mut mock_idology_expect_id = MockVendorAPICall::<
        IdologyExpectIDRequest,
        IdologyExpectIDAPIResponse,
        idv::idology::error::Error,
    >::new();
    mock_idology_expect_id
        .expect_make_request()
        .times(1)
        .return_once(move |_| Err(error));
    state.set_idology_expect_id(Arc::new(mock_idology_expect_id));
}

pub fn mock_idology_hard_error(state: &mut State) {
    mock_idology_error(state, idv::idology::error::Error::UnknownError("oops".to_owned()));
}

pub fn mock_idology_parseable_error(state: &mut State) {
    mock_idology_error(
        state,
        idv::idology::error::Error::ErrorWithResponse(Box::new(idv::idology::error::ErrorWithResponse {
            error: idv::idology::error::Error::UnknownError("Last name is too short yo".to_owned()),
            response: PiiJsonValue::new(
                serde_json::json!({"response":{"error":"Last name is too short","id-scan":null,"results":null,"id-number":null,"qualifiers":null,"restriction":null,"summary-result":null}}),
            ),
        })),
    );
}

pub struct WithSsnResultCode(pub Option<&'static str>);
pub struct WithScore(pub Option<&'static str>);
pub fn mock_experian(state: &mut State, ssn_result_code: WithSsnResultCode, score: WithScore) {
    let mut mock_experian = MockVendorAPICall::<
        ExperianCrossCoreRequest,
        ExperianCrossCoreResponse,
        idv::experian::error::Error,
    >::new();
    mock_experian
        .expect_make_request()
        .times(1)
        .return_once(move |_| {
            Ok(idv::tests::fixtures::experian::create_response(
                ssn_result_code.0,
                score.0,
            ))
        });
    state.set_experian_cross_core(Arc::new(mock_experian));
}

fn mock_experian_error(state: &mut State, error: idv::experian::error::Error) {
    let mut mock_experian = MockVendorAPICall::<
        ExperianCrossCoreRequest,
        ExperianCrossCoreResponse,
        idv::experian::error::Error,
    >::new();
    mock_experian
        .expect_make_request()
        .times(1)
        .return_once(move |_| Err(error));
    state.set_experian_cross_core(Arc::new(mock_experian));
}

pub fn mock_experian_hard_error(state: &mut State) {
    mock_experian_error(state, idv::experian::error::Error::UserNamePasswordError);
}

pub fn mock_experian_parseable_error(state: &mut State) {
    mock_experian_error(
        state,
        idv::experian::error::Error::ErrorWithResponse(Box::new(idv::experian::error::ErrorWithResponse {
            error: idv::experian::error::Error::ResponseError(
                idv::experian::error::CrossCoreResponseError::Error(
                    idv::experian::cross_core::error_code::ErrorCode::InvalidSurname,
                    "018".to_owned(),
                ),
            ),
            response: PiiJsonValue::new(
                serde_json::json!({"responseHeader":{"category":null,"tenantId":"abc123","messageTime":"2023-11-29T15:31:06Z","requestType":"PreciseIdOnly","expRequestId":"abc123","responseCode":"R0201","responseType":"INFO","overallResponse":{"score":null,"decision":null,"decisionText":null,"spareObjects":[],"decisionReasons":[],"recommendedNextActions":[]},"responseMessage":"Workflow Complete.","clientReferenceId":"vreq_abc"},"clientResponsePayload":{"decisionElements":[{"matches":null,"decisions":null,"otherData":{"json":{"fraudSolutions":{"response":{"products":{"preciseIdServer":{"error":{"errorCode":"106","reportDate":"11292023","reportTime":"093108","actionIndicator":{"code":"C","value":""},"referenceNumber":"vreq_abc","errorDescription":"Invalid surname"},"header":"<SCRUBBED>","summary":null,"glbDetail":null,"ipAddress":"<SCRUBBED>","onFileSsn":"<SCRUBBED>","sessionId":null,"preciseMatch":null,"pidxmlversion":"06.00"},"customerManagement":null}}}}},"applicantId":"Contact1","serviceName":"PreciseId","warningsErrors":[{"responseCode":"106","responseType":"ERROR","responseMessage":"Invalid surname"}],"normalizedScore":-1}],"orchestrationDecisions":[]}}),
            ),
        })),
    );
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

#[derive(Clone, Debug, derive_more::Display)]
pub struct ExpectedStatus(pub OnboardingStatus);

#[derive(Clone, Debug, derive_more::Display)]
pub struct ExpectedRequiresManualReview(pub bool);

#[derive(Debug)]
pub struct OnboardingCompleted(pub ExpectedStatus, pub ExpectedRequiresManualReview);

impl std::fmt::Display for OnboardingCompleted {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        <Self as std::fmt::Debug>::fmt(self, f)
    }
}

impl predicates::reflection::PredicateReflection for OnboardingCompleted {}

impl mockall::Predicate<WebhookEvent> for OnboardingCompleted {
    fn eval(&self, w: &WebhookEvent) -> bool {
        match w {
            WebhookEvent::OnboardingCompleted(osc) => {
                osc.status == self.0 .0 && osc.requires_manual_review == self.1 .0
            }
            _ => false,
        }
    }
}

#[derive(Debug)]
pub struct OnboardingStatusChanged(pub ExpectedStatus, pub ExpectedRequiresManualReview);

impl std::fmt::Display for OnboardingStatusChanged {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        <Self as std::fmt::Debug>::fmt(self, f)
    }
}

impl predicates::reflection::PredicateReflection for OnboardingStatusChanged {}

impl mockall::Predicate<WebhookEvent> for OnboardingStatusChanged {
    fn eval(&self, w: &WebhookEvent) -> bool {
        match w {
            WebhookEvent::OnboardingStatusChanged(osc) => {
                osc.new_status == self.0 .0 && osc.requires_manual_review == self.1 .0
            }
            _ => false,
        }
    }
}

// TODO: I think since we are executing the webhook Task's spawned threads, it could be possible
// these expectations panic but don't necessarily fail the test need to check what CI would do that
// in situation. Possible fixes could be: wrap tests in a runtime we create with unhandled_panic OR
// wrap mock webhook client in a Mutex and call .checkpoint throughout test
pub fn mock_webhooks(
    state: &mut State,
    expected_ob_status_changed: Vec<OnboardingStatusChanged>,
    expected_ob_completed: Vec<OnboardingCompleted>,
) {
    let mut mock_webhook_client = MockWebhookClient::new();

    for e in expected_ob_status_changed {
        mock_webhook_client
            .expect_send_event_to_tenant()
            .with(always(), always(), always(), e, always())
            .times(1)
            .return_once(|_, _, _, _, _| Ok(()));
    }

    for e in expected_ob_completed {
        mock_webhook_client
            .expect_send_event_to_tenant()
            .with(always(), always(), always(), e, always())
            .times(1)
            .return_once(|_, _, _, _, _| Ok(()));
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
) -> FpResult<VerificationResult> {
    let di = DecisionIntent::get_or_create_for_workflow(conn, sv_id, wf_id, DecisionIntentKind::DocScan)?;
    let vreq = VerificationRequest::create(conn, (sv_id, &di.id, vendor_api).into())?;
    let e_response = vendor::verification_result::encrypt_verification_result_response(
        &response.clone().into(),
        &vault.public_key,
    )?;
    let vres = VerificationResult::create(conn, vreq.id, response.into(), e_response, false)?;

    Ok(vres)
}

// TODO: we need to simulate actually collecting a document, but incode machine is not currently
// mockable.
pub async fn mock_incode_doc_collection(
    state: &State,
    scoped_vault_id: ScopedVaultId,
    document_frcs: Vec<FootprintReasonCode>,
    wf_id: WorkflowId,
    create_doc_request: bool,
) {
    state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let vault = Vault::get(conn.conn(), &scoped_vault_id).unwrap();

            if create_doc_request
                && DocumentRequest::get(conn, &wf_id, DocumentRequestKind::Identity)
                    .unwrap()
                    .is_none()
            {
                // we need a doc request in order to indicate to the decision engine that we should include
                // document rules in decisioning
                let config = DocumentRequestConfig::Identity {
                    collect_selfie: false,
                };
                let args = NewDocumentRequestArgs {
                    scoped_vault_id: scoped_vault_id.clone(),
                    workflow_id: wf_id.clone(),
                    rule_set_result_id: None,
                    config,
                };
                let dr = DocumentRequest::create(conn, args).unwrap();
                let doc_args = NewDocumentArgs {
                    request_id: dr.id,
                    document_type: DocumentKind::DriversLicense,
                    country_code: Some(newtypes::Iso3166TwoDigitCountryCode::US),
                    fixture_result: None,
                    skip_selfie: None,
                    device_type: None,
                    insight: CreateInsightEvent::default(),
                };
                let doc = Document::get_or_create(conn, doc_args);
                let doc = doc.unwrap();

                // And mock out this part of complete.rs
                let wf = Workflow::get(conn, &wf_id)?;
                let terminal_review_status = match wf.kind {
                    // Documents in a document workflow must always be reviewed by a human
                    WorkflowKind::Document => DocumentReviewStatus::PendingHumanReview,
                    _ => DocumentReviewStatus::ReviewedByMachine,
                };
                let update = DocumentUpdate {
                    status: Some(DocumentStatus::Complete),
                    review_status: Some(terminal_review_status),
                    ..Default::default()
                };
                Document::update(conn, &doc.id, update)?;
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

            let footprint_reason_codes = document_frcs
                .into_iter()
                .map(|frc| (frc, VendorAPI::IncodeFetchScores, vres.id.clone()))
                .collect();
            let rsg = RiskSignalGroupStruct::<Doc> {
                footprint_reason_codes,
                group: Doc,
            };
            // incode state machine defaults this to not hidden
            let rcs = rsg.footprint_reason_codes;
            RiskSignal::bulk_create(conn, &scoped_vault_id, rcs, RiskSignalGroupKind::Doc, false)?;

            Ok(())
        })
        .await
        .unwrap();
}
