use super::VendorAPIError;
use crate::enclave_client::EnclaveClient;
use crate::FpResult;
use api_errors::FpError;
use chrono::Utc;
use db::models::verification_request::NewVerificationRequestArgs;
use db::models::verification_request::VerificationRequest;
use db::models::verification_result::NewVerificationResult;
use db::models::verification_result::VerificationResult;
use db::DbError;
use db::DbPool;
use db::PgConn;
use idv::RawResponseWrapper;
use idv::VendorResponse;
use newtypes::DecisionIntentId;
use newtypes::DocumentId;
use newtypes::EncryptedVaultPrivateKey;
use newtypes::PiiJsonValue;
use newtypes::ScopedVaultId;
use newtypes::ScrubbedPiiVendorResponse;
use newtypes::SealedVaultBytes;
use newtypes::VaultPublicKey;
use newtypes::VendorAPI;
use newtypes::VerificationRequestId;

type VerificationRequestWithVendorResponse = (VerificationRequest, VendorResponse);

/// Save a verification result, encrypting the response payload in the process
pub fn save_verification_result(
    conn: &mut PgConn,
    vendor_response: &VerificationRequestWithVendorResponse,
    user_vault_public_key: &VaultPublicKey, // passed in so unit testing is easier
) -> FpResult<VerificationResult> {
    let now = Utc::now();
    // For testing rollout of footprint
    let (req, res) = vendor_response;
    let scrubbed_json = ScrubbedPiiVendorResponse::new(&res.response)?;
    let e_response = encrypt_verification_result_response(&res.raw_response, user_vault_public_key)?;
    let new_verification_result = NewVerificationResult {
        request_id: req.id.clone(),
        response: scrubbed_json,
        timestamp: now,
        e_response: Some(e_response),
        is_error: false,
    };

    let result = VerificationResult::bulk_create(conn, vec![new_verification_result])?
        .into_iter()
        .next()
        .ok_or(FpError::from(DbError::IncorrectNumberOfRowsUpdated))?;
    Ok(result)
}

/// Save a verification result for an errored VRes, encrypting the response payload in the process
/// (if we got one back) For requests with no response payload, we will notate on VRes that the
/// request was an error
pub fn save_error_verification_result(
    conn: &mut PgConn,
    req: VerificationRequest,
) -> FpResult<VerificationResult> {
    let now = Utc::now();
    // response is non-optional on vres. This is a hack
    let empty_response = ScrubbedPiiVendorResponse::from(serde_json::json!({}));

    let new_vres = NewVerificationResult {
        request_id: req.id.clone(),
        response: empty_response,
        timestamp: now,
        e_response: None,
        is_error: true,
    };

    let res = VerificationResult::bulk_create(conn, vec![new_vres])?
        .into_iter()
        .next()
        .ok_or(FpError::from(DbError::IncorrectNumberOfRowsUpdated))?;
    Ok(res)
}

// Encrypt payload using UV
pub fn encrypt_verification_result_response(
    response: &PiiJsonValue,
    user_vault_public_key: &VaultPublicKey,
) -> FpResult<SealedVaultBytes> {
    user_vault_public_key
        .seal_bytes(response.leak_to_vec()?.as_slice())
        .map_err(FpError::from)
}

// Bulk decrypt a Vec of encrypted responses
#[tracing::instrument(skip_all)]
pub async fn decrypt_verification_result_response(
    enclave_client: &EnclaveClient,
    sealed_data: Vec<SealedVaultBytes>, // sealed vault bytes
    sealed_key: &EncryptedVaultPrivateKey,
) -> FpResult<Vec<PiiJsonValue>> {
    let sealed_data = sealed_data
        .iter()
        .map(|sealed| (sealed_key, sealed, vec![]))
        .collect();

    enclave_client
        .batch_decrypt_to_piibytes(sealed_data)
        .await?
        .into_iter()
        .map(|b| PiiJsonValue::parse_from_pii_bytes(b).map_err(FpError::from))
        .collect()
}

pub fn save_vreq_and_vres(
    conn: &mut PgConn,
    public_key: &VaultPublicKey,
    sv_id: &ScopedVaultId,
    di_id: &DecisionIntentId,
    vendor_result: Result<VendorResponse, VendorAPIError>,
) -> FpResult<(VerificationRequest, VerificationResult)> {
    let vendor_api = match &vendor_result {
        Ok(vr) => (&vr.response).into(),
        Err(e) => e.vendor_api,
    };

    let vreq = VerificationRequest::create(conn, (sv_id, di_id, vendor_api).into())?;

    let vres = save_vres(conn, public_key, &vendor_result, &vreq)?;

    Ok((vreq, vres))
}

pub fn save_vres<E>(
    conn: &mut PgConn,
    public_key: &VaultPublicKey,
    vendor_result: &Result<VendorResponse, E>,
    vreq: &VerificationRequest,
) -> FpResult<VerificationResult> {
    match vendor_result {
        Ok(vr) => save_verification_result(conn, &(vreq.clone(), vr.clone()), public_key),
        Err(_) => save_error_verification_result(conn, vreq.clone()),
    }
}

// For some Incode APIs we save the VReq first still (e.g. IncodeWatchlistCheck)
pub enum ShouldSaveVerificationRequest {
    Yes(VendorAPI, DecisionIntentId, ScopedVaultId, Option<DocumentId>),
    No(VerificationRequestId),
}
/// Struct to make sure we handle the different cases Vendor call errors we may see
pub struct SaveVerificationResultArgs {
    pub is_error: bool,
    pub raw_response: PiiJsonValue,
    pub scrubbed_response: ScrubbedPiiVendorResponse,
    pub vault_public_key: VaultPublicKey,
    pub should_save_verification_request: ShouldSaveVerificationRequest,
}

impl SaveVerificationResultArgs {
    pub fn error(
        should_save_verification_request: ShouldSaveVerificationRequest,
        vault_public_key: VaultPublicKey,
    ) -> Self {
        Self {
            is_error: true,
            raw_response: serde_json::json!("").into(),
            scrubbed_response: serde_json::json!("").into(),
            vault_public_key,
            should_save_verification_request,
        }
    }

    pub fn new<T: serde::Serialize, E1, E2>(
        request_result: &Result<RawResponseWrapper<T, E1>, E2>,
        vault_public_key: VaultPublicKey,
        should_save_verification_request: ShouldSaveVerificationRequest,
    ) -> Self {
        match request_result {
            Ok(response) => {
                let is_error = response.parsed.is_err();
                let raw_response = response.raw_response.clone();

                let scrubbed_response = (response.parsed.as_ref().ok())
                    .and_then(|res| ScrubbedPiiVendorResponse::new(res).ok())
                    .unwrap_or(serde_json::json!("").into());

                Self {
                    is_error,
                    raw_response,
                    scrubbed_response,
                    should_save_verification_request,
                    vault_public_key,
                }
            }
            Err(_) => Self::error(should_save_verification_request, vault_public_key),
        }
    }

    pub fn save_sync(self, conn: &mut PgConn) -> FpResult<(VerificationResult, VerificationRequestId)> {
        let SaveVerificationResultArgs {
            scrubbed_response,
            raw_response,
            is_error,
            should_save_verification_request,
            vault_public_key,
        } = self;
        let e_response = encrypt_verification_result_response(&raw_response, &vault_public_key)?;
        // This is interesting - we make the VReq and VRes at the same time.
        // In other vendor APIs, the only bookkeeping we have for an outstanding vendor request
        // is a VReq without a VRes - for the document workflow, we have the incode state
        // machine that tells us what state we're in.
        let vreq_id = match should_save_verification_request {
            ShouldSaveVerificationRequest::Yes(vendor_api, di_id, sv_id, doc_id) => {
                let args = NewVerificationRequestArgs {
                    scoped_vault_id: &sv_id,
                    identity_document_id: doc_id.as_ref(),
                    decision_intent_id: &di_id,
                    vendor_api,
                };
                let vreq = VerificationRequest::create(conn, args)?;
                vreq.id
            }
            ShouldSaveVerificationRequest::No(vreq_id) => vreq_id,
        };
        let res = VerificationResult::create(conn, vreq_id.clone(), scrubbed_response, e_response, is_error)?;

        Ok((res, vreq_id))
    }

    pub async fn save(self, db_pool: &DbPool) -> FpResult<(VerificationResult, VerificationRequestId)> {
        let result = db_pool.db_transaction(move |conn| self.save_sync(conn)).await?;
        Ok(result)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::decision::tests::test_helpers::create_kyc_user_and_wf;
    use crate::decision::tests::test_helpers::FixtureData;
    use crate::decision::vendor::vendor_trait::MockVendorAPICall;
    use crate::decision::vendor::vendor_trait::VendorAPICall;
    use crate::decision::vendor::vendor_trait::VendorAPIResponse;
    use crate::State;
    use db::models::decision_intent::DecisionIntent;
    use db::tests::fixtures::ob_configuration::ObConfigurationOpts;
    use db::tests::test_db_pool::TestDbPool;
    use idv::idology::IdologyExpectIDRequest;
    use macros::test_state;
    use newtypes::vendor_credentials::IdologyCredentials;
    use newtypes::DecisionIntentKind;
    use newtypes::IdvData;
    use newtypes::Vendor;
    use newtypes::VendorAPI;

    async fn test_save_vreq_and_vres<T, U>(
        state: &State,
        req: T,
        res: FpResult<U>,
        vendor_api: VendorAPI,
        res_json: serde_json::Value,
    ) where
        T: Send + Sync + Sized,
        U: VendorAPIResponse + Send + Sync + 'static,
    {
        let mut mock_client = MockVendorAPICall::<T, U>::new();
        mock_client
            .expect_make_request()
            .times(1)
            .return_once(move |_| res);

        let res: FpResult<U> = mock_client.make_request(req).await;

        let res = res
            .map(|r| r.into_vendor_response())
            .map_err(|error| VendorAPIError { vendor_api, error });

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

        let res = Ok(res);

        let req = IdologyExpectIDRequest {
            idv_data: IdvData { ..Default::default() },
            credentials: IdologyCredentials { ..Default::default() },
            tenant_identifier: "yo".to_owned(),
        };

        test_save_vreq_and_vres(state, req, res, VendorAPI::IdologyExpectId, json).await;
    }
}
