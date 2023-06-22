use crate::*;

/// Describes an audit event of a data access
#[derive(Debug, Clone, Serialize, Apiv2Schema, JsonSchema)]
#[schemars(rename_all = "camelCase")]
pub struct AccessEvent {
    pub fp_id: FpId,
    pub tenant_id: TenantId,
    pub reason: Option<String>,
    pub principal: String, // TODO: change to Actor once frontend can support it
    pub timestamp: DateTime<Utc>,
    pub ordering_id: i64,
    pub insight_event: Option<InsightEvent>,
    pub kind: AccessEventKind,
    #[schemars(with = "String")]
    pub targets: Vec<DataIdentifier>,
}
export_schema!(AccessEvent);
