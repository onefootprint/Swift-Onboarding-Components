use async_trait::async_trait;
use db::models::verification_request::VerificationRequest;
use db::models::verification_result::VerificationResult;
use db::DbPool;
use idv::footprint_http_client::FootprintVendorHttpClient;

use idv::incode::{
    APIResponseToIncodeError, IncodeAddBackRequest, IncodeAddFrontRequest, IncodeFetchScoresRequest,
    IncodeProcessIdRequest, IncodeResponse, IncodeStartOnboardingRequest,
};
use newtypes::vendor_credentials::{IncodeCredentials, IncodeCredentialsWithToken};
use newtypes::{
    DecisionIntentId, DocVData, IdentityDocumentId, IncodeConfigurationId, ScopedVaultId, ScrubbedJsonValue,
    VaultPublicKey, VendorAPI, VerificationRequestId,
};

use crate::decision::vendor::verification_result::encrypt_verification_result_response;

use crate::errors::ApiResult;
use crate::ApiError;

use super::incode_state_machine::{IncodeState, IncodeStateName, Transition};
use crate::decision::vendor::vendor_trait::VendorAPICall;

pub struct StartOnboarding {
    pub incode_credentials: IncodeCredentials,
    pub configuration_id: IncodeConfigurationId,
    pub scoped_vault_id: ScopedVaultId,
    pub decision_intent_id: DecisionIntentId,
    pub identity_document_id: IdentityDocumentId,
}

#[async_trait]
impl IncodeState for StartOnboarding {
    fn name(&self) -> IncodeStateName {
        IncodeStateName::StartOnboarding
    }

    async fn run(
        &self,
        db_pool: &DbPool,
        footprint_http_client: &FootprintVendorHttpClient,
        uv_public_key: VaultPublicKey,
        _docv_data: &DocVData,
    ) -> Result<Transition, ApiError> {
        let sv_id = self.scoped_vault_id.clone();
        let sv_id2 = self.scoped_vault_id.clone();
        let di_id = self.decision_intent_id.clone();
        let di_id2 = self.decision_intent_id.clone();
        let incode_credentials = self.incode_credentials.clone();

        //
        // Save our initial VReq
        //
        let start_onboarding_verification_request = db_pool
            .db_query(move |conn| {
                VerificationRequest::create(conn, &sv_id, &di_id, VendorAPI::IncodeStartOnboarding)
            })
            .await??;

        //
        // make the request to incode
        //
        let request = IncodeStartOnboardingRequest {
            credentials: incode_credentials.clone(),
            configuration_id: self.configuration_id.clone(),
            session_id: None,
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
        let successful_response = request_result
            .map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        //
        // Set up the next state transition
        //
        let credentials = IncodeCredentialsWithToken {
            credentials: incode_credentials,
            authentication_token: successful_response.token,
        };
        let id_doc_id = self.identity_document_id.clone();
        // Save the next stage's Vreq
        let add_front_vreq = db_pool
            .db_query(move |conn| -> ApiResult<VerificationRequest> {
                let res = VerificationRequest::create_document_verification_request(
                    conn,
                    VendorAPI::IncodeAddFront,
                    sv_id2,
                    id_doc_id,
                    &di_id2,
                )?;

                Ok(res)
            })
            .await??;

        Ok(Transition::Next(Box::new(AddFront {
            credentials,
            scoped_vault_id: self.scoped_vault_id.clone(),
            decision_intent_id: self.decision_intent_id.clone(),
            add_front_verification_request: add_front_vreq,
            identity_document_id: self.identity_document_id.clone(),
        })))
    }
}

pub struct AddFront {
    pub credentials: IncodeCredentialsWithToken,
    pub scoped_vault_id: ScopedVaultId,
    pub decision_intent_id: DecisionIntentId,
    pub add_front_verification_request: VerificationRequest,
    pub identity_document_id: IdentityDocumentId,
}

#[async_trait]
impl IncodeState for AddFront {
    fn name(&self) -> IncodeStateName {
        IncodeStateName::AddFront
    }
    async fn run(
        &self,
        db_pool: &DbPool,
        footprint_http_client: &FootprintVendorHttpClient,
        uv_public_key: VaultPublicKey,
        docv_data: &DocVData,
    ) -> Result<Transition, ApiError> {
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
            credentials: self.credentials.clone(),
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
        request_result
            .map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        //
        // Set up the next state transition
        //
        let id_doc_id = self.identity_document_id.clone();
        // Save the next stage's Vreq
        let add_back_vreq = db_pool
            .db_query(move |conn| -> ApiResult<VerificationRequest> {
                let res = VerificationRequest::create_document_verification_request(
                    conn,
                    VendorAPI::IncodeAddBack,
                    sv_id,
                    id_doc_id,
                    &di_id,
                )?;

                Ok(res)
            })
            .await??;

        Ok(Transition::Next(Box::new(AddBack {
            credentials: self.credentials.clone(),
            scoped_vault_id: self.scoped_vault_id.clone(),
            decision_intent_id: self.decision_intent_id.clone(),
            add_back_verification_request: add_back_vreq,
        })))
    }
}

pub struct AddBack {
    pub credentials: IncodeCredentialsWithToken,
    pub scoped_vault_id: ScopedVaultId,
    pub decision_intent_id: DecisionIntentId,
    pub add_back_verification_request: VerificationRequest,
}

#[async_trait]
impl IncodeState for AddBack {
    fn name(&self) -> IncodeStateName {
        IncodeStateName::AddBack
    }

    async fn run(
        &self,
        db_pool: &DbPool,
        footprint_http_client: &FootprintVendorHttpClient,
        uv_public_key: VaultPublicKey,
        docv_data: &DocVData,
    ) -> Result<Transition, ApiError> {
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
            credentials: self.credentials.clone(),
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
        request_result
            .map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        //
        // Set up the next state transition
        //
        // Save the next stage's Vreq
        let process_id_vreq = db_pool
            .db_query(move |conn| -> ApiResult<VerificationRequest> {
                let res = VerificationRequest::create(conn, &sv_id, &di_id, VendorAPI::IncodeProcessId)?;

                Ok(res)
            })
            .await??;

        Ok(Transition::Next(Box::new(ProcessId {
            credentials: self.credentials.clone(),
            scoped_vault_id: self.scoped_vault_id.clone(),
            decision_intent_id: self.decision_intent_id.clone(),
            process_id_verification_request: process_id_vreq,
        })))
    }
}

pub struct ProcessId {
    pub credentials: IncodeCredentialsWithToken,
    pub scoped_vault_id: ScopedVaultId,
    pub decision_intent_id: DecisionIntentId,
    pub process_id_verification_request: VerificationRequest,
}

#[async_trait]
impl IncodeState for ProcessId {
    fn name(&self) -> IncodeStateName {
        IncodeStateName::ProcessId
    }

    async fn run(
        &self,
        db_pool: &DbPool,
        footprint_http_client: &FootprintVendorHttpClient,
        uv_public_key: VaultPublicKey,
        _docv_data: &DocVData,
    ) -> Result<Transition, ApiError> {
        let sv_id = self.scoped_vault_id.clone();
        let di_id = self.decision_intent_id.clone();

        //
        // make the request to incode
        //
        let process_id_vreq_id = self.process_id_verification_request.id.clone();

        let request = IncodeProcessIdRequest {
            credentials: self.credentials.clone(),
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
        let process_id_vreq = db_pool
            .db_query(move |conn| -> ApiResult<VerificationRequest> {
                let res = VerificationRequest::create(conn, &sv_id, &di_id, VendorAPI::IncodeFetchScores)?;

                Ok(res)
            })
            .await??;

        Ok(Transition::Next(Box::new(FetchScores {
            credentials: self.credentials.clone(),
            fetch_scores_verification_request: process_id_vreq,
        })))
    }
}

pub struct FetchScores {
    pub credentials: IncodeCredentialsWithToken,
    pub fetch_scores_verification_request: VerificationRequest,
}

#[async_trait]
impl IncodeState for FetchScores {
    fn name(&self) -> IncodeStateName {
        IncodeStateName::FetchScores
    }

    async fn run(
        &self,
        db_pool: &DbPool,
        footprint_http_client: &FootprintVendorHttpClient,
        uv_public_key: VaultPublicKey,
        _docv_data: &DocVData,
    ) -> Result<Transition, ApiError> {
        //
        // make the request to incode
        //
        let fetch_scores_vreq_id = self.fetch_scores_verification_request.id.clone();

        let request = IncodeFetchScoresRequest {
            credentials: self.credentials.clone(),
        };

        let request_result = footprint_http_client.make_request(request).await;

        //
        // Save our result
        //
        let save_verification_result_args =
            SaveVerificationResultArgs::from((&request_result, fetch_scores_vreq_id));

        save_incode_verification_result(db_pool, save_verification_result_args, &uv_public_key).await?;

        // Now ensure we don't have an error
        request_result
            .map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        // We're done!
        // TODO: Since this yields control back to /documents, I think we'll
        // want to actually return VRes or something
        Ok(Transition::Complete)
    }
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
