use super::document_test_utils::mock_enclave_s3_client;
use super::document_test_utils::mock_ff_client;
use super::document_test_utils::mock_s3_put_object;
use super::document_test_utils::UserKind;
use super::test_helpers::FixtureData;
use crate::decision::document::meta_headers::MetaHeaders;
use crate::decision::document::route_handler::IncodeConfigurationIdOverride;
use crate::decision::document::route_handler::IsRerun;
use crate::decision::tests::document_e2e::assert_ivs_in_state;
use crate::decision::tests::document_test_utils::IncodeMockOpts;
use crate::decision::tests::document_test_utils::IncodeMocker;
use crate::decision::{
    self,
};
use crate::utils::file_upload::FileUpload;
use crate::State;
use api_wire_types::CreateDocumentRequest;
use api_wire_types::DocumentImageError;
use api_wire_types::DocumentResponse;
use chrono::Utc;
use db::models::document::Document;
use db::models::document::DocumentImageArgs;
use db::models::incode_verification_session::IncodeVerificationSession;
use db::models::insight_event::CreateInsightEvent;
use db::models::insight_event::InsightEvent;
use db::models::scoped_vault::ScopedVault;
use db::models::tenant::Tenant;
use db::models::user_consent::UserConsent;
use db::models::vault::Vault;
use db::models::workflow::Workflow;
use db::tests::fixtures::ob_configuration::ObConfigurationOpts;
use db::DbResult;
use idv::incode::doc::response::AddSideResponse;
use idv::incode::IncodeAPIResult;
use idv::incode::IncodeResponse;
use macros::test_state_case;
use newtypes::CollectedDataOption;
use newtypes::CountryRestriction;
use newtypes::DocTypeRestriction;
use newtypes::DocumentCdoInfo;
use newtypes::DocumentFixtureResult;
use newtypes::DocumentId;
use newtypes::DocumentSide;
use newtypes::IdDocKind;
use newtypes::IncodeFailureReason;
use newtypes::IncodeVerificationSessionState;
use newtypes::Iso3166TwoDigitCountryCode;
use newtypes::PiiBytes;
use newtypes::PiiJsonValue;
use newtypes::Selfie;
use newtypes::WorkflowFixtureResult;
use std::time::Duration;
use tokio::time::Instant;

/// Test we require consent, or we'll error uploading a side
#[test_state_case(UserKind::Live, Selfie::RequireSelfie)]
#[test_state_case(UserKind::Live, Selfie::None)]
#[test_state_case(UserKind::Sandbox(DocumentFixtureResult::Pass), Selfie::RequireSelfie)]
#[test_state_case(UserKind::Sandbox(DocumentFixtureResult::Pass), Selfie::None)]
#[test_state_case(UserKind::Sandbox(DocumentFixtureResult::Real), Selfie::None)]
#[test_state_case(UserKind::Sandbox(DocumentFixtureResult::Real), Selfie::RequireSelfie)]
#[tokio::test]
async fn test_require_consent(state: &mut State, user_kind: UserKind, require_selfie: Selfie) {
    let obc_opts = ObConfigurationOpts {
        must_collect_data: vec![CollectedDataOption::Document(DocumentCdoInfo(
            DocTypeRestriction::None,
            CountryRestriction::None,
            require_selfie,
        ))],
        is_live: matches!(user_kind, UserKind::Live),
        ..Default::default()
    };
    let user_fixture_result = match user_kind {
        UserKind::Live => None,
        UserKind::Sandbox(_) => Some(WorkflowFixtureResult::Pass), // not important here
        UserKind::Demo => todo!(),
    };
    let FixtureData { t, wf, sv, dr, .. } =
        super::test_helpers::create_kyc_user_and_wf(state, obc_opts, user_fixture_result, None).await;
    let dr = dr.unwrap();

    let id_doc_req = CreateDocumentRequest {
        request_id: Some(dr.id),
        document_type: IdDocKind::DriversLicense.into(),
        country_code: Some(Iso3166TwoDigitCountryCode::US),
        fixture_result: user_kind.identity_doc_fixture(),
        skip_selfie: None,
        device_type: None,
    };

    mock_ff_client(state, user_kind.identity_doc_fixture(), t.id.clone());
    let identity_doc_id = decision::document::route_handler::handle_document_create(
        state,
        id_doc_req,
        t.id.clone(),
        sv.id.clone(),
        wf.id.clone(),
        CreateInsightEvent { ..Default::default() },
    )
    .await
    .unwrap();
    //
    // TESTING BEGINS HERE
    //
    let file_upload = FileUpload::new_simple(PiiBytes::new(vec![1, 2, 3, 4]), "f".into(), "image/png");
    mock_s3_put_object(state);

    // First try without consent
    let upload_res_no_consent = decision::document::route_handler::handle_document_upload(
        state,
        wf.id.clone(),
        sv.id.clone(),
        MetaHeaders::default(),
        file_upload.clone(),
        identity_doc_id.clone(),
        DocumentSide::Front,
    )
    .await;

    // we are expecting a no consent error
    let err = upload_res_no_consent.err().unwrap().message();
    assert_eq!(err, "User consent not found for onboarding");
    // Now add consent
    let wf_id = wf.id.clone();
    state
        .db_pool
        .db_transaction(move |conn| -> DbResult<_> {
            let ie = InsightEvent::get_for_workflow(conn, &wf_id)?.unwrap();

            let note = "I, Bob Boberto, consent to NOTHING".into();
            UserConsent::create(conn, Utc::now(), ie.id, note, false, wf_id)?;
            Ok(())
        })
        .await
        .unwrap();

    // try uploading again, and we're successful
    decision::document::route_handler::handle_document_upload(
        state,
        wf.id.clone(),
        sv.id.clone(),
        MetaHeaders::default(),
        file_upload,
        identity_doc_id.clone(),
        DocumentSide::Front,
    )
    .await
    .unwrap();
}

/// Test that we only allow going through doc flow if there's a pending document request
#[test_state_case(UserKind::Live)]
#[test_state_case(UserKind::Sandbox(DocumentFixtureResult::Pass))]
#[test_state_case(UserKind::Sandbox(DocumentFixtureResult::Real))]
#[tokio::test]
async fn test_add_unsupported_doc_type(state: &mut State, user_kind: UserKind) {
    let obc_opts = ObConfigurationOpts {
        // restrict to DL
        must_collect_data: vec![CollectedDataOption::Document(DocumentCdoInfo(
            DocTypeRestriction::Restrict(vec![IdDocKind::DriversLicense]),
            CountryRestriction::None,
            Selfie::None,
        ))],
        is_live: matches!(user_kind, UserKind::Live),
        ..Default::default()
    };
    let user_fixture_result = match user_kind {
        UserKind::Live => None,
        UserKind::Sandbox(_) => Some(WorkflowFixtureResult::Pass), // not important here
        UserKind::Demo => todo!(),
    };
    let FixtureData { t, wf, sv, dr, .. } =
        super::test_helpers::create_kyc_user_and_wf(state, obc_opts, user_fixture_result, None).await;
    let dr = dr.unwrap();

    //
    // Add Passport, but we only accept DL
    //
    let id_doc_req = CreateDocumentRequest {
        request_id: Some(dr.id.clone()),
        document_type: IdDocKind::Passport.into(),
        country_code: Some(Iso3166TwoDigitCountryCode::US),
        fixture_result: user_kind.identity_doc_fixture(),
        skip_selfie: None,
        device_type: None,
    };

    mock_ff_client(state, user_kind.identity_doc_fixture(), t.id.clone());
    let identity_doc_res = decision::document::route_handler::handle_document_create(
        state,
        id_doc_req,
        t.id.clone(),
        sv.id.clone(),
        wf.id.clone(),
        CreateInsightEvent { ..Default::default() },
    )
    .await;

    let err = identity_doc_res.err().unwrap().message();
    assert!(err.contains("Unsupported document type. Supported document types:"));
    //
    // Add DL, but wrong country
    //
    let id_doc_req = CreateDocumentRequest {
        request_id: Some(dr.id.clone()),
        document_type: IdDocKind::DriversLicense.into(),
        country_code: Some(Iso3166TwoDigitCountryCode::ZA),
        fixture_result: user_kind.identity_doc_fixture(),
        skip_selfie: None,
        device_type: None,
    };

    mock_ff_client(state, user_kind.identity_doc_fixture(), t.id.clone());
    let identity_doc_res = decision::document::route_handler::handle_document_create(
        state,
        id_doc_req,
        t.id.clone(),
        sv.id.clone(),
        wf.id.clone(),
        CreateInsightEvent { ..Default::default() },
    )
    .await;

    let err = identity_doc_res.err().unwrap().message();
    assert!(err.contains("Unsupported document country. Supported document countries"));
}


#[test_state_case(UserKind::Live)]
#[test_state_case(UserKind::Sandbox(DocumentFixtureResult::Real))]
#[tokio::test]
async fn test_adding_side_failures_front(state: &mut State, user_kind: UserKind) {
    let (doc_id, wf, t, sv, v) = setup_document_test(state, user_kind).await;

    // TEST BEGINS HERE

    // First attempt: Fail to classify
    let resp = upload_and_process_document(
        state,
        &wf,
        &sv,
        &t,
        &doc_id,
        &v,
        DocumentSide::Front,
        IncodeMockOpts::StopAfterFront {
            add_front_response: Some(add_front_response_failure("UNKNOWN_DOCUMENT_TYPE")),
        },
    )
    .await;

    assert_eq!(resp.errors, vec![DocumentImageError::UnknownDocumentType]);
    assert_eq!(resp.next_side_to_collect, Some(DocumentSide::Front));
    assert_ivs_in_state(state, doc_id.clone(), IncodeVerificationSessionState::AddFront).await;

    // Second attempt: Still fail to classify
    let resp = upload_and_process_document(
        state,
        &wf,
        &sv,
        &t,
        &doc_id,
        &v,
        DocumentSide::Front,
        IncodeMockOpts::UploadFront {
            add_front_response: Some(add_front_response_failure("UNKNOWN_DOCUMENT_TYPE")),
        },
    )
    .await;

    assert_eq!(resp.errors, vec![DocumentImageError::UnknownDocumentType]);
    assert_eq!(resp.next_side_to_collect, Some(DocumentSide::Front));
    assert_ivs_in_state(state, doc_id.clone(), IncodeVerificationSessionState::AddFront).await;

    // Third attempt: Succeed and move to next state
    let resp = upload_and_process_document(
        state,
        &wf,
        &sv,
        &t,
        &doc_id,
        &v,
        DocumentSide::Front,
        IncodeMockOpts::UploadFront {
            add_front_response: Some(add_front_response_failure("UNKNOWN_DOCUMENT_TYPE")),
        },
    )
    .await;
    assert_eq!(resp.next_side_to_collect, Some(DocumentSide::Back));
    assert_eq!(resp.errors, vec![]);

    // ASSERTIONS
    state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            let ivs = IncodeVerificationSession::get(conn, &doc_id).unwrap().unwrap();
            let (iddoc, _) = Document::get(conn, &ivs.identity_document_id).unwrap();
            let doc_uploads = iddoc.images(conn, DocumentImageArgs::default()).unwrap();
            let front_side_upload = doc_uploads.first().unwrap();
            let expected_fail_reasons = vec![IncodeFailureReason::UnknownDocumentType];
            // IVS in correct state
            assert_eq!(ivs.state, IncodeVerificationSessionState::AddBack);
            // ignore reasons from front are on IVS
            assert_eq!(ivs.ignored_failure_reasons, expected_fail_reasons);
            // failure reasons from front are on doc upload
            assert_eq!(front_side_upload.failure_reasons, expected_fail_reasons);
            Ok(())
        })
        .await
        .unwrap();
}


async fn setup_document_test(
    state: &mut State,
    user_kind: UserKind,
) -> (DocumentId, Workflow, Tenant, ScopedVault, Vault) {
    let obc_opts = ObConfigurationOpts {
        must_collect_data: vec![CollectedDataOption::Document(DocumentCdoInfo(
            DocTypeRestriction::Restrict(vec![IdDocKind::DriversLicense]),
            CountryRestriction::None,
            Selfie::None,
        ))],
        is_live: matches!(user_kind, UserKind::Live),
        ..Default::default()
    };
    let user_fixture_result = match user_kind {
        UserKind::Live => None,
        UserKind::Sandbox(_) => Some(WorkflowFixtureResult::Pass), // not important here
        UserKind::Demo => todo!(),
    };
    let FixtureData {
        t,
        wf,
        sv,
        dr,
        v,
        obc: _,
    } = super::test_helpers::create_kyc_user_and_wf(state, obc_opts, user_fixture_result, None).await;
    let dr = dr.unwrap();

    let id_doc_req = CreateDocumentRequest {
        request_id: Some(dr.id.clone()),
        document_type: IdDocKind::DriversLicense.into(),
        country_code: Some(Iso3166TwoDigitCountryCode::US),
        fixture_result: user_kind.identity_doc_fixture(),
        skip_selfie: None,
        device_type: None,
    };

    // CREATE CONSENT
    mock_ff_client(state, user_kind.identity_doc_fixture(), t.id.clone());
    let wf_id = wf.id.clone();
    state
        .db_pool
        .db_transaction(move |conn| -> DbResult<_> {
            let ie = InsightEvent::get_for_workflow(conn, &wf_id)?.unwrap();

            let note = "I, Bob Boberto, consent to NOTHING".into();
            UserConsent::create(conn, Utc::now(), ie.id, note, false, wf_id)?;
            Ok(())
        })
        .await
        .unwrap();

    // CREATE DOCUMENT
    let doc_id = decision::document::route_handler::handle_document_create(
        state,
        id_doc_req,
        t.id.clone(),
        sv.id.clone(),
        wf.id.clone(),
        CreateInsightEvent { ..Default::default() },
    )
    .await
    .unwrap();

    (doc_id, wf, t, sv, v)
}


// Upload a document and run process according to the parameterization by mock_opts
#[allow(clippy::too_many_arguments)]
async fn upload_and_process_document(
    state: &mut State,
    wf: &Workflow,
    sv: &ScopedVault,
    t: &Tenant,
    doc_id: &DocumentId,
    v: &Vault,
    side_to_upload: DocumentSide,
    incode_call_mock_opts: IncodeMockOpts,
) -> DocumentResponse {
    let file_upload = FileUpload::new_simple(PiiBytes::new(vec![1, 2, 3, 4]), "f".into(), "image/png");
    mock_s3_put_object(state);

    decision::document::route_handler::handle_document_upload(
        state,
        wf.id.clone(),
        sv.id.clone(),
        MetaHeaders::default(),
        file_upload,
        doc_id.clone(),
        side_to_upload,
    )
    .await
    .unwrap();

    mock_enclave_s3_client(state, doc_id.clone(), &v.e_private_key).await;

    let mocker = IncodeMocker::new(IdDocKind::DriversLicense.into(), false);
    mocker.mock(state, incode_call_mock_opts);

    decision::document::route_handler::handle_document_process(
        state,
        sv.id.clone(),
        wf.id.clone(),
        t.id.clone(),
        doc_id.clone(),
        IsRerun(false),
        IncodeConfigurationIdOverride(None),
        Instant::now() + Duration::from_secs(60),
    )
    .await
    .unwrap()
}


fn add_front_response_failure(failure_reason: &str) -> IncodeResponse<AddSideResponse> {
    let raw_response = serde_json::json!({
        "sharpness": 100,
        "glare": 100,
        "horizontalResolution": 0,
        "classification": false,
        "typeOfId": "DriversLicense",
        "countryCode": "USA",
        "issueYear": 2016,
        "issueName": "USA DriversLicense DRIVERS_LICENSE",
        "sessionStatus": "Alive",
        "failReason": failure_reason
    });

    let parsed: AddSideResponse = serde_json::from_value(raw_response.clone()).unwrap();
    IncodeResponse {
        result: IncodeAPIResult::Success(parsed),
        raw_response: PiiJsonValue::from(serde_json::to_value(&raw_response).unwrap()),
    }
}
