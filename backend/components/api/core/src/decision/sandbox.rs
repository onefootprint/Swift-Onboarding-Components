use db::models::verification_request::VerificationRequest;
use idv::{ParsedResponse, VendorResponse};
use newtypes::VendorAPI;

use crate::errors::ApiResult;

use super::{engine::VendorResults, Error};

// In future, this could take in FixtureDecision and determine the fixture vendor response to use.
// But its a little tricky because if the sandbox selection is "Review" or "Stepup" thats a function of rules not just the individual vendor responses
fn fixture_response_for_vendor_api(vendor_api: VendorAPI) -> ApiResult<VendorResponse> {
    match vendor_api {
        VendorAPI::IdologyExpectID => {
            let v = idv::test_fixtures::idology_fake_data_expectid_response();
            Ok(VendorResponse {
                response: ParsedResponse::IDologyExpectID(serde_json::value::from_value(v.clone())?),
                raw_response: v.into(),
            })
        }
        VendorAPI::TwilioLookupV2 => {
            let v = idv::test_fixtures::test_twilio_lookupv2_response();
            Ok(VendorResponse {
                response: ParsedResponse::TwilioLookupV2(serde_json::value::from_value(v.clone())?),
                raw_response: v.into(),
            })
        }
        VendorAPI::SocureIDPlus => {
            let v = idv::test_fixtures::socure_idplus_fake_passing_response();
            Ok(VendorResponse {
                response: ParsedResponse::SocureIDPlus(serde_json::value::from_value(v.clone())?),
                raw_response: v.into(),
            })
        }
        VendorAPI::ExperianPreciseID => {
            let v = idv::test_fixtures::experian_precise_id_response(false, "747");
            Ok(VendorResponse {
                response: ParsedResponse::ExperianPreciseID(serde_json::value::from_value(v.clone())?),
                raw_response: v.into(),
            })
        }
        v => Err(Error::FixtureDataNotFound(v).into()),
    }
}

pub fn get_fixture_vendor_results(vreqs: Vec<VerificationRequest>) -> ApiResult<VendorResults> {
    let fixture_responses = vreqs
        .into_iter()
        .map(|vreq| {
            let vr = fixture_response_for_vendor_api(vreq.vendor_api)?;
            Ok((vreq, vr))
        })
        .collect::<ApiResult<Vec<_>>>()?;

    Ok(VendorResults {
        successful: fixture_responses,
        non_critical_errors: vec![],
        critical_errors: vec![],
    })
}
