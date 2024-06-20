use itertools::Itertools;
use newtypes::ScrubbedPiiString;
use newtypes::SocureReasonCode;
use std::collections::HashMap;

// https://developer.socure.com/reference#tag/ID+
// https://developer.socure.com/docs/idplus/modules/modules-overview
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Default)]
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
    pub score: Option<f32>,
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
    pub score: Option<f32>,
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
    pub score: Option<f32>,
}

// alternatively could combine AddressRisk, EmailRisk, PhoneRisk into one struct i guess
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EmailRisk {
    pub reason_codes: Vec<String>,
    pub score: Option<f32>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PhoneRisk {
    pub reason_codes: Vec<String>,
    pub score: Option<f32>,
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
    pub element: Option<String>,
    pub dataset_name: Option<String>,
    pub reason: Option<String>,
    pub industry_name: Option<String>,
    pub last_reported_date: Option<String>,
    pub reported_count: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct GlobalWatchlist {
    pub reason_codes: Vec<String>,
    pub matches: HashMap<String, Vec<GlobalWatchlistMatch>>, /* key is the watchlist name (eg: "PEP Data",
                                                              * "OFAC SDN List") */
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GlobalWatchlistMatch {
    pub entity_id: String,
    pub match_fields: Option<Vec<String>>,
    pub source_urls: Option<Vec<String>>,
    pub comments: Option<GlobalWatchlistMatchComment>,
    pub match_score: Option<f32>,
}

impl Eq for GlobalWatchlistMatch {}
// just implemented because f32 doesn't have a built in Eq impl
impl PartialEq for GlobalWatchlistMatch {
    fn eq(&self, other: &Self) -> bool {
        self.entity_id == other.entity_id
            && self.match_fields == other.match_fields
            && self.source_urls == other.source_urls
            && self.comments == other.comments
            && (self.match_score.unwrap_or_default() - other.match_score.unwrap_or_default()).abs()
                < f32::EPSILON
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct GlobalWatchlistMatchComment {
    pub name: Option<Vec<ScrubbedPiiString>>,
    pub original_country_text: Option<Vec<String>>,
    pub aka: Option<Vec<ScrubbedPiiString>>,
    pub political_position: Option<Vec<String>>,
    pub offense: Option<Vec<String>>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeviceRisk {
    pub reason_codes: Vec<String>,
    pub score: Option<f32>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeviceData {
    pub information: Option<Information>,
    pub geolocation: Option<Geolocation>,
    pub observations: Option<Observations>,
    pub velocity_metrics: Option<VelocityMetrics>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Information {
    pub device_manufacturer: Option<String>,
    pub device_model_number: Option<String>,
    pub operating_system: Option<String>,
    pub operating_system_version: Option<String>,
    pub browser_type: Option<String>,
    pub browser_version: Option<String>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Geolocation {
    pub ip_geolocation: Option<IpGeolocation>,
    pub gps_geolocation: Option<GpsGeolocation>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IpGeolocation {
    pub coordinates: Option<String>,
    pub city: Option<String>,
    pub state: Option<String>,
    pub zip: Option<String>,
    pub country: Option<String>,
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
    pub historical_count: Option<HistoricalCount>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HistoricalCount {
    pub email: Option<Counts>,
    pub mobile_number: Option<Counts>,
    pub sur_name: Option<Counts>,
    pub first_name: Option<Counts>,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Counts {
    pub unique_count: u32,
    pub unique_share_percent: u32,
}

fn get_score_by_name(scores: &[Score], name: String) -> Option<f32> {
    scores.iter().find(|s| s.name == name).and_then(|s| s.score)
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
        self.email_risk.as_ref().and_then(|e| e.score)
    }

    pub fn phone_risk_score(&self) -> Option<f32> {
        self.phone_risk.as_ref().and_then(|e| e.score)
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

    fn parse_reason_codes(reason_codes: &[String]) -> Vec<SocureReasonCode> {
        reason_codes
            .iter()
            .flat_map(|src| SocureReasonCode::try_from(src.as_str()).ok())
            .collect()
    }

    pub fn name_address_correlation_reason_codes(&self) -> Option<Vec<SocureReasonCode>> {
        self.name_address_correlation
            .as_ref()
            .map(|n| Self::parse_reason_codes(&n.reason_codes))
    }

    pub fn name_phone_correlation_reason_codes(&self) -> Option<Vec<SocureReasonCode>> {
        self.name_phone_correlation
            .as_ref()
            .map(|n| Self::parse_reason_codes(&n.reason_codes))
    }

    pub fn fraud_reason_codes(&self) -> Option<Vec<SocureReasonCode>> {
        self.fraud
            .as_ref()
            .map(|n| Self::parse_reason_codes(&n.reason_codes))
    }

    pub fn kyc_reason_codes(&self) -> Option<Vec<SocureReasonCode>> {
        self.kyc
            .as_ref()
            .map(|n| Self::parse_reason_codes(&n.reason_codes))
    }

    pub fn synthetic_reason_codes(&self) -> Option<Vec<SocureReasonCode>> {
        self.synthetic
            .as_ref()
            .map(|n| Self::parse_reason_codes(&n.reason_codes))
    }

    pub fn address_risk_reason_codes(&self) -> Option<Vec<SocureReasonCode>> {
        self.address_risk
            .as_ref()
            .map(|n| Self::parse_reason_codes(&n.reason_codes))
    }

    pub fn email_risk_reason_codes(&self) -> Option<Vec<SocureReasonCode>> {
        self.email_risk
            .as_ref()
            .map(|n| Self::parse_reason_codes(&n.reason_codes))
    }

    pub fn phone_risk_reason_codes(&self) -> Option<Vec<SocureReasonCode>> {
        self.phone_risk
            .as_ref()
            .map(|n| Self::parse_reason_codes(&n.reason_codes))
    }

    pub fn alert_list_reason_codes(&self) -> Option<Vec<SocureReasonCode>> {
        self.alert_list
            .as_ref()
            .map(|n| Self::parse_reason_codes(&n.reason_codes))
    }

    pub fn global_watchlist_reason_codes(&self) -> Option<Vec<SocureReasonCode>> {
        self.global_watchlist
            .as_ref()
            .map(|n| Self::parse_reason_codes(&n.reason_codes))
    }

    pub fn device_risk_reason_codes(&self) -> Option<Vec<SocureReasonCode>> {
        self.device_risk
            .as_ref()
            .map(|n| Self::parse_reason_codes(&n.reason_codes))
    }

    pub fn device_identity_correlation_reason_codes(&self) -> Option<Vec<SocureReasonCode>> {
        self.device_identity_correlation
            .as_ref()
            .map(|n| Self::parse_reason_codes(&n.reason_codes))
    }

    // all reason codes in response from all modules
    pub fn all_unique_reason_codes(&self) -> Vec<SocureReasonCode> {
        vec![
            self.name_address_correlation_reason_codes(),
            self.name_phone_correlation_reason_codes(),
            self.fraud_reason_codes(),
            self.kyc_reason_codes(),
            self.synthetic_reason_codes(),
            self.address_risk_reason_codes(),
            self.email_risk_reason_codes(),
            self.phone_risk_reason_codes(),
            self.alert_list_reason_codes(),
            self.global_watchlist_reason_codes(),
            self.device_risk_reason_codes(),
            self.device_identity_correlation_reason_codes(),
        ]
        .into_iter()
        .flatten()
        .flatten()
        .unique() // Different modules can return the same reason codes
        .collect()
    }
}
