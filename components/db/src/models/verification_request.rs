use crate::schema::{verification_requests, verification_requests_user_data};
use chrono::NaiveDateTime;
use diesel::Insertable;
use newtypes::{OnboardingId, UserDataId, Vendor, VerificationRequestId, VerificationRequestUserDataId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable)]
#[diesel(table_name = verification_requests)]
pub struct VerificationRequest {
    pub id: VerificationRequestId,
    pub onboarding_id: OnboardingId,
    pub vendor: Vendor,
    pub timestamp: NaiveDateTime,
    pub _created_at: NaiveDateTime,
    pub _updated_at: NaiveDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable)]
#[diesel(table_name = verification_requests_user_data)]
pub struct VerificationRequestUserData {
    pub id: VerificationRequestUserDataId,
    pub request_id: VerificationRequestId,
    pub user_data_id: UserDataId,
}
