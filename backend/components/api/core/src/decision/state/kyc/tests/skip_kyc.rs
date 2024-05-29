use crate::decision::state::actions::Authorize;
use crate::decision::state::test_utils::UserKind::{
    self,
    *,
};
use crate::decision::state::test_utils::{
    mock_incode_doc_collection,
    mock_webhooks,
    query_data,
    setup_data,
    DocumentOutcome as Doc,
    ExpectedRequiresManualReview,
    ExpectedStatus,
    OnboardingCompleted,
    OnboardingStatusChanged,
};
use crate::decision::state::{
    WorkflowActions,
    WorkflowWrapper,
};
use crate::State;
use db::tests::fixtures::ob_configuration::ObConfigurationOpts;
use macros::test_state_case;
use newtypes::OnboardingStatus::{
    self,
    *,
};
use newtypes::{
    CollectedDataOption as CDO,
    CountryRestriction,
    DocTypeRestriction,
    DocumentCdoInfo,
    KycState,
    Selfie,
    SignalScope,
    WorkflowFixtureResult as Fixture,
    WorkflowState,
};

struct Review(bool);

#[test_state_case(Live, Doc::Success, (Pass, Review(false)))]
#[test_state_case(Live, Doc::Failure, (Fail, Review(false)))]
#[test_state_case(Live, Doc::DocUploadFailed, (Fail, Review(true)))]
#[test_state_case(Sandbox(Fixture::DocumentDecision), Doc::Success, (Pass, Review(false)))]
#[test_state_case(Sandbox(Fixture::DocumentDecision), Doc::Failure, (Fail, Review(false)))]
#[test_state_case(Sandbox(Fixture::DocumentDecision), Doc::DocUploadFailed, (Fail, Review(true)))]
#[test_state_case(Sandbox(Fixture::Pass), Doc::Success, (Pass, Review(false)))]
#[test_state_case(Sandbox(Fixture::Pass), Doc::Failure, (Fail, Review(false)))]
#[test_state_case(Sandbox(Fixture::Pass), Doc::DocUploadFailed, (Fail, Review(true)))]
#[test_state_case(Sandbox(Fixture::Fail), Doc::Success, (Pass, Review(false)))]
#[test_state_case(Sandbox(Fixture::Fail), Doc::Failure, (Fail, Review(false)))]
#[test_state_case(Sandbox(Fixture::Fail), Doc::DocUploadFailed, (Fail, Review(true)))]
#[tokio::test(flavor = "multi_thread", worker_threads = 1)]
async fn collect_doc_skip_kyc(
    state: &mut State,
    user_kind: UserKind,
    document_outcome: Doc,
    expected: (OnboardingStatus, Review),
) {
    let (expected_status, expected_review) = expected;
    // DATA SETUP
    let (wf, _t, _obc, _tu) = setup_data(
        state,
        ObConfigurationOpts {
            is_live: user_kind.is_live(),
            skip_kyc: true,
            must_collect_data: vec![
                CDO::PhoneNumber,
                CDO::FullAddress,
                CDO::Document(DocumentCdoInfo(
                    DocTypeRestriction::None,
                    CountryRestriction::None,
                    Selfie::None,
                )),
            ],
            ..Default::default()
        },
        user_kind.fixture_result(),
    )
    .await;

    let wfid = wf.id.clone();
    let svid = wf.scoped_vault_id.clone();
    let svid2 = svid.clone();

    let ww = WorkflowWrapper::init(state, wf).await.unwrap();

    // MOCKING
    // No Idology/Experian KYC calls are mocked, we expect these to not be called because skip_kyc =
    // true only Incode doc calls are mocked
    mock_incode_doc_collection(
        state,
        svid2,
        document_outcome.footprint_reason_codes(),
        wfid.clone(),
        false,
    )
    .await;

    // TESTS
    //
    // Expect Webhooks
    mock_webhooks(
        state,
        vec![
            OnboardingStatusChanged(
                ExpectedStatus(OnboardingStatus::Pending),
                ExpectedRequiresManualReview(false),
            ),
            OnboardingStatusChanged(
                ExpectedStatus(expected_status),
                ExpectedRequiresManualReview(expected_review.0),
            ),
        ],
        vec![OnboardingCompleted(
            ExpectedStatus(expected_status),
            ExpectedRequiresManualReview(expected_review.0),
        )],
    );

    let _ww = ww
        .run(state, WorkflowActions::Authorize(Authorize {}))
        .await
        .unwrap();

    let (wf, _, _, _, rs) = query_data(state, &svid, &wfid).await;
    assert_eq!(WorkflowState::Kyc(KycState::Complete), wf.state);
    assert_eq!(expected_status, wf.status.unwrap());

    // Only Doc risk signals are produced (no Kyc risk signals produced)
    assert!(rs
        .iter()
        .all(|r| matches!(r.reason_code.scope(), Some(SignalScope::Document))));
}
