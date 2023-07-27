pub mod client;
pub mod common;
pub mod error;
pub mod expectid;
pub(crate) mod fixtures;
pub mod pa;
pub mod scan_onboarding;
pub mod scan_verify;

use newtypes::vendor_credentials::IdologyCredentials;
use newtypes::{DocVData, IdvData, PiiJsonValue};

use crate::footprint_http_client::FootprintVendorHttpClient;
use crate::{ParsedResponse, VendorResponse};

use crate::idology::client::IdologyClient;
use crate::idology::error as IdologyError;
use expectid::response::ExpectIDResponse;
use scan_onboarding::response::ScanOnboardingAPIResponse;

use tokio_retry::{
    strategy::{jitter, ExponentialBackoff},
    RetryIf,
};

use self::common::request::{IdologyRequestData, Request};
use self::pa::IdologyPaRequest;
use self::scan_verify::response::ScanVerifySubmissionAPIResponse;

pub struct IdologyExpectIDRequest {
    pub idv_data: IdvData,
    pub credentials: IdologyCredentials,
    pub tenant_identifier: String,
}

#[derive(Clone)]
pub struct IdologyExpectIDAPIResponse {
    pub raw_response: PiiJsonValue,
    pub parsed_response: ExpectIDResponse,
}

/// Make a request to the ExpectID module. Returns the result from ExpectID and a vec of
/// scopes that were sent to IDology's ExpectID
#[tracing::instrument(skip_all)]
pub async fn verify_expectid(
    fp_http_client: &FootprintVendorHttpClient,
    request: IdologyExpectIDRequest,
) -> Result<serde_json::Value, IdologyError::Error> {
    let url = "https://web.idologylive.com/api/idiq.svc";
    let req_data = expectid::request::RequestData::try_from(request.idv_data, request.tenant_identifier)?;
    let req_list = Request::new(
        request.credentials.username.clone(),
        request.credentials.password.clone(),
        IdologyRequestData::ExpectId(req_data),
    );
    let response = fp_http_client
        .client
        .post(url)
        .query(&req_list)
        .send()
        .await
        .map_err(|err| IdologyError::ReqwestError::SendError(err.to_string()))?;

    let idology_response = response
        .json::<serde_json::Value>()
        .await
        .map_err(IdologyError::ReqwestError::InternalError)?;
    Ok(idology_response)
}
pub async fn send_scan_verify_request(
    client: &IdologyClient,
    data: DocVData,
) -> Result<VendorResponse, crate::Error> {
    let response = client
        .submit_to_scan_verify(data)
        .await
        .map_err(crate::idology::error::Error::from)?;
    let parsed_response: ScanVerifySubmissionAPIResponse =
        scan_verify::response::parse_submission_response(response.clone())
            .map_err(crate::idology::error::Error::from)?;

    // Validate there are no errors (related to UN/PW, submitted fields, whitelisted IPs etc)
    parsed_response.validate()?;

    Ok(VendorResponse {
        raw_response: response.into(),
        response: ParsedResponse::IDologyScanVerifySubmission(parsed_response),
    })
}

pub async fn poll_scan_verify_results_request(
    client: &IdologyClient,
    query_id: u64,
) -> Result<VendorResponse, crate::Error> {
    // Retry logic
    //
    // Note: IDology does not recommend polling the service until at least five seconds have passed
    // and then only polling at five second intervals thereafter once the link to the customer has been displayed/delivered
    //
    // 2023-01-05, we aren't using scan verify yet, but should expect to need to configure this time
    // See: https://web.idologylive.com/api_portal.php#step-3-obtaining-scan-verify-results-subtitle-step-3-scan-verify
    let retry_strategy = ExponentialBackoff::from_millis(100).map(jitter).take(3);
    let response = RetryIf::spawn(
        retry_strategy,
        || client.get_scan_verify_results(query_id),
        should_retry_request,
    )
    .await
    .map_err(IdologyError::Error::from)?;

    let parsed =
        scan_verify::response::parse_response(response.clone()).map_err(IdologyError::Error::from)?;

    // Validate we have a response we can use
    parsed.response.validate()?;

    Ok(VendorResponse {
        raw_response: response.into(),
        response: ParsedResponse::IDologyScanVerifyResult(parsed),
    })
}

pub async fn standalone_pa(
    fp_http_client: &FootprintVendorHttpClient,
    request: IdologyPaRequest,
) -> Result<serde_json::Value, IdologyError::Error> {
    let IdologyPaRequest {
        idv_data,
        credentials,
        tenant_identifier,
    } = request;

    let url = "https://web.idologylive.com/api/pa-standalone.svc";
    let req_data = pa::request::RequestData::try_from(idv_data, tenant_identifier)?;
    let req_list = Request::new(
        credentials.username,
        credentials.password,
        IdologyRequestData::Pa(req_data),
    );
    let response = fp_http_client
        .client
        .post(url)
        .query(&req_list)
        .send()
        .await
        .map_err(|err| IdologyError::ReqwestError::SendError(err.to_string()))?;

    let idology_response = response
        .json::<serde_json::Value>()
        .await
        .map_err(IdologyError::ReqwestError::InternalError)?;
    Ok(idology_response)
}
/// Scan onboarding
/// As of 2023-01-06, acc to their API docs, we don't need to poll /shrug
#[tracing::instrument(skip_all)]
pub async fn send_scan_onboarding_request(
    client: &IdologyClient,
    data: DocVData,
) -> Result<VendorResponse, crate::Error> {
    let response = client
        .submit_to_scan_onboarding(data)
        .await
        .map_err(crate::idology::error::Error::from)?;

    let parsed_response: ScanOnboardingAPIResponse =
        scan_onboarding::response::parse_response(response.clone())
            .map_err(crate::idology::error::Error::from)?;

    // validate no errors
    parsed_response.response.validate()?;

    Ok(VendorResponse {
        raw_response: response.into(),
        response: ParsedResponse::IDologyScanOnboarding(parsed_response),
    })
}

fn should_retry_request(err: &IdologyError::Error) -> bool {
    err.should_retry_request()
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::idology::fixtures;
    use newtypes::{DocVData, IDologyReasonCode, IdvData, ModernIdDocKind, PiiString};

    fn map_pii(s: String) -> Option<PiiString> {
        Some(PiiString::from(s))
    }

    #[ignore]
    #[tokio::test]
    async fn test_e2e_scan_verify() {
        // !!!!!
        // Note: this will fail unless ScanVerify is enabled in the Idology enterprise portal!!
        //!!!!!

        // First get a queryID from expectID
        let test_data = fixtures::test_data::ExpectIDTestData::load_passing_sandbox_data();
        let client = FootprintVendorHttpClient::new().unwrap();
        let idv_data = IdvData {
            // We have to induce a failure to get access to scan verify, so we do that here
            first_name: map_pii("intentional_fail".to_string()),
            last_name: map_pii(test_data.last_name.clone()),
            address_line1: map_pii(test_data.address_line_1.clone()),
            zip: map_pii(test_data.zip.clone()),
            ..Default::default()
        };
        let credentials = IdologyCredentials {
            username: test_data.username.clone(),
            password: test_data.password.clone(),
        };
        // TODO: remove as Part of migrating away from clients with credentials per vendor
        let legacy_idology_client =
            IdologyClient::new(credentials.username.clone(), credentials.password.clone()).unwrap();
        // ////////////
        // Send to ExpectID
        // ////////////
        let res = super::verify_expectid(
            &client,
            IdologyExpectIDRequest {
                idv_data,
                credentials,
                tenant_identifier: "org_1234".into(),
            },
        )
        .await
        .unwrap();
        let expect_id_response = crate::idology::expectid::response::parse_response(res).unwrap();

        let parsed_expect_id = expect_id_response.response.clone();
        assert!(parsed_expect_id.is_id_scan_required());
        // pull out the query id
        let query_id = expect_id_response.response.id_number;

        // ////////////
        // Submit to ScanVerify
        // ////////////
        let docv_data = DocVData {
            reference_id: query_id,
            front_image: map_pii(fixtures::images::scan_verify_test_image_document_verified()),
            back_image: map_pii(fixtures::images::scan_verify_test_image_document_verified()),
            selfie_image: None, // TODO: add selfie to this test or add another
            country_code: map_pii("USA".to_string()),
            document_type: Some(ModernIdDocKind::DriversLicense),
            ..Default::default()
        };

        let scan_res = send_scan_verify_request(&legacy_idology_client, docv_data)
            .await
            .unwrap();

        let ParsedResponse::IDologyScanVerifySubmission(scan_verify_response) = scan_res.response else {
            panic!("incorrect scan verify submission type")
        };

        assert!(scan_verify_response.upload_status_is_success());

        // ////////////
        // Fetch Results
        // ////////////
        let results = poll_scan_verify_results_request(&legacy_idology_client, query_id.unwrap())
            .await
            .unwrap();

        let ParsedResponse::IDologyScanVerifyResult(scan_verify_response) = results.response else {
            panic!("incorrect scan verify results response type")
        };

        assert_eq!(
            scan_verify_response.response.id_scan_result.unwrap().key,
            "result.id.scan.approved"
        );
        // TODO(argoff): Add back in once we figure out a story for saving PII
        // assert_eq!(
        //     scan_verify_response
        //         .response
        //         .located_id_scan_record
        //         .unwrap()
        //         .id_scan_city
        //         .unwrap(),
        //     "ATLANTA".to_string()
        // );
    }

    #[ignore]
    #[tokio::test]
    async fn test_scan_onboarding() {
        let test_data = fixtures::test_data::ScanOnboardingTestData::load_passing_sandbox_data();
        let docv_data = DocVData {
            reference_id: None,
            front_image: map_pii(fixtures::images::scan_onboarding_test_image_document_accepted()),
            back_image: map_pii(fixtures::images::scan_onboarding_test_image_document_accepted()),
            selfie_image: None,
            country_code: map_pii(test_data.country_code),
            document_type: Some(test_data.scan_document_type),
            ..Default::default()
        };

        let client =
            super::client::IdologyClient::new(test_data.username.clone(), test_data.password.clone())
                .unwrap();

        let scan_ob_res = send_scan_onboarding_request(&client, docv_data).await.unwrap();

        let ParsedResponse::IDologyScanOnboarding(scan_ob_response) = scan_ob_res.response else {
            panic!("incorrect scan onboarding results response type")
        };

        assert_eq!(
            scan_ob_response.response.capture_result.unwrap().key,
            "capture.completed"
        );

        // TODO put this back in
        // assert_eq!(
        //     scan_ob_response.response.capture_data.unwrap().city.unwrap(),
        //     "ATLANTA".to_string()
        // );
    }

    #[ignore]
    #[tokio::test]
    async fn test_scan_onboarding_with_selfie() {
        let test_data = fixtures::test_data::ScanOnboardingTestData::load_passing_sandbox_data();
        let docv_data = DocVData {
            reference_id: None,
            front_image: map_pii(fixtures::images::scan_onboarding_test_image_document_accepted()),
            back_image: map_pii(fixtures::images::scan_onboarding_test_image_document_accepted()),
            selfie_image: map_pii(fixtures::images::scan_onboarding_test_image_face_15_match_score()),
            country_code: map_pii(test_data.country_code),
            document_type: Some(test_data.scan_document_type),
            ..Default::default()
        };

        let client =
            super::client::IdologyClient::new(test_data.username.clone(), test_data.password.clone())
                .unwrap();

        let scan_ob_res = send_scan_onboarding_request(&client, docv_data).await.unwrap();
        let ParsedResponse::IDologyScanOnboarding(scan_ob_response) = scan_ob_res.response else {
            panic!("incorrect scan onboarding results response type")
        };
        tracing::info!(scan_ob_response = format!("{:?}", scan_ob_response));

        assert_eq!(
            scan_ob_response.response.capture_result.unwrap().key,
            "capture.completed"
        );
        assert_eq!(
            vec![IDologyReasonCode::FaceCompareAlert],
            scan_ob_response
                .response
                .qualifiers
                .unwrap()
                .parse_qualifiers()
                .into_iter()
                .map(|r| r.1)
                .collect::<Vec<IDologyReasonCode>>()
        );
    }
}
