use std::slice;

use crate::{
    decision::engine::VendorResults,
    enclave_client::EnclaveClient,
    errors::{ApiError, ApiResult},
};
use chrono::Utc;
use db::{
    models::{
        verification_request::{NewVerificationRequestArgs, VerificationRequest},
        verification_result::{NewVerificationResult, VerificationResult},
    },
    DbError, DbPool, PgConn,
};
use idv::VendorResponse;
use newtypes::{
    DecisionIntentId, EncryptedVaultPrivateKey, DocumentId, PiiJsonValue, ScopedVaultId,
    ScrubbedPiiJsonValue, SealedVaultBytes, VaultPublicKey, VendorAPI, VerificationRequestId,
    VerificationResultId,
};

use super::{
    make_request::VerificationRequestWithVendorResponse,
    vendor_api::vendor_api_response::scrub_raw_error_vendor_response, VendorAPIError,
};

/// Save a verification result, encrypting the response payload in the process
pub fn save_verification_results(
    conn: &mut PgConn,
    vendor_responses: &[VerificationRequestWithVendorResponse],
    user_vault_public_key: &VaultPublicKey, // passed in so unit testing is easier
) -> Result<Vec<VerificationResult>, ApiError> {
    let now = Utc::now();
    let new_verification_results: Vec<NewVerificationResult> = vendor_responses
        .iter()
        .map(|(req, res)| {
            // For testing rollout of footprint
            let scrubbed_json = ScrubbedPiiJsonValue::scrub(&res.response)?;

            let e_response = encrypt_verification_result_response(&res.raw_response, user_vault_public_key)?;

            Ok(NewVerificationResult {
                request_id: req.id.clone(),
                response: scrubbed_json,
                timestamp: now,
                e_response: Some(e_response),
                is_error: false,
            })
        })
        .collect::<Result<Vec<NewVerificationResult>, ApiError>>()?;

    Ok(VerificationResult::bulk_create(conn, new_verification_results)?)
}

/// Save a verification result for an errored VRes, encrypting the response payload in the process (if we got one back)
/// For requests with no response payload, we will notate on VRes that the request was an error
pub fn save_error_verification_results(
    conn: &mut PgConn,
    vendor_responses_with_errors: &[(VerificationRequest, Option<PiiJsonValue>)],
    user_vault_public_key: &VaultPublicKey, // passed in so unit testing is easier
) -> Result<Vec<VerificationResult>, ApiError> {
    let now = Utc::now();
    let new_verification_results: Vec<NewVerificationResult> = vendor_responses_with_errors
        .iter()
        .map(|(req, response)| {
            let (e_response, scrubbed_response) = if let Some(raw_json) = response {
                let e_response = encrypt_verification_result_response(raw_json, user_vault_public_key)?;
                let scrubbed_response = match scrub_raw_error_vendor_response(&req.vendor_api, raw_json) {
                    Ok(s) => s,
                    Err(err) => {
                        tracing::error!(?err, "Error in scrub_raw_error_vendor_response");
                        ScrubbedPiiJsonValue::from(raw_json.leak().clone())
                    }
                };
                (Some(e_response), scrubbed_response)
            } else {
                // response is non-optional on vres. This is a hack
                let empty_response = ScrubbedPiiJsonValue::from(serde_json::json!({}));
                (None, empty_response)
            };

            Ok(NewVerificationResult {
                request_id: req.id.clone(),
                response: scrubbed_response,
                timestamp: now,
                e_response,
                is_error: true,
            })
        })
        .collect::<Result<Vec<NewVerificationResult>, ApiError>>()?;

    Ok(VerificationResult::bulk_create(conn, new_verification_results)?)
}

pub fn save_verification_result(
    conn: &mut PgConn,
    vendor_response: &VerificationRequestWithVendorResponse,
    user_vault_public_key: &VaultPublicKey, // passed in so unit testing is easier
) -> Result<VerificationResult, ApiError> {
    save_verification_results(conn, slice::from_ref(vendor_response), user_vault_public_key)?
        .pop()
        .ok_or(ApiError::from(DbError::IncorrectNumberOfRowsUpdated))
}

pub fn save_error_verification_result(
    conn: &mut PgConn,
    vendor_response: &(VerificationRequest, Option<PiiJsonValue>),
    user_vault_public_key: &VaultPublicKey,
) -> Result<VerificationResult, ApiError> {
    save_error_verification_results(conn, slice::from_ref(vendor_response), user_vault_public_key)?
        .pop()
        .ok_or(ApiError::from(DbError::IncorrectNumberOfRowsUpdated))
}

// Encrypt payload using UV
pub fn encrypt_verification_result_response(
    response: &PiiJsonValue,
    user_vault_public_key: &VaultPublicKey,
) -> Result<SealedVaultBytes, ApiError> {
    user_vault_public_key
        .seal_bytes(response.leak_to_vec()?.as_slice())
        .map_err(ApiError::from)
}

// Bulk decrypt a Vec of encrypted responses
#[tracing::instrument(skip_all)]
pub async fn decrypt_verification_result_response(
    enclave_client: &EnclaveClient,
    sealed_data: Vec<SealedVaultBytes>, // sealed vault bytes
    sealed_key: &EncryptedVaultPrivateKey,
) -> Result<Vec<PiiJsonValue>, ApiError> {
    let sealed_data = sealed_data
        .iter()
        .map(|sealed| (sealed_key, sealed, vec![]))
        .collect();

    enclave_client
        .batch_decrypt_to_piibytes(sealed_data)
        .await?
        .into_iter()
        .map(|b| PiiJsonValue::try_from(b).map_err(ApiError::from))
        .collect()
}

pub fn save_vreq_and_vres(
    conn: &mut PgConn,
    public_key: &VaultPublicKey,
    sv_id: &ScopedVaultId,
    di_id: &DecisionIntentId,
    vendor_result: Result<VendorResponse, VendorAPIError>,
) -> ApiResult<(VerificationRequest, VerificationResult)> {
    let vendor_api = match &vendor_result {
        Ok(vr) => (&vr.response).into(),
        Err(e) => e.vendor_api,
    };

    let vreq = VerificationRequest::create(conn, (sv_id, di_id, vendor_api).into())?;

    let vres = save_vres(conn, public_key, &vendor_result, &vreq)?;

    Ok((vreq, vres))
}

pub fn save_vres(
    conn: &mut PgConn,
    public_key: &VaultPublicKey,
    vendor_result: &Result<VendorResponse, VendorAPIError>,
    vreq: &VerificationRequest,
) -> ApiResult<VerificationResult> {
    match vendor_result {
        Ok(vr) => save_verification_result(conn, &(vreq.clone(), vr.clone()), public_key),
        Err(e) => {
            let json = VendorResults::vendor_api_error_to_json(e);
            save_error_verification_result(conn, &(vreq.clone(), json), public_key)
        }
    }
}

// For some Incode APIs we save the VReq first still (e.g. IncodeWatchlistCheck)
pub enum ShouldSaveVerificationRequest {
    Yes(VendorAPI),
    No(VerificationRequestId),
}
/// Struct to make sure we handle the different cases Vendor call errors we may see
pub struct SaveVerificationResultArgs {
    pub is_error: bool,
    pub raw_response: PiiJsonValue,
    pub scrubbed_response: ScrubbedPiiJsonValue,
    pub vault_public_key: VaultPublicKey,
    pub should_save_verification_request: ShouldSaveVerificationRequest,
    pub decision_intent_id: DecisionIntentId,
    pub scoped_vault_id: ScopedVaultId,
    pub identity_document_id: Option<DocumentId>,
}
impl SaveVerificationResultArgs {
    pub async fn save(self, db_pool: &DbPool) -> ApiResult<(VerificationResultId, VerificationRequestId)> {
        let SaveVerificationResultArgs {
            scrubbed_response,
            raw_response,
            is_error,
            should_save_verification_request,
            decision_intent_id,
            vault_public_key,
            scoped_vault_id,
            identity_document_id,
        } = self;
        let e_response = encrypt_verification_result_response(&raw_response, &vault_public_key)?;
        let result = db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                // This is interesting - we make the VReq and VRes at the same time.
                // In other vendor APIs, the only bookkeeping we have for an outstanding vendor request
                // is a VReq without a VRes - for the document workflow, we have the incode state
                // machine that tells us what state we're in.
                let vreq_id = match should_save_verification_request {
                    ShouldSaveVerificationRequest::Yes(vendor_api) => {
                        let args = NewVerificationRequestArgs {
                            scoped_vault_id: &scoped_vault_id,
                            identity_document_id: identity_document_id.as_ref(),
                            decision_intent_id: &decision_intent_id,
                            vendor_api,
                        };
                        let vreq = VerificationRequest::create(conn, args)?;
                        vreq.id
                    }
                    ShouldSaveVerificationRequest::No(vreq_id) => vreq_id,
                };
                let res = VerificationResult::create(
                    conn,
                    vreq_id.clone(),
                    scrubbed_response,
                    e_response,
                    is_error,
                )?;

                Ok((res.id, vreq_id))
            })
            .await?;
        Ok(result)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::{
        decision::{
            tests::test_helpers::{create_kyc_user_and_wf, FixtureData},
            vendor::vendor_trait::{MockVendorAPICall, VendorAPICall, VendorAPIResponse},
        },
        State,
    };
    use db::{
        models::decision_intent::DecisionIntent,
        tests::{fixtures::ob_configuration::ObConfigurationOpts, test_db_pool::TestDbPool},
    };
    use idv::{
        idology::{IdologyExpectIDAPIResponse, IdologyExpectIDRequest},
        stytch::{StytchLookupRequest, StytchLookupResponse},
    };
    use macros::test_state;
    use newtypes::{vendor_credentials::IdologyCredentials, DecisionIntentKind, IdvData, Vendor, VendorAPI};
    use serde_json::json;

    async fn test_save_vreq_and_vres<T, U, E>(
        state: &State,
        req: T,
        res: Result<U, E>,
        vendor_api: VendorAPI,
        res_json: serde_json::Value,
    ) where
        T: Send + Sync + Sized,
        U: VendorAPIResponse + Send + Sync + 'static,
        E: Send + Sync + Into<idv::Error> + 'static,
    {
        let mut mock_client = MockVendorAPICall::<T, U, E>::new();
        mock_client
            .expect_make_request()
            .times(1)
            .return_once(move |_| res);

        let res: Result<U, E> = mock_client.make_request(req).await;

        let res = res.map(|r| r.into_vendor_response()).map_err(|e| VendorAPIError {
            vendor_api,
            error: e.into(),
        });

        let FixtureData {
            wf, v: uv, sv: su, ..
        } = create_kyc_user_and_wf(
            state,
            ObConfigurationOpts {
                is_live: true,
                ..Default::default()
            },
            None,
            None,
        )
        .await;

        let is_error = res.is_err();
        let sv_id = su.id.clone();
        let wf_id = wf.id.clone();
        let (vreq, vres) = state
            .db_pool
            .db_transaction(move |conn| {
                let di = DecisionIntent::get_or_create_for_workflow(
                    conn,
                    &sv_id,
                    &wf_id,
                    DecisionIntentKind::OnboardingKyc,
                )
                .unwrap();
                save_vreq_and_vres(conn, &uv.public_key, &sv_id, &di.id, res)
            })
            .await
            .unwrap();

        assert_eq!(vendor_api, vreq.vendor_api);
        assert_eq!(Vendor::from(vendor_api), vreq.vendor);
        assert_eq!(is_error, vres.is_error);

        // assert we can decrypt e_response and it matches the raw json
        let decrypted_e_response = decrypt_verification_result_response(
            &state.enclave_client,
            vec![vres.e_response.unwrap()],
            &uv.e_private_key,
        )
        .await
        .unwrap()
        .pop()
        .unwrap();

        assert_eq!(res_json, decrypted_e_response.into_leak());
    }

    #[test_state]
    async fn save_vreq_and_vres_idology_success(state: &mut State) {
        let res = idv::tests::fixtures::idology::create_response("result.match".to_string(), None, None);
        let json = res.raw_response.clone().into_leak();

        let res = Ok::<_, idv::idology::error::Error>(res);

        let req = IdologyExpectIDRequest {
            idv_data: IdvData { ..Default::default() },
            credentials: IdologyCredentials { ..Default::default() },
            tenant_identifier: "yo".to_owned(),
        };

        test_save_vreq_and_vres(state, req, res, VendorAPI::IdologyExpectId, json).await;
    }

    #[test_state]
    async fn save_vreq_and_vres_idology_error(state: &mut State) {
        // TODO: refactor how we propogate errors + raw json response from vendor calls
        let json = idv::tests::fixtures::idology::error_response_json();
        let error =
            serde_json::from_value::<idv::idology::expectid::response::ExpectIDResponse>(json.clone())
                .unwrap()
                .response
                .validate()
                .unwrap_err();

        let res = Err::<IdologyExpectIDAPIResponse, _>(idv::idology::error::Error::ErrorWithResponse(
            Box::new(idv::idology::error::ErrorWithResponse {
                error,
                response: PiiJsonValue::new(json.clone()),
            }),
        ));

        let req = IdologyExpectIDRequest {
            idv_data: IdvData { ..Default::default() },
            credentials: IdologyCredentials { ..Default::default() },
            tenant_identifier: "yo".to_owned(),
        };

        test_save_vreq_and_vres(state, req, res, VendorAPI::IdologyExpectId, json).await;
    }

    #[test_state]
    async fn save_vreq_and_vres_stytch_error(state: &mut State) {
        let json = json!({"error_message": "something went mad wrong"});
        let error: idv::stytch::error::Error =
            idv::stytch::response::parse_response(json.clone()).unwrap_err();

        let res = Err::<StytchLookupResponse, _>(idv::stytch::error::Error::ErrorWithResponse(Box::new(
            idv::stytch::error::ErrorWithResponse {
                error,
                response: PiiJsonValue::new(json.clone()),
            },
        )));

        let req = StytchLookupRequest {
            telemetry_id: "yo".to_owned(),
        };

        test_save_vreq_and_vres(state, req, res, VendorAPI::StytchLookup, json).await;
    }
}
