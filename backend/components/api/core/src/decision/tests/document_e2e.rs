use crate::{
    decision::{self, document::meta_headers::MetaHeaders, state::test_utils::query_risk_signals},
    utils::file_upload::FileUpload,
    State,
};
use api_wire_types::{CreateIdentityDocumentRequest, DocumentResponse};
use chrono::Utc;
use db::{
    models::{
        document_request::{DocumentRequest, NewDocumentRequestArgs},
        identity_document::IdentityDocument,
        incode_verification_session::IncodeVerificationSession,
        incode_verification_session_event::IncodeVerificationSessionEvent,
        insight_event::InsightEvent,
        user_consent::UserConsent,
        vault::Vault,
        workflow::Workflow,
    },
    test_helpers::assert_have_same_elements,
    tests::fixtures::ob_configuration::ObConfigurationOpts,
    DbResult,
};

use macros::test_state_case;
use newtypes::{
    CollectedDataOption, CountryRestriction, DocTypeRestriction, DocumentCdoInfo, DocumentRequestConfig,
    DocumentRequestKind, DocumentSide, IdDocKind, IdentityDocumentFixtureResult, IdentityDocumentId,
    IdentityDocumentStatus, IncodeVerificationSessionState, Iso3166TwoDigitCountryCode, PiiBytes,
    RiskSignalGroupKind, ScopedVaultId, Selfie, TenantId, WorkflowFixtureResult,
};

use super::document_test_utils::{
    mock_enclave_s3_client, mock_ff_client, mock_incode_request, mock_s3_put_object, DocumentUploadTestCase,
    UserKind,
};

#[test_state_case(UserKind::Live, Selfie::RequireSelfie)]
#[test_state_case(UserKind::Live, Selfie::None)]
#[test_state_case(UserKind::Sandbox(IdentityDocumentFixtureResult::Pass), Selfie::RequireSelfie)]
#[test_state_case(UserKind::Sandbox(IdentityDocumentFixtureResult::Pass), Selfie::None)]
#[test_state_case(UserKind::Sandbox(IdentityDocumentFixtureResult::Real), Selfie::None)]
#[test_state_case(UserKind::Sandbox(IdentityDocumentFixtureResult::Real), Selfie::RequireSelfie)]
#[tokio::test]
async fn test_e2e_document_upload_for_all_identity_document_types(
    state: &mut State,
    user_kind: UserKind,
    require_selfie: Selfie,
) {
    // TODOO: validate_doc_type_is_allowed failing
    // TODO: erroring if no doc req
    // TODO: assert usertimeline
    // TODO: assert specific risk signals based on incode response OR sandbox fixture
    // TODO: mock incode failing and having to redo a state (new test)
    // TODO: mock incode failing until moving on 3x (new test)
    // TODO: (later) incode 500ing, selfie 6000
    // TODO: assert failure reasons
    // TODO: check vaulted_doc_type
    // TODO: skip selfie?
    // TODO: going back to create a new iddoc?
    // TODO: demo
    // TODO: assert ordering of state transitions!

    //
    // Setup
    //
    for doc_type in IdDocKind::identity_docs() {
        // can't use map bc closure + mutable ref for state
        let test_case = DocumentUploadTestCase::new(user_kind, doc_type, require_selfie);
        e2e_inner(state, test_case).await;
    }
}

#[test_state_case(UserKind::Live)]
#[test_state_case(UserKind::Sandbox(IdentityDocumentFixtureResult::Pass))]
#[tokio::test]
async fn test_proof_of_ssn(state: &mut State, user_kind: UserKind) {
    let test_case = DocumentUploadTestCase::new(user_kind, IdDocKind::SsnCard, Selfie::None);

    e2e_inner(state, test_case).await;
}

#[test_state_case(UserKind::Live)]
#[test_state_case(UserKind::Sandbox(IdentityDocumentFixtureResult::Pass))]
#[tokio::test]
async fn test_proof_of_address(state: &mut State, user_kind: UserKind) {
    for doc_type in IdDocKind::proof_of_address_docs() {
        let test_case = DocumentUploadTestCase::new(user_kind, doc_type, Selfie::None);

        e2e_inner(state, test_case).await;
    }
}

async fn e2e_inner(state: &mut State, test_case: DocumentUploadTestCase) {
    let obc_opts = ObConfigurationOpts {
        must_collect_data: vec![CollectedDataOption::Document(DocumentCdoInfo(
            DocTypeRestriction::None,
            CountryRestriction::None,
            test_case.require_selfie,
        ))],
        is_live: test_case.user_is_live(),
        ..Default::default()
    };
    let user_fixture_result = match test_case.user_kind {
        UserKind::Live => None,
        UserKind::Sandbox(_) => Some(WorkflowFixtureResult::Pass), // not important here
        UserKind::Demo => todo!(),
    };
    let (t, wf, v, sv, _obc) =
        super::test_helpers::create_kyc_user_and_wf(state, obc_opts, user_fixture_result).await;

    // Save proof of SSN doc req
    let doc_kind: DocumentRequestKind = test_case.document_type.into();
    if !doc_kind.is_identity() {
        let config = match doc_kind {
            DocumentRequestKind::Identity => DocumentRequestConfig::Identity {
                collect_selfie: false,
            },
            DocumentRequestKind::ProofOfAddress => DocumentRequestConfig::ProofOfAddress {},
            DocumentRequestKind::ProofOfSsn => DocumentRequestConfig::ProofOfSsn {},
            // Don't support custom doc requests in these tests yet
            DocumentRequestKind::Custom => todo!(),
        };
        let args = NewDocumentRequestArgs {
            scoped_vault_id: sv.id.clone(),
            workflow_id: wf.id.clone(),
            rule_set_result_id: None,
            config,
        };

        state
            .db_pool
            .db_query(move |conn| DocumentRequest::create(conn, args))
            .await
            .unwrap();
    }

    let wf_id = wf.id.clone();
    let id_doc_req = CreateIdentityDocumentRequest {
        document_type: test_case.document_type,
        country_code: Some(Iso3166TwoDigitCountryCode::US),
        fixture_result: test_case.identity_doc_fixture(),
        skip_selfie: None,
        device_type: None,
    };
    state
        .db_pool
        .db_transaction(move |conn| -> DbResult<_> {
            let ie = InsightEvent::get(conn, &wf_id)?.unwrap();

            let note = "I, Bob Boberto, consent to NOTHING".into();
            UserConsent::create(conn, Utc::now(), ie.id, note, false, wf_id)?;
            Ok(())
        })
        .await
        .unwrap();

    //
    // START
    //
    mock_ff_client(state, test_case.identity_doc_fixture(), t.id.clone());
    let identity_doc_id = decision::document::route_handler::handle_document_create(
        state,
        id_doc_req,
        t.id.clone(),
        sv.id.clone(),
        wf.id.clone(),
    )
    .await
    .unwrap();

    //
    // UPLOAD AND PROCESS
    //
    upload_and_process(
        state,
        test_case.clone(),
        wf,
        t.id.clone(),
        sv.id.clone(),
        v,
        identity_doc_id.clone(),
    )
    .await;
    let sv_id = sv.id.clone();
    assertions(state, test_case, &sv_id, identity_doc_id).await;
}

// util to upload and process until completion an iddoc
async fn upload_and_process(
    state: &mut State,
    test_case: DocumentUploadTestCase,
    workflow: Workflow,
    tenant_id: TenantId,
    sv_id: ScopedVaultId,
    vault: Vault,
    document_id: IdentityDocumentId,
) -> DocumentResponse {
    // only make incode requests for live users
    if test_case.make_incode_calls() {
        mock_incode_request(state, test_case.document_type, test_case.requires_selfie());
    }

    let mut sides = test_case.document_type.sides();
    if test_case.requires_selfie() {
        sides.push(DocumentSide::Selfie)
    }
    let mut ptr = 0;
    let mut curr_side = sides[ptr];

    // Simulate uploading and processing each side of the document
    loop {
        // Mock incode requests
        let res = upload_and_process_inner(
            state,
            workflow.clone(),
            sv_id.clone(),
            document_id.clone(),
            tenant_id.clone(),
            vault.clone(),
            curr_side,
            &test_case,
        )
        .await;
        ptr += 1;
        if ptr == sides.len() {
            break res;
        } else {
            curr_side = sides[ptr]
        }
    }
}

#[allow(clippy::too_many_arguments)]
async fn upload_and_process_inner(
    state: &mut State,
    workflow: Workflow,
    sv_id: ScopedVaultId,
    document_id: IdentityDocumentId,
    tenant_id: TenantId,
    vault: Vault,
    side: DocumentSide,
    test_case: &DocumentUploadTestCase,
) -> DocumentResponse {
    let file_upload = FileUpload::new_simple(PiiBytes::new(vec![1, 2, 3, 4]), "f".into(), "image/png");
    mock_s3_put_object(state);

    // Upload the document
    let upload_res = decision::document::route_handler::handle_document_upload(
        state,
        workflow.clone(),
        sv_id.clone(),
        MetaHeaders::default(),
        file_upload,
        document_id.clone(),
        side,
    )
    .await
    .unwrap();
    assert!(upload_res.is_none());

    //
    // PROCESS (incode)
    //
    if test_case.make_incode_calls() {
        // mock enclave decrypting images in s3 to send to incode
        mock_enclave_s3_client(state, document_id.clone(), &vault.e_private_key).await;
    }

    // Assert incode machine is in the right state, but we create the IVS inside handle_document_process on the first pass through,
    // so if we're handling front we won't have it yet
    if side != DocumentSide::Front && test_case.make_incode_calls() {
        assert_ivs_in_state(state, document_id.clone(), side_to_ivs_state(side)).await;
    }

    // Process the doc
    decision::document::route_handler::handle_document_process(
        state,
        sv_id,
        workflow.id.clone(),
        tenant_id.clone(),
        document_id,
    )
    .await
    .unwrap()
}

async fn assertions(
    state: &State,
    test_case: DocumentUploadTestCase,
    sv_id: &ScopedVaultId,
    document_id: IdentityDocumentId,
) {
    let rs = query_risk_signals(state, sv_id, RiskSignalGroupKind::Doc).await;
    if test_case.is_non_identity_document_flow() {
        assert!(rs.is_empty());
    } else {
        assert!(!rs.is_empty());
    };

    // Only assert incode stuff if we're live
    if test_case.make_incode_calls() {
        let ivs = assert_ivs_in_state(
            state,
            document_id.clone(),
            IncodeVerificationSessionState::Complete,
        )
        .await;

        state
            .db_pool
            .db_query(move |conn| -> DbResult<_> {
                let (id_doc, _) = IdentityDocument::get(conn, &document_id)?;
                assert_eq!(id_doc.status, IdentityDocumentStatus::Complete);

                // Assert the state machine visited all states we expect
                let events = IncodeVerificationSessionEvent::get_for_session_id(conn, &ivs.id)?;
                let states = events
                    .into_iter()
                    .map(|i| i.incode_verification_session_state)
                    .collect();
                let expected_states = vec![
                    Some(IncodeVerificationSessionState::StartOnboarding),
                    Some(IncodeVerificationSessionState::AddFront),
                    test_case
                        .document_type
                        .sides()
                        .contains(&DocumentSide::Back)
                        .then_some(IncodeVerificationSessionState::AddBack),
                    Some(IncodeVerificationSessionState::AddConsent),
                    test_case
                        .requires_selfie()
                        .then_some(IncodeVerificationSessionState::AddSelfie),
                    test_case
                        .requires_selfie()
                        .then_some(IncodeVerificationSessionState::ProcessFace),
                    Some(IncodeVerificationSessionState::ProcessId),
                    Some(IncodeVerificationSessionState::GetOnboardingStatus),
                    Some(IncodeVerificationSessionState::FetchScores),
                    Some(IncodeVerificationSessionState::Complete),
                ]
                .into_iter()
                .flatten()
                .collect();
                assert_have_same_elements(states, expected_states);
                Ok(())
            })
            .await
            .unwrap();
    }
}

// Assert incode_verification_session is in the correct state
async fn assert_ivs_in_state(
    state: &State,
    document_id: IdentityDocumentId,
    incode_session_state: IncodeVerificationSessionState,
) -> IncodeVerificationSession {
    state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            let ivs = IncodeVerificationSession::get(conn, &document_id)
                .unwrap()
                .unwrap();
            assert_eq!(ivs.state, incode_session_state);
            Ok(ivs)
        })
        .await
        .unwrap()
}

// Map the side we're handling in the API route to what the incode machine should be in
fn side_to_ivs_state(side: DocumentSide) -> IncodeVerificationSessionState {
    match side {
        DocumentSide::Front => IncodeVerificationSessionState::AddFront,
        DocumentSide::Back => IncodeVerificationSessionState::AddBack,
        DocumentSide::Selfie => IncodeVerificationSessionState::AddSelfie,
    }
}
