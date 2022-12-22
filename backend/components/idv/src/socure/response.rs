// https://developer.socure.com/reference#tag/ID+
// https://developer.socure.com/docs/idplus/modules/modules-overview
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SocureIDPlusResponse {
    pub reference_id: String,
    pub name_address_correlation: Option<Correlation>,
    pub name_phone_correlation: Option<Correlation>,
    pub fraud: Option<Fraud>,
    pub kyc: Option<Kyc>,
    pub synthetic: Option<Synthetic>,
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
pub struct Synthetic {
    pub reason_codes: Vec<String>,
    pub scores: Vec<Score>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Fraud {
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

fn get_score_by_name(scores: &[Score], name: String) -> Option<f32> {
    scores.iter().find(|s| s.name == name).map(|s| s.score)
}

impl SocureIDPlusResponse {
    pub fn sigma_fraud_score(&self) -> Option<f32> {
        self.fraud
            .as_ref()
            .and_then(|m| get_score_by_name(&m.scores, "sigma".to_owned()))
    }

    pub fn sigma_synthetic_score(&self) -> Option<f32> {
        self.synthetic
            .as_ref()
            .and_then(|m| get_score_by_name(&m.scores, "sigma".to_owned()))
    }

    pub fn email_risk_score(&self) -> Option<f32> {
        self.email_risk.as_ref().map(|e| e.score)
    }

    pub fn phone_risk_score(&self) -> Option<f32> {
        self.phone_risk.as_ref().map(|e| e.score)
    }

    pub fn all_device_reason_codes(&self) -> Vec<String> {
        let device_risk_reason_codes: Vec<String> = self
            .device_risk
            .as_ref()
            .map(|m| m.reason_codes.clone())
            .unwrap_or_default();

        let device_identity_correlation_reason_codes: Vec<String> = self
            .device_identity_correlation
            .as_ref()
            .map(|m| m.reason_codes.clone())
            .unwrap_or_default();

        [device_risk_reason_codes, device_identity_correlation_reason_codes].concat()
    }
}
