#![allow(clippy::too_many_arguments)]
use std::sync::Arc;

use super::tenant_vendor_control::TenantVendorControl;

use super::vendor_trait::VendorAPIResponse;
use super::*;
use crate::enclave_client::EnclaveClient;
use crate::metrics;
use crate::vendor_clients::VendorClient;
use crate::{errors::ApiError, State};
use db::DbPool;
use db::{
    models::{
        insight_event::InsightEvent, ob_configuration::ObConfiguration,
        socure_device_session::SocureDeviceSession, verification_request::VerificationRequest,
    },
    DbError,
};
use feature_flag::{BoolFlag, FeatureFlagClient};
use idv::experian::{ExperianCrossCoreRequest, ExperianCrossCoreResponse};
use idv::idology::{IdologyExpectIDAPIResponse, IdologyExpectIDRequest};
use idv::socure::{SocureIDPlusAPIResponse, SocureIDPlusRequest};
use idv::twilio::{TwilioLookupV2APIResponse, TwilioLookupV2Request};
use idv::{idology::expectid::response::ExpectIDResponse, ParsedResponse, VendorResponse};
use newtypes::idology::IdologyScanOnboardingCaptureResult;
use newtypes::{DocVData, IdvData, ObConfigurationKey, PiiString, VendorAPI};
use prometheus::labels;

#[tracing::instrument(skip(
    ff_client,
    idology_client,
    socure_client,
    twilio_client,
    experian_client,
    idv_data,
    socure_data,
    tenant_vendor_control
))]
pub async fn send_idv_request(
    request: VerificationRequest,
    tenant_vendor_control: &TenantVendorControl,
    idv_data: IdvData,
    socure_data: SocureData,
    ob_configuration_key: ObConfigurationKey,
    is_production: bool,
    ff_client: Arc<dyn FeatureFlagClient>,
    idology_client: VendorClient<
        IdologyExpectIDRequest,
        IdologyExpectIDAPIResponse,
        idv::idology::error::Error,
    >,
    socure_client: VendorClient<SocureIDPlusRequest, SocureIDPlusAPIResponse, idv::socure::Error>,
    twilio_client: VendorClient<TwilioLookupV2Request, TwilioLookupV2APIResponse, idv::twilio::Error>,
    experian_client: VendorClient<
        ExperianCrossCoreRequest,
        ExperianCrossCoreResponse,
        idv::experian::error::Error,
    >,
) -> Result<VendorResponse, VendorAPIError> {
    // still TODO: traitfy the ff logic shared by these requests
    match request.vendor_api {
        VendorAPI::IdologyExpectID => {
            let request = tenant_vendor_control.build_idology_request(idv_data);
            send_idology_idv_request(
                request,
                is_production,
                ob_configuration_key,
                idology_client,
                ff_client,
            )
            .await
        }
        VendorAPI::TwilioLookupV2 => send_twilio_lookupv2_request(idv_data, twilio_client.clone()).await,
        VendorAPI::SocureIDPlus => {
            send_socure_idv_request(
                idv_data,
                socure_data,
                ob_configuration_key,
                is_production,
                socure_client,
                ff_client,
            )
            .await
        }
        VendorAPI::ExperianPreciseID => {
            let request = tenant_vendor_control.build_experian_request(idv_data);
            send_experian_idv_request(
                request,
                is_production,
                ob_configuration_key,
                experian_client,
                ff_client,
            )
            .await
        }
        api => {
            let err = format!("send_idv_request not implemented for {}", api);
            Err(idv::Error::AssertionError(err))
        }
    }
    .map_err(|e| VendorAPIError {
        vendor_api: request.vendor_api,
        error: e,
    })
}

/// Send a request to vendors for document verification
#[tracing::instrument(skip_all)]
pub async fn send_docv_request(
    state: &State,
    request: VerificationRequest,
    onboarding_id: &OnboardingId,
    data: DocVData,
) -> Result<VendorResponse, ApiError> {
    tracing::info!(
        msg = "Sending verification request",
        request_id = request.id.clone().to_string(),
        vendor_api = request.vendor_api.clone().to_string(),
        scoped_user_id = %request.scoped_vault_id,
        onboarding_id = %onboarding_id,
    );
    // Make the request to the DocV vendor
    // TODO implement mocking for these once we use scan verify
    let result = match request.vendor_api {
        VendorAPI::IdologyScanVerifySubmission => {
            idv::idology::send_scan_verify_request(&state.idology_client, data).await?
        }
        VendorAPI::IdologyScanVerifyResults => {
            let Some(ref_id) = data.reference_id else {
                return Err(idv::Error::from(idv::idology::error::Error::MissingReferenceId).into())
            };
            idv::idology::poll_scan_verify_results_request(&state.idology_client, ref_id).await?
        }
        VendorAPI::IdologyScanOnboarding => {
            send_scan_onboarding_docv_request(state, onboarding_id, data).await?
        }
        api => {
            let err = format!("send_docv_request not implemented for {}", api);
            return Err(ApiError::AssertionError(err));
        }
    };

    Ok(result)
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
            let parsed_response = r.clone().parsed_response();
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

        match res {
            Ok(ref vr) => {
                let summary_result = vr
                    .parsed_response
                    .response
                    .summary_result
                    .as_ref()
                    .map(|k| k.key.clone())
                    .unwrap_or_default();
                let results = vr
                    .parsed_response
                    .response
                    .results
                    .as_ref()
                    .map(|k| k.key.clone())
                    .unwrap_or_default();
                if let Ok(metric) = metrics::IDOLOGY_EXPECT_ID_SUCCESS.get_metric_with(
                    &labels! {"summary_result" => summary_result.as_str(), "results" => results.as_str()},
                ) {
                    metric.inc();
                }
            }
            Err(ref e) => {
                let error = format!("{}", e);
                if let Ok(metric) =
                    metrics::IDOLOGY_EXPECT_ID_ERROR.get_metric_with(&labels! {"error" => error.as_str()})
                {
                    metric.inc();
                }
            }
        }

        res.map(|r| {
            let parsed_response = r.clone().parsed_response();
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

        if let Ok(r) = &res {
            if let Some(score) = r.parsed_response.sigma_fraud_score() {
                metrics::SOCURE_SIGMA_FRAUD_SCORE.observe(score.into());
            }
        }

        res.map(|r| {
            // TODO: later delete VendorResponse and just replace with VendorAPIResponse
            let parsed_response = r.clone().parsed_response();
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
            let parsed_response = r.clone().parsed_response();
            let raw_response = r.raw_response();

            VendorResponse {
                response: parsed_response,
                raw_response,
            }
        })
        .map_err(|e| e.into())
    } else {
        let response = idv::test_fixtures::experian_cross_core_response();

        let parsed_response = idv::experian::cross_core::response::parse_response(response.clone())?;

        Ok(VendorResponse {
            response: ParsedResponse::ExperianPreciseID(parsed_response),
            raw_response: response.into(),
        })
    }
}

#[tracing::instrument(skip_all)]
pub async fn send_scan_onboarding_docv_request(
    state: &State,
    onboarding_id: &OnboardingId,
    data: DocVData,
) -> Result<VendorResponse, ApiError> {
    let ff_client = state.feature_flag_client.clone();

    let obid = onboarding_id.clone();
    let ob_configuration_key = state
        .db_pool
        .db_query(move |conn| -> Result<ObConfigurationKey, DbError> {
            Ok(ObConfiguration::get_by_onboarding_id(conn, &obid)?.key)
        })
        .await??;

    if ff_client.flag(BoolFlag::DisableAllScanOnboarding) {
        Err(ApiError::from(idv::Error::VendorCallsDisabledError))
    } else if state.config.service_config.is_production()
        || ff_client.flag(BoolFlag::EnableScanOnboardingInNonProd(&ob_configuration_key))
    {
        idv::idology::send_scan_onboarding_request(&state.idology_client, data)
            .await
            .map_err(ApiError::from)
    } else {
        let response = idv::test_fixtures::scan_onboarding_fake_response(
            IdologyScanOnboardingCaptureResult::Completed,
            None,
        );

        let parsed_response = idv::idology::scan_onboarding::response::parse_response(response.clone())
            .map_err(|e| ApiError::from(idv::Error::from(e)))?;

        Ok(VendorResponse {
            response: ParsedResponse::IDologyScanOnboarding(parsed_response),
            raw_response: response.into(),
        })
    }
}

/// Make our requests to a vendor, building data from the cached VerificationRequest
#[tracing::instrument(skip_all)]
pub async fn make_idv_request(
    request: VerificationRequest,
    onboarding_id: &OnboardingId,
    data: IdvData,
    socure_data: SocureData,
    ob_configuration_key: ObConfigurationKey,
    is_production: bool,
    ff_client: Arc<dyn FeatureFlagClient>,
    idology_client: VendorClient<
        IdologyExpectIDRequest,
        IdologyExpectIDAPIResponse,
        idv::idology::error::Error,
    >,
    socure_client: VendorClient<SocureIDPlusRequest, SocureIDPlusAPIResponse, idv::socure::Error>,
    twilio_client: VendorClient<TwilioLookupV2Request, TwilioLookupV2APIResponse, idv::twilio::Error>,
    experian_client: VendorClient<
        ExperianCrossCoreRequest,
        ExperianCrossCoreResponse,
        idv::experian::error::Error,
    >,
    tenant_vendor_control: &TenantVendorControl,
) -> Result<VendorResponse, VendorAPIError> {
    let vendor_api = request.vendor_api;
    tracing::info!(
        msg = "Sending verification request",
        request_id = request.id.clone().to_string(),
        vendor_api = vendor_api.clone().to_string(),
        scoped_user_id = %request.scoped_vault_id,
        onboarding_id = %onboarding_id,
    );

    let vendor_response = send_idv_request(
        request,
        tenant_vendor_control,
        data,
        socure_data,
        ob_configuration_key,
        is_production,
        ff_client,
        idology_client,
        socure_client,
        twilio_client,
        experian_client,
    )
    .await?;

    Ok(vendor_response)
}

pub type VerificationRequestWithVendorResponse = (VerificationRequest, VendorResponse);
pub type VerificationRequestWithVendorError = (VerificationRequest, ApiError);

#[tracing::instrument(skip_all, 
    fields(vreqs = ?requests.iter().map(|r| r.id.clone()).collect::<Vec<_>>(), 
    vendors = ?requests.iter().map(|r| r.vendor).collect::<Vec<_>>()))
]
pub async fn make_vendor_requests(
    requests: Vec<VerificationRequest>,
    onboarding_id: &OnboardingId,
    db_pool: &DbPool,
    enclave_client: &EnclaveClient,
    is_production: bool,
    ff_client: Arc<dyn FeatureFlagClient>,
    idology_client: VendorClient<
        IdologyExpectIDRequest,
        IdologyExpectIDAPIResponse,
        idv::idology::error::Error,
    >,
    socure_client: VendorClient<SocureIDPlusRequest, SocureIDPlusAPIResponse, idv::socure::Error>,
    twilio_client: VendorClient<TwilioLookupV2Request, TwilioLookupV2APIResponse, idv::twilio::Error>,
    experian_client: VendorClient<
        ExperianCrossCoreRequest,
        ExperianCrossCoreResponse,
        idv::experian::error::Error,
    >,
    tenant_vendor_control: TenantVendorControl,
) -> Result<Vec<Result<VerificationRequestWithVendorResponse, VerificationRequestWithVendorError>>, ApiError>
{
    let requests_with_data =
        build_request::bulk_build_data_from_requests(db_pool, enclave_client, requests).await?;

    let obid = onboarding_id.clone();

    let (socure_device_session_id, ip_address, ob_configuration_key) = db_pool
        .db_query(
            move |conn| -> Result<(Option<String>, Option<PiiString>, ObConfigurationKey), DbError> {
                let socure_device_session_id =
                    SocureDeviceSession::latest_for_onboarding(conn, &obid)?.map(|d| d.device_session_id);

                let ip_address = InsightEvent::get_by_onboarding_id(conn, &obid)?
                    .and_then(|ie| ie.ip_address.map(PiiString::from));

                let ob_configuration_key = ObConfiguration::get_by_onboarding_id(conn, &obid)?.key;

                Ok((socure_device_session_id, ip_address, ob_configuration_key))
            },
        )
        .await??;
    let socure_data = SocureData {
        device_session_id: socure_device_session_id,
        ip_address,
    };
    let raw_futures_with_vendors = requests_with_data.into_iter().map(|(r, data)| {
        (
            r.clone(),
            make_idv_request(
                r,
                onboarding_id,
                data,
                socure_data.clone(),
                ob_configuration_key.clone(),
                is_production,
                ff_client.clone(),
                idology_client.clone(),
                socure_client.clone(),
                twilio_client.clone(),
                experian_client.clone(),
                &tenant_vendor_control,
            ),
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
                Err(e) => {
                    tracing::warn!(
                        vendor_api = %e.vendor_api,
                        err = format!("{:?}", e.error),
                        log_msg
                    );

                    Err((reqs[idx].clone(), ApiError::VendorRequestFailed(e)))
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
    use feature_flag::MockFeatureFlagClient;
    use idv::idology::{
        expectid::{response::ExpectIDResponse, response::Response},
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
        let mut mock_ff_client = MockFeatureFlagClient::new();
        let mut mock_api = MockVendorAPICall::<
            IdologyExpectIDRequest,
            IdologyExpectIDAPIResponse,
            idv::idology::error::Error,
        >::new();

        let ob_config_key = ob_configuration_key.clone();
        mock_ff_client
            .expect_flag()
            .withf(move |f| *f == BoolFlag::EnableIdologyInNonProd(&ob_config_key))
            .return_once(move |_| flag_value);

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
            Arc::new(mock_ff_client),
        )
        .await
        .expect("shouldn't error");
    }
}
