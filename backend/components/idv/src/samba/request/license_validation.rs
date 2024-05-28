use newtypes::PiiString;
use serde::Serialize;

use super::SambaCreateLVOrderRequest;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateLVOrderRequest {
    first_name: PiiString,
    last_name: PiiString,
    // format of this differs by state
    // https://dev-devportal.sambasafety.io/guides/glossary.html#licene-number-patterns
    license_number: PiiString,
    // iso3166 2 char
    license_state: PiiString,
    // optional fields
    middle_name: Option<PiiString>,
    // YYYY-MM-DD
    birth_date: Option<PiiString>,
    suffix: Option<PiiString>,
    // A customer's custom billing code.
    bill_code: Option<PiiString>,
    // A customer's custom billing reference note
    bill_reference: Option<PiiString>,
    // ? not sure if we need. not in docs but in postman
    purpose: Option<PiiString>,
    // ? not sure if we need. not in docs but in postman
    options: Vec<String>,
    custom_fields: Vec<CreateLVOrderCustomField>,
    // The more of these we supply, the more things they match in the DMV
    // Samba allows you to configure which of these are included in the overall "is license valid" calculation
    // We don't want to use this functionality, and will send everything we can just so we get back does it match records
    license_category: Option<PiiString>,
    issue_date: Option<PiiString>,
    expiry_date: Option<PiiString>,
    gender: Option<PiiString>,
    address: Option<CreateLVOrderAddress>,
    eye_color: Option<PiiString>,
    height: Option<u16>,
    weight: Option<u16>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateLVOrderCustomField {
    name: Option<PiiString>,
    value: Option<PiiString>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateLVOrderAddress {
    pub street: PiiString,
    pub city: PiiString,
    pub state: PiiString,
    pub zip_code: PiiString,
}

impl From<SambaCreateLVOrderRequest> for CreateLVOrderRequest {
    fn from(value: SambaCreateLVOrderRequest) -> Self {
        let SambaCreateLVOrderRequest {
            credentials: _,
            first_name,
            last_name,
            middle_name,
            license_number,
            license_state,
            license_category,
            issue_date,
            dob,
            expiry_date,
            gender,
            eye_color,
            height,
            weight,
            address,
        } = value;

        Self {
            first_name,
            last_name,
            middle_name,
            license_number,
            license_state,
            license_category,
            issue_date,
            expiry_date,
            gender,
            eye_color,
            height,
            weight,
            birth_date: dob,
            address,
            suffix: None,
            bill_code: None,
            bill_reference: None,
            purpose: None,
            options: vec!["LICENSE_VALIDATION".to_string()],
            custom_fields: vec![],
        }
    }
}
