use super::VerificationCheck;
use crate::CollectedDataOption;
use crate::DocumentRequestConfig;
use crate::ObConfigurationId;
use diesel::AsExpression;
use diesel::FromSqlRow;
use diesel_as_jsonb::AsJsonb;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, AsJsonb)]
#[serde(rename_all = "snake_case")]
// TODO would be nice to remove the content here to reduce unnecessary nesting, but lots to migrate
#[serde(tag = "kind", content = "data")]
pub enum WorkflowRequestConfig {
    /// Allow onboarding onto the specific playbook.
    /// This allows editing data, re-verifies data, and then re-triggers decision engine
    Onboard(WfrOnboardConfig),
    /// Upload a new document and re-run the decision engine
    Document(WfrDocumentConfig),
    /// Adhoc vendor call
    AdhocVendorCall(WfrAdhocVendorCallConfig),
}

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, AsJsonb)]
#[serde(rename_all = "snake_case")]
pub struct WfrOnboardConfig {
    pub playbook_id: ObConfigurationId,
    #[serde(default)]
    pub recollect_attributes: Vec<CollectedDataOption>,
    #[serde(default)]
    pub reuse_existing_bo_kyc: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, AsJsonb)]
#[serde(rename_all = "snake_case")]
pub struct WfrDocumentConfig {
    pub configs: Vec<DocumentRequestConfig>,
    #[serde(default)]
    pub business_configs: Vec<DocumentRequestConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema, AsJsonb)]
#[serde(rename_all = "snake_case")]
pub struct WfrAdhocVendorCallConfig {
    pub verification_checks: Vec<VerificationCheck>,
}
