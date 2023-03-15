use newtypes::{IdvData, PiiJsonValue};

use self::cross_core::response::CrossCoreAPIResponse;

pub mod auth;
pub mod cross_core;
pub mod error;
pub mod precise_id;

pub struct ExperianCrossCoreRequest {
    pub idv_data: IdvData,
}

#[derive(Clone)]
pub struct ExperianCrossCoreResponse {
    pub raw_response: PiiJsonValue,
    pub parsed_response: CrossCoreAPIResponse,
}
