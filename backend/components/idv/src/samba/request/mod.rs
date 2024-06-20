use self::license_validation::CreateLVOrderAddress;
use newtypes::samba::SambaAddress;
use newtypes::samba::SambaLicenseValidationData;
use newtypes::vendor_credentials::SambaSafetyCredentials;
use newtypes::PiiString;
use newtypes::SambaOrderId;
use newtypes::SambaReportId;

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

impl From<(SambaLicenseValidationData, SambaSafetyCredentials)> for SambaCreateLVOrderRequest {
    fn from(value: (SambaLicenseValidationData, SambaSafetyCredentials)) -> Self {
        let (data, credentials) = value;

        let SambaLicenseValidationData {
            first_name,
            last_name,
            license_number,
            license_state,
            dob,
            license_category,
            issue_date,
            expiry_date,
            gender,
            eye_color,
            height,
            weight,
            address,
            middle_name,
        } = data;

        let idv_address = address.map(|a| {
            let SambaAddress {
                street,
                city,
                state,
                zip_code,
            } = a;

            CreateLVOrderAddress {
                street,
                city,
                state,
                zip_code,
            }
        });

        Self {
            credentials,
            first_name,
            last_name,
            license_number,
            license_state,
            dob,
            license_category,
            issue_date,
            expiry_date,
            gender,
            eye_color,
            height,
            weight,
            address: idv_address,
            middle_name,
        }
    }
}

pub struct SambaCheckLVOrderStatusRequest {
    pub credentials: SambaSafetyCredentials,
    pub order_id: SambaOrderId,
}

pub struct SambaGetLVReportRequest {
    pub credentials: SambaSafetyCredentials,
    pub report_id: SambaReportId,
}
