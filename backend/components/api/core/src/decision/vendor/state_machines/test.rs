use chrono::Utc;
use db::{
    models::{
        document_request::DocumentRequest, document_upload::DocumentUpload,
        identity_document::IdentityDocument, incode_verification_session::IncodeVerificationSession,
        incode_verification_session_event::IncodeVerificationSessionEvent, user_consent::UserConsent,
        verification_request::VerificationRequest,
    },
    test_helpers::assert_have_same_elements,
    DbError, DbResult,
};
use idv::incode::{doc::response::FetchScoresResponse, IncodeAPIResult};
use macros::test_state_case;
use newtypes::{
    incode::{IncodeStatus, IncodeTest},
    CollectedDataOption, DocVData, DocumentRequestStatus, DocumentSide, IdDocKind, IncodeConfigurationId,
    IncodeVerificationSessionState, PiiString, SealedVaultDataKey, VendorAPI,
};

use super::incode_state_machine::IncodeContext;
use crate::{
    decision::{
        tests::test_helpers::create_user_and_onboarding,
        vendor::state_machines::{images::*, incode_state_machine::IncodeStateMachine, state::IncodeState},
    },
    State,
};

#[ignore]
#[test_state_case(true)]
#[test_state_case(false)]
#[tokio::test]
async fn test_run_machine(state: &State, is_selfie: bool) {
    //
    // Set up
    //
    let must_collect_data = if is_selfie {
        Some(vec![CollectedDataOption::DocumentAndSelfie])
    } else {
        None
    };
    let (tenant, ob, uv, su, di) =
        create_user_and_onboarding(&state.db_pool, &state.enclave_client, must_collect_data).await;

    // Needed for db constraints
    let su_id = su.id.clone();
    let id_doc = state
        .db_pool
        .db_transaction(move |conn| -> Result<IdentityDocument, DbError> {
            let doc_request = DocumentRequest::create(conn.conn(), su_id, None, false).unwrap();
            if is_selfie {
                let note = "I, Bob Boberto, consent to NOTHING".into();
                UserConsent::create(conn, Utc::now(), ob.id, ob.insight_event_id, note)?;
            }

            Ok(db::tests::fixtures::identity_document::create(
                conn,
                Some(doc_request.id),
            ))
        })
        .await
        .unwrap();

    //
    // Run the incode verification machine
    //
    let docv_data = DocVData {
        front_image: Some(PiiString::from(small_front_image())),
        back_image: None, // only upload one document at a time
        document_type: Some(IdDocKind::DriverLicense),
        first_name: Some(PiiString::from("Robert")),
        last_name: Some(PiiString::from("Roberto")),
        ..Default::default()
    };
    let ctx = IncodeContext {
        di_id: di.id.clone(),
        sv_id: su.id.clone(),
        id_doc_id: id_doc.id,
        vault: uv.clone(),
        docv_data,
        doc_request_id: id_doc.request_id,
    };
    let config_id = IncodeConfigurationId::from("643450886f6f92d20b27599b".to_string());
    let machine = IncodeStateMachine::init(&state, tenant.id.clone(), config_id.clone(), ctx)
        .await
        .unwrap();
    let machine = machine.run(&state.db_pool, &state.fp_client).await.unwrap();

    // Assert machine stops at AddBack until we add the back
    assert!(matches!(machine.state, IncodeState::AddBack(_)));

    let su_id = su.id.clone();
    state
        .db_pool
        .db_query(move |conn| -> Result<_, DbError> {
            // Make sure we're in the right state
            let session = IncodeVerificationSession::get(conn, &su_id)?.unwrap();
            assert_eq!(session.state, IncodeVerificationSessionState::AddBack);
            assert!(session.latest_failure_reason.is_none());
            Ok(())
        })
        .await
        .unwrap()
        .unwrap();

    //
    // Now, simulate uploading the back and continuing
    //
    let mut ctx = machine.ctx;
    ctx.docv_data.back_image = Some(PiiString::from(small_back_image()));
    let machine = IncodeStateMachine::init(&state, tenant.id, config_id, ctx)
        .await
        .unwrap();
    assert!(matches!(machine.state, IncodeState::AddBack(_)));

    let machine = machine.run(&state.db_pool, &state.fp_client).await.unwrap();
    assert!(matches!(machine.state, IncodeState::Complete(_)));

    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, DbError> {
            let db_verifications = VerificationRequest::list_by_decision_intent(conn, &di.id)?;

            // Assert we've made all the requests we expect
            let vendor_apis = db_verifications
                .iter()
                .filter_map(|(req, res)| res.as_ref().map(|_| req.vendor_api))
                .collect();

            let consent_apis = vec![VendorAPI::IncodeAddMLConsent, VendorAPI::IncodeAddPrivacyConsent];
            let expected_apis = vec![
                VendorAPI::IncodeStartOnboarding,
                VendorAPI::IncodeAddFront,
                VendorAPI::IncodeAddBack,
                VendorAPI::IncodeProcessId,
                VendorAPI::IncodeFetchScores,
                VendorAPI::IncodeFetchOCR,
            ]
            .into_iter()
            .chain(if is_selfie { consent_apis } else { vec![] })
            .collect();
            assert_have_same_elements(vendor_apis, expected_apis);

            // Make sure we're in the right state
            let session = IncodeVerificationSession::get(conn, &su.id)?.unwrap();
            assert_eq!(session.state, IncodeVerificationSessionState::Complete);
            assert!(session.latest_failure_reason.is_none());

            // Assert the state machine visited all states we expect
            let events = IncodeVerificationSessionEvent::get_for_session_id(conn, &session.id)?;
            let states = events
                .into_iter()
                .map(|i| i.incode_verification_session_state)
                .collect();
            let expected_states = vec![
                Some(IncodeVerificationSessionState::StartOnboarding),
                Some(IncodeVerificationSessionState::AddFront),
                Some(IncodeVerificationSessionState::AddBack),
                is_selfie.then_some(IncodeVerificationSessionState::AddConsent),
                Some(IncodeVerificationSessionState::ProcessId),
                Some(IncodeVerificationSessionState::FetchScores),
                Some(IncodeVerificationSessionState::FetchOCR),
                Some(IncodeVerificationSessionState::Complete),
            ]
            .into_iter()
            .flatten()
            .collect();
            assert_have_same_elements(states, expected_states);

            // Check some of the VReses we got
            let (_, score_vres) = db_verifications
                .iter()
                .find(|(req, _)| req.vendor_api == VendorAPI::IncodeFetchScores)
                .unwrap();
            let score_result =
                IncodeAPIResult::<FetchScoresResponse>::try_from(score_vres.clone().unwrap().response.0)
                    .unwrap()
                    .into_success()
                    .unwrap();
            let id_tests = score_result.get_id_tests();
            assert_eq!(
                id_tests.get(&IncodeTest::FirstNameMatch).unwrap(),
                &IncodeStatus::Fail
            );
            assert_eq!(
                id_tests.get(&IncodeTest::LastNameMatch).unwrap(),
                &IncodeStatus::Fail
            );
            assert!(score_result.id_validation.is_some());

            db::private_cleanup_integration_tests(conn, uv.id).unwrap();

            Ok(())
        })
        .await
        .unwrap();
}

#[ignore]
#[test_state_case(true)]
#[test_state_case(false)]
#[tokio::test]
async fn test_fail(state: &State, is_selfie: bool) {
    //
    // Set up
    //
    let must_collect_data = if is_selfie {
        Some(vec![CollectedDataOption::DocumentAndSelfie])
    } else {
        None
    };
    let (tenant, ob, uv, su, di) =
        create_user_and_onboarding(&state.db_pool, &state.enclave_client, must_collect_data).await;
    let suid = su.id.clone();

    // Needed for db constraints
    let id_doc = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, DbError> {
            let doc_request = DocumentRequest::create(conn.conn(), suid, None, false).unwrap();
            if is_selfie {
                let note = "I, Bob Boberto, consent to NOTHING".into();
                UserConsent::create(conn, Utc::now(), ob.id, ob.insight_event_id, note)?;
            }
            let id_doc = db::tests::fixtures::identity_document::create(conn, Some(doc_request.id.clone()));
            assert!(!id_doc.images(conn)?.is_empty());

            Ok(id_doc)
        })
        .await
        .unwrap();

    //
    // Run the incode verification machine, first with a blurry image
    //
    let docv_data = DocVData {
        front_image: Some(PiiString::from(small_blurry_image())),
        back_image: None,
        document_type: Some(IdDocKind::Passport),
        first_name: Some(PiiString::from("Robert")),
        last_name: Some(PiiString::from("Roberto")),
        ..Default::default()
    };
    let ctx = IncodeContext {
        di_id: di.id.clone(),
        sv_id: su.id.clone(),
        id_doc_id: id_doc.id.clone(),
        vault: uv.clone(),
        docv_data,
        doc_request_id: id_doc.request_id.clone(),
    };
    let config_id = IncodeConfigurationId::from("643450886f6f92d20b27599b".to_string());
    let machine = IncodeStateMachine::init(&state, tenant.id.clone(), config_id.clone(), ctx)
        .await
        .unwrap();
    let machine = machine.run(&state.db_pool, &state.fp_client).await.unwrap();

    // Assert machine is in the correct state
    assert!(matches!(machine.state, IncodeState::AddFront(_)));

    let s_id = machine.session.id;
    let s_id2 = s_id.clone();
    state
        .db_pool
        .db_transaction(move |conn| -> DbResult<_> {
            let session = IncodeVerificationSession::get(conn, &s_id2).unwrap().unwrap();
            assert_eq!(session.state, IncodeVerificationSessionState::AddFront);
            assert!(session.latest_failure_reason.is_some());

            // Check we cleared out the front image to retry
            let (doc, _) = IdentityDocument::get(conn, &id_doc.id)?;
            assert!(doc.images(conn)?.is_empty());

            // Now, add our images to the vault as if the user hit the POST /document APi again
            let key = SealedVaultDataKey(vec![]);
            DocumentUpload::create(conn, doc.id.clone(), DocumentSide::Front, "".into(), key.clone())
                .unwrap();
            DocumentUpload::create(conn, doc.id, DocumentSide::Back, "".into(), key).unwrap();

            Ok(())
        })
        .await
        .unwrap();

    //
    // Now, simulate retrying with non-blurry
    //
    let mut ctx = machine.ctx;
    ctx.docv_data.front_image = Some(PiiString::from(small_front_image()));
    let machine = IncodeStateMachine::init(&state, tenant.id.clone(), config_id.clone(), ctx)
        .await
        .unwrap();
    assert!(matches!(machine.state, IncodeState::AddFront(_)));

    let machine = machine.run(&state.db_pool, &state.fp_client).await.unwrap();
    assert!(matches!(machine.state, IncodeState::Complete(_)));

    // Check we have the right things in the db
    state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            let session = IncodeVerificationSession::get(conn, &s_id).unwrap().unwrap();
            assert_eq!(session.state, IncodeVerificationSessionState::Complete);
            assert!(session.latest_failure_reason.is_none());

            let incode_events = IncodeVerificationSessionEvent::get_for_session_id(conn, &session.id)?;
            let states = incode_events
                .into_iter()
                .map(|i| i.incode_verification_session_state)
                .collect();

            let expected_states = vec![
                Some(IncodeVerificationSessionState::StartOnboarding),
                Some(IncodeVerificationSessionState::AddFront),
                Some(IncodeVerificationSessionState::AddFront), // Repeated since we failed the first time
                // Passport has no back
                is_selfie.then_some(IncodeVerificationSessionState::AddConsent),
                Some(IncodeVerificationSessionState::ProcessId),
                Some(IncodeVerificationSessionState::FetchScores),
                Some(IncodeVerificationSessionState::FetchOCR),
                Some(IncodeVerificationSessionState::Complete),
            ]
            .into_iter()
            .flatten()
            .collect();
            assert_have_same_elements(states, expected_states);

            // Check score res
            let (_, score_vres) = VerificationRequest::list_by_decision_intent(conn, &di.id)?
                .into_iter()
                .find(|(req, _)| req.vendor_api == VendorAPI::IncodeFetchScores)
                .unwrap();
            let score_result =
                IncodeAPIResult::<FetchScoresResponse>::try_from(score_vres.unwrap().response.0)
                    .unwrap()
                    .into_success()
                    .unwrap();
            let parsed_tests = score_result.get_id_tests();
            assert_eq!(
                parsed_tests.get(&IncodeTest::FirstNameMatch).unwrap(),
                &IncodeStatus::Fail
            );
            assert_eq!(
                parsed_tests.get(&IncodeTest::LastNameMatch).unwrap(),
                &IncodeStatus::Fail
            );
            assert!(score_result.id_validation.is_some());

            // Check business logic bookkeeping
            let doc_request = DocumentRequest::get(conn, &su.id)?;
            assert_eq!(doc_request.status, DocumentRequestStatus::Complete);

            Ok(())
        })
        .await
        .unwrap()
        .unwrap();

    // Clean up
    state
        .db_pool
        .db_transaction(move |conn| db::private_cleanup_integration_tests(conn, uv.id))
        .await
        .unwrap();
}
