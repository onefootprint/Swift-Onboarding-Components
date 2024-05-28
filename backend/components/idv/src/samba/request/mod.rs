use newtypes::{vendor_credentials::SambaSafetyCredentials, PiiString};

use self::license_validation::CreateLVOrderAddress;

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
