use super::{
    document_test_utils::{mock_ff_client, mock_s3_put_object, UserKind},
    test_helpers::FixtureData,
};
use crate::{
    decision::{self, document::meta_headers::MetaHeaders},
    errors::onboarding::OnboardingError,
    utils::file_upload::FileUpload,
    ApiErrorKind, State,
};
use api_wire_types::CreateIdentityDocumentRequest;
use chrono::Utc;
use db::{
    models::{insight_event::InsightEvent, user_consent::UserConsent},
    tests::fixtures::ob_configuration::ObConfigurationOpts,
    DbResult,
};
use macros::test_state_case;
use newtypes::{
    CollectedDataOption, CountryRestriction, DocTypeRestriction, DocumentCdoInfo, DocumentSide, IdDocKind,
    IdentityDocumentFixtureResult, Iso3166TwoDigitCountryCode, PiiBytes, Selfie, WorkflowFixtureResult,
};

/// Test we require consent, or we'll error uploading a side
#[test_state_case(UserKind::Live, Selfie::RequireSelfie)]
#[test_state_case(UserKind::Live, Selfie::None)]
#[test_state_case(UserKind::Sandbox(IdentityDocumentFixtureResult::Pass), Selfie::RequireSelfie)]
#[test_state_case(UserKind::Sandbox(IdentityDocumentFixtureResult::Pass), Selfie::None)]
#[test_state_case(UserKind::Sandbox(IdentityDocumentFixtureResult::Real), Selfie::None)]
#[test_state_case(UserKind::Sandbox(IdentityDocumentFixtureResult::Real), Selfie::RequireSelfie)]
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
        super::test_helpers::create_kyc_user_and_wf(state, obc_opts, user_fixture_result).await;
    let dr = dr.unwrap();

    let id_doc_req = CreateIdentityDocumentRequest {
        request_id: Some(dr.id),
        document_type: IdDocKind::DriversLicense,
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
        wf.clone(),
        sv.id.clone(),
        MetaHeaders::default(),
        file_upload.clone(),
        identity_doc_id.clone(),
        DocumentSide::Front,
    )
    .await;

    // we are expecting a no consent error
    let err = upload_res_no_consent.err().unwrap().into_kind();
    match err {
        ApiErrorKind::OnboardingError(OnboardingError::UserConsentNotFound) => {}
        _ => panic!("wrong error found when uploading a side without consent"),
    }
    // Now add consent
    let wf_id = wf.id.clone();
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

    // try uploading again, and we're successful
    decision::document::route_handler::handle_document_upload(
        state,
        wf.clone(),
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
#[test_state_case(UserKind::Sandbox(IdentityDocumentFixtureResult::Pass))]
#[test_state_case(UserKind::Sandbox(IdentityDocumentFixtureResult::Real))]
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
        super::test_helpers::create_kyc_user_and_wf(state, obc_opts, user_fixture_result).await;
    let dr = dr.unwrap();

    //
    // Add Passport, but we only accept DL
    //
    let id_doc_req = CreateIdentityDocumentRequest {
        request_id: Some(dr.id.clone()),
        document_type: IdDocKind::Passport,
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
    )
    .await;

    let err = identity_doc_res.err().unwrap().into_kind();
    match err {
        ApiErrorKind::OnboardingError(OnboardingError::UnsupportedDocumentType(_)) => {}
        _ => panic!("wrong error found when trying to uploading a doc with wrong type"),
    }
    //
    // Add DL, but wrong country
    //
    let id_doc_req = CreateIdentityDocumentRequest {
        request_id: Some(dr.id.clone()),
        document_type: IdDocKind::DriversLicense,
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
    )
    .await;

    let err = identity_doc_res.err().unwrap().into_kind();
    match err {
        ApiErrorKind::OnboardingError(OnboardingError::UnsupportedDocumentCountryForDocumentType(_)) => {}
        _ => panic!("wrong error found when trying to uploading a doc with wrong country"),
    }
}
