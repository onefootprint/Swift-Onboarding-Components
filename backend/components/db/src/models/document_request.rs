use crate::{schema::document_request, DbResult};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, PgConnection, Queryable};
use newtypes::{DocumentRequestId, DocumentRequestStatus, OnboardingId};
use serde::{Deserialize, Serialize};

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
#[derive(Debug, AsChangeset, Default)]
#[diesel(table_name = document_request)]
pub struct DocumentRequestUpdate {
    pub status: Option<DocumentRequestStatus>,
}

impl DocumentRequestUpdate {
    pub fn status(status: DocumentRequestStatus) -> Self {
        Self {
            status: Some(status),
            ..Self::default()
        }
    }
}
impl DocumentRequest {
    pub fn create(
        conn: &mut PgConnection,
        onboarding_id: OnboardingId,
        ref_id: Option<String>,
    ) -> DbResult<Self> {
        let new = NewDocumentRequest {
            onboarding_id,
            ref_id,
            status: DocumentRequestStatus::Pending,
            created_at: Utc::now(),
        };
        let result = diesel::insert_into(document_request::table)
            .values(new)
            .get_result::<DocumentRequest>(conn)?;
        Ok(result)
    }

    pub fn get_active_requests(conn: &mut PgConnection, onboarding_id: OnboardingId) -> DbResult<Vec<Self>> {
        let results = document_request::table
            .filter(document_request::onboarding_id.eq(onboarding_id))
            .filter(document_request::status.eq(DocumentRequestStatus::Pending))
            .load::<Self>(conn)?;

        Ok(results)
    }

    pub fn get(
        conn: &mut PgConnection,
        onboarding_id: OnboardingId,
        request_id: DocumentRequestId,
    ) -> DbResult<Self> {
        let result = document_request::table
            .filter(document_request::onboarding_id.eq(onboarding_id))
            .filter(document_request::id.eq(request_id))
            .first(conn)?;

        Ok(result)
    }

    pub fn update(self, conn: &mut PgConnection, update: DocumentRequestUpdate) -> DbResult<Self> {
        // Intentionally consume self so the stale version is not used
        let result = Self::update_by_id(conn, &self.id, update)?;
        Ok(result)
    }

    pub fn update_by_id(
        conn: &mut PgConnection,
        id: &DocumentRequestId,
        update: DocumentRequestUpdate,
    ) -> DbResult<Self> {
        let result = diesel::update(document_request::table)
            .filter(document_request::id.eq(id))
            .set(update)
            .get_result(conn)?;
        Ok(result)
    }
}

impl DocumentRequest {
    pub fn is_pending(&self) -> bool {
        self.status == DocumentRequestStatus::Pending
    }
}
#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = document_request)]
pub struct NewDocumentRequest {
    pub onboarding_id: OnboardingId,
    pub ref_id: Option<String>,
    pub status: DocumentRequestStatus,
    pub created_at: DateTime<Utc>,
}
