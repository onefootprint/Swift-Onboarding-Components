// https://developer.socure.com/reference#tag/ID+
// https://developer.socure.com/docs/idplus/modules/modules-overview
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SocureIDPlusResponse {
    pub reference_id: String,
    pub name_address_correlation: Option<Correlation>,
    pub name_phone_correlation: Option<Correlation>,
    pub fraud: Option<Fraud>,
    pub synthetic: Option<Synthetic>,
    pub kyc: Option<Kyc>,
    pub address_risk: Option<AddressRisk>,
    pub email_risk: Option<EmailRisk>,
    pub phone_risk: Option<PhoneRisk>,
    pub alert_list: Option<AlertList>,
    pub global_watchlist: Option<GlobalWatchlist>,
    pub device_risk: Option<DeviceRisk>,
    pub device_identity_correlation: Option<Correlation>,
    pub device_data: Option<DeviceData>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Correlation {
    pub reason_codes: Vec<String>,
    pub score: f32,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Fraud {
    pub reason_codes: Vec<String>,
    pub scores: Vec<Score>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Synthetic {
    pub reason_codes: Vec<String>,
    pub scores: Vec<Score>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Score {
    pub name: String,
    pub version: String,
    pub score: f32,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Kyc {
    pub reason_codes: Vec<String>,
    pub field_validations: FieldValidation,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FieldValidation {
    pub first_name: Option<f32>,
    pub sur_name: Option<f32>,
    pub street_address: Option<f32>,
    pub city: Option<f32>,
    pub state: Option<f32>,
    pub zip: Option<f32>,
    pub mobile_number: Option<f32>,
    pub dob: Option<f32>,
    pub ssn: Option<f32>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddressRisk {
    pub reason_codes: Vec<String>,
    pub score: f32,
}

// alternatively could combine AddressRisk, EmailRisk, PhoneRisk into one struct i guess
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EmailRisk {
    pub reason_codes: Vec<String>,
    pub score: f32,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PhoneRisk {
    pub reason_codes: Vec<String>,
    pub score: f32,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AlertList {
    pub reason_codes: Vec<String>,
    pub matches: Vec<AlertListMatch>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AlertListMatch {
    pub element: String,
    pub dataset_name: String,
    pub reason: String,
    pub industry_name: String,
    pub last_reported_date: String,
    pub reported_count: String,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GlobalWatchlist {
    pub reason_codes: Vec<String>,
    pub matches: serde_json::Value, // TODO: this ones pretty intense and the schema isn't clear will defer for now
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeviceRisk {
    pub reason_codes: Vec<String>,
    pub score: f32,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeviceData {
    pub information: Information,
    pub geolocation: Geolocation,
    pub observations: Observations,
    pub velocity_metrics: VelocityMetrics,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Information {
    pub device_manufacturer: String,
    pub device_model_number: String,
    pub operating_system: String,
    pub operating_system_version: String,
    pub browser_type: String,
    pub browser_version: String,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Geolocation {
    pub ip_geolocation: IpGeolocation,
    pub gps_geolocation: GpsGeolocation,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IpGeolocation {
    pub coordinates: String,
    pub city: String,
    pub state: String,
    pub zip: String,
    pub country: String,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GpsGeolocation {
    pub coordinates: String,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Observations {
    pub first_seen: String,
    pub last_seen: String,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VelocityMetrics {
    pub historical_count: HistoricalCount,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HistoricalCount {
    pub email: Counts,
    pub mobile_number: Counts,
    pub sur_name: Counts,
    pub first_name: Counts,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Counts {
    pub unique_count: u32,
    pub unique_share_percent: u32,
}
