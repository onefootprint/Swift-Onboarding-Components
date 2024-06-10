use self::license_validation::CreateLVOrderAddress;
use newtypes::vendor_credentials::SambaSafetyCredentials;
use newtypes::{
    PiiString,
    SambaOrderId,
    SambaReportId,
};

pub mod license_validation;

// app code interop request structs
#[derive(Default)]
pub struct SambaCreateLVOrderRequest {
    pub credentials: SambaSafetyCredentials,
    pub first_name: PiiString,
    pub last_name: PiiString,
    pub license_number: PiiString,
    pub license_state: PiiString,
    pub dob: Option<PiiString>,
    pub license_category: Option<PiiString>,
    pub issue_date: Option<PiiString>,
    pub expiry_date: Option<PiiString>,
    pub gender: Option<PiiString>,
    pub eye_color: Option<PiiString>,
    pub height: Option<u16>,
    pub weight: Option<u16>,
    pub address: Option<CreateLVOrderAddress>,
    pub middle_name: Option<PiiString>,
}


pub struct SambaCheckLVOrderStatusRequest {
    pub credentials: SambaSafetyCredentials,
    pub order_id: SambaOrderId,
}


pub struct SambaGetLVReportRequest {
    pub credentials: SambaSafetyCredentials,
    pub report_id: SambaReportId,
}
