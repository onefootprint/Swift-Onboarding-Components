#![allow(clippy::too_many_arguments)]
use super::waterfall_vendor_api::WaterfallVendorAPI;
use crate::decision::vendor::build_request;
use crate::decision::vendor::tenant_vendor_control::TenantVendorControl;
use crate::decision::vendor::vendor_trait::VendorAPIResponse;
use crate::decision::vendor::verification_result;
use crate::decision::vendor::VendorAPIError;
use crate::vendor_clients::VendorClient;
use crate::FpResult;
use crate::State;
use db::models::vault::Vault;
use db::models::verification_request::VerificationRequest;
use db::models::verification_result::VerificationResult;
use feature_flag::BoolFlag;
use feature_flag::FeatureFlagClient;
use idv::experian::error::Error as ExperianError;
use idv::experian::ExperianCrossCoreRequest;
use idv::experian::ExperianCrossCoreResponse;
use idv::idology::expectid::response::ExpectIDResponse;
use idv::idology::IdologyExpectIDAPIResponse;
use idv::idology::IdologyExpectIDRequest;
use idv::lexis::client::LexisFlexIdRequest;
use idv::lexis::client::LexisFlexIdResponse;
use idv::ParsedResponse;
use idv::VendorResponse;
use newtypes::DecisionIntentId;
use newtypes::IdvData;
use newtypes::ObConfigurationKey;
use newtypes::ScopedVaultId;
use std::sync::Arc;

// For a given vendor_api, saves a vreq, populates IdvData from user's vault, makes the API call,
// and returns the success or error response
#[tracing::instrument(skip(state, tvc))]
pub async fn make_idv_vendor_call_save_vreq_vres(
    state: &State,
    tvc: &TenantVendorControl,
    sv_id: &ScopedVaultId,
    di_id: &DecisionIntentId,
    ob_configuration_key: ObConfigurationKey,
    vendor_api: WaterfallVendorAPI,
) -> FpResult<(
    VerificationRequest,
    VerificationResult,
    Result<VendorResponse, VendorAPIError>,
)> {
    let (vreq, vendor_result) =
        make_idv_vendor_call_save_vreq(state, tvc, sv_id, di_id, ob_configuration_key, vendor_api).await?;

    if let Err(err) = vendor_result.as_ref() {
        let VendorAPIError { vendor_api: _, error } = err;
        let message = "Error making vendor call";
        match error {
            idv::Error::ExperianError(ExperianError::ErrorWithResponse(e)) => match e.is_known_error() {
                true => {
                    tracing::warn!(?err, message);
                }
                false => tracing::error!(?err, message),
            },
            _ => {
                tracing::error!(?err, message);
            }
        };
    }

    let sv_id = sv_id.clone();
    let v_req: VerificationRequest = vreq.clone();
    let (vres, vendor_result) = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let uv = Vault::get(conn, &sv_id)?;
            let vres = verification_result::save_vres(conn, &uv.public_key, &vendor_result, &v_req)?;
            Ok((vres, vendor_result))
        })
        .await?;

    Ok((vreq, vres, vendor_result))
}

// For a given vendor_api, saves a vreq, populates IdvData from user's vault, makes the API call,
// and returns the success or error response
#[tracing::instrument(skip(state, tvc))]
pub async fn make_idv_vendor_call_save_vreq(
    state: &State,
    tvc: &TenantVendorControl,
    sv_id: &ScopedVaultId,
    di_id: &DecisionIntentId,
    ob_configuration_key: ObConfigurationKey,
    vendor_api: WaterfallVendorAPI,
) -> FpResult<(VerificationRequest, Result<VendorResponse, VendorAPIError>)> {
    let sv_id = sv_id.clone();
    let di_id = di_id.clone();
    let vreq = state
        .db_pool
        .db_query(move |conn| VerificationRequest::create(conn, (&sv_id, &di_id, vendor_api.into()).into()))
        .await?;

    let idv_data = build_request::build_idv_data_from_verification_request(
        &state.db_pool,
        &state.enclave_client,
        vreq.clone(),
    )
    .await?;

    Ok((
        vreq,
        send_idv_request(state, tvc, vendor_api, idv_data, ob_configuration_key).await,
    ))
}

#[tracing::instrument(skip(state, tvc, idv_data))]
pub async fn send_idv_request(
    state: &State,
    tvc: &TenantVendorControl,
    vendor_api: WaterfallVendorAPI,
    idv_data: IdvData,
    ob_configuration_key: ObConfigurationKey,
) -> Result<VendorResponse, VendorAPIError> {
    let is_production = state.config.service_config.is_production();
    match vendor_api {
        WaterfallVendorAPI::Idology => {
            let request = tvc.build_idology_request(idv_data);
            send_idology_idv_request(
                request,
                is_production,
                ob_configuration_key,
                state.vendor_clients.idology_expect_id.clone(),
                state.ff_client.clone(),
            )
            .await
        }
        WaterfallVendorAPI::Experian => {
            let request = tvc.build_experian_request(idv_data);
            send_experian_idv_request(
                request,
                is_production,
                ob_configuration_key,
                state.vendor_clients.experian_cross_core.clone(),
                state.ff_client.clone(),
            )
            .await
        }
        WaterfallVendorAPI::Lexis => {
            let credentials = tvc.lexis_credentials();
            if let Some(tbi) = tvc.tenant_business_info() {
                send_lexis_flex_id_request(
                    LexisFlexIdRequest {
                        idv_data,
                        credentials,
                        tenant_identifier: tvc.tenant_identifier(),
                        tbi,
                    },
                    is_production,
                    ob_configuration_key,
                    state.vendor_clients.lexis_flex_id.clone(),
                    state.ff_client.clone(),
                )
                .await
            } else {
                // shouldn't be possible since we check tvc.enabled_vendor_apis before attempting this
                // function and that takes the presence of TBI into account
                Err(idv::Error::AssertionError(
                    "Missing tenant_business_info".to_owned(),
                ))
            }
        }
    }
    .map_err(|e| VendorAPIError {
        vendor_api: vendor_api.into(),
        error: e,
    })
}


#[tracing::instrument(skip_all)]
pub async fn send_idology_idv_request(
    request: IdologyExpectIDRequest,
    is_production: bool,
    ob_configuration_key: ObConfigurationKey,
    idology_api_call: VendorClient<
        IdologyExpectIDRequest,
        IdologyExpectIDAPIResponse,
        idv::idology::error::Error,
    >,
    ff_client: Arc<dyn FeatureFlagClient>,
) -> Result<VendorResponse, idv::Error> {
    if is_production || ff_client.flag(BoolFlag::EnableIdologyInNonProd(&ob_configuration_key)) {
        let res = idology_api_call.make_request(request).await;

        res.map(|r| {
            let parsed_response = r.parsed_response();
            let raw_response = r.raw_response();
            VendorResponse {
                // TODO: later delete VendorResponse and just replace with VendorAPIResponse
                response: parsed_response,
                raw_response,
            }
        })
        .map_err(|e| e.into())
    } else {
        let response = idv::test_fixtures::idology_fake_data_expectid_response();

        let parsed_response: ExpectIDResponse =
            idv::idology::expectid::response::parse_response(response.clone())?;

        Ok(VendorResponse {
            raw_response: response.into(),
            response: ParsedResponse::IDologyExpectID(parsed_response),
        })
    }
}


#[tracing::instrument(skip_all)]
pub async fn send_experian_idv_request(
    request: ExperianCrossCoreRequest,
    is_production: bool,
    ob_configuration_key: ObConfigurationKey,
    experian_api_call: VendorClient<
        ExperianCrossCoreRequest,
        ExperianCrossCoreResponse,
        idv::experian::error::Error,
    >,
    ff_client: Arc<dyn FeatureFlagClient>,
) -> Result<VendorResponse, idv::Error> {
    if is_production || ff_client.flag(BoolFlag::EnableExperianInNonProd(&ob_configuration_key)) {
        let res = experian_api_call.make_request(request).await;

        res.map(|r| {
            let parsed_response = r.parsed_response();
            let raw_response = r.raw_response();

            VendorResponse {
                response: parsed_response,
                raw_response,
            }
        })
        .map_err(|e| e.into())
    } else {
        let response = idv::test_fixtures::experian_cross_core_response(None, None);

        let parsed_response = idv::experian::cross_core::response::parse_response(response.clone())?;

        Ok(VendorResponse {
            response: ParsedResponse::ExperianPreciseID(parsed_response),
            raw_response: response.into(),
        })
    }
}

#[tracing::instrument(skip_all)]
pub async fn send_lexis_flex_id_request(
    request: LexisFlexIdRequest,
    is_production: bool,
    ob_configuration_key: ObConfigurationKey,
    client: VendorClient<LexisFlexIdRequest, LexisFlexIdResponse, idv::lexis::Error>,
    ff_client: Arc<dyn FeatureFlagClient>,
) -> Result<VendorResponse, idv::Error> {
    if is_production || ff_client.flag(BoolFlag::EnableLexisInNonProd(&ob_configuration_key)) {
        let res = client.make_request(request).await;

        res.map(|r| {
            let parsed_response = r.parsed_response();
            let raw_response = r.raw_response();

            VendorResponse {
                response: parsed_response,
                raw_response,
            }
        })
        .map_err(|e| e.into())
    } else {
        let response = idv::test_fixtures::passing_lexis_flex_id_response();
        let parsed_response = idv::lexis::parse_response(response.clone())?;
        Ok(VendorResponse {
            response: ParsedResponse::LexisFlexId(parsed_response),
            raw_response: response.into(),
        })
    }
}


#[cfg(test)]
#[allow(clippy::unwrap_used)]
#[allow(clippy::expect_used)]
mod tests {
    use super::*;
    use crate::decision::vendor::vendor_trait::MockVendorAPICall;
    use db::tests::MockFFClient;
    use idv::idology::expectid::response::ExpectIDResponse;
    use idv::idology::expectid::response::Response;
    use idv::idology::IdologyExpectIDAPIResponse;
    use newtypes::PiiJsonValue;
    use serde_json::json;
    use std::str::FromStr;
    use test_case::test_case;

    #[test_case(true, false, true)]
    #[test_case(false, true, true)]
    #[test_case(false, false, false)]
    #[tokio::test]
    async fn test_send_idology_idv_request(
        // Proof of concept test
        is_production: bool,
        flag_value: bool,
        expect_api_call: bool,
    ) {
        let ob_configuration_key = ObConfigurationKey::from_str("obc123").unwrap();
        let mut mock_ff_client = MockFFClient::new();
        let mut mock_api = MockVendorAPICall::<
            IdologyExpectIDRequest,
            IdologyExpectIDAPIResponse,
            idv::idology::error::Error,
        >::new();

        let ob_config_key = ob_configuration_key.clone();
        mock_ff_client.mock(|c| {
            c.expect_flag()
                .withf(move |f| *f == BoolFlag::EnableIdologyInNonProd(&ob_config_key))
                .return_once(move |_| flag_value);
        });

        if expect_api_call {
            mock_api.expect_make_request().times(1).return_once(|_| {
                Ok(IdologyExpectIDAPIResponse {
                    // TODO: helpers methods to make these and other test structs
                    raw_response: PiiJsonValue::from(json!({"yo": "sup"})),
                    parsed_response: ExpectIDResponse {
                        response: Response {
                            qualifiers: None,
                            results: None,
                            summary_result: None,
                            id_number: None,
                            id_scan: None,
                            error: None,
                            restriction: None,
                        },
                    },
                })
            });
        }
        let tvc = TenantVendorControl::default();
        send_idology_idv_request(
            tvc.build_idology_request(IdvData::default()),
            is_production,
            ob_configuration_key,
            Arc::new(mock_api),
            mock_ff_client.into_mock(),
        )
        .await
        .expect("shouldn't error");
    }
}
