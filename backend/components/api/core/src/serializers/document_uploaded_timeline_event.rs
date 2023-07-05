use db::models::document_data::DocumentData;

use crate::utils::db2api::DbToApi;

impl DbToApi<DocumentData> for api_wire_types::DocumentUploadedTimelineEvent {
    fn from_db(doc: DocumentData) -> Self {
        Self { identifier: doc.kind }
    }
}
