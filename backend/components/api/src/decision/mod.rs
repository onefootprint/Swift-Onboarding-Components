use db::models::ob_configuration::ObConfiguration;

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
/// risk.rs
///   - risk-based step ups
///   - additional auth challenges
///
/// request.rs
///   - To be implemented, handle vendor requests
///   - Handle waterfalling
///
/// result.rs
///   - To be implement, handle results from vendors
///   - add step ups
///   - decide to waterfall to other vendors
///
/// engine.rs
///   - To be implemented, Fn<Results, UserVaultId, Risk> -> (OnboardingDecision, FootprintDecision)
///
////////////////////////
pub mod engine;
pub(self) mod features;
pub mod risk;
pub(self) mod utils;
pub mod vendor;
