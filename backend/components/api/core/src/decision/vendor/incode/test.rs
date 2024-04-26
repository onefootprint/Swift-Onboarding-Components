use chrono::Utc;
use db::{
    models::{
        data_lifetime::DataLifetime,
        decision_intent::DecisionIntent,
        document_request::DocumentRequest,
        document_upload::{DocumentUpload, NewDocumentUploadArgs},
        identity_document::IdentityDocument,
        incode_verification_session::IncodeVerificationSession,
        incode_verification_session_event::IncodeVerificationSessionEvent,
        insight_event::InsightEvent,
        risk_signal::RiskSignal,
        user_consent::UserConsent,
        verification_request::VerificationRequest,
    },
    test_helpers::assert_have_same_elements,
    tests::fixtures::ob_configuration::ObConfigurationOpts,
    DbError, DbResult,
};
use idv::{
    footprint_http_client::{FootprintVendorHttpClient, FpVendorClientArgs},
    incode::{doc::response::FetchScoresResponse, IncodeAPIResult},
};
use macros::test_state_case;
use newtypes::{
    incode::{IncodeStatus, IncodeTest},
    CollectedDataOption, CountryRestriction, DecisionIntentKind, DocTypeRestriction, DocVData,
    DocumentCdoInfo, DocumentRequestKind, DocumentSide, IdDocKind, IdentityDocumentStatus,
    IncodeFailureReason, IncodeVerificationSessionState, PiiString, RiskSignalGroupKind, S3Url,
    SealedVaultDataKey, Selfie, VendorAPI,
};

use super::IncodeContext;
use crate::{
    decision::{
        tests::test_helpers::{create_kyc_user_and_wf, FixtureData},
        vendor::incode::{get_config_id, images::*, IncodeStateMachine},
    },
    State,
};

#[ignore]
#[test_state_case(true)]
#[test_state_case(false)]
#[tokio::test]
async fn test_run_machine(state: &State, is_selfie: bool) {
    // These tests are actually testing that our integration with incode works.
    // But in other cases, we'll mock responses so we don't actually make requests
    let fp_client = FootprintVendorHttpClient::new(FpVendorClientArgs::default()).expect("client failed");
    state.set_incode_to_real_calls(fp_client);
    //
    // Set up
    //
    let obc_opts = if is_selfie {
        let doc_info = DocumentCdoInfo(
            DocTypeRestriction::None,
            CountryRestriction::None,
            Selfie::RequireSelfie,
        );
        ObConfigurationOpts {
            must_collect_data: vec![CollectedDataOption::Document(doc_info)],
            is_live: true,
            ..Default::default()
        }
    } else {
        ObConfigurationOpts {
            is_live: true,
            ..Default::default()
        }
    };
    let FixtureData {
        t: tenant,
        wf,
        v: uv,
        sv: su,
        obc,
        ..
    } = create_kyc_user_and_wf(state, obc_opts, None, None).await;
    let wf_id = wf.id.clone();
    let wf_id2 = wf.id.clone();

    // Needed for db constraints
    let su_id = su.id.clone();
    let (di, id_doc) = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, DbError> {
            let di =
                DecisionIntent::get_or_create_for_workflow(conn, &su_id, &wf.id, DecisionIntentKind::DocScan)
                    .unwrap();

            let ie = InsightEvent::get_for_workflow(conn, &wf_id)?.unwrap();
            let doc_request =
                DocumentRequest::get(conn.conn(), &wf.id, DocumentRequestKind::Identity)?.unwrap();

            let note = "I, Bob Boberto, consent to NOTHING".into();
            UserConsent::create(conn, Utc::now(), ie.id, note, false, wf_id)?;

            Ok((
                di,
                db::tests::fixtures::identity_document::create(conn, Some(doc_request.id)),
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
        selfie_image: None,
        document_type: Some(IdDocKind::IdCard),
        first_name: Some(PiiString::from("Robert")),
        last_name: Some(PiiString::from("Roberto")),
        country_code: Some(PiiString::from("USA")),
        ..Default::default()
    };
    let vault_country = Some(newtypes::Iso3166TwoDigitCountryCode::US);

    let ctx = IncodeContext {
        di_id: di.id.clone(),
        sv_id: su.id.clone(),
        id_doc_id: id_doc.id.clone(),
        wf_id: wf_id2,
        obc: obc.clone(),
        vault: uv.clone(),
        docv_data,
        vault_country,
        doc_request_id: id_doc.request_id,
        enclave_client: state.enclave_client.clone(),
        tenant_id: tenant.id.clone(),
        ff_client: state.feature_flag_client.clone(),
        failed_attempts_for_side: 0,
        disable_selfie: false,
        is_re_run: false,
        aws_selfie_client: state.aws_selfie_doc_client.clone(),
    };
    let config_id = get_config_id(state, is_selfie, false, &tenant.id);
    let machine = IncodeStateMachine::init(state, tenant.id.clone(), config_id.clone(), ctx, false)
        .await
        .unwrap();
    let (machine, failure_reasons) = machine
        .run(&state.db_pool, &state.vendor_clients.incode)
        .await
        .unwrap();

    // Assert machine stops at AddBack until we add the back
    assert_eq!(machine.state.name(), IncodeVerificationSessionState::AddBack);
    assert!(failure_reasons.is_empty());

    let id_doc_id = id_doc.id.clone();
    state
        .db_pool
        .db_query(move |conn| -> Result<_, DbError> {
            // Make sure we're in the right state
            let session = IncodeVerificationSession::get(conn, &id_doc_id)?.unwrap();
            assert_eq!(session.state, IncodeVerificationSessionState::AddBack);
            assert!(session.latest_failure_reasons.is_empty());
            Ok(())
        })
        .await
        .unwrap();

    //
    // Now, simulate uploading the back and continuing
    //
    let mut ctx = machine.ctx;
    ctx.docv_data.back_image = Some(PiiString::from(small_back_image()));
    let machine = IncodeStateMachine::init(state, tenant.id.clone(), config_id.clone(), ctx, false)
        .await
        .unwrap();
    assert_eq!(machine.state.name(), IncodeVerificationSessionState::AddBack);

    let (mut machine, mut failure_reasons) = machine
        .run(&state.db_pool, &state.vendor_clients.incode)
        .await
        .unwrap();

    // If we are uploading a selfie, the machine will have stopped to wait for an upload
    if is_selfie {
        assert_eq!(machine.state.name(), IncodeVerificationSessionState::AddConsent);
        assert!(failure_reasons.is_empty());
        let mut ctx = machine.ctx;
        ctx.docv_data.selfie_image = Some(PiiString::from(selfie_image()));
        machine = IncodeStateMachine::init(state, tenant.id, config_id, ctx, false)
            .await
            .unwrap();
        assert_eq!(machine.state.name(), IncodeVerificationSessionState::AddConsent);
        (machine, failure_reasons) = machine
            .run(&state.db_pool, &state.vendor_clients.incode)
            .await
            .unwrap();
    }

    assert!(failure_reasons.is_empty());
    assert_eq!(machine.state.name(), IncodeVerificationSessionState::Complete);

    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, DbError> {
            let db_verifications = VerificationRequest::list(conn, &di.id)?;

            // Assert we've made all the requests we expect
            let successful_vendor_apis = db_verifications
                .iter()
                .filter_map(|(req, res)| res.as_ref().map(|res| (req.vendor_api, res)))
                .filter_map(|(api, res)| (!res.is_error).then_some(api))
                .collect();

            let selfie_aps = vec![
                VendorAPI::IncodeAddMlConsent,
                VendorAPI::IncodeAddPrivacyConsent,
                VendorAPI::IncodeAddSelfie,
                VendorAPI::IncodeProcessFace,
            ];
            let expected_apis = vec![
                VendorAPI::IncodeStartOnboarding,
                VendorAPI::IncodeAddFront,
                VendorAPI::IncodeAddBack,
                VendorAPI::IncodeProcessId,
                VendorAPI::IncodeGetOnboardingStatus,
                VendorAPI::IncodeFetchScores,
                VendorAPI::IncodeFetchOcr,
            ]
            .into_iter()
            .chain(if is_selfie { selfie_aps } else { vec![] })
            .collect();
            assert_have_same_elements(successful_vendor_apis, expected_apis);

            // Make sure we're in the right state
            let session = IncodeVerificationSession::get(conn, &id_doc.id)?.unwrap();
            assert_eq!(session.state, IncodeVerificationSessionState::Complete);
            assert!(session.latest_failure_reasons.is_empty());

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
                is_selfie.then_some(IncodeVerificationSessionState::AddSelfie),
                is_selfie.then_some(IncodeVerificationSessionState::ProcessFace),
                Some(IncodeVerificationSessionState::ProcessId),
                Some(IncodeVerificationSessionState::GetOnboardingStatus),
                Some(IncodeVerificationSessionState::FetchScores),
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
            let score_result = IncodeAPIResult::<FetchScoresResponse>::try_from(
                score_vres.clone().unwrap().response_for_test().inner(),
            )
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

            let risk_signals =
                RiskSignal::latest_by_risk_signal_group_kind(conn, &su.id, RiskSignalGroupKind::Doc).unwrap();

            assert!(!risk_signals.is_empty());

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
    // These tests are actually testing that our integration with incode works.
    // But in other cases, we'll mock responses so we don't actually make requests
    let fp_client = FootprintVendorHttpClient::new(FpVendorClientArgs::default()).expect("client failed");
    state.set_incode_to_real_calls(fp_client);
    //
    // Set up
    //
    let obc_opts = if is_selfie {
        let doc_info = DocumentCdoInfo(
            DocTypeRestriction::None,
            CountryRestriction::None,
            Selfie::RequireSelfie,
        );
        ObConfigurationOpts {
            is_live: true,
            must_collect_data: vec![CollectedDataOption::Document(doc_info)],
            ..Default::default()
        }
    } else {
        ObConfigurationOpts {
            is_live: true,
            ..Default::default()
        }
    };
    let FixtureData {
        t: tenant,
        wf,
        v: uv,
        sv: su,
        obc,
        ..
    } = create_kyc_user_and_wf(state, obc_opts, None, None).await;
    let wf_id = wf.id.clone();
    let wf_id2 = wf.id.clone();

    // Needed for db constraints
    let suid = su.id.clone();
    let (di, id_doc) = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, DbError> {
            let di =
                DecisionIntent::get_or_create_for_workflow(conn, &suid, &wf.id, DecisionIntentKind::DocScan)
                    .unwrap();
            let ie = InsightEvent::get_for_workflow(conn, &wf_id)?.unwrap();

            let doc_request = DocumentRequest::get(conn, &wf.id, DocumentRequestKind::Identity)?.unwrap();

            let note = "I, Bob Boberto, consent to NOTHING".into();
            UserConsent::create(conn, Utc::now(), ie.id, note, false, wf_id)?;

            let id_doc = db::tests::fixtures::identity_document::create(conn, Some(doc_request.id));
            assert!(!id_doc.images(conn, true)?.is_empty());

            Ok((di, id_doc))
        })
        .await
        .unwrap();

    //
    // Run the incode verification machine, first with a blurry image
    //
    let docv_data = DocVData {
        front_image: Some(PiiString::from(non_document_image())),
        back_image: None,
        selfie_image: None,
        document_type: Some(IdDocKind::IdCard),
        first_name: Some(PiiString::from("Robert")),
        last_name: Some(PiiString::from("Roberto")),
        country_code: Some(PiiString::from("USA")),
        ..Default::default()
    };
    let vault_country = Some(newtypes::Iso3166TwoDigitCountryCode::US);

    let ctx = IncodeContext {
        di_id: di.id.clone(),
        sv_id: su.id.clone(),
        id_doc_id: id_doc.id.clone(),
        wf_id: wf_id2,
        vault: uv.clone(),
        obc: obc.clone(),
        docv_data,
        vault_country,
        doc_request_id: id_doc.request_id.clone(),
        enclave_client: state.enclave_client.clone(),
        tenant_id: tenant.id.clone(),
        ff_client: state.feature_flag_client.clone(),
        failed_attempts_for_side: 0,
        disable_selfie: false,
        is_re_run: false,
        aws_selfie_client: state.aws_selfie_doc_client.clone(),
    };
    let config_id = get_config_id(state, is_selfie, false, &tenant.id);
    let machine = IncodeStateMachine::init(state, tenant.id.clone(), config_id.clone(), ctx, false)
        .await
        .unwrap();
    let (machine, failure_reasons) = machine
        .run(&state.db_pool, &state.vendor_clients.incode)
        .await
        .unwrap();

    // Assert machine is in the correct state
    assert_eq!(machine.state.name(), IncodeVerificationSessionState::AddFront);

    assert_have_same_elements(
        failure_reasons,
        vec![
            IncodeFailureReason::UnableToAlignDocument,
            IncodeFailureReason::UnsupportedDocumentType,
        ],
    );

    let id_doc_id = id_doc.id.clone();
    let s_id = machine.session.id;
    state
        .db_pool
        .db_transaction(move |conn| -> DbResult<_> {
            let session = IncodeVerificationSession::get(conn, &id_doc_id).unwrap().unwrap();
            assert_eq!(session.state, IncodeVerificationSessionState::AddFront);
            assert_have_same_elements(
                session.latest_failure_reasons,
                vec![
                    IncodeFailureReason::UnableToAlignDocument,
                    IncodeFailureReason::UnsupportedDocumentType,
                ],
            );

            // Check we cleared out the front image to retry
            let (doc, _) = IdentityDocument::get(conn, &id_doc_id)?;
            assert!(doc.images(conn, true)?.is_empty());

            // Now, add our images to the vault as if the user hit the POST /document APi again
            let s3_url = S3Url::test_data("".into());
            let key = SealedVaultDataKey(vec![]);
            let seqno = DataLifetime::get_next_seqno(conn)?;
            let front_args = NewDocumentUploadArgs {
                document_id: doc.id.clone(),
                side: DocumentSide::Front,
                s3_url: s3_url.clone(),
                e_data_key: key.clone(),
                created_seqno: seqno,
                is_instant_app: None,
                is_app_clip: None,
                is_manual: None,
                is_extra_compressed: false,
                is_upload: None,
                is_forced_upload: None,
            };
            let back_args = NewDocumentUploadArgs {
                document_id: doc.id,
                side: DocumentSide::Front,
                s3_url,
                e_data_key: key,
                created_seqno: seqno,
                is_instant_app: None,
                is_app_clip: None,
                is_manual: None,
                is_extra_compressed: false,
                is_upload: None,
                is_forced_upload: None,
            };
            DocumentUpload::create(conn, front_args).unwrap();
            DocumentUpload::create(conn, back_args).unwrap();

            Ok(())
        })
        .await
        .unwrap();

    //
    // Now, simulate retrying with non-blurry
    //
    let mut ctx = machine.ctx;
    ctx.docv_data.front_image = Some(PiiString::from(small_front_image()));
    ctx.docv_data.back_image = Some(PiiString::from(small_back_image()));
    ctx.docv_data.selfie_image = Some(PiiString::from(selfie_image()));
    let machine = IncodeStateMachine::init(state, tenant.id.clone(), config_id.clone(), ctx, false)
        .await
        .unwrap();
    assert_eq!(machine.state.name(), IncodeVerificationSessionState::AddFront);

    let (machine, failure_reasons) = machine
        .run(&state.db_pool, &state.vendor_clients.incode)
        .await
        .unwrap();
    assert!(failure_reasons.is_empty());
    assert_eq!(machine.state.name(), IncodeVerificationSessionState::Complete);

    // Check we have the right things in the db
    state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            let session = IncodeVerificationSession::get(conn, &s_id).unwrap().unwrap();
            assert_eq!(session.state, IncodeVerificationSessionState::Complete);
            assert!(session.latest_failure_reasons.is_empty());

            let incode_events = IncodeVerificationSessionEvent::get_for_session_id(conn, &session.id)?;
            let states = incode_events
                .into_iter()
                .map(|i| i.incode_verification_session_state)
                .collect();

            let expected_states = vec![
                Some(IncodeVerificationSessionState::StartOnboarding),
                Some(IncodeVerificationSessionState::AddFront),
                Some(IncodeVerificationSessionState::AddFront), // Repeated since we failed the first time
                Some(IncodeVerificationSessionState::AddBack),
                is_selfie.then_some(IncodeVerificationSessionState::AddConsent),
                is_selfie.then_some(IncodeVerificationSessionState::AddSelfie),
                is_selfie.then_some(IncodeVerificationSessionState::ProcessFace),
                Some(IncodeVerificationSessionState::ProcessId),
                Some(IncodeVerificationSessionState::FetchScores),
                Some(IncodeVerificationSessionState::GetOnboardingStatus),
                Some(IncodeVerificationSessionState::Complete),
            ]
            .into_iter()
            .flatten()
            .collect();
            assert_have_same_elements(states, expected_states);

            // Check score res
            let (_, score_vres) = VerificationRequest::list(conn, &di.id)?
                .into_iter()
                .find(|(req, _)| req.vendor_api == VendorAPI::IncodeFetchScores)
                .unwrap();
            let score_result = IncodeAPIResult::<FetchScoresResponse>::try_from(
                score_vres.unwrap().response_for_test().inner(),
            )
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
            let (id_doc, _) = IdentityDocument::get(conn, &id_doc.id)?;
            assert_eq!(id_doc.status, IdentityDocumentStatus::Complete);

            Ok(())
        })
        .await
        .unwrap();

    // Clean up
    state
        .db_pool
        .db_transaction(move |conn| db::private_cleanup_integration_tests(conn, uv.id))
        .await
        .unwrap();
}
