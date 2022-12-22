use crate::schema::onboarding;
use crate::DbPool;
use crate::{schema::insight_event, DbError};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, PgConnection, Queryable, RunQueryDsl};
use newtypes::{InsightEventId, OnboardingId};
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

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
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
    pub fn insert_with_conn(self, conn: &mut PgConnection) -> Result<InsightEvent, DbError> {
        let ev = diesel::insert_into(crate::schema::insight_event::table)
            .values(self)
            .get_result(conn)?;
        Ok(ev)
    }

    pub async fn insert(self, pool: &DbPool) -> Result<InsightEvent, DbError> {
        let ev = pool.db_query(move |conn| self.insert_with_conn(conn)).await??;
        Ok(ev)
    }
}

impl InsightEvent {
    pub fn get_by_onboarding_id(
        conn: &mut PgConnection,
        onboarding_id: &OnboardingId,
    ) -> Result<InsightEvent, DbError> {
        let insight_event: InsightEvent = onboarding::table
            .inner_join(insight_event::table)
            .filter(onboarding::id.eq(onboarding_id))
            .select(insight_event::all_columns)
            .get_result(conn)?;

        Ok(insight_event)
    }
}
