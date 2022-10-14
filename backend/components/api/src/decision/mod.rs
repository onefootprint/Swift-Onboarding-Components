use db::{
    models::{ob_configuration::ObConfiguration, requirement::Requirement},
    DbResult, PgConnection,
};
use newtypes::{OnboardingId, UserVaultId};

use crate::types::identity_data_request::IdentityDataUpdate;

mod requirement;
pub mod risk;
pub mod verification_request;
////////////////////////
/// Decision Engine
////////////////////////
///
/// https://www.notion.so/onefootprint/Risk-Decisioning-Schema-41c96db272c84222b8d5892341193295
///
/// The Decision Engine is the entry point for several key aspects of Footprint's product. Namely,
///
/// 1) Creating `Requirements` which indicate what sort of information needs to be collected from the User
/// 2) Managing the `Requirement` lifecycle (marking as processing, fulfilled, deactivated, retry and so on)
/// 3) Firing off VerificationRequests to vendors
/// 4) Handle and processing VerificationResults (results from vendors)
///
/// Other key aspects include:
/// 1) Risk-based step ups (e.g. Tenant requests SSN but we think we should ask the user for SSN + identity document)
/// 2) Marking Requirements as already fulfilled (e.g. Tenant A already collected Name from the User, so Tenant B doesn't have to again)
///
////////////////////////
/// Organization
////////////////////////
/// mod.rs
///   - public interfaces for creating and managing requirements
///
/// requirement.rs
///   - implementation of working with requirements
///
/// risk.rs
///   - risk-based step ups
///   - additional auth challenges
///
/// request.rs
///   - To be implemented, handle vendor requests
///   - Handle waterfalling
///
/// result.rs
///   - To be implement, handle results from vendors, mark requirements as fulfilled/requiring retry
///   - add step ups
///   - decide to waterfall to other vendors
///
/// decision_engine.rs
///   - To be implemented, Fn<Results, UserVaultId, Risk> -> (OnboardingDecision, FootprintDecision)
///
////////////////////////

/// Create requirements, checking if we have already satisfied them and adding any risk-related requirements
pub fn create_requirements(
    conn: &mut PgConnection,
    user_vault_id: &UserVaultId,
    onboarding_id: &OnboardingId,
    ob_config: &ObConfiguration,
) -> DbResult<Vec<Requirement>> {
    requirement::create_requirements(conn, user_vault_id, onboarding_id, ob_config)
}

/// Update statuses of Requirements to processing, checking if we can do so
/// TODO: we need to add who or what is updating the status
pub fn update_requirement_statuses_to_processing(
    conn: &mut PgConnection,
    identity_data: Option<&IdentityDataUpdate>,
    user_vault_id: &UserVaultId,
) -> DbResult<Vec<Requirement>> {
    requirement::update_requirement_statuses_to_processing(conn, user_vault_id, identity_data)
}
