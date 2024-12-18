use crate::experian::cross_core::response::CrossCoreAPIResponse;
use crate::experian::ExperianCrossCoreResponse;
use newtypes::PiiJsonValue;

pub fn create_response(ssn_result_code: Option<&str>, score: Option<&str>) -> ExperianCrossCoreResponse {
    let fuck = crate::test_fixtures::experian_cross_core_response(ssn_result_code, score);
    // println!("fuck: {:#?}", fuck);
    let r: CrossCoreAPIResponse = serde_json::from_value(fuck.clone()).unwrap();
    // println!("r: {:#?}", r);
    let _fuck2 = serde_json::to_value(&r).unwrap();
    // println!("fuck2: {:#?}", fuck2);
    ExperianCrossCoreResponse {
        raw_response: PiiJsonValue::from(fuck),
        parsed: Ok(r),
    }
}
