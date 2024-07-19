#![allow(clippy::too_many_arguments)]
use super::tenant_vendor_control::TenantVendorControl;
use super::vendor_trait::VendorAPIResponse;
use super::*;
use crate::vendor_clients::VendorClient;
use crate::State;
use db::models::ob_configuration::ObConfiguration;
use db::models::verification_request::VerificationRequest;
use db::DbError;
use feature_flag::BoolFlag;
use feature_flag::FeatureFlagClient;
use idv::experian::ExperianCrossCoreRequest;
use idv::experian::ExperianCrossCoreResponse;
use idv::idology::expectid::response::ExpectIDResponse;
use idv::idology::IdologyExpectIDAPIResponse;
use idv::idology::IdologyExpectIDRequest;
use idv::lexis::client::LexisFlexIdRequest;
use idv::lexis::client::LexisFlexIdResponse;
use idv::ParsedResponse;
use idv::VendorResponse;
use newtypes::IdvData;
use newtypes::ObConfigurationKey;
use newtypes::VendorAPI;
use newtypes::WorkflowId;
use std::sync::Arc;

/// /////
/// DEPRECATED THIS WHOLE FILE WILL BE DELETED DO NOT USE
/// ////

#[tracing::instrument(skip(state, tvc, idv_data))]
pub async fn send_idv_request(
    state: &State,
    tvc: &TenantVendorControl,
    vendor_api: VendorAPI,
    idv_data: IdvData,
    ob_configuration_key: ObConfigurationKey,
) -> Result<VendorResponse, VendorAPIError> {
    let is_production = state.config.service_config.is_production();
    // still TODO: traitfy the ff logic shared by these requests
    match vendor_api {
        VendorAPI::IdologyExpectId => {
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
        VendorAPI::ExperianPreciseId => {
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
        VendorAPI::LexisFlexId => {
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
        api => {
            let err = format!("send_idv_request not implemented for {}", api);
            Err(idv::Error::AssertionError(err))
        }
    }
    .map_err(|e| VendorAPIError { vendor_api, error: e })
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

/// Make our requests to a vendor, building data from the cached VerificationRequest
#[tracing::instrument(skip_all)]
pub async fn make_idv_request(
    // TODO: really no need to have this and send_idv_request
    state: &State,
    tvc: &TenantVendorControl,
    vendor_api: VendorAPI,
    idv_data: IdvData,
    ob_configuration_key: ObConfigurationKey,
    wf_id: &WorkflowId, // TODO: remove, only used in this random log here
) -> Result<VendorResponse, VendorAPIError> {
    tracing::info!(
        vendor_api = vendor_api.clone().to_string(),
        workflow_id = %wf_id,
        "Sending verification request"
    );

    let vendor_response = send_idv_request(state, tvc, vendor_api, idv_data, ob_configuration_key).await?;

    Ok(vendor_response)
}

pub type VerificationRequestWithVendorResponse = (VerificationRequest, VendorResponse);
pub type VerificationRequestWithVendorError = (VerificationRequest, VendorAPIError);

#[tracing::instrument(skip_all,
    fields(vreqs = ?requests.iter().map(|r| r.id.clone()).collect::<Vec<_>>(),
    vendors = ?requests.iter().map(|r| r.vendor).collect::<Vec<_>>()))
]
pub async fn make_vendor_requests(
    state: &State,
    tvc: TenantVendorControl,
    requests: Vec<VerificationRequest>,
    wf_id: &WorkflowId, // TODO: remove?
) -> FpResult<Vec<Result<VerificationRequestWithVendorResponse, VerificationRequestWithVendorError>>> {
    let requests_with_data =
        build_request::bulk_build_data_from_requests(&state.db_pool, &state.enclave_client, requests).await?;

    let wfid = wf_id.clone();

    let obc_key = state
        .db_pool
        .db_query(move |conn| -> Result<ObConfigurationKey, DbError> {
            let obc_key = ObConfiguration::get(conn, &wfid)?.0.key;

            Ok(obc_key)
        })
        .await?;

    let raw_futures_with_vendors = requests_with_data.into_iter().map(|(r, data)| {
        (
            r.clone(),
            make_idv_request(state, &tvc, r.vendor_api, data, obc_key.clone(), wf_id),
        )
    });

    let (reqs, raw_futures): (Vec<_>, Vec<_>) = raw_futures_with_vendors.into_iter().unzip();
    let raw_results = futures::future::join_all(raw_futures).await;
    let results = raw_results
        .into_iter()
        .enumerate()
        .map(|(idx, res)| {
            let log_msg = "VerificationRequest failed";

            match res {
                Ok(vr) => Ok((reqs[idx].clone(), vr)),
                Err(err) => {
                    tracing::error!(
                        ?err,
                        vendor_api = %err.vendor_api,
                        log_msg
                    );

                    Err((reqs[idx].clone(), err))
                }
            }
        })
        .collect();

    Ok(results)
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
