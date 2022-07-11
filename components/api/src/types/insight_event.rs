use chrono::{DateTime, Utc};
use db::models::insight_event::InsightEvent;
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct ApiInsightEvent {
    // TODO id?
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

impl From<InsightEvent> for ApiInsightEvent {
    fn from(e: InsightEvent) -> Self {
        let InsightEvent {
            city,
            timestamp,
            ip_address,
            country,
            region,
            region_name,
            latitude,
            longitude,
            metro_code,
            postal_code,
            time_zone,
            user_agent,
            ..
        } = e;
        ApiInsightEvent {
            timestamp,
            ip_address,
            city,
            country,
            region,
            region_name,
            latitude,
            longitude,
            metro_code,
            postal_code,
            time_zone,
            user_agent,
        }
    }
}
