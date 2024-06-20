use newtypes::UserInsightScope;
use newtypes::UserInsightUnit;
use paperclip::actix::Apiv2Response;
use serde::Serialize;

// Represents a single insight about a user
#[derive(Debug, Clone, Serialize, Apiv2Response, macros::JsonResponder)]

pub struct UserInsight {
    // the display name of the metric
    pub name: String,
    // The serialized value of the metric, in the format that can be displayed in the dashboard
    pub value: String,
    // enum: Behavior, Onboarding, Device, etc so we can render into specific section
    pub scope: UserInsightScope,
    pub description: String,
    pub unit: UserInsightUnit,
}
