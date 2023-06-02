use crate::experian::cross_core::response::CrossCoreAPIResponse;
use crate::experian::ExperianCrossCoreResponse;
use newtypes::PiiJsonValue;

pub fn create_response() -> ExperianCrossCoreResponse {
    let r: CrossCoreAPIResponse =
        serde_json::from_value(crate::test_fixtures::experian_cross_core_response()).unwrap();
    ExperianCrossCoreResponse {
        raw_response: PiiJsonValue::from(serde_json::to_value(&r).unwrap()),
        parsed_response: r,
    }
}
