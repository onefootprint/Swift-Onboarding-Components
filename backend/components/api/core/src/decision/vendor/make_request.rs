#![allow(clippy::too_many_arguments)]
use std::sync::Arc;

use super::tenant_vendor_control::TenantVendorControl;

use super::{vendor_trait::VendorAPIResponse, *};
use crate::{errors::ApiError, vendor_clients::VendorClient, State};
use db::{
    models::{
        ob_configuration::ObConfiguration, vault::Vault, verification_request::VerificationRequest,
        verification_result::VerificationResult,
    },
    DbError,
};
use feature_flag::{BoolFlag, FeatureFlagClient};
use idv::{
    experian::{ExperianCrossCoreRequest, ExperianCrossCoreResponse},
    idology::{expectid::response::ExpectIDResponse, IdologyExpectIDAPIResponse, IdologyExpectIDRequest},
    lexis::client::{LexisFlexIdRequest, LexisFlexIdResponse},
    socure::{SocureIDPlusAPIResponse, SocureIDPlusRequest},
    twilio::{TwilioLookupV2APIResponse, TwilioLookupV2Request},
    ParsedResponse, VendorResponse,
};
use newtypes::{IdvData, ObConfigurationKey, PiiString, VendorAPI, WorkflowId};

// For a given vendor_api, saves a vreq, populates IdvData from user's vault, makes the API call, and returns the success or error response
#[tracing::instrument(skip(state, tvc))]
pub async fn make_idv_vendor_call_save_vreq_vres(
    state: &State,
    tvc: &TenantVendorControl,
    sv_id: &ScopedVaultId,
    di_id: &DecisionIntentId,
    ob_configuration_key: ObConfigurationKey,
    vendor_api: VendorAPI,
) -> ApiResult<(
    VerificationRequest,
    VerificationResult,
    Result<VendorResponse, VendorAPIError>,
)> {
    let (vreq, vendor_result) =
        make_idv_vendor_call_save_vreq(state, tvc, sv_id, di_id, ob_configuration_key, vendor_api).await?;

    if let Err(err) = vendor_result.as_ref() {
        tracing::error!(?err, "Error making vendor call");
    }

    let sv_id = sv_id.clone();
    let v_req: VerificationRequest = vreq.clone();
    let (vres, vendor_result) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let uv = Vault::get(conn, &sv_id)?;
            let vres = verification_result::save_vres(conn, &uv.public_key, &vendor_result, &v_req)?;
            Ok((vres, vendor_result))
        })
        .await?;

    Ok((vreq, vres, vendor_result))
}

// For a given vendor_api, saves a vreq, populates IdvData from user's vault, makes the API call, and returns the success or error response
#[tracing::instrument(skip(state, tvc))]
pub async fn make_idv_vendor_call_save_vreq(
    state: &State,
    tvc: &TenantVendorControl,
    sv_id: &ScopedVaultId,
    di_id: &DecisionIntentId,
    ob_configuration_key: ObConfigurationKey,
    vendor_api: VendorAPI,
) -> ApiResult<(VerificationRequest, Result<VendorResponse, VendorAPIError>)> {
    let sv_id = sv_id.clone();
    let di_id = di_id.clone();
    let vreq = state
        .db_pool
        .db_query(move |conn| VerificationRequest::create(conn, (&sv_id, &di_id, vendor_api).into()))
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
                state.feature_flag_client.clone(),
            )
            .await
        }
        VendorAPI::TwilioLookupV2 => {
            send_twilio_lookupv2_request(idv_data, state.vendor_clients.twilio_lookup_v2.clone()).await
        }
        VendorAPI::SocureIdPlus => {
            tracing::error!("Socure called in `make_request`");
            // if we ever add this back, we need to fetch device_id and ip_address
            let socure_data = SocureData {
                device_session_id: None,
                ip_address: None,
            };
            send_socure_idv_request(
                idv_data,
                socure_data,
                ob_configuration_key,
                is_production,
                state.vendor_clients.socure_id_plus.clone(),
                state.feature_flag_client.clone(),
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
                state.feature_flag_client.clone(),
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
                    state.feature_flag_client.clone(),
                )
                .await
            } else {
                // shouldn't be possible since we check tvc.enabled_vendor_apis before attempting this function and that takes the presence of TBI into account
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
pub async fn send_twilio_lookupv2_request(
    idv_data: IdvData,
    twilio_api_call: VendorClient<TwilioLookupV2Request, TwilioLookupV2APIResponse, idv::twilio::Error>,
) -> Result<VendorResponse, idv::Error> {
    twilio_api_call
        .make_request(TwilioLookupV2Request { idv_data })
        .await
        .map(|r| {
            let parsed_response = r.parsed_response();
            let raw_response = r.raw_response();
            // TODO put this into a INto
            VendorResponse {
                response: parsed_response,
                raw_response,
            }
        })
        .map_err(|e| e.into())
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

#[derive(Clone)]
pub struct SocureData {
    pub device_session_id: Option<String>,
    pub ip_address: Option<PiiString>,
}
#[tracing::instrument(skip_all)]
pub async fn send_socure_idv_request(
    data: IdvData,
    socure_data: SocureData,
    ob_configuration_key: ObConfigurationKey,
    is_production: bool,
    socure_client: VendorClient<SocureIDPlusRequest, SocureIDPlusAPIResponse, idv::socure::Error>,
    ff_client: Arc<dyn FeatureFlagClient>,
) -> Result<VendorResponse, idv::Error> {
    if ff_client.flag(BoolFlag::DisableAllSocure) {
        Err(idv::Error::VendorCallsDisabledError)
    } else if is_production || ff_client.flag(BoolFlag::EnableSocureInNonProd(&ob_configuration_key)) {
        let res = socure_client
            .make_request(SocureIDPlusRequest {
                idv_data: data,
                socure_device_session_id: socure_data.device_session_id,
                ip_address: socure_data.ip_address,
            })
            .await;

        res.map(|r| {
            // TODO: later delete VendorResponse and just replace with VendorAPIResponse
            let parsed_response = r.parsed_response();
            let raw_response = r.raw_response();
            VendorResponse {
                response: parsed_response,
                raw_response,
            }
        })
        .map_err(|e| e.into())
    } else {
        let response = idv::test_fixtures::socure_idplus_fake_passing_response();

        let parsed_response = idv::socure::parse_response(response.clone())?;

        Ok(VendorResponse {
            response: ParsedResponse::SocureIDPlus(parsed_response),
            raw_response: response.into(),
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
pub type VerificationRequestWithVendorError = (VerificationRequest, ApiError);

#[tracing::instrument(skip_all, 
    fields(vreqs = ?requests.iter().map(|r| r.id.clone()).collect::<Vec<_>>(), 
    vendors = ?requests.iter().map(|r| r.vendor).collect::<Vec<_>>()))
]
pub async fn make_vendor_requests(
    state: &State,
    tvc: TenantVendorControl,
    requests: Vec<VerificationRequest>,
    wf_id: &WorkflowId, // TODO: remove?
) -> Result<Vec<Result<VerificationRequestWithVendorResponse, VerificationRequestWithVendorError>>, ApiError>
{
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

                    Err((reqs[idx].clone(), ApiError::from(err))) // TODO: no need to wrap in ApiError
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
    use idv::idology::{
        expectid::response::{ExpectIDResponse, Response},
        IdologyExpectIDAPIResponse,
    };
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
