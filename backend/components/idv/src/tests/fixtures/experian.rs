use crate::experian::cross_core::response::CrossCoreAPIResponse;
use crate::experian::ExperianCrossCoreResponse;
use newtypes::PiiJsonValue;
use serde_json::json;

pub fn create_response() -> ExperianCrossCoreResponse {
    let r: CrossCoreAPIResponse =
        serde_json::from_value(crate::test_fixtures::experian_cross_core_response()).unwrap();
    ExperianCrossCoreResponse {
        raw_response: PiiJsonValue::from(json!({})),
        parsed_response: r,
    }
}
