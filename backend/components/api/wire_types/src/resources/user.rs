use paperclip::{actix::OperationModifier, v2::schema::Apiv2Schema};

use crate::*;

#[derive(Debug, Clone, Serialize)]
pub struct LiteUser {
    pub id: FpId,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sandbox_id: Option<SandboxId>,
}

impl Apiv2Schema for LiteUser {
    fn name() -> Option<String> {
        DUMMYLiteUser::name()
    }

    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        DUMMYLiteUser::raw_schema()
    }
}

impl OperationModifier for LiteUser {}

#[derive(Apiv2Schema)]
struct DUMMYLiteUser {
    // Once we fork paperclip and add an ability to skip serializing a field, we can get rid of this
    #[openapi(example = "fp_id_7p793EF07xKXHqAeg5VGPj")]
    #[allow(unused)]
    id: FpId,
}

/// Basic information about a user
#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct User {
    pub id: FpId,
    pub requires_manual_review: bool,
    pub status: Option<OnboardingStatus>,
}
