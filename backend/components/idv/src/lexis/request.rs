use newtypes::*;
use std::fmt::Debug;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub(crate) struct LexisRequest {
    #[serde(rename = "FlexIDRequest")]
    pub flex_id_request: FlexIdRequest,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "PascalCase")]
pub(crate) struct FlexIdRequest {
    pub user: User,
    pub search_by: SearchBy,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub(crate) struct User {
    pub reference_code: String,
    #[serde(rename = "GLBPurpose")]
    pub glb_purpose: String,
    #[serde(rename = "DLPurpose")]
    pub dl_purpose: String,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub(crate) struct SearchBy {
    pub name: Name,
    pub address: Address,
    #[serde(rename = "SSN")]
    pub ssn: Option<PiiString>,
    pub home_phone: Option<PiiString>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "PascalCase")]
pub(crate) struct Name {
    pub first: Option<PiiString>,
    pub last: Option<PiiString>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "PascalCase")]
pub(crate) struct Address {
    pub street_address_1: Option<PiiString>,
    pub city: Option<PiiString>,
    pub state: Option<PiiString>,
    pub zip_5: Option<PiiString>,
}

impl LexisRequest {
    pub fn new(idv_data: IdvData) -> Result<Self, crate::lexis::Error> {
        let IdvData {
            first_name,
            last_name,
            address_line1,
            address_line2: _,
            city,
            state,
            zip,
            country: _,
            ssn4: _,
            ssn9,
            dob: _,
            email: _,
            phone_number,
            verification_request_id: _,
        } = idv_data;

        Ok(Self {
            flex_id_request: FlexIdRequest {
                user: User {
                    reference_code: String::from("XML testing Example"), // TODO
                    glb_purpose: String::from("1"),                      // TODO
                    dl_purpose: String::from("0"),                       // TODO
                },
                search_by: SearchBy {
                    name: Name {
                        first: first_name,
                        last: last_name,
                    },
                    address: Address {
                        street_address_1: address_line1,
                        city,
                        state,
                        zip_5: zip,
                    },
                    ssn: ssn9,
                    home_phone: phone_number,
                },
            },
        })
    }
}
