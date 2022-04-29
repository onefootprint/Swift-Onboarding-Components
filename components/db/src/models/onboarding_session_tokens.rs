use crate::schema::onboarding_session_tokens;
use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};


#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "onboarding_session_tokens"]
pub struct OnboardingSessionToken {
    pub h_token: String,
    pub created_at: NaiveDateTime,
    pub user_ob_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "onboarding_session_tokens"]
pub struct NewOnboardingSessionToken {
    pub h_token: String,
    pub user_ob_id: String
}