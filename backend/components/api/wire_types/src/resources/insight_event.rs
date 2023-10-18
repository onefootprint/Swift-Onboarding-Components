use crate::*;

/// Describes a device insight event with locations and IP of the event
#[derive(Debug, Clone, Serialize, Apiv2Schema)]

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
