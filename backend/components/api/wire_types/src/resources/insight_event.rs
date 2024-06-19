use crate::*;

/// Describes a device insight event with locations and IP of the event
#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]

pub struct InsightEvent {
    pub timestamp: DateTime<Utc>,
    pub ip_address: Option<String>,
    pub city: Option<String>,
    pub country: Option<String>,
    pub region: Option<String>,
    pub region_name: Option<String>,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub metro_code: Option<String>,
    pub postal_code: Option<String>,
    pub time_zone: Option<String>,
    pub user_agent: Option<String>,
}

/// Describes a device insight event with locations and IP of the event
#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]

pub struct PublicInsightEvent {
    pub timestamp: DateTime<Utc>,
    pub ip_address: Option<String>,
    #[openapi(example = "San Francisco")]
    pub city: Option<String>,
    #[openapi(example = "United States")]
    pub country: Option<String>,
    #[openapi(example = "CA")]
    pub region: Option<String>,
    #[openapi(example = "94117")]
    pub postal_code: Option<String>,
    #[openapi(
        example = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
    )]
    pub user_agent: Option<String>,
    #[openapi(example = "37.7703")]
    pub latitude: Option<f64>,
    #[openapi(example = "-122.4407")]
    pub longitude: Option<f64>,
}
