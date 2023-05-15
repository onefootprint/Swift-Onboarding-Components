use async_trait::async_trait;
use db::models::incode_verification_session::{IncodeVerificationSession, UpdateIncodeVerificationSession};
use db::models::verification_request::VerificationRequest;
use db::models::verification_result::VerificationResult;
use db::{DbPool, DbResult};
use idv::footprint_http_client::FootprintVendorHttpClient;

use idv::incode::{request::OnboardingStartCustomNameFields, response::FetchScoresResponse};
use idv::incode::{
    APIResponseToIncodeError, IncodeAddBackRequest, IncodeAddFrontRequest, IncodeFetchScoresRequest,
    IncodeProcessIdRequest, IncodeResponse, IncodeStartOnboardingRequest,
};
use newtypes::vendor_credentials::{IncodeCredentials, IncodeCredentialsWithToken};
use newtypes::{
    DecisionIntentId, DocVData, IdentityDocumentId, IncodeAuthorizationToken, IncodeConfigurationId,
    IncodeSessionId, IncodeVerificationSessionId, IncodeVerificationSessionState, ScopedVaultId,
    ScrubbedJsonValue, VaultPublicKey, VendorAPI, VerificationRequestId,
};

use crate::decision::vendor::verification_result::encrypt_verification_result_response;

use crate::errors::ApiResult;
use crate::ApiError;

use super::incode_state_machine::{IncodeState, IncodeStateTransition};
use crate::decision::vendor::vendor_trait::VendorAPICall;

pub mod state_impl {
    use db::models::user_consent::UserConsent;
    use idv::incode::{
        response::FetchOCRResponse, IncodeAddMLConsentRequest, IncodeAddPrivacyConsentRequest,
        IncodeFetchOCRRequest,
    };
    use newtypes::IncodeVerificationFailureReason;

    use super::*;

    pub struct StartOnboarding {
        pub incode_credentials: IncodeCredentials,
        pub configuration_id: IncodeConfigurationId,
        pub scoped_vault_id: ScopedVaultId,
        pub decision_intent_id: DecisionIntentId,
        pub identity_document_id: IdentityDocumentId,
    }

    #[async_trait]
    impl IncodeStateTransition for StartOnboarding {
        async fn run(
            &self,
            db_pool: &DbPool,
            footprint_http_client: &FootprintVendorHttpClient,
            uv_public_key: VaultPublicKey,
            docv_data: &DocVData,
        ) -> Result<IncodeState, ApiError> {
            let sv_id = self.scoped_vault_id.clone();
            let sv_id2 = self.scoped_vault_id.clone();
            let di_id = self.decision_intent_id.clone();
            let di_id2 = self.decision_intent_id.clone();
            let incode_credentials = self.incode_credentials.clone();
            let config_id = self.configuration_id.clone();
            let id_doc_id2 = self.identity_document_id.clone();

            //
            // Save our initial VReq
            //
            let (start_onboarding_verification_request, verification_session) = db_pool
                .db_transaction(
                    move |conn| -> DbResult<(VerificationRequest, IncodeVerificationSession)> {
                        let vr = VerificationRequest::create(
                            conn,
                            &sv_id,
                            &di_id,
                            VendorAPI::IncodeStartOnboarding,
                        )?;
                        // Initialize the incode state
                        let is = IncodeVerificationSession::create(conn, sv_id, config_id, id_doc_id2)?;

                        Ok((vr, is))
                    },
                )
                .await?;

            //
            // make the request to incode
            //
            // TODO: we need to be able to error if the fn/ln is missing and we need it
            let custom_name_fields = OnboardingStartCustomNameFields {
                first_name: docv_data.first_name.clone(),
                last_name: docv_data.last_name.clone(),
            };
            let request = IncodeStartOnboardingRequest {
                credentials: incode_credentials.clone(),
                configuration_id: self.configuration_id.clone(),
                session_id: None,
                custom_name_fields: Some(custom_name_fields),
            };

            let request_result = footprint_http_client.make_request(request).await;

            //
            // Save our result
            //
            let save_verification_result_args = SaveVerificationResultArgs::from((
                &request_result,
                start_onboarding_verification_request.id.clone(),
            ));

            save_incode_verification_result(db_pool, save_verification_result_args, &uv_public_key).await?;

            // Now ensure we don't have an error
            // If we get an error here, the response does not include interviewId or anything else, so we just error here and will restart
            let successful_response = request_result
                .map_err(map_to_api_err)?
                .result
                .into_success()
                .map_err(map_to_api_err)?;

            //
            // Set up the next state transition
            //
            let session = VerificationSession {
                id: verification_session.id.clone(),
                credentials: IncodeCredentialsWithToken {
                    credentials: incode_credentials,
                    authentication_token: successful_response.token.clone(),
                },
            };

            // Save the next stage's Vreq
            let (consent, privacy_vreq, ml_vreq) = db_pool
                .db_transaction(
                    move |conn| -> ApiResult<(UserConsent, VerificationRequest, VerificationRequest)> {
                        // Update our state to the next stage
                        let update = UpdateIncodeVerificationSession::set_state_and_incode_session_and_token(
                            IncodeVerificationSessionState::AddConsent,
                            IncodeSessionId::from(successful_response.interview_id),
                            IncodeAuthorizationToken::from(successful_response.token.leak_to_string()),
                        );

                        IncodeVerificationSession::update(conn, verification_session.id, update)?;

                        // we need consent in order to proceed, so we error
                        let consent = UserConsent::latest_for_scoped_vault(conn, &sv_id2)?
                            .ok_or(ApiError::AssertionError("User consent not found".into()))?;

                        let privacy_vreq = VerificationRequest::create(
                            conn,
                            &sv_id2,
                            &di_id2,
                            VendorAPI::IncodeAddPrivacyConsent,
                        )?;

                        let ml_vreq = VerificationRequest::create(
                            conn,
                            &sv_id2,
                            &di_id2,
                            VendorAPI::IncodeAddMLConsent,
                        )?;

                        Ok((consent, privacy_vreq, ml_vreq))
                    },
                )
                .await?;
            // If we don't have consent, we can't proceed

            Ok(AddConsent {
                session,
                user_consent_text: consent.consent_language_text,
                scoped_vault_id: self.scoped_vault_id.clone(),
                decision_intent_id: self.decision_intent_id.clone(),
                identity_document_id: self.identity_document_id.clone(),
                privacy_vreq,
                ml_vreq,
            }
            .into())
        }
    }

    /// Add Consent
    pub struct AddConsent {
        pub session: VerificationSession,
        pub user_consent_text: String,
        pub privacy_vreq: VerificationRequest,
        pub ml_vreq: VerificationRequest,
        pub scoped_vault_id: ScopedVaultId,
        pub decision_intent_id: DecisionIntentId,
        pub identity_document_id: IdentityDocumentId,
    }

    #[async_trait]
    impl IncodeStateTransition for AddConsent {
        async fn run(
            &self,
            db_pool: &DbPool,
            footprint_http_client: &FootprintVendorHttpClient,
            uv_public_key: VaultPublicKey,
            _docv_data: &DocVData,
        ) -> Result<IncodeState, ApiError> {
            let sv_id = self.scoped_vault_id.clone();
            let di_id = self.decision_intent_id.clone();
            let id_doc_id = self.identity_document_id.clone();

            let privacy_request = IncodeAddPrivacyConsentRequest {
                credentials: self.session.credentials.clone(),
                title: "Service Consent".into(),
                content: self.user_consent_text.to_owned(),
            };
            // TODO this should be separated out from privacy in bifrost
            let ml_request = IncodeAddMLConsentRequest {
                credentials: self.session.credentials.clone(),
                status: true,
            };

            let privacy_request_result = footprint_http_client.make_request(privacy_request).await;
            let ml_request_result = footprint_http_client.make_request(ml_request).await;

            //
            // Save our result
            //
            let save_privacy_verification_result_args =
                SaveVerificationResultArgs::from((&privacy_request_result, self.privacy_vreq.id.clone()));
            let save_ml_verification_result_args =
                SaveVerificationResultArgs::from((&ml_request_result, self.ml_vreq.id.clone()));

            save_incode_verification_result(db_pool, save_privacy_verification_result_args, &uv_public_key)
                .await?;
            save_incode_verification_result(db_pool, save_ml_verification_result_args, &uv_public_key)
                .await?;

            // Now ensure we don't have an error
            privacy_request_result
                .map_err(map_to_api_err)?
                .result
                .into_success()
                .map_err(map_to_api_err)?;

            ml_request_result
                .map_err(map_to_api_err)?
                .result
                .into_success()
                .map_err(map_to_api_err)?;

            //
            // Set up the next state transition
            //
            // Save the next stage's Vreq
            let verification_session_id = self.session.id.clone();
            let add_front_vreq = db_pool
                .db_transaction(move |conn| -> ApiResult<VerificationRequest> {
                    let res = VerificationRequest::create_document_verification_request(
                        conn,
                        VendorAPI::IncodeAddFront,
                        sv_id,
                        id_doc_id,
                        &di_id,
                    )?;

                    let update =
                        UpdateIncodeVerificationSession::set_state(IncodeVerificationSessionState::AddFront);

                    IncodeVerificationSession::update(conn, verification_session_id, update)?;

                    Ok(res)
                })
                .await?;

            Ok(AddFront {
                session: self.session.to_owned(),
                scoped_vault_id: self.scoped_vault_id.clone(),
                decision_intent_id: self.decision_intent_id.clone(),
                add_front_verification_request: add_front_vreq,
                identity_document_id: self.identity_document_id.clone(),
            }
            .into())
        }
    }

    pub struct AddFront {
        pub session: VerificationSession,
        pub scoped_vault_id: ScopedVaultId,
        pub decision_intent_id: DecisionIntentId,
        pub add_front_verification_request: VerificationRequest,
        pub identity_document_id: IdentityDocumentId,
    }

    #[async_trait]
    impl IncodeStateTransition for AddFront {
        async fn run(
            &self,
            db_pool: &DbPool,
            footprint_http_client: &FootprintVendorHttpClient,
            uv_public_key: VaultPublicKey,
            docv_data: &DocVData,
        ) -> Result<IncodeState, ApiError> {
            let sv_id = self.scoped_vault_id.clone();
            let di_id = self.decision_intent_id.clone();

            //
            // make the request to incode
            //
            let add_front_vreq_id = self.add_front_verification_request.id.clone();
            let docv_data = DocVData {
                front_image: docv_data.front_image.clone(),
                country_code: docv_data.country_code.clone(),
                document_type: docv_data.document_type,
                ..Default::default()
            };
            let request = IncodeAddFrontRequest {
                credentials: self.session.credentials.clone(),
                docv_data,
            };
            let request_result = footprint_http_client.make_request(request).await;

            //
            // Save our result
            //
            let save_verification_result_args =
                SaveVerificationResultArgs::from((&request_result, add_front_vreq_id));

            save_incode_verification_result(db_pool, save_verification_result_args, &uv_public_key).await?;

            // Now ensure we don't have an error
            let response = request_result
                .map_err(map_to_api_err)?
                .result
                .into_success()
                .map_err(map_to_api_err)?;

            // Incode returns 200 for upload failures, so catch these here
            let failure_reason = response.add_side_failure_reason();

            //
            // Set up the next state transition
            //
            let verification_session_id = self.session.id.clone();
            let id_doc_id = self.identity_document_id.clone();
            // Save the next stage's Vreq
            let add_back_vreq = db_pool
                .db_transaction(move |conn| -> ApiResult<Option<VerificationRequest>> {
                    // If there's failure, we move to retry upload
                    let vreq = if let Some(reason) = failure_reason {
                        let update =
                            UpdateIncodeVerificationSession::set_state_to_retry_with_failure_reason(reason);

                        IncodeVerificationSession::update(conn, verification_session_id, update)?;

                        None
                    } else {
                        let res = VerificationRequest::create_document_verification_request(
                            conn,
                            VendorAPI::IncodeAddBack,
                            sv_id,
                            id_doc_id,
                            &di_id,
                        )?;

                        let update = UpdateIncodeVerificationSession::set_state(
                            IncodeVerificationSessionState::AddBack,
                        );

                        IncodeVerificationSession::update(conn, verification_session_id, update)?;

                        Some(res)
                    };

                    Ok(vreq)
                })
                .await?;

            if let Some(vreq) = add_back_vreq {
                Ok(AddBack {
                    session: self.session.clone(),
                    scoped_vault_id: self.scoped_vault_id.clone(),
                    decision_intent_id: self.decision_intent_id.clone(),
                    identity_document_id: self.identity_document_id.clone(),
                    add_back_verification_request: vreq,
                }
                .into())
            } else {
                Ok(RetryUpload {
                    session: self.session.clone(),
                    scoped_vault_id: self.scoped_vault_id.clone(),
                    decision_intent_id: self.decision_intent_id.clone(),
                    identity_document_id: self.identity_document_id.clone(),
                }
                .into())
            }
        }
    }

    pub struct AddBack {
        pub session: VerificationSession,
        pub scoped_vault_id: ScopedVaultId,
        pub decision_intent_id: DecisionIntentId,
        pub identity_document_id: IdentityDocumentId,
        pub add_back_verification_request: VerificationRequest,
    }

    #[async_trait]
    impl IncodeStateTransition for AddBack {
        async fn run(
            &self,
            db_pool: &DbPool,
            footprint_http_client: &FootprintVendorHttpClient,
            uv_public_key: VaultPublicKey,
            docv_data: &DocVData,
        ) -> Result<IncodeState, ApiError> {
            let sv_id = self.scoped_vault_id.clone();
            let di_id = self.decision_intent_id.clone();

            //
            // make the request to incode
            //
            let add_back_vreq_id = self.add_back_verification_request.id.clone();
            let docv_data = DocVData {
                back_image: docv_data.back_image.clone(),
                country_code: docv_data.country_code.clone(),
                document_type: docv_data.document_type,
                ..Default::default()
            };
            let request = IncodeAddBackRequest {
                credentials: self.session.credentials.clone(),
                docv_data,
            };
            let request_result = footprint_http_client.make_request(request).await;

            //
            // Save our result
            //
            let save_verification_result_args =
                SaveVerificationResultArgs::from((&request_result, add_back_vreq_id));

            save_incode_verification_result(db_pool, save_verification_result_args, &uv_public_key).await?;

            // Now ensure we don't have an error
            let response = request_result
                .map_err(map_to_api_err)?
                .result
                .into_success()
                .map_err(map_to_api_err)?;

            // Incode returns 200 for upload failures, so catch these here
            let failure_reason = response.add_side_failure_reason().and_then(|r| {
                if r != IncodeVerificationFailureReason::WrongOneSidedDocument {
                    Some(r)
                } else {
                    None
                }
            });

            //
            // Set up the next state transition
            //
            // Save the next stage's Vreq
            let verification_session_id = self.session.id.clone();
            let process_id_vreq = db_pool
                .db_transaction(move |conn| -> ApiResult<Option<VerificationRequest>> {
                    // If there's failure, we move to retry upload
                    let vreq = if let Some(reason) = failure_reason {
                        let update =
                            UpdateIncodeVerificationSession::set_state_to_retry_with_failure_reason(reason);
                        IncodeVerificationSession::update(conn, verification_session_id, update)?;

                        None
                    } else {
                        let res =
                            VerificationRequest::create(conn, &sv_id, &di_id, VendorAPI::IncodeProcessId)?;
                        let update = UpdateIncodeVerificationSession::set_state(
                            IncodeVerificationSessionState::ProcessId,
                        );

                        IncodeVerificationSession::update(conn, verification_session_id, update)?;

                        Some(res)
                    };

                    Ok(vreq)
                })
                .await?;

            if let Some(vreq) = process_id_vreq {
                Ok(ProcessId {
                    session: self.session.clone(),
                    scoped_vault_id: self.scoped_vault_id.clone(),
                    decision_intent_id: self.decision_intent_id.clone(),
                    process_id_verification_request: vreq,
                }
                .into())
            } else {
                Ok(RetryUpload {
                    session: self.session.clone(),
                    scoped_vault_id: self.scoped_vault_id.clone(),
                    decision_intent_id: self.decision_intent_id.clone(),
                    identity_document_id: self.identity_document_id.clone(),
                }
                .into())
            }
        }
    }

    pub struct ProcessId {
        pub session: VerificationSession,
        pub scoped_vault_id: ScopedVaultId,
        pub decision_intent_id: DecisionIntentId,
        pub process_id_verification_request: VerificationRequest,
    }

    #[async_trait]
    impl IncodeStateTransition for ProcessId {
        async fn run(
            &self,
            db_pool: &DbPool,
            footprint_http_client: &FootprintVendorHttpClient,
            uv_public_key: VaultPublicKey,
            _docv_data: &DocVData,
        ) -> Result<IncodeState, ApiError> {
            let sv_id = self.scoped_vault_id.clone();
            let di_id = self.decision_intent_id.clone();

            //
            // make the request to incode
            //
            let process_id_vreq_id = self.process_id_verification_request.id.clone();

            let request = IncodeProcessIdRequest {
                credentials: self.session.credentials.clone(),
            };
            let request_result = footprint_http_client.make_request(request).await;

            //
            // Save our result
            //
            let save_verification_result_args =
                SaveVerificationResultArgs::from((&request_result, process_id_vreq_id));

            save_incode_verification_result(db_pool, save_verification_result_args, &uv_public_key).await?;

            // Now ensure we don't have an error
            request_result
                .map_err(map_to_api_err)?
                .result
                .into_success()
                .map_err(map_to_api_err)?;

            //
            // Set up the next state transition
            //
            // Save the next stage's Vreq
            let verification_session_id = self.session.id.clone();
            let process_id_vreq = db_pool
                .db_transaction(move |conn| -> ApiResult<VerificationRequest> {
                    let res =
                        VerificationRequest::create(conn, &sv_id, &di_id, VendorAPI::IncodeFetchScores)?;

                    let update = UpdateIncodeVerificationSession::set_state(
                        IncodeVerificationSessionState::FetchScores,
                    );

                    IncodeVerificationSession::update(conn, verification_session_id, update)?;

                    Ok(res)
                })
                .await?;

            Ok(FetchScores {
                session: self.session.clone(),
                scoped_vault_id: self.scoped_vault_id.clone(),
                decision_intent_id: self.decision_intent_id.clone(),
                fetch_scores_verification_request: process_id_vreq,
            }
            .into())
        }
    }

    pub struct FetchScores {
        pub session: VerificationSession,
        pub scoped_vault_id: ScopedVaultId,
        pub decision_intent_id: DecisionIntentId,
        pub fetch_scores_verification_request: VerificationRequest,
    }

    #[async_trait]
    impl IncodeStateTransition for FetchScores {
        async fn run(
            &self,
            db_pool: &DbPool,
            footprint_http_client: &FootprintVendorHttpClient,
            uv_public_key: VaultPublicKey,
            _docv_data: &DocVData,
        ) -> Result<IncodeState, ApiError> {
            let sv_id = self.scoped_vault_id.clone();
            let di_id = self.decision_intent_id.clone();
            //
            // make the request to incode
            //
            let fetch_scores_vreq_id = self.fetch_scores_verification_request.id.clone();

            let request = IncodeFetchScoresRequest {
                credentials: self.session.credentials.clone(),
            };

            let request_result = footprint_http_client.make_request(request).await;

            //
            // Save our result
            //
            let save_verification_result_args =
                SaveVerificationResultArgs::from((&request_result, fetch_scores_vreq_id));

            save_incode_verification_result(db_pool, save_verification_result_args, &uv_public_key).await?;

            // Now ensure we don't have an error
            let fetch_scores_response = request_result
                .map_err(map_to_api_err)?
                .result
                .into_success()
                .map_err(map_to_api_err)?;

            let verification_session_id = self.session.id.clone();
            let fetch_ocr_verification_request = db_pool
                .db_transaction(move |conn| -> ApiResult<VerificationRequest> {
                    let req = VerificationRequest::create(conn, &sv_id, &di_id, VendorAPI::IncodeFetchOCR)?;

                    let update =
                        UpdateIncodeVerificationSession::set_state(IncodeVerificationSessionState::FetchOCR);

                    IncodeVerificationSession::update(conn, verification_session_id, update)?;

                    Ok(req)
                })
                .await?;

            Ok(FetchOCR {
                session: self.session.clone(),
                fetch_scores_response,
                fetch_ocr_verification_request,
            }
            .into())
        }
    }

    pub struct FetchOCR {
        pub session: VerificationSession,
        pub fetch_ocr_verification_request: VerificationRequest,
        pub fetch_scores_response: FetchScoresResponse,
    }

    #[async_trait]
    impl IncodeStateTransition for FetchOCR {
        async fn run(
            &self,
            db_pool: &DbPool,
            footprint_http_client: &FootprintVendorHttpClient,
            uv_public_key: VaultPublicKey,
            _docv_data: &DocVData,
        ) -> Result<IncodeState, ApiError> {
            //
            // make the request to incode
            //
            let fetch_ocr_vreq_id = self.fetch_ocr_verification_request.id.clone();

            let request = IncodeFetchOCRRequest {
                credentials: self.session.credentials.clone(),
            };

            let request_result = footprint_http_client.make_request(request).await;

            //
            // Save our result
            //
            let save_verification_result_args =
                SaveVerificationResultArgs::from((&request_result, fetch_ocr_vreq_id));

            save_incode_verification_result(db_pool, save_verification_result_args, &uv_public_key).await?;

            // Now ensure we don't have an error
            let fetch_ocr_response = request_result
                .map_err(map_to_api_err)?
                .result
                .into_success()
                .map_err(map_to_api_err)?;

            let verification_session_id = self.session.id.clone();
            db_pool
                .db_transaction(move |conn| -> ApiResult<()> {
                    let update =
                        UpdateIncodeVerificationSession::set_state(IncodeVerificationSessionState::Complete);

                    IncodeVerificationSession::update(conn, verification_session_id, update)?;

                    Ok(())
                })
                .await?;

            // We're done!
            Ok(Complete {
                fetch_scores_response: self.fetch_scores_response.clone(),
                fetch_ocr_response,
            }
            .into())
        }
    }

    pub struct Complete {
        pub fetch_scores_response: FetchScoresResponse,
        pub fetch_ocr_response: FetchOCRResponse,
    }

    #[async_trait]
    impl IncodeStateTransition for Complete {
        async fn run(
            &self,
            _db_pool: &DbPool,
            _footprint_http_client: &FootprintVendorHttpClient,
            _uv_public_key: VaultPublicKey,
            _docv_data: &DocVData,
        ) -> Result<IncodeState, ApiError> {
            Err(ApiError::AssertionError("incode already complete".into()))
        }
    }

    /// Document upload has failed and user needs to retry
    pub struct RetryUpload {
        pub session: VerificationSession,
        pub identity_document_id: IdentityDocumentId,
        pub scoped_vault_id: ScopedVaultId,
        pub decision_intent_id: DecisionIntentId,
    }

    #[async_trait]
    impl IncodeStateTransition for RetryUpload {
        async fn run(
            &self,
            db_pool: &DbPool,
            _footprint_http_client: &FootprintVendorHttpClient,
            _uv_public_key: VaultPublicKey,
            _docv_data: &DocVData,
        ) -> Result<IncodeState, ApiError> {
            let sv_id = self.scoped_vault_id.clone();
            let di_id = self.decision_intent_id.clone();
            let session_id = self.session.id.clone();
            let id_doc_id = self.identity_document_id.clone();
            //
            // Set up the next state transition
            //
            // Save the next stage's Vreq
            let add_front_vreq = db_pool
                .db_transaction(move |conn| -> ApiResult<VerificationRequest> {
                    let res = VerificationRequest::create_document_verification_request(
                        conn,
                        VendorAPI::IncodeAddFront,
                        sv_id,
                        id_doc_id,
                        &di_id,
                    )?;

                    // Update our state to the next stage
                    let update =
                        UpdateIncodeVerificationSession::set_state(IncodeVerificationSessionState::AddFront);

                    IncodeVerificationSession::update(conn, session_id, update)?;

                    Ok(res)
                })
                .await?;

            Ok(AddFront {
                session: self.session.to_owned(),
                scoped_vault_id: self.scoped_vault_id.clone(),
                decision_intent_id: self.decision_intent_id.clone(),
                add_front_verification_request: add_front_vreq,
                identity_document_id: self.identity_document_id.clone(),
            }
            .into())
        }
    }
}

#[derive(Clone)]
pub struct VerificationSession {
    pub id: IncodeVerificationSessionId,
    pub credentials: IncodeCredentialsWithToken,
}

/// Struct to make sure we handle the different cases of Incode vendor call errors we may see
struct SaveVerificationResultArgs {
    pub is_error: bool,
    pub raw_response: serde_json::Value,
    pub scrubbed_response: ScrubbedJsonValue,
    pub verification_request_id: VerificationRequestId,
}

impl<T: APIResponseToIncodeError + serde::Serialize>
    From<(
        &Result<IncodeResponse<T>, idv::incode::error::Error>,
        VerificationRequestId,
    )> for SaveVerificationResultArgs
{
    fn from(
        value: (
            &Result<IncodeResponse<T>, idv::incode::error::Error>,
            VerificationRequestId,
        ),
    ) -> Self {
        let (request_result, verification_request_id) = value;
        // We need to handle saving if
        // 1) if the Incode call fails (for some reason)
        // 2) if the Incode response succeeds but there's an error returned
        match request_result {
            Ok(response) => {
                let is_error = response.result.is_error();
                let raw_response = response.raw_response.clone();
                let scrubbed_response = response
                    .result
                    .scrub()
                    .map_err(map_to_api_err)
                    .unwrap_or(serde_json::json!("").into());

                Self {
                    is_error,
                    raw_response,
                    scrubbed_response,
                    verification_request_id,
                }
            }
            Err(_) => Self {
                is_error: true,
                raw_response: serde_json::json!(""),
                scrubbed_response: serde_json::json!("").into(),
                verification_request_id,
            },
        }
    }
}

async fn save_incode_verification_result(
    db_pool: &DbPool,
    args: SaveVerificationResultArgs,
    user_vault_public_key: &VaultPublicKey,
) -> ApiResult<VerificationResult> {
    let uvk = user_vault_public_key.clone();

    db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let e_response = encrypt_verification_result_response(&args.raw_response.into(), &uvk)?;

            let res = VerificationResult::create(
                conn,
                args.verification_request_id,
                args.scrubbed_response,
                e_response,
                args.is_error,
            )?;

            Ok(res)
        })
        .await?
}

fn map_to_api_err(e: idv::incode::error::Error) -> ApiError {
    ApiError::from(idv::Error::from(e))
}
