use crate::{DbResult, PgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::neuro_id_analytics_event;
use diesel::{prelude::*, Insertable, Queryable};
use newtypes::{
    NeuroIdAnalyticsEventId, NeuroIdentityId, ScopedVaultId, TenantId, VerificationResultId, WorkflowId,
};

/// An append-only, immutable event that denormalizes a lot of data we get back from NeuroID
/// in order to render and/or compute signals for the dashboard, analysis, or model training pipelines
#[derive(Debug, Clone, Insertable, Queryable)]
#[diesel(table_name = neuro_id_analytics_event)]
pub struct NeuroIdAnalyticsEvent {
    pub id: NeuroIdAnalyticsEventId,
    pub verification_result_id: VerificationResultId,
    pub workflow_id: WorkflowId,
    pub scoped_vault_id: ScopedVaultId,
    pub tenant_id: TenantId,
    pub neuro_identifier: NeuroIdentityId,
    pub cookie_id: Option<String>,
    pub device_id: Option<String>,
    pub model_fraud_ring_indicator_result: Option<bool>,
    pub model_automated_activity_result: Option<bool>,
    pub model_risky_device_result: Option<bool>,
    pub model_factory_reset_result: Option<bool>,
    pub model_gps_spoofing_result: Option<bool>,
    pub model_tor_exit_node_result: Option<bool>,
    pub model_public_proxy_result: Option<bool>,
    pub model_vpn_result: Option<bool>,
    pub model_ip_blocklist_result: Option<bool>,
    pub model_ip_address_association_result: Option<bool>,
    pub model_incognito_result: Option<bool>,
    pub model_bot_framework_result: Option<bool>,
    pub model_suspicious_device_result: Option<bool>,
    pub model_multiple_ids_per_device_result: Option<bool>,
    pub model_device_reputation_result: Option<bool>,
    pub suspicious_device_emulator: Option<bool>,
    pub suspicious_device_jailbroken: Option<bool>,
    pub suspicious_device_missing_expected_properties: Option<bool>,
    pub suspicious_device_frida: Option<bool>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    // TODO: add these in one we start getting actual good, analyzable results
    // pub model_familiarity_result: Option<String>,
    // pub model_combined_digital_intent_result: Option<String>,
}

#[derive(Debug, Clone)]
pub struct NewNeuroIdAnalyticsEvent {
    pub verification_result_id: VerificationResultId,
    pub workflow_id: WorkflowId,
    pub scoped_vault_id: ScopedVaultId,
    pub tenant_id: TenantId,
    pub neuro_identifier: NeuroIdentityId,
    pub cookie_id: Option<String>,
    pub device_id: Option<String>,
    pub model_fraud_ring_indicator_result: Option<bool>,
    pub model_automated_activity_result: Option<bool>,
    pub model_risky_device_result: Option<bool>,
    pub model_factory_reset_result: Option<bool>,
    pub model_gps_spoofing_result: Option<bool>,
    pub model_tor_exit_node_result: Option<bool>,
    pub model_public_proxy_result: Option<bool>,
    pub model_vpn_result: Option<bool>,
    pub model_ip_blocklist_result: Option<bool>,
    pub model_ip_address_association_result: Option<bool>,
    pub model_incognito_result: Option<bool>,
    pub model_bot_framework_result: Option<bool>,
    pub model_suspicious_device_result: Option<bool>,
    pub model_multiple_ids_per_device_result: Option<bool>,
    pub model_device_reputation_result: Option<bool>,
    pub suspicious_device_emulator: Option<bool>,
    pub suspicious_device_jailbroken: Option<bool>,
    pub suspicious_device_missing_expected_properties: Option<bool>,
    pub suspicious_device_frida: Option<bool>,
}

#[derive(Debug, Clone, Insertable, Queryable)]
#[diesel(table_name = neuro_id_analytics_event)]
pub struct NewNeuroIdAnalyticsEventRow {
    verification_result_id: VerificationResultId,
    workflow_id: WorkflowId,
    scoped_vault_id: ScopedVaultId,
    tenant_id: TenantId,
    neuro_identifier: NeuroIdentityId,
    cookie_id: Option<String>,
    device_id: Option<String>,
    model_fraud_ring_indicator_result: Option<bool>,
    model_automated_activity_result: Option<bool>,
    model_risky_device_result: Option<bool>,
    model_factory_reset_result: Option<bool>,
    model_gps_spoofing_result: Option<bool>,
    model_tor_exit_node_result: Option<bool>,
    model_public_proxy_result: Option<bool>,
    model_vpn_result: Option<bool>,
    model_ip_blocklist_result: Option<bool>,
    model_ip_address_association_result: Option<bool>,
    model_incognito_result: Option<bool>,
    model_bot_framework_result: Option<bool>,
    model_suspicious_device_result: Option<bool>,
    model_multiple_ids_per_device_result: Option<bool>,
    model_device_reputation_result: Option<bool>,
    suspicious_device_emulator: Option<bool>,
    suspicious_device_jailbroken: Option<bool>,
    suspicious_device_missing_expected_properties: Option<bool>,
    suspicious_device_frida: Option<bool>,
}

impl NeuroIdAnalyticsEvent {
    #[tracing::instrument("NeuroIdAnalyticsEvent::create", skip_all)]
    pub fn create(conn: &mut PgConn, args: NewNeuroIdAnalyticsEvent) -> DbResult<Self> {
        let NewNeuroIdAnalyticsEvent {
            verification_result_id,
            workflow_id,
            scoped_vault_id,
            tenant_id,
            neuro_identifier,
            cookie_id,
            device_id,
            model_fraud_ring_indicator_result,
            model_automated_activity_result,
            model_risky_device_result,
            model_factory_reset_result,
            model_gps_spoofing_result,
            model_tor_exit_node_result,
            model_public_proxy_result,
            model_vpn_result,
            model_ip_blocklist_result,
            model_ip_address_association_result,
            model_incognito_result,
            model_bot_framework_result,
            model_suspicious_device_result,
            model_multiple_ids_per_device_result,
            model_device_reputation_result,
            suspicious_device_emulator,
            suspicious_device_jailbroken,
            suspicious_device_missing_expected_properties,
            suspicious_device_frida,
        } = args;
        let new = NewNeuroIdAnalyticsEventRow {
            verification_result_id,
            workflow_id,
            scoped_vault_id,
            tenant_id,
            neuro_identifier,
            cookie_id,
            device_id,
            model_fraud_ring_indicator_result,
            model_automated_activity_result,
            model_risky_device_result,
            model_factory_reset_result,
            model_gps_spoofing_result,
            model_tor_exit_node_result,
            model_public_proxy_result,
            model_vpn_result,
            model_ip_blocklist_result,
            model_ip_address_association_result,
            model_incognito_result,
            model_bot_framework_result,
            model_suspicious_device_result,
            model_multiple_ids_per_device_result,
            model_device_reputation_result,
            suspicious_device_emulator,
            suspicious_device_jailbroken,
            suspicious_device_missing_expected_properties,
            suspicious_device_frida,
        };
        let result = diesel::insert_into(neuro_id_analytics_event::table)
            .values(new)
            .get_result::<NeuroIdAnalyticsEvent>(conn)?;
        Ok(result)
    }
}
