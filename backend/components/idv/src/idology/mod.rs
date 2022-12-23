pub mod client;
pub mod error;
pub mod expectid;
pub(crate) mod fixtures;
pub(self) mod response_common;
pub mod scan_verify;

use newtypes::{DocVData, IdvData};

use crate::{ParsedResponse, VendorResponse};

use crate::idology::client::IdologyClient;
use expectid::response::ExpectIDAPIResponse;
use newtypes::Vendor;
use scan_verify::response::ScanVerifyAPIResponse;

use self::scan_verify::response::ScanVerifySubmissionAPIResponse;

pub async fn send_expectid_request(
    client: &IdologyClient,
    data: IdvData,
) -> Result<VendorResponse, crate::Error> {
    let response = client
        .verify_expectid(data)
        .await
        .map_err(crate::idology::error::Error::from)?;
    let parsed_response: ExpectIDAPIResponse =
        expectid::response::parse_response(response.clone()).map_err(crate::idology::error::Error::from)?;

    Ok(VendorResponse {
        vendor: Vendor::Idology,
        raw_response: response,
        response: ParsedResponse::IDologyExpectID(parsed_response),
    })
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

    Ok(VendorResponse {
        // TODO: Change this?
        vendor: Vendor::Idology,
        raw_response: response,
        response: ParsedResponse::IDologyScanVerifySubmission(parsed_response),
    })
}

// TODO polling
pub async fn poll_scan_verify_results_request(
    client: &IdologyClient,
    query_id: u64,
) -> Result<VendorResponse, crate::Error> {
    let response = client
        .get_scan_verify_results(query_id)
        .await
        .map_err(crate::idology::error::Error::from)?;
    let parsed_response: ScanVerifyAPIResponse = scan_verify::response::parse_response(response.clone())
        .map_err(crate::idology::error::Error::from)?;

    Ok(VendorResponse {
        // TODO: Change this?
        vendor: Vendor::Idology,
        raw_response: response,
        response: ParsedResponse::IDologyScanVerify(parsed_response),
    })
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::idology::fixtures;
    use newtypes::{DocVData, IdvData, PiiString};

    #[ignore]
    #[tokio::test]
    async fn test_e2e_scan_verify() {
        // First get a queryID from expectID
        fn map_pii(s: String) -> Option<PiiString> {
            Some(PiiString::from(s))
        }
        let test_data = fixtures::expect_id::ExpectIDTestData::load_passing_sandbox_data();
        let client =
            super::client::IdologyClient::new(test_data.username.clone(), test_data.password.clone())
                .unwrap();
        let idv_data = IdvData {
            // We have to induce a failure to get access to scan verify, so we do that here
            first_name: map_pii("intentional_fail".to_string()),
            last_name: map_pii(test_data.last_name.clone()),
            address_line1: map_pii(test_data.address_line_1.clone()),
            zip: map_pii(test_data.zip.clone()),
            ..Default::default()
        };
        // ////////////
        // Send to ExpectID
        // ////////////
        let res = send_expectid_request(&client, idv_data).await.unwrap();
        let ParsedResponse::IDologyExpectID(expect_id_response) = res.response else {
            panic!("incorrect expectID results response type")
        };
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
            country_code: map_pii("USA".to_string()),
            document_type: Some("drivers_license".to_string()),
        };

        let scan_res = send_scan_verify_request(&client, docv_data).await.unwrap();

        let ParsedResponse::IDologyScanVerifySubmission(scan_verify_response) = scan_res.response else {
            panic!("incorrect scan verify submission type")
        };

        assert_eq!(scan_verify_response.status, "Request Submitted".to_string());

        // ////////////
        // Fetch Results
        // ////////////
        let results = poll_scan_verify_results_request(&client, query_id.unwrap())
            .await
            .unwrap();

        let ParsedResponse::IDologyScanVerify(scan_verify_response) = results.response else {
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
}
