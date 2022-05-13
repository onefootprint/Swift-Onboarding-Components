use db::models::onboardings::Onboarding;
use db::models::types::Status;
use paperclip::actix::Apiv2Schema;
use strum_macros::{self, Display};

#[derive(
    Debug,
    Clone,
    Apiv2Schema,
    serde::Deserialize,
    serde::Serialize,
    Eq,
    PartialEq,
    Hash,
    Ord,
    PartialOrd,
    Display,
)]
#[serde(rename_all = "snake_case")]
pub enum ApiStatus {
    Verified,
    Processing,
    Incomplete,
    Failed,
}

impl From<ApiStatus> for Status {
    fn from(v: ApiStatus) -> Self {
        match v {
            ApiStatus::Verified => Status::Verified,
            ApiStatus::Processing => Status::Processing,
            ApiStatus::Incomplete => Status::Incomplete,
            ApiStatus::Failed => Status::Failed,
        }
    }
}

impl From<Status> for ApiStatus {
    fn from(v: Status) -> Self {
        match v {
            Status::Verified => ApiStatus::Verified,
            Status::Processing => ApiStatus::Processing,
            Status::Incomplete => ApiStatus::Incomplete,
            Status::Failed => ApiStatus::Failed,
        }
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Apiv2Schema)]
pub struct ApiOnboarding {
    pub fp_user_id: String,
    pub tenant_id: String,
    pub status: ApiStatus,
    pub created_at: chrono::NaiveDateTime,
    pub updated_at: chrono::NaiveDateTime,
}

impl From<Onboarding> for ApiOnboarding {
    fn from(ob: Onboarding) -> Self {
        ApiOnboarding {
            fp_user_id: ob.user_ob_id,
            tenant_id: ob.tenant_id,
            status: ob.status.into(),
            created_at: ob.created_at,
            updated_at: ob.updated_at,
        }
    }
}
