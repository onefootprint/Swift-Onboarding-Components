use crate::schema::{verification_requests, verification_requests_user_data};
use chrono::NaiveDateTime;
use diesel::Insertable;
use newtypes::{OnboardingId, UserDataId, Vendor};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable)]
#[table_name = "verification_requests"]
pub struct VerificationRequest {
    pub id: Uuid,
    pub onboarding_id: OnboardingId,
    pub vendor: Vendor,
    pub timestamp: NaiveDateTime,
    pub _created_at: NaiveDateTime,
    pub _updated_at: NaiveDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable)]
#[table_name = "verification_requests_user_data"]
pub struct VerificationRequestUserData {
    pub id: Uuid,
    pub request_id: Uuid,
    pub user_data_id: UserDataId,
}
