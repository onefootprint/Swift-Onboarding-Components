#![allow(clippy::too_many_arguments)]
use super::tenant_vendor_control::TenantVendorControl;

use super::vendor_trait::{VendorAPICall, VendorAPIResponse};
use super::*;
use crate::decision::{self};
use crate::enclave_client::EnclaveClient;
use crate::metrics;
use crate::{errors::ApiError, State};

use db::models::onboarding::Onboarding;
use db::models::verification_result::VerificationResult;
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
use idv::middesk::response::webhook::{
    MiddeskBusinessUpdateWebhookResponse, MiddeskTinRetriedWebhookResponse,
};
use idv::middesk::{
    self, MiddeskCreateBusinessRequest, MiddeskCreateBusinessResponse, MiddeskGetBusinessRequest,
    MiddeskGetBusinessResponse,
};
use idv::socure::{SocureIDPlusAPIResponse, SocureIDPlusRequest};
use idv::twilio::{TwilioLookupV2APIResponse, TwilioLookupV2Request};
use idv::{idology::expectid::response::ExpectIDResponse, ParsedResponse, VendorResponse};
use newtypes::idology::IdologyScanOnboardingCaptureResult;
use newtypes::{BusinessData, DocVData, IdvData, ObConfigurationKey, PiiJsonValue, PiiString, VendorAPI};
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
        VendorAPI::TwilioLookupV2 => send_twilio_lookupv2_request(idv_data, twilio_client).await,
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
pub async fn send_twilio_lookupv2_request<T>(
    idv_data: IdvData,
    twilio_api_call: &T,
) -> Result<VendorResponse, idv::Error>
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
        .map_err(|e| e.into())
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
    socure_client: &impl VendorAPICall<SocureIDPlusRequest, SocureIDPlusAPIResponse, idv::socure::Error>,
    ff_client: &impl FeatureFlagClient,
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
    data: IdvData,
    socure_data: SocureData,
    ob_configuration_key: ObConfigurationKey,
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
pub type VerificationRequestWithVendorError = (VerificationRequest, ApiError);

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
                    .ip_address
                    .map(PiiString::from);

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
    let sv_id = vreq.scoped_vault_id.clone();
    let di_id = vreq.decision_intent_id.ok_or(DbError::ObjectNotFound)?;
    let verification_result = db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let uv = VerificationRequest::get_user_vault(conn, vreq_id)?;
            let vres = verification_result::save_verification_result(conn, &vr, &uv.public_key)?;

            // Create vreq for anticipated business.updated webhook
            let _vreq =
                VerificationRequest::create(conn, &sv_id, &di_id, VendorAPI::MiddeskBusinessUpdateWebhook)?;
            Ok(vres)
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

// TODO: move all this garbonzo to a separate file
pub async fn handle_middesk_webhook(
    db_pool: &DbPool,
    ff_client: &impl FeatureFlagClient,
    middesk_client: &impl VendorAPICall<
        MiddeskGetBusinessRequest,
        MiddeskGetBusinessResponse,
        idv::middesk::Error,
    >,
    enclave_client: &EnclaveClient,
    res: serde_json::Value,
) -> Result<(), ApiError> {
    match middesk::response::webhook::parse_webhook(res.clone()).map_err(idv::Error::from)? {
        middesk::response::webhook::MiddeskWebhookResponse::BusinessUpdate(b) => {
            handle_middesk_business_response(db_pool, ff_client, enclave_client, b, res).await
        }
        middesk::response::webhook::MiddeskWebhookResponse::TinRetried(r) => {
            handle_middesk_tin_retried_response(db_pool, ff_client, enclave_client, middesk_client, r, res)
                .await
        }
    }
}

pub async fn handle_middesk_business_response(
    db_pool: &DbPool,
    ff_client: &impl FeatureFlagClient,
    enclave_client: &EnclaveClient,
    middesk_response: MiddeskBusinessUpdateWebhookResponse,
    raw_res: serde_json::Value,
) -> Result<(), ApiError> {
    let business_id =
        middesk_response
            .business_id()
            .ok_or(idv::Error::from(middesk::Error::ExpectedFieldMissing(
                "business_id".to_owned(),
            )))?;

    let mr = middesk_response.clone();
    let has_tin_error = mr.has_tin_error();
    if has_tin_error {
        tracing::error!(business_id = business_id, "Middesk TIN failure Error");
    }

    let (vres_id, ob) = db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            // Lookup the VRes for the POST /business call we made so we can associate this webhook with a particular scoped_vault
            let (create_business_vreq, _, di) =
                VerificationResult::get_by_response_id(conn, VendorAPI::MiddeskCreateBusiness, &business_id)?
                    .ok_or(idv::Error::from(middesk::Error::CreateBusinessResultNotFound(
                        business_id,
                    )))?;

            let vreqs = VerificationRequest::list_by_decision_intent_id(conn, &di.id)?;
            let outstanding_webhook_vreqs: Vec<_> = vreqs
                .into_iter()
                .filter(|(vreq, vres, _)| {
                    vreq.vendor_api == VendorAPI::MiddeskBusinessUpdateWebhook && vres.is_none()
                })
                .collect();
            if outstanding_webhook_vreqs.len() != 1 {
                Err(idv::Error::from(
                    middesk::Error::UnexpectedNumberOfOutstandingWebhookVreqs(
                        outstanding_webhook_vreqs.len(),
                    ),
                ))?;
            }
            let webhook_vreq = outstanding_webhook_vreqs[0].0.clone();

            let uv = VerificationRequest::get_user_vault(conn, webhook_vreq.id.clone())?;

            let vendor_response = VendorResponse {
                response: ParsedResponse::MiddeskBusinessUpdateWebhook(mr),
                raw_response: PiiJsonValue::new(raw_res),
            };
            let vr = (webhook_vreq, vendor_response);

            let verification_result =
                verification_result::save_verification_result(conn, &vr, &uv.public_key)?;

            // if the IRS is unavailable, then we need to wait for a `tin.retried` webhook from Middesk
            if has_tin_error {
                // Create vreq for anticipated `tin.retried` webhook
                let di_id = create_business_vreq
                    .decision_intent_id
                    .ok_or(DbError::ObjectNotFound)?;

                let _vreq = VerificationRequest::create(
                    conn,
                    &create_business_vreq.scoped_vault_id,
                    &di_id,
                    VendorAPI::MiddeskTinRetriedWebhook,
                )?;
            }

            let (ob, _, _, _) = Onboarding::get(conn, (&create_business_vreq.scoped_vault_id, &uv.id))?;

            Ok((verification_result.id, ob))
        })
        .await?;

    if !has_tin_error {
        let business_response = middesk_response.business_response().ok_or(idv::Error::from(
            middesk::Error::ExpectedFieldMissing("business".to_owned()),
        ))?;

        decision::biz_risk::make_kyb_decision(
            db_pool,
            ff_client,
            enclave_client,
            &ob,
            business_response,
            &vres_id,
        )
        .await
    } else {
        Ok(())
    }
}

pub async fn handle_middesk_tin_retried_response(
    db_pool: &DbPool,
    ff_client: &impl FeatureFlagClient,
    enclave_client: &EnclaveClient,
    middesk_client: &impl VendorAPICall<
        MiddeskGetBusinessRequest,
        MiddeskGetBusinessResponse,
        idv::middesk::Error,
    >,
    middesk_response: MiddeskTinRetriedWebhookResponse,
    raw_res: serde_json::Value,
) -> Result<(), ApiError> {
    let business_id =
        middesk_response
            .business_id()
            .ok_or(idv::Error::from(middesk::Error::ExpectedFieldMissing(
                "business_id".to_owned(),
            )))?;
    let mr = middesk_response.clone();
    let bizid = business_id.clone();
    let (uv, ob, get_business_vreq) = db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            // Lookup the VRes for the POST /business call we made so we can associate this webhook with a particular scoped_vault
            let (create_business_vreq, _, di) =
                VerificationResult::get_by_response_id(conn, VendorAPI::MiddeskCreateBusiness, &bizid)?
                    .ok_or(idv::Error::from(middesk::Error::CreateBusinessResultNotFound(
                        bizid,
                    )))?;

            let vreqs = VerificationRequest::list_by_decision_intent_id(conn, &di.id)?;
            let outstanding_webhook_vreqs: Vec<_> = vreqs
                .into_iter()
                .filter(|v| v.0.vendor_api == VendorAPI::MiddeskTinRetriedWebhook && v.1.is_none())
                .collect();
            if outstanding_webhook_vreqs.len() != 1 {
                Err(idv::Error::from(
                    middesk::Error::UnexpectedNumberOfOutstandingWebhookVreqs(
                        outstanding_webhook_vreqs.len(),
                    ),
                ))?;
            }
            let webhook_vreq = outstanding_webhook_vreqs[0].0.clone();

            let uv = VerificationRequest::get_user_vault(conn, webhook_vreq.id.clone())?;
            let (ob, _, _, _) = Onboarding::get(conn, (&create_business_vreq.scoped_vault_id, &uv.id))?;

            let vendor_response = VendorResponse {
                response: ParsedResponse::MiddeskTinRetriedWebhook(mr),
                raw_response: PiiJsonValue::new(raw_res),
            };
            let vr = (webhook_vreq, vendor_response);

            let _vres = verification_result::save_verification_result(conn, &vr, &uv.public_key)?;

            // create a Vreq for the GET /business call we will now make
            let di_id = create_business_vreq
                .decision_intent_id
                .ok_or(DbError::ObjectNotFound)?;
            let get_business_vreq = VerificationRequest::create(
                conn,
                &create_business_vreq.scoped_vault_id,
                &di_id,
                VendorAPI::MiddeskGetBusiness,
            )?;

            Ok((uv, ob, get_business_vreq))
        })
        .await?;

    let get_business_res = middesk_client
        .make_request(MiddeskGetBusinessRequest { business_id })
        .await
        .map_err(|e| ApiError::from(idv::Error::from(e)))?;

    let vendor_response = VendorResponse {
        response: get_business_res.clone().parsed_response(),
        raw_response: get_business_res.clone().raw_response(),
    };

    // TODO: refactor code sites where we save a single vres to share a common func
    let vr = (get_business_vreq.clone(), vendor_response.clone());
    let vres = db_pool
        .db_query(move |conn| -> ApiResult<_> {
            verification_result::save_verification_result(conn, &vr, &uv.public_key)
        })
        .await??;

    decision::biz_risk::make_kyb_decision(
        db_pool,
        ff_client,
        enclave_client,
        &ob,
        &get_business_res.parsed_response,
        &vres.id,
    )
    .await
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
            &mock_api,
            &mock_ff_client,
        )
        .await
        .expect("shouldn't error");
    }
}
