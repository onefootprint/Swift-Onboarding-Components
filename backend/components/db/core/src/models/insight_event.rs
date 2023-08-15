use crate::DbError;
use crate::DbResult;
use crate::PgConn;
use chrono::{DateTime, Utc};
use db_schema::schema::insight_event;
use db_schema::schema::workflow;
use diesel::prelude::*;
use diesel::{Insertable, Queryable, RunQueryDsl};
use newtypes::{InsightEventId, WorkflowId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = insight_event)]
pub struct InsightEvent {
    pub id: InsightEventId,
    pub timestamp: DateTime<Utc>,
    pub ip_address: Option<String>,
    pub country: Option<String>,
    pub region: Option<String>,
    pub region_name: Option<String>,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub metro_code: Option<String>,
    pub postal_code: Option<String>,
    pub time_zone: Option<String>,
    pub user_agent: Option<String>,
    pub city: Option<String>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub is_android_user: Option<bool>,
    pub is_desktop_viewer: Option<bool>,
    pub is_ios_viewer: Option<bool>,
    pub is_mobile_viewer: Option<bool>,
    pub is_smarttv_viewer: Option<bool>,
    pub is_tablet_viewer: Option<bool>,
    pub asn: Option<String>,
    pub country_code: Option<String>,
    pub forwarded_proto: Option<String>,
    pub http_version: Option<String>,
    pub tls: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Default)]
#[diesel(table_name = insight_event)]
pub struct CreateInsightEvent {
    pub timestamp: DateTime<Utc>,
    pub ip_address: Option<String>,
    pub country: Option<String>,
    pub region: Option<String>,
    pub region_name: Option<String>,
    pub latitude: Option<f64>,
    pub longitude: Option<f64>,
    pub metro_code: Option<String>,
    pub postal_code: Option<String>,
    pub time_zone: Option<String>,
    pub user_agent: Option<String>,
    pub city: Option<String>,
    pub is_android_user: Option<bool>,
    pub is_desktop_viewer: Option<bool>,
    pub is_ios_viewer: Option<bool>,
    pub is_mobile_viewer: Option<bool>,
    pub is_smarttv_viewer: Option<bool>,
    pub is_tablet_viewer: Option<bool>,
    pub asn: Option<String>,
    pub country_code: Option<String>,
    pub forwarded_proto: Option<String>,
    pub http_version: Option<String>,
    pub tls: Option<String>,
}

impl CreateInsightEvent {
    #[tracing::instrument("CreateInsightEvent::insert_with_conn", skip_all)]
    pub fn insert_with_conn(self, conn: &mut PgConn) -> Result<InsightEvent, DbError> {
        let ev = diesel::insert_into(db_schema::schema::insight_event::table)
            .values(self)
            .get_result(conn)?;
        Ok(ev)
    }
}

impl InsightEvent {
    #[tracing::instrument("InsightEvent::get", skip_all)]
    pub fn get(conn: &mut PgConn, wf_id: &WorkflowId) -> DbResult<Option<InsightEvent>> {
        let insight_event: Option<InsightEvent> = workflow::table
            .inner_join(insight_event::table)
            .filter(workflow::id.eq(wf_id))
            .select(insight_event::all_columns)
            .get_result(conn)
            .optional()?;

        Ok(insight_event)
    }
}
