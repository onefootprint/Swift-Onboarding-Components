use crate::*;

/// Describes an onboarding of a user vault to a tenant
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
pub struct HostedAuthorizedOrgs {
    pub id: ScopedUserId,
    pub tenant_id: TenantId,
    pub name: String,
    pub logo_url: Option<String>,
    pub timestamp: DateTime<Utc>,
    pub onboardings: Vec<HostedUserOnboardingInfo>,
}

export_schema!(HostedAuthorizedOrgs);

/// Describes an onboarding of a user vault to a tenant
#[derive(Debug, Clone, Deserialize, Serialize, Apiv2Schema, JsonSchema)]
pub struct HostedUserOnboardingInfo {
    pub name: String,
    pub insight_event: InsightEvent,
    pub timestamp: DateTime<Utc>,
    pub can_access_data: Vec<CollectedDataOption>,
}

export_schema!(HostedUserOnboardingInfo);
