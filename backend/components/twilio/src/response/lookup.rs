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
pub struct LookupV2Response {
    pub country_code: String,
    pub national_format: String,
    pub phone_number: String,
    pub add_ons: Option<String>,
    pub url: String,
    pub carrier: Option<CarrierInformation>,
    pub call_forwarding: Option<CallForwarding>,
    pub live_activity: Option<LiveActivity>,
    pub sim_swap: Option<SimSwap>,
    pub caller_name: Option<CallerName>,
    pub line_type_intelligence: Option<LineTypeIntelligence>,
    // TODO this is a field we added ourselves, maybe put this somewhere else?
    pub name_str_distance: Option<usize>,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
pub struct CarrierInformation {
    pub error_code: Option<String>,
    pub mobile_country_code: Option<String>,
    pub mobile_network_code: Option<String>,
    pub name: Option<String>,
    pub type_: Option<String>,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
pub struct CallForwarding {
    pub mobile_network_code: Option<String>,
    pub call_forwarding_enabled: Option<String>,
    pub mobile_country_code: Option<String>,
    pub carrier_name: Option<String>,
    pub error_code: Option<i64>,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
pub struct LiveActivity {
    pub original_carrier: Option<String>,
    pub ported: Option<String>,
    pub ported_carrier: Option<String>,
    pub connectivity: Option<String>,
    pub roaming_carrier: Option<String>,
    pub roaming: Option<String>,
    pub error_code: Option<i64>,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
pub struct SimSwap {
    pub mobile_country_code: Option<String>,
    pub mobile_network_code: Option<String>,
    pub carrier_name: Option<String>,
    pub last_sim_swap: Option<serde_json::Value>,
    pub error_code: Option<i64>,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
pub struct CallerName {
    pub caller_name: Option<String>,
    pub caller_type: Option<String>,
    pub error_code: Option<i64>,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
pub struct LineTypeIntelligence {
    pub mobile_country_code: Option<String>,
    pub mobile_network_code: Option<String>,
    pub carrier_name: Option<String>,
    #[serde(rename = "type")]
    pub kind: Option<String>,
    pub error_code: Option<i64>,
}
