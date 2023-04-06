use idv::{experian::ExperianCrossCoreRequest, idology::IdologyExpectIDRequest};
use newtypes::IdvData;

use super::tenant_vendor_control::TenantVendorControl;

#[derive(Clone)]
pub struct KycRequestBuilder<'a> {
    idv_data: IdvData,
    credentials: &'a TenantVendorControl,
}

impl<'a> KycRequestBuilder<'a> {
    pub fn new(idv_data: IdvData, credentials: &'a TenantVendorControl) -> Self {
        Self {
            idv_data,
            credentials,
        }
    }

    pub fn build_idology_request(self) -> IdologyExpectIDRequest {
        IdologyExpectIDRequest {
            idv_data: self.idv_data.clone(),
            credentials: self.credentials.idology_credentials(),
        }
    }
    pub fn build_experian_request(self) -> ExperianCrossCoreRequest {
        ExperianCrossCoreRequest {
            idv_data: self.idv_data.clone(),
            credentials: self.credentials.experian_credentials(),
        }
    }

    pub fn idv_data(self) -> IdvData {
        self.idv_data
    }
}
