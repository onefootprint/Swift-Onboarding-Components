use crate::schema::onboarding_session_tokens;
use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[table_name = "onboarding_session_tokens"]
pub struct OnboardingSessionToken {
    pub h_token: String,
    pub timestamp: NaiveDateTime,
    pub user_vault_id: String,
    pub tenant_id: String,
    pub footprint_user_id: String
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[table_name = "onboarding_session_tokens"]
pub struct NewOnboardingSessionToken {
    pub h_token: String,
    pub user_vault_id: String,
    pub tenant_id: String,
    pub footprint_user_id: String
}