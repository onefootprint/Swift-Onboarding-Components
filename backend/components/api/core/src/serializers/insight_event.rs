use crate::utils::db2api::DbToApi;
use db::models::insight_event::InsightEvent;

impl DbToApi<InsightEvent> for api_wire_types::InsightEvent {
    fn from_db(e: InsightEvent) -> Self {
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
            session_id,
            ..
        } = e;

        api_wire_types::InsightEvent {
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
            session_id,
        }
    }
}

impl DbToApi<InsightEvent> for api_wire_types::PublicInsightEvent {
    fn from_db(e: InsightEvent) -> Self {
        let InsightEvent {
            timestamp,
            ip_address,
            city,
            country,
            region,
            postal_code,
            user_agent,
            latitude,
            longitude,
            ..
        } = e;

        api_wire_types::PublicInsightEvent {
            timestamp,
            ip_address,
            city,
            country,
            region,
            postal_code,
            user_agent,
            latitude,
            longitude,
        }
    }
}
