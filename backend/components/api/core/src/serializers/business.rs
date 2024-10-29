use crate::utils::db2api::DbToApi;
use api_wire_types::business::HostedBusiness;
use db::models::business_owner::BusinessOwner;
use db::models::manual_review::ManualReview;
use db::models::scoped_vault::ScopedVault;
use newtypes::OnboardingStatus;
use newtypes::PiiString;

impl DbToApi<(ScopedVault, Vec<ManualReview>)> for api_wire_types::Business {
    fn from_db((sv, manual_reviews): (ScopedVault, Vec<ManualReview>)) -> Self {
        Self {
            id: sv.fp_id,
            status: sv.status,
            requires_manual_review: !manual_reviews.is_empty(),
            external_id: sv.external_id,
        }
    }
}

impl DbToApi<(BusinessOwner, ScopedVault, PiiString)> for HostedBusiness {
    fn from_db((bo, sb, name): (BusinessOwner, ScopedVault, PiiString)) -> Self {
        Self {
            id: bo.id,
            name,
            created_at: sb.start_timestamp,
            last_activity_at: sb.last_activity_at,
            is_incomplete: sb.status == OnboardingStatus::Incomplete,
        }
    }
}
