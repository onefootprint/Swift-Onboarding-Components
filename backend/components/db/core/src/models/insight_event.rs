use crate::PgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::insight_event;
use db_schema::schema::workflow;
use diesel::prelude::*;
use diesel::Insertable;
use diesel::Queryable;
use diesel::RunQueryDsl;
use itertools::Itertools;
use newtypes::DeviceType;
use newtypes::InsightEventId;
use newtypes::ObConfigurationId;
use newtypes::ScopedVaultId;
use newtypes::WorkflowId;
use std::collections::HashMap;

#[derive(Debug, Clone, Default, Queryable, Insertable, Selectable)]
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
    pub session_id: Option<String>,
    pub origin: Option<String>,
}

impl InsightEvent {
    pub fn device_type(&self) -> Option<DeviceType> {
        let is_mobile = [self.is_ios_viewer, self.is_android_user, self.is_mobile_viewer]
            .iter()
            .flatten()
            .max()
            .cloned()
            .unwrap_or(false);

        if is_mobile {
            Some(DeviceType::Mobile)
        } else if self.is_desktop_viewer.unwrap_or(false) {
            Some(DeviceType::Desktop)
        } else {
            None
        }
    }
}

#[derive(Debug, Clone, Queryable, Insertable, Default)]
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
    pub session_id: Option<String>,
    pub origin: Option<String>,
}

impl CreateInsightEvent {
    #[tracing::instrument("CreateInsightEvent::insert_with_conn", skip_all)]
    pub fn insert_with_conn(self, conn: &mut PgConn) -> FpResult<InsightEvent> {
        let ev = diesel::insert_into(db_schema::schema::insight_event::table)
            .values(self)
            .get_result(conn)?;
        Ok(ev)
    }
}

impl InsightEvent {
    #[tracing::instrument("InsightEvent::get_for_workflow", skip_all)]
    pub fn get_for_workflow(conn: &mut PgConn, wf_id: &WorkflowId) -> FpResult<Option<InsightEvent>> {
        let insight_event: Option<InsightEvent> = workflow::table
            .inner_join(insight_event::table)
            .filter(workflow::id.eq(wf_id))
            .select(insight_event::all_columns)
            .get_result(conn)
            .optional()?;

        Ok(insight_event)
    }

    pub fn get_latest_for_obc(
        conn: &mut PgConn,
        obc_id: &ObConfigurationId,
        sv_ids: &[ScopedVaultId],
    ) -> FpResult<HashMap<ScopedVaultId, Vec<InsightEvent>>> {
        let results: Vec<(ScopedVaultId, InsightEvent)> = workflow::table
            .inner_join(insight_event::table)
            .filter(workflow::ob_configuration_id.eq(obc_id))
            .filter(workflow::scoped_vault_id.eq_any(sv_ids))
            // For each SV, get the latest associated insight event for the given OBC.
            .distinct_on(workflow::scoped_vault_id)
            .order((workflow::scoped_vault_id, insight_event::timestamp.desc()))
            .select((workflow::scoped_vault_id, insight_event::all_columns))
            .get_results(conn)?;

        let grouped = results.into_iter().into_group_map();
        Ok(grouped)
    }
}
