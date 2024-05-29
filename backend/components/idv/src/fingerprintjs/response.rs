use chrono::{
    DateTime,
    Utc,
};
use newtypes::{
    FingerprintRequestId,
    FingerprintVisitorId,
};
use serde::*;

/// Response from Fingerprint's Server API
///    - https://dev.fingerprint.com/docs/server-api
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FingerprintServerAPIResponse {
    // identification + botd (which we aren't currently using)
    pub products: FingerprintProducts,
    // General errors (request_id not found, auth, etc)
    pub error: Option<Error>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Error {
    pub code: Option<String>,
    pub message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FingerprintProducts {
    pub identification: FingerprintIdentificationProduct,
    // TODO eventually, maybe
    pub botd: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FingerprintIdentificationProduct {
    pub data: Option<FingerprintIdentification>,
    // If an error specifically happened during identification, it'll be returned here
    pub error: Option<Error>,
}

/// A RequestId corresponds to a single visit from a VisitorId
/// This struct contains all the information from that visit
///
/// Visit information is stored for 30d
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FingerprintIdentification {
    pub request_id: FingerprintRequestId,
    pub visitor_id: FingerprintVisitorId,
    pub visitor_found: Option<bool>,
    pub timestamp: i64, // unix ms,
    pub time: DateTime<Utc>,
    pub incognito: Option<bool>,
    pub url: String,
    pub client_referrer: Option<String>,
    pub ip_location: Option<IpLocation>,
    pub browser_details: Option<BrowserDetails>,
    pub confidence: Option<Confidence>,
    pub first_seen_at: Option<SeenAt>,
    pub last_seen_at: Option<SeenAt>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IpLocation {
    // in miles
    pub accuracy_radius: Option<i32>,
    pub city: Option<City>,
    pub continent: Option<Location>,
    pub country: Option<Location>,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub postal_code: Option<String>,
    pub subdivisions: Option<Vec<Subdivision>>,
    pub timezone: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct City {
    pub name: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Location {
    pub code: Option<String>,
    pub name: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Subdivision {
    pub iso_code: Option<String>,
    pub name: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BrowserDetails {
    pub browser_details: Option<String>,
    pub browser_name: Option<String>,
    pub browser_full_version: Option<String>,
    pub browser_major_version: Option<String>,
    pub os: Option<String>,
    pub os_version: Option<String>,
    pub device: Option<String>,
    pub user_agent: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Confidence {
    pub score: Option<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SeenAt {
    pub global: Option<DateTime<Utc>>,
    pub subscription: Option<DateTime<Utc>>,
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_parse() {
        use super::*;
        use crate::test_fixtures::fingerprint_server_api_fake_event;

        let r: FingerprintServerAPIResponse = serde_json::from_value(fingerprint_server_api_fake_event())
            .expect("failed to parse fingerprint js response");

        assert!(r
            .products
            .identification
            .data
            .map(|d| d.browser_details.is_some())
            .unwrap_or(false))
    }
}
