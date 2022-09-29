use crate::schema::{document_request};
use chrono::{DateTime, Utc};
use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};
use newtypes::{DocumentRequestId, OnboardingId, DocumentRequestStatus};


#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = document_request)]
pub struct DocumentRequest {
    pub id: DocumentRequestId,
    pub onboarding_id: OnboardingId,
    pub ref_id: Option<String>,
    pub status: DocumentRequestStatus,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}