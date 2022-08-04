#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
pub struct LookupResponse {
    pub caller_name: Option<String>,
    pub carrier: Option<CarrierInformation>,
    pub country_code: String,
    pub national_format: String,
    pub phone_number: String,
    pub add_ons: Option<String>,
    pub url: String,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
pub struct CarrierInformation {
    pub error_code: Option<String>,
    pub mobile_country_code: Option<String>,
    pub mobile_network_code: Option<String>,
    pub name: Option<String>,
    pub type_: Option<String>,
}
