use db::{models::requirement::CreateRequirementConfig, PgConnection};
use newtypes::{RequirementKind, RequirementStatus2};

/// Controls what additional requirements we may add during onboarding
pub(super) fn get_onboarding_step_up_requirement_kinds() -> Vec<CreateRequirementConfig> {
    // For now, the only "extra" requirement we have is liveness
    // Eventually, we'll do some risk-based computations here to add additional step ups
    vec![CreateRequirementConfig {
        kind: RequirementKind::Liveness,
        initiator: newtypes::RequirementInitiator::Footprint,
        fulfilled_at: None,
        fulfilled_by_requirement_id: None,
    }]
}

/// Determines whether we can move Requirement of kind RequirementKind to status RequirementStatus
pub(super) fn can_update_status_for_kind(
    _conn: &mut PgConnection,
    _status: RequirementStatus2,
    _kind: &RequirementKind,
) -> bool {
    true
}
