use crate::models::insight_event::CreateInsightEvent;
use crate::models::insight_event::InsightEvent;
use crate::TxnPgConn;
use chrono::Utc;

pub fn create(conn: &mut TxnPgConn) -> InsightEvent {
    let event = CreateInsightEvent {
        timestamp: Utc::now(),
        user_agent: Some("test fixtures".to_owned()),
        ..Default::default()
    };
    event
        .insert_with_conn(conn)
        .expect("couldn't create insight event")
}
