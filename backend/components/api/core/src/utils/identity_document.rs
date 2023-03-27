use std::collections::HashMap;

use api_wire_types::UserFacingCollectedDocumentStatus;
use chrono::{DateTime, Utc};
use db::{
    models::{document_request::DocumentRequest, identity_document::IdentityDocument},
    PgConn,
};
use newtypes::{DocumentRequestStatus, IdDocKind, IdentityDocumentId};

use crate::errors::ApiError;

type CollectedSelfie = bool;
pub type IdDocumentData = (
    IdDocKind,
    CollectedSelfie,
    UserFacingCollectedDocumentStatus,
    DateTime<Utc>,
);
/// Expose a status for a particular uploaded document.
pub fn user_facing_status_for_document(
    document_request: &DocumentRequest,
) -> Option<UserFacingCollectedDocumentStatus> {
    match document_request.status {
        DocumentRequestStatus::Failed => Some(UserFacingCollectedDocumentStatus::Fail),
        DocumentRequestStatus::Complete => Some(UserFacingCollectedDocumentStatus::Success),
        // If doc request is not in failed/complete, there's nothing to return
        // this is kept completely enumerated so that we don't miss doc request status variants
        DocumentRequestStatus::Pending => None,
        DocumentRequestStatus::Uploaded => None,
        DocumentRequestStatus::UploadFailed => None,
    }
}

pub fn create_user_facing_status_for_documents(
    conn: &mut PgConn,
    identity_document_ids: Vec<&IdentityDocumentId>,
) -> Result<HashMap<IdentityDocumentId, IdDocumentData>, ApiError> {
    let map = IdentityDocument::get_bulk_with_requests(conn, identity_document_ids)?
        .into_iter()
        .filter_map(|(id, (id_doc, doc_request))| {
            user_facing_status_for_document(&doc_request).map(|s| {
                (
                    id,
                    (
                        id_doc.document_type,
                        id_doc_collected_selfie(&id_doc),
                        s,
                        id_doc.created_at,
                    ),
                )
            })
        })
        .collect();

    Ok(map)
}

/// helper to see if we collected a selfie alongside an identity doc
pub fn id_doc_collected_selfie(doc: &IdentityDocument) -> bool {
    doc.selfie_image_s3_url.is_some()
}
