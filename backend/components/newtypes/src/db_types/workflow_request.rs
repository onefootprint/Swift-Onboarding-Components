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
    /// Allow editing data, re-verify data, and then re-trigger decision engine
    /// DEPRECATED
    RedoKyc,
    /// Allow onboarding onto the specific playbook.
    /// This allows editing data, re-verifies data, and then re-triggers decision engine
    Onboard { playbook_id: ObConfigurationId },
    /// Upload a new document and re-run the decision engine
    Document { configs: Vec<DocumentRequestConfig> },
}
