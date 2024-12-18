#![allow(clippy::too_many_arguments)]
use super::waterfall_vendor_api::WaterfallVendorAPI;
use crate::decision::vendor::build_request;
use crate::decision::vendor::into_fp_error;
use crate::decision::vendor::tenant_vendor_control::TenantVendorControl;
use crate::decision::vendor::vendor_trait::VendorAPIResponse;
use crate::decision::vendor::verification_result;
use crate::decision::vendor::verification_result::SaveVerificationResultArgs;
use crate::decision::vendor::verification_result::ShouldSaveVerificationRequest;
use crate::vendor_clients::VendorClient;
use crate::FpResult;
use crate::State;
use api_errors::ServerErrInto;
use db::models::vault::Vault;
use db::models::verification_request::VerificationRequest;
use db::models::verification_result::VerificationResult;
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
use newtypes::DecisionIntentId;
use newtypes::IdvData;
use newtypes::PublishablePlaybookKey;
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
    ob_configuration_key: PublishablePlaybookKey,
    vendor_api: WaterfallVendorAPI,
) -> FpResult<(VerificationRequest, VerificationResult, Option<ParsedResponse>)> {
    let svid = sv_id.clone();
    let diid = di_id.clone();
    let vreq = state
        .db_query(move |conn| VerificationRequest::create(conn, (&svid, &diid, vendor_api.into()).into()))
        .await?;

    let idv_data = build_request::build_idv_data_from_verification_request(
        &state.db_pool,
        &state.enclave_client,
        vreq.clone(),
    )
    .await?;
    let svid = sv_id.clone();
    let uv = state.db_query(move |conn| Vault::get(conn, &svid)).await?;

    let (vendor_result, vres) =
        send_idv_request(state, tvc, uv, vendor_api, &vreq, idv_data, ob_configuration_key).await?;

    if let Err(error) = vendor_result.as_ref() {
        tracing::warn!(?vendor_api, ?error, "Error making KYC vendor call");
    }

    // Need vres and vendor_result
    Ok((vreq, vres, vendor_result.ok()))
}

#[tracing::instrument(skip(state, tvc, idv_data))]
pub async fn send_idv_request(
    state: &State,
    tvc: &TenantVendorControl,
    uv: Vault,
    vendor_api: WaterfallVendorAPI,
    vreq: &VerificationRequest,
    idv_data: IdvData,
    ob_configuration_key: PublishablePlaybookKey,
) -> FpResult<(FpResult<ParsedResponse>, VerificationResult)> {
    let vreq = vreq.clone();
    let is_production = state.config.service_config.is_production();
    match vendor_api {
        WaterfallVendorAPI::Idology => {
            let request = IdologyExpectIDRequest {
                idv_data,
                credentials: tvc.idology_credentials(),
                tenant_identifier: tvc.tenant_identifier(),
            };
            let res = send_idology_idv_request(
                request,
                is_production,
                ob_configuration_key,
                state.vendor_clients.idology_expect_id.clone(),
                state.ff_client.clone(),
            )
            .await;
            let vreq = ShouldSaveVerificationRequest::No(vreq.id);
            let args = SaveVerificationResultArgs::new(&res, uv.public_key, vreq);
            let (vres, _) = args.save(&state.db_pool).await?;
            let res = res
                .and_then(|r| r.parsed.map_err(into_fp_error))
                .map(ParsedResponse::IDologyExpectID);
            Ok((res, vres))
        }
        WaterfallVendorAPI::Experian => {
            let request = ExperianCrossCoreRequest {
                idv_data,
                credentials: tvc.experian_credentials(),
            };
            let res = send_experian_idv_request(
                request,
                is_production,
                ob_configuration_key,
                state.vendor_clients.experian_cross_core.clone(),
                state.ff_client.clone(),
            )
            .await;
            let vreq = ShouldSaveVerificationRequest::No(vreq.id);
            let args = SaveVerificationResultArgs::new(&res, uv.public_key, vreq);
            let (vres, _) = args.save(&state.db_pool).await?;
            let res = res
                .and_then(|r| r.parsed.map_err(into_fp_error))
                .map(ParsedResponse::ExperianPreciseID);
            Ok((res, vres))
        }
        WaterfallVendorAPI::Lexis => {
            let credentials = tvc.lexis_credentials();
            let response = if let Some(tbi) = tvc.tenant_business_info() {
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
                ServerErrInto("Missing tenant_business_info")
            };
            let (response, vres) = state
                .db_pool
                .db_query(move |conn| {
                    let vres = verification_result::save_vres(conn, &uv.public_key, &response, &vreq)?;
                    Ok((response, vres))
                })
                .await?;
            let res = response.map(|r| r.response.clone());
            Ok((res, vres))
        }
    }
}


#[tracing::instrument(skip_all)]
pub async fn send_idology_idv_request(
    request: IdologyExpectIDRequest,
    is_production: bool,
    ob_configuration_key: PublishablePlaybookKey,
    client: VendorClient<IdologyExpectIDRequest, IdologyExpectIDAPIResponse>,
    ff_client: Arc<dyn FeatureFlagClient>,
) -> FpResult<IdologyExpectIDAPIResponse> {
    if is_production || ff_client.flag(BoolFlag::EnableIdologyInNonProd(&ob_configuration_key)) {
        client.make_request(request).await
    } else {
        let response = idv::test_fixtures::idology_fake_data_expectid_response();

        let parsed_response: ExpectIDResponse =
            idv::idology::expectid::response::parse_response(response.clone())?;

        Ok(IdologyExpectIDAPIResponse {
            raw_response: response.into(),
            parsed: Ok(parsed_response),
        })
    }
}


#[tracing::instrument(skip_all)]
pub async fn send_experian_idv_request(
    request: ExperianCrossCoreRequest,
    is_production: bool,
    ob_configuration_key: PublishablePlaybookKey,
    client: VendorClient<ExperianCrossCoreRequest, ExperianCrossCoreResponse>,
    ff_client: Arc<dyn FeatureFlagClient>,
) -> FpResult<ExperianCrossCoreResponse> {
    if is_production || ff_client.flag(BoolFlag::EnableExperianInNonProd(&ob_configuration_key)) {
        client.make_request(request).await
    } else {
        let response = idv::test_fixtures::experian_cross_core_response(None, None);

        let parsed_response = idv::experian::cross_core::response::parse_response(response.clone())?;

        Ok(ExperianCrossCoreResponse {
            raw_response: response.into(),
            parsed: Ok(parsed_response),
        })
    }
}

#[tracing::instrument(skip_all)]
pub async fn send_lexis_flex_id_request(
    request: LexisFlexIdRequest,
    is_production: bool,
    ob_configuration_key: PublishablePlaybookKey,
    client: VendorClient<LexisFlexIdRequest, LexisFlexIdResponse>,
    ff_client: Arc<dyn FeatureFlagClient>,
) -> FpResult<VendorResponse> {
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
        let ob_configuration_key = PublishablePlaybookKey::from_str("obc123").unwrap();
        let mut mock_ff_client = MockFFClient::new();
        let mut mock_api = MockVendorAPICall::<IdologyExpectIDRequest, IdologyExpectIDAPIResponse>::new();

        let ob_config_key = ob_configuration_key.clone();
        mock_ff_client.mock(|c| {
            c.expect_flag()
                .withf(move |f| *f == BoolFlag::EnableIdologyInNonProd(&ob_config_key))
                .return_once(move |_| flag_value);
        });

        if expect_api_call {
            mock_api.expect_make_request().times(1).return_once(|_| {
                let response = ExpectIDResponse {
                    response: Response {
                        qualifiers: None,
                        results: None,
                        summary_result: None,
                        id_number: None,
                        id_scan: None,
                        error: None,
                        restriction: None,
                    },
                };
                Ok(IdologyExpectIDAPIResponse {
                    // TODO: helpers methods to make these and other test structs
                    raw_response: PiiJsonValue::from(json!({"yo": "sup"})),
                    parsed: Ok(response),
                })
            });
        }
        let tvc = TenantVendorControl::default();
        let request = IdologyExpectIDRequest {
            idv_data: IdvData::default(),
            credentials: tvc.idology_credentials(),
            tenant_identifier: tvc.tenant_identifier(),
        };
        send_idology_idv_request(
            request,
            is_production,
            ob_configuration_key,
            Arc::new(mock_api),
            mock_ff_client.into_mock(),
        )
        .await
        .expect("shouldn't error");
    }
}
