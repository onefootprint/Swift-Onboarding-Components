use api_wire_types::DecisionSource;
use db::models::{
    ob_configuration::ObConfiguration, onboarding_decision::OnboardingDecision, tenant_user::TenantUser,
    verification_request::VerificationRequest,
};

use crate::utils::db2api::DbToApi;

impl DbToApi<(OnboardingDecision, Option<TenantUser>)> for api_wire_types::OnboardingDecision {
    fn from_db((decision, tenant_user): (OnboardingDecision, Option<TenantUser>)) -> Self {
        Self::from_db((decision, None, None, tenant_user))
    }
}

type OnboardingDecisionInfo = (
    OnboardingDecision,
    Option<ObConfiguration>,
    Option<Vec<VerificationRequest>>,
    Option<TenantUser>,
);

impl DbToApi<OnboardingDecisionInfo> for api_wire_types::OnboardingDecision {
    fn from_db((decision, ob_configuration, vrs, tenant_user): OnboardingDecisionInfo) -> Self {
        let OnboardingDecision {
            id,
            status,
            created_at,
            ..
        } = decision;
        let source = if let Some(tenant_user) = tenant_user {
            DecisionSource::Organization {
                member: tenant_user.email,
            }
        } else {
            DecisionSource::Footprint
        };
        let vendors = vrs.map(|vrs| vrs.into_iter().map(|vr| vr.vendor).collect());
        api_wire_types::OnboardingDecision {
            id,
            status,
            timestamp: created_at,
            source,
            ob_configuration: ob_configuration.map(api_wire_types::LiteObConfiguration::from_db),
            vendors,
        }
    }
}
