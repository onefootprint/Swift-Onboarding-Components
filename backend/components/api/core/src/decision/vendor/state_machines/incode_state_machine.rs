use async_trait::async_trait;
use db::models::incode_verification_session::IncodeVerificationSession;
use db::models::vault::Vault;
use db::DbPool;
use enum_dispatch::enum_dispatch;
use idv::footprint_http_client::FootprintVendorHttpClient;

use newtypes::vendor_credentials::IncodeCredentialsWithToken;
use newtypes::{
    DecisionIntentId, DocVData, DocumentRequestId, IdentityDocumentId, IncodeConfigurationId,
    IncodeVerificationSessionState, ScopedVaultId, TenantId,
};

use crate::config::Config;
use crate::decision::vendor::state_machines::states::VerificationSession;
use crate::decision::vendor::tenant_vendor_control::TenantVendorControl;
use crate::enclave_client::EnclaveClient;
use crate::ApiError;

use super::states::*;

/// Various context fields needed by ever stage of the state machine
#[derive(Clone)]
pub struct IncodeContext {
    pub di_id: DecisionIntentId,
    pub sv_id: ScopedVaultId,
    pub id_doc_id: IdentityDocumentId,
    pub vault: Vault,
    pub docv_data: DocVData,
    pub doc_request_id: DocumentRequestId,
}

/// This trait represents a running a state transition for an Incode Verification session
#[async_trait]
#[enum_dispatch]
pub trait IncodeStateTransition {
    async fn run(
        self,
        db_pool: &DbPool,
        footprint_http_client: &FootprintVendorHttpClient,
        ctx: &IncodeContext,
    ) -> Result<IncodeState, ApiError>;
}

// These are concrete structs that implement `IncodeStateTransition`. By using `enum_dispatch`,
// we can recover the structs rather than working with trait objects (and we get some runtime perf increases)
#[enum_dispatch(IncodeStateTransition)]
pub enum IncodeState {
    StartOnboarding,
    AddConsent,
    AddFront,
    AddBack,
    RetryUpload,
    ProcessId,
    FetchScores,
    FetchOCR,
    Complete,
}

impl IncodeState {
    pub fn name(&self) -> IncodeVerificationSessionState {
        match self {
            IncodeState::StartOnboarding(_) => IncodeVerificationSessionState::StartOnboarding,
            IncodeState::AddFront(_) => IncodeVerificationSessionState::AddFront,
            IncodeState::AddConsent(_) => IncodeVerificationSessionState::AddConsent,
            IncodeState::AddBack(_) => IncodeVerificationSessionState::AddBack,
            IncodeState::RetryUpload(_) => IncodeVerificationSessionState::RetryUpload,
            IncodeState::ProcessId(_) => IncodeVerificationSessionState::ProcessId,
            IncodeState::FetchScores(_) => IncodeVerificationSessionState::FetchScores,
            IncodeState::FetchOCR(_) => IncodeVerificationSessionState::FetchOCR,
            IncodeState::Complete(_) => IncodeVerificationSessionState::Complete,
        }
    }

    fn is_terminal_state(&self) -> bool {
        matches!(
            self.name(),
            IncodeVerificationSessionState::RetryUpload | IncodeVerificationSessionState::Complete
        )
    }
}

pub struct IncodeMachineError {
    pub error: ApiError,
    pub state_name: IncodeVerificationSessionState,
}

impl std::fmt::Debug for IncodeMachineError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        format!(
            "IncodeStateMachine error: state={:?} error={:?}",
            &self.state_name, &self.error
        )
        .fmt(f)
    }
}

/// The machine that initializes and then runs a series of state transitions
pub struct IncodeStateMachine {
    pub state: IncodeState,
    pub ctx: IncodeContext,
}

impl IncodeStateMachine {
    #[allow(clippy::too_many_arguments)]
    pub async fn init(
        tenant_id: TenantId,
        db_pool: &DbPool,
        enclave_client: &EnclaveClient,
        config: &Config,
        configuration_id: IncodeConfigurationId,
        ctx: IncodeContext,
    ) -> Result<Self, ApiError> {
        // get incode credentials from TVC
        let tenant_vendor_control =
            TenantVendorControl::new(tenant_id, db_pool, enclave_client, config).await?;

        // Load our existing state
        let sv_id = ctx.sv_id.clone();
        let existing_verification_session = db_pool
            .db_query(move |conn| IncodeVerificationSession::get(conn, &sv_id))
            .await??;

        let initial_state: IncodeState = if let Some(existing) = existing_verification_session {
            match existing.state {
                IncodeVerificationSessionState::RetryUpload => {
                    let token = existing
                        .incode_authentication_token
                        .ok_or(ApiError::AssertionError("missing token".into()))?
                        .to_string()
                        .into();
                    let session = VerificationSession {
                        id: existing.id,
                        credentials: IncodeCredentialsWithToken {
                            credentials: tenant_vendor_control.incode_credentials(),
                            authentication_token: token,
                        },
                    };
                    RetryUpload::init(session).into()
                }
                _ => return Err(ApiError::AssertionError("wrong state".into())),
            }
        } else {
            StartOnboarding {
                incode_credentials: tenant_vendor_control.incode_credentials(),
                configuration_id,
            }
            .into()
        };

        Ok(Self {
            state: initial_state,
            ctx,
        })
    }

    pub async fn run(
        self,
        db_pool: &DbPool,
        footprint_http_client: &FootprintVendorHttpClient,
    ) -> Result<Self, IncodeMachineError> {
        let mut machine = self;
        loop {
            machine = machine.step(db_pool, footprint_http_client).await?;

            // Break if in `Complete` or `RetryUpload`
            if machine.state.is_terminal_state() {
                break;
            }
        }

        Ok(machine)
    }

    // Allows us to materialize each step
    pub async fn step(
        self,
        db_pool: &DbPool,
        footprint_http_client: &FootprintVendorHttpClient,
    ) -> Result<Self, IncodeMachineError> {
        let Self { state, ctx } = self;
        let current_state = state.name();

        let result = { state.run(db_pool, footprint_http_client, &ctx).await };

        result
            .map(|s| Self { state: s, ctx })
            .map_err(|e| IncodeMachineError {
                state_name: current_state,
                error: e,
            })
    }
}

#[cfg(test)]
mod tests {
    use chrono::Utc;
    use db::{
        models::{
            document_request::{DocumentRequest, DocumentRequestUpdate},
            identity_document::IdentityDocument,
            incode_verification_session::IncodeVerificationSession,
            incode_verification_session_event::IncodeVerificationSessionEvent,
            user_consent::UserConsent,
            verification_request::VerificationRequest,
        },
        test_helpers::{assert_have_same_elements, test_db_pool},
        DbError,
    };
    use idv::{
        footprint_http_client::FootprintVendorHttpClient,
        incode::{response::FetchScoresResponse, IncodeAPIResult},
    };
    use newtypes::{
        incode::{IncodeStatus, IncodeTest},
        vendor_apis_from_vendor, CollectedDataOption, DocVData, DocumentRequestStatus, IdDocKind,
        IncodeConfigurationId, IncodeVerificationSessionState, PiiString, Vendor, VendorAPI,
    };

    use super::{IncodeContext, IncodeState};
    use crate::{
        decision::{
            tests::test_helpers::create_user_and_onboarding,
            vendor::state_machines::{images::*, incode_state_machine::IncodeStateMachine},
        },
        utils::mock_enclave::StateWithMockEnclave,
    };
    use strum::IntoEnumIterator;
    use test_case::test_case;

    fn expected_vendor_apis(is_selfie: bool) -> Vec<VendorAPI> {
        let consent_apis = vec![VendorAPI::IncodeAddMLConsent, VendorAPI::IncodeAddPrivacyConsent];
        vendor_apis_from_vendor(Vendor::Incode)
            .into_iter()
            .filter(|v| {
                if !is_selfie && consent_apis.contains(v) {
                    return false;
                }

                true
            })
            .collect()
    }

    fn expected_incode_verification_session_states(
        is_selfie: bool,
        is_retry: bool,
    ) -> Vec<IncodeVerificationSessionState> {
        IncodeVerificationSessionState::iter()
            .filter(|s| {
                if !is_selfie && s == &IncodeVerificationSessionState::AddConsent {
                    return false;
                }

                if !is_retry && s == &IncodeVerificationSessionState::RetryUpload {
                    return false;
                }

                true
            })
            .collect()
    }

    #[ignore]
    #[test_case(true)]
    #[test_case(false)]
    #[tokio::test]
    async fn test_run_machine(is_selfie: bool) {
        //
        // Set up
        //
        let db_pool = test_db_pool();
        let state = &StateWithMockEnclave::init().await.state;
        let vendor_client = FootprintVendorHttpClient::new().unwrap();

        let must_collect_data = if is_selfie {
            Some(vec![CollectedDataOption::DocumentAndSelfie])
        } else {
            None
        };
        let (tenant, ob, uv, su, di) =
            create_user_and_onboarding(&db_pool, &state.enclave_client, must_collect_data).await;
        let suid = su.id.clone();
        let suid2 = su.id.clone();

        //
        // Simulate doc v data
        //
        let docv_data = DocVData {
            front_image: Some(PiiString::from(small_image())),
            back_image: Some(PiiString::from(small_image())),
            document_type: Some(IdDocKind::Passport),
            first_name: Some(PiiString::from("Robert")),
            last_name: Some(PiiString::from("Roberto")),
            ..Default::default()
        };

        // Needed for db constraints
        let id_doc = db_pool
            .db_transaction(move |conn| -> Result<IdentityDocument, DbError> {
                let doc_request = DocumentRequest::create(conn.conn(), suid, None, false, None).unwrap();
                if is_selfie {
                    UserConsent::create(
                        conn,
                        Utc::now(),
                        ob.id,
                        ob.insight_event_id,
                        "I, Bob Boberto, consent to NOTHING".into(),
                    )?;
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
        let ctx = IncodeContext {
            di_id: di.id.clone(),
            sv_id: su.id,
            id_doc_id: id_doc.id,
            vault: uv.clone(),
            docv_data,
            doc_request_id: id_doc.request_id,
        };
        let machine = IncodeStateMachine::init(
            tenant.id,
            &db_pool,
            &state.enclave_client,
            &state.config,
            IncodeConfigurationId::from("643450886f6f92d20b27599b".to_string()),
            ctx,
        )
        .await
        .unwrap();

        // Assert machine is in the correct final state
        let final_state = machine.run(&db_pool, &vendor_client).await.unwrap().state;

        match final_state {
            IncodeState::Complete(c) => assert!(c.fetch_scores_response.id_validation.is_some()),
            _ => panic!("state machine finished in wrong state!"),
        }

        db_pool
            .db_transaction(move |conn| -> Result<_, DbError> {
                let db_verifications =
                    VerificationRequest::list_successful_by_decision_intent_id(conn, &di.id)?;

                // Assert we've made all the requests we expect
                assert_have_same_elements(
                    db_verifications
                        .iter()
                        .filter_map(|(req, res, _)| res.as_ref().map(|_| req.vendor_api))
                        .collect(),
                    expected_vendor_apis(is_selfie),
                );

                let (_, score_vres, _) = db_verifications
                    .into_iter()
                    .find(|(req, _, _)| req.vendor_api == VendorAPI::IncodeFetchScores)
                    .unwrap();

                let incode_verification_session = IncodeVerificationSession::get(conn, &suid2)?.unwrap();
                let incode_events = IncodeVerificationSessionEvent::get_for_session_id(
                    conn,
                    incode_verification_session.id.clone(),
                )?;
                assert_have_same_elements(
                    incode_events
                        .into_iter()
                        .map(|i| i.incode_verification_session_state)
                        .collect(),
                    expected_incode_verification_session_states(is_selfie, false),
                );

                let score_result =
                    IncodeAPIResult::<FetchScoresResponse>::try_from(score_vres.unwrap().response.0)
                        .unwrap()
                        .into_success()
                        .unwrap();
                //
                // Assertions
                //
                assert_eq!(
                    incode_verification_session.state,
                    IncodeVerificationSessionState::Complete
                );
                let parsed_tests = score_result.get_id_tests();
                assert_eq!(
                    parsed_tests.get(&IncodeTest::FirstNameMatch).unwrap(),
                    &IncodeStatus::Fail
                );
                assert_eq!(
                    parsed_tests.get(&IncodeTest::LastNameMatch).unwrap(),
                    &IncodeStatus::Fail
                );

                db::private_cleanup_integration_tests(conn, uv.id).unwrap();

                Ok(())
            })
            .await
            .unwrap();
    }

    #[ignore]
    #[test_case(true)]
    #[test_case(false)]
    #[tokio::test]
    async fn test_e2e_with_retries(is_selfie: bool) {
        //
        // Set up
        //
        let db_pool = test_db_pool();
        let state = &StateWithMockEnclave::init().await.state;
        let vendor_client = FootprintVendorHttpClient::new().unwrap();

        let must_collect_data = if is_selfie {
            Some(vec![CollectedDataOption::DocumentAndSelfie])
        } else {
            None
        };
        let (tenant, ob, uv, su, di) =
            create_user_and_onboarding(&db_pool, &state.enclave_client, must_collect_data).await;
        let suid = su.id.clone();
        let suid2 = su.id.clone();
        let suid3 = su.id.clone();

        //
        // Simulate doc v data
        //
        let docv_data = DocVData {
            front_image: Some(PiiString::from(small_blurry_image())),
            back_image: Some(PiiString::from(small_blurry_image())),
            document_type: Some(IdDocKind::Passport),
            first_name: Some(PiiString::from("Robert")),
            last_name: Some(PiiString::from("Roberto")),
            ..Default::default()
        };

        // Needed for db constraints
        let (id_doc, doc_request) = db_pool
            .db_transaction(
                move |conn| -> Result<(IdentityDocument, DocumentRequest), DbError> {
                    let doc_request = DocumentRequest::create(conn.conn(), suid, None, false, None).unwrap();
                    if is_selfie {
                        UserConsent::create(
                            conn,
                            Utc::now(),
                            ob.id,
                            ob.insight_event_id,
                            "I, Bob Boberto, consent to NOTHING".into(),
                        )?;
                    }

                    Ok((
                        db::tests::fixtures::identity_document::create(conn, Some(doc_request.id.clone())),
                        doc_request,
                    ))
                },
            )
            .await
            .unwrap();

        //
        // Run the incode verification machine, first with a blurry image
        //
        let ctx = IncodeContext {
            di_id: di.id.clone(),
            sv_id: su.id.clone(),
            id_doc_id: id_doc.id,
            vault: uv.clone(),
            docv_data,
            doc_request_id: id_doc.request_id,
        };
        let machine = IncodeStateMachine::init(
            tenant.id.clone(),
            &db_pool,
            &state.enclave_client,
            &state.config,
            IncodeConfigurationId::from("643450886f6f92d20b27599b".to_string()),
            ctx,
        )
        .await
        .unwrap();

        assert_eq!(
            machine.state.name(),
            IncodeVerificationSessionState::StartOnboarding
        );

        // Assert machine is in the correct state
        let after_running_with_blurry_state = machine.run(&db_pool, &vendor_client).await.unwrap().state;

        let session_id = match after_running_with_blurry_state {
            IncodeState::RetryUpload(r) => r.session().id.clone(),
            _ => panic!("state machine finished in wrong state!"),
        };

        // Check we have the right things in the state db
        db_pool
            .db_query(move |conn| {
                let session = IncodeVerificationSession::get(conn, &session_id)
                    .unwrap()
                    .unwrap();

                assert!(session.latest_failure_reason.is_some())
            })
            .await
            .unwrap();

        //
        // Now, simulate retrying with non-blurry
        //
        let docv_data = DocVData {
            front_image: Some(PiiString::from(small_image())),
            back_image: Some(PiiString::from(small_image())),
            document_type: Some(IdDocKind::Passport),
            first_name: Some(PiiString::from("Robert")),
            last_name: Some(PiiString::from("Roberto")),
            ..Default::default()
        };

        // Needed for db constraints
        let id_doc = db_pool
            .db_transaction(move |conn| -> Result<IdentityDocument, DbError> {
                // need to deactivate previous doc request fist
                let update = DocumentRequestUpdate::status(DocumentRequestStatus::Failed);
                DocumentRequest::update_by_id(conn, &doc_request.id, update).unwrap();

                let new_doc_request =
                    DocumentRequest::create(conn.conn(), suid3, None, false, Some(doc_request.id)).unwrap();

                Ok(db::tests::fixtures::identity_document::create(
                    conn,
                    Some(new_doc_request.id),
                ))
            })
            .await
            .unwrap();

        //
        // Run the incode verification machine
        //
        let ctx = IncodeContext {
            di_id: di.id.clone(),
            sv_id: su.id,
            id_doc_id: id_doc.id,
            vault: uv.clone(),
            docv_data,
            doc_request_id: id_doc.request_id,
        };
        let machine = IncodeStateMachine::init(
            tenant.id,
            &db_pool,
            &state.enclave_client,
            &state.config,
            IncodeConfigurationId::from("643450886f6f92d20b27599b".to_string()),
            ctx,
        )
        .await
        .unwrap();

        assert_eq!(machine.state.name(), IncodeVerificationSessionState::RetryUpload);

        let final_state = machine.run(&db_pool, &vendor_client).await.unwrap().state;

        match final_state {
            IncodeState::Complete(c) => assert!(c.fetch_scores_response.id_validation.is_some()),
            _ => panic!("state machine finished in wrong state!"),
        }

        db_pool
            .db_transaction(move |conn| -> Result<_, DbError> {
                let (_, score_vres, _) =
                    VerificationRequest::list_successful_by_decision_intent_id(conn, &di.id)?
                        .into_iter()
                        .find(|(req, _, _)| req.vendor_api == VendorAPI::IncodeFetchScores)
                        .unwrap();

                let incode_verification_session = IncodeVerificationSession::get(conn, &suid2)?.unwrap();
                let incode_events = IncodeVerificationSessionEvent::get_for_session_id(
                    conn,
                    incode_verification_session.id.clone(),
                )?;
                assert_have_same_elements(
                    incode_events
                        .into_iter()
                        .map(|i| i.incode_verification_session_state)
                        .collect(),
                    vec![
                        IncodeVerificationSessionState::StartOnboarding,
                        IncodeVerificationSessionState::AddConsent,
                        IncodeVerificationSessionState::AddFront,
                        IncodeVerificationSessionState::RetryUpload,
                        IncodeVerificationSessionState::AddFront,
                        IncodeVerificationSessionState::AddBack,
                        IncodeVerificationSessionState::ProcessId,
                        IncodeVerificationSessionState::FetchScores,
                        IncodeVerificationSessionState::FetchOCR,
                        IncodeVerificationSessionState::Complete,
                    ]
                    .into_iter()
                    .filter(|s| is_selfie || !(s == &IncodeVerificationSessionState::AddConsent))
                    .collect(),
                );

                let score_result =
                    IncodeAPIResult::<FetchScoresResponse>::try_from(score_vres.unwrap().response.0)
                        .unwrap()
                        .into_success()
                        .unwrap();
                //
                // Assertions
                //
                assert_eq!(
                    incode_verification_session.state,
                    IncodeVerificationSessionState::Complete
                );
                let parsed_tests = score_result.get_id_tests();
                assert_eq!(
                    parsed_tests.get(&IncodeTest::FirstNameMatch).unwrap(),
                    &IncodeStatus::Fail
                );
                assert_eq!(
                    parsed_tests.get(&IncodeTest::LastNameMatch).unwrap(),
                    &IncodeStatus::Fail
                );

                db::private_cleanup_integration_tests(conn, uv.id).unwrap();

                Ok(())
            })
            .await
            .unwrap();
    }
}
