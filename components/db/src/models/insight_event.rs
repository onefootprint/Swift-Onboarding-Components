use crate::schema::insight_events;
use crate::DbPool;
use chrono::NaiveDateTime;
use diesel::{Insertable, PgConnection, Queryable, RunQueryDsl};
use newtypes::InsightEventId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = insight_events)]
pub struct InsightEvent {
    pub id: InsightEventId,
    pub timestamp: NaiveDateTime,
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
    pub _created_at: NaiveDateTime,
    pub _updated_at: NaiveDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = insight_events)]
pub struct CreateInsightEvent {
    pub timestamp: NaiveDateTime,
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
}

impl CreateInsightEvent {
    pub fn insert_with_conn(self, conn: &mut PgConnection) -> Result<InsightEvent, diesel::result::Error> {
        let ev = diesel::insert_into(crate::schema::insight_events::table)
            .values(self)
            .get_result(conn)?;
        Ok(ev)
    }

    pub async fn insert(self, pool: &DbPool) -> Result<InsightEvent, crate::DbError> {
        let ev = pool.db_query(move |conn| self.insert_with_conn(conn)).await??;
        Ok(ev)
    }
}
