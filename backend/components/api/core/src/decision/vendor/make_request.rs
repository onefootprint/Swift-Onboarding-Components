#![allow(clippy::too_many_arguments)]
use super::idv_request::KycRequestBuilder;
use super::tenant_vendor_control::TenantVendorControl;
use super::vendor_trait::{VendorAPICall, VendorAPIResponse};
use super::*;
use crate::enclave_client::EnclaveClient;
use crate::metrics;
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
use idv::middesk::response::business::BusinessResponse;
use idv::middesk::{MiddeskCreateBusinessRequest, MiddeskCreateBusinessResponse};
use idv::socure::{SocureIDPlusAPIResponse, SocureIDPlusRequest};
use idv::twilio::{TwilioLookupV2APIResponse, TwilioLookupV2Request};
use idv::{idology::expectid::response::ExpectIDResponse, ParsedResponse, VendorResponse};
use newtypes::idology::IdologyScanOnboardingCaptureResult;
use newtypes::{BusinessData, DocVData, IdvData, ObConfigurationKey, PiiString, VendorAPI};
use prometheus::labels;

/// Branch on vendor and send requests to vendors
#[tracing::instrument(skip(
    kyc_request_builder,
    db_pool,
    ff_client,
    idology_client,
    socure_client,
    twilio_client,
    experian_client
))]
pub async fn send_idv_request(
    request: VerificationRequest,
    kyc_request_builder: KycRequestBuilder<'_>,
    onboarding_id: &OnboardingId,
    db_pool: &DbPool,
    is_production: bool,
    ff_client: &impl FeatureFlagClient,
    idology_client: &impl VendorAPICall<
        IdologyExpectIDRequest,
        IdologyExpectIDAPIResponse,
        idv::idology::error::Error,
    >,
    socure_client: &impl VendorAPICall<SocureIDPlusRequest, SocureIDPlusAPIResponse, idv::socure::Error>,
    twilio_client: &impl VendorAPICall<TwilioLookupV2Request, TwilioLookupV2APIResponse, idv::twilio::Error>,
    experian_client: &impl VendorAPICall<
        ExperianCrossCoreRequest,
        ExperianCrossCoreResponse,
        idv::experian::error::Error,
    >,
) -> Result<VendorResponse, ApiError> {
    tracing::info!(
        msg = "Sending verification request",
        request_id = request.id.clone().to_string(),
        vendor_api = request.vendor_api.clone().to_string(),
        scoped_user_id = %request.scoped_vault_id,
        onboarding_id = %onboarding_id,
    );
    // Make the request to the IDV vendor

    let obid = onboarding_id.clone();
    let ob_configuration_key = db_pool
        .db_query(move |conn| ObConfiguration::get_by_onboarding_id(conn, &obid))
        .await??
        .key;

    // still TODO: traitfy the ff logic shared by these requests
    let result = match request.vendor_api {
        VendorAPI::IdologyExpectID => {
            let request = kyc_request_builder.build_idology_request();
            send_idology_idv_request(
                request,
                is_production,
                ob_configuration_key,
                idology_client,
                ff_client,
            )
            .await?
        }
        VendorAPI::TwilioLookupV2 => {
            send_twilio_lookupv2_request(kyc_request_builder.idv_data(), twilio_client).await?
        }
        VendorAPI::SocureIDPlus => {
            send_socure_idv_request(
                onboarding_id,
                kyc_request_builder.idv_data(),
                is_production,
                db_pool,
                socure_client,
                ff_client,
            )
            .await?
        }
        // TODO finish this
        VendorAPI::ExperianPreciseID => {
            let request = kyc_request_builder.build_experian_request();
            send_experian_idv_request(
                request,
                is_production,
                ob_configuration_key,
                experian_client,
                ff_client,
            )
            .await?
        }
        api => {
            let err = format!("send_idv_request not implemented for {}", api);
            return Err(ApiError::AssertionError(err));
        }
    };

    Ok(result)
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
pub async fn send_twilio_lookupv2_request<T>(
    idv_data: IdvData,
    twilio_api_call: &T,
) -> Result<VendorResponse, ApiError>
where
    T: VendorAPICall<TwilioLookupV2Request, TwilioLookupV2APIResponse, idv::twilio::Error>,
{
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
        .map_err(|e| ApiError::from(idv::Error::from(e)))
}

#[tracing::instrument(skip_all)]
pub async fn send_idology_idv_request(
    request: IdologyExpectIDRequest,
    is_production: bool,
    ob_configuration_key: ObConfigurationKey,
    idology_api_call: &impl VendorAPICall<
        IdologyExpectIDRequest,
        IdologyExpectIDAPIResponse,
        idv::idology::error::Error,
    >,
    ff_client: &impl FeatureFlagClient,
) -> Result<VendorResponse, ApiError> {
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
        .map_err(|e| ApiError::from(idv::Error::from(e)))
    } else {
        let response = idv::test_fixtures::idology_fake_data_expectid_response();

        let parsed_response: ExpectIDResponse =
            idv::idology::expectid::response::parse_response(response.clone())
                .map_err(|e| ApiError::from(idv::Error::from(e)))?;

        Ok(VendorResponse {
            raw_response: response.into(),
            response: ParsedResponse::IDologyExpectID(parsed_response),
        })
    }
}

#[tracing::instrument(skip_all)]
pub async fn send_socure_idv_request(
    onboarding_id: &OnboardingId,
    data: IdvData,
    is_production: bool,
    db_pool: &DbPool,
    socure_client: &impl VendorAPICall<SocureIDPlusRequest, SocureIDPlusAPIResponse, idv::socure::Error>,
    ff_client: &impl FeatureFlagClient,
) -> Result<VendorResponse, ApiError> {
    let obid = onboarding_id.clone();
    let (socure_device_session_id, ip_address, ob_configuration_key) = db_pool
        .db_query(
            move |conn| -> Result<(Option<String>, Option<PiiString>, ObConfigurationKey), DbError> {
                let socure_device_session_id =
                    SocureDeviceSession::latest_for_onboarding(conn, &obid)?.map(|d| d.device_session_id);

                let ip_address = InsightEvent::get_by_onboarding_id(conn, &obid)?
                    .ip_address
                    .map(PiiString::from);

                let ob_configuration_key = ObConfiguration::get_by_onboarding_id(conn, &obid)?.key;

                Ok((socure_device_session_id, ip_address, ob_configuration_key))
            },
        )
        .await??;

    if ff_client.flag(BoolFlag::DisableAllSocure) {
        Err(ApiError::from(idv::Error::VendorCallsDisabledError))
    } else if is_production || ff_client.flag(BoolFlag::EnableSocureInNonProd(&ob_configuration_key)) {
        let res = socure_client
            .make_request(SocureIDPlusRequest {
                idv_data: data,
                socure_device_session_id,
                ip_address,
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
        .map_err(|e| ApiError::from(idv::Error::from(e)))
    } else {
        let response = idv::test_fixtures::socure_idplus_fake_passing_response();

        let parsed_response =
            idv::socure::parse_response(response.clone()).map_err(|e| ApiError::from(idv::Error::from(e)))?;

        Ok(VendorResponse {
            response: ParsedResponse::SocureIDPlus(parsed_response),
            raw_response: response.into(),
        })
    }
}

// #[tracing::instrument(skip_all)]
pub async fn send_experian_idv_request(
    request: ExperianCrossCoreRequest,
    is_production: bool,
    ob_configuration_key: ObConfigurationKey,
    experian_api_call: &impl VendorAPICall<
        ExperianCrossCoreRequest,
        ExperianCrossCoreResponse,
        idv::experian::error::Error,
    >,
    ff_client: &impl FeatureFlagClient,
) -> Result<VendorResponse, ApiError> {
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
        .map_err(|e| ApiError::from(idv::Error::from(e)))
    } else {
        let response = idv::test_fixtures::experian_cross_core_response();

        let parsed_response = idv::experian::cross_core::response::parse_response(response.clone())
            .map_err(|e| ApiError::from(idv::Error::from(e)))?;

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
    let ff_client = &state.feature_flag_client;

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
pub async fn make_idv_request(
    request: VerificationRequest,
    onboarding_id: &OnboardingId,
    db_pool: &DbPool,
    enclave_client: &EnclaveClient,
    is_production: bool,
    ff_client: &impl FeatureFlagClient,
    idology_client: &impl VendorAPICall<
        IdologyExpectIDRequest,
        IdologyExpectIDAPIResponse,
        idv::idology::error::Error,
    >,
    socure_client: &impl VendorAPICall<SocureIDPlusRequest, SocureIDPlusAPIResponse, idv::socure::Error>,
    twilio_client: &impl VendorAPICall<TwilioLookupV2Request, TwilioLookupV2APIResponse, idv::twilio::Error>,
    experian_client: &impl VendorAPICall<
        ExperianCrossCoreRequest,
        ExperianCrossCoreResponse,
        idv::experian::error::Error,
    >,
    tenant_vendor_control: &TenantVendorControl,
) -> Result<VendorResponse, ApiError> {
    let data =
        build_request::build_idv_data_from_verification_request(db_pool, enclave_client, request.clone())
            .await?;
    let kyc_request_builder = KycRequestBuilder::new(data, tenant_vendor_control);
    let vendor_response = send_idv_request(
        request,
        kyc_request_builder,
        onboarding_id,
        db_pool,
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

/// Make our requests to a vendor, building data from the cached VerificationRequest
///
/// A note on usage: Doc verification is different from other vendor requests in that we run the request synchronously in bifrost
/// in order to communicate potential issues with the uploaded image back to the customer. Because of this,
/// we have VerificationResults _before_ the decision engine would run
#[tracing::instrument(skip(state))]
pub async fn make_docv_request(
    state: &State,
    request: VerificationRequest,
    onboarding_id: &OnboardingId,
) -> Result<vendor_result::VendorResult, ApiError> {
    let request_id = request.id.clone();
    let requestid = request.id.clone();

    let data =
        build_request::build_docv_data_for_submission_from_verification_request(state, request.clone())
            .await?;

    let vendor_response = send_docv_request(state, request.clone(), onboarding_id, data).await?;

    let vr = (request.clone(), vendor_response.clone());
    let verification_result = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let uv = VerificationRequest::get_user_vault(conn, requestid)?;
            verification_result::save_verification_result(conn, &vr, &uv.public_key)
        })
        .await??;

    let result = vendor_result::VendorResult {
        response: vendor_response,
        verification_result_id: verification_result.id,
        verification_request_id: request_id,
    };

    Ok(result)
}

pub type VerificationRequestWithVendorResponse = (VerificationRequest, VendorResponse);

#[tracing::instrument(skip_all)]
pub async fn make_vendor_requests(
    requests: Vec<VerificationRequest>,
    onboarding_id: &OnboardingId,
    db_pool: &DbPool,
    enclave_client: &EnclaveClient,
    is_production: bool,
    ff_client: &impl FeatureFlagClient,
    idology_client: &impl VendorAPICall<
        IdologyExpectIDRequest,
        IdologyExpectIDAPIResponse,
        idv::idology::error::Error,
    >,
    socure_client: &impl VendorAPICall<SocureIDPlusRequest, SocureIDPlusAPIResponse, idv::socure::Error>,
    twilio_client: &impl VendorAPICall<TwilioLookupV2Request, TwilioLookupV2APIResponse, idv::twilio::Error>,
    experian_client: &impl VendorAPICall<
        ExperianCrossCoreRequest,
        ExperianCrossCoreResponse,
        idv::experian::error::Error,
    >,
    tenant_vendor_control: TenantVendorControl,
) -> Result<Vec<Result<VerificationRequestWithVendorResponse, ApiError>>, ApiError> {
    let raw_futures_with_vendors = requests.into_iter().map(|r| {
        (
            r.clone(),
            make_idv_request(
                r,
                onboarding_id,
                db_pool,
                enclave_client,
                is_production,
                ff_client,
                idology_client,
                socure_client,
                twilio_client,
                experian_client,
                &tenant_vendor_control,
            ),
        )
    });

    let (reqs, raw_futures): (Vec<_>, Vec<_>) = raw_futures_with_vendors.into_iter().unzip();
    let raw_results = futures::future::join_all(raw_futures).await;
    let results = raw_results
        .into_iter()
        .enumerate()
        .map(|(idx, res)| match res {
            Ok(vr) => Ok((reqs[idx].clone(), vr)),
            Err(ref e) => {
                let vendor_api = reqs[idx].vendor_api;
                tracing::warn!(
                    vendor_api = %vendor_api,
                    err = format!("{:?}", e),
                    "VerificationRequest failed"
                );
                Err(ApiError::VendorRequestFailed(vendor_api))
            }
        })
        .collect();

    Ok(results)
}

#[tracing::instrument(skip(db_pool, enclave_client, middesk_client, ff_client))]
pub async fn make_kyb_request(
    db_pool: &DbPool,
    enclave_client: &EnclaveClient,
    vreq: VerificationRequest,
    onboarding_id: &OnboardingId,
    middesk_client: &impl VendorAPICall<
        MiddeskCreateBusinessRequest,
        MiddeskCreateBusinessResponse,
        idv::middesk::Error,
    >,
    ff_client: &impl FeatureFlagClient,
    ob_configuration_key: ObConfigurationKey,
) -> Result<vendor_result::VendorResult, ApiError> {
    let vreq_id = vreq.id.clone();

    let business_data =
        build_request::build_business_data_from_verification_request(db_pool, enclave_client, vreq.clone())
            .await?;

    let res = send_middesk_call(business_data, middesk_client, ff_client, ob_configuration_key).await;

    let vendor_response = res
        .map(|r| {
            let parsed_response = r.clone().parsed_response();
            let raw_response = r.raw_response();
            VendorResponse {
                response: parsed_response,
                raw_response,
            }
        })
        .map_err(|e| ApiError::from(idv::Error::from(e)))?;

    let vr = (vreq.clone(), vendor_response.clone());
    let verification_result = db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let uv = VerificationRequest::get_user_vault(conn, vreq_id)?;
            verification_result::save_verification_result(conn, &vr, &uv.public_key)
        })
        .await??;

    let result = vendor_result::VendorResult {
        response: vendor_response,
        verification_result_id: verification_result.id,
        verification_request_id: vreq.id.clone(),
    };

    Ok(result)
}

async fn send_middesk_call(
    business_data: BusinessData,
    middesk_client: &impl VendorAPICall<
        MiddeskCreateBusinessRequest,
        MiddeskCreateBusinessResponse,
        idv::middesk::Error,
    >,
    ff_client: &impl FeatureFlagClient,
    ob_configuration_key: ObConfigurationKey,
) -> Result<MiddeskCreateBusinessResponse, idv::middesk::Error> {
    if ff_client.flag(BoolFlag::EnableMiddeskInNonProd(&ob_configuration_key)) {
        middesk_client
            .make_request(MiddeskCreateBusinessRequest { business_data })
            .await
    } else {
        let raw = serde_json::json!(
          {
            "object": "business",
            "id": "dd16b27e-e6b7-4rf34-5454-d77e6d1b9dfe",
            "name": "Waffle House",
            "created_at": "2023-02-07T21:51:21.234Z",
            "updated_at": "2023-02-07T21:51:24.894Z",
            "status": "in_review",
          }
        );
        let parsed: BusinessResponse = idv::middesk::response::parse_response(raw.clone())?;

        Ok(MiddeskCreateBusinessResponse {
            raw_response: raw.into(),
            parsed_response: parsed,
        })
    }
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
        let kyc_request = KycRequestBuilder::new(IdvData { ..Default::default() }, &tvc);
        send_idology_idv_request(
            kyc_request.build_idology_request(),
            is_production,
            ob_configuration_key,
            &mock_api,
            &mock_ff_client,
        )
        .await
        .expect("shouldn't error");
    }
}
