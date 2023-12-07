use api_core::{
    decision::vendor::incode::states::vault_complete_images, errors::ApiResult,
    utils::vault_wrapper::VaultWrapper, State,
};
use db::{
    models::{
        document_upload::DocumentUpload,
        identity_document::{IdentityDocument, IdentityDocumentUpdate},
        user_timeline::UserTimeline,
    },
    TxnPgConn,
};
use itertools::Itertools;
use newtypes::{DocumentSide, IdentityDocumentStatus, ScopedVaultId};

#[derive(derive_more::Deref)]
pub struct MissingSides(pub Vec<DocumentSide>);
impl MissingSides {
    pub fn next_side_to_collect(&self) -> Option<DocumentSide> {
        vec![DocumentSide::Front, DocumentSide::Back, DocumentSide::Selfie]
            .into_iter()
            .find(|s| self.contains(s))
    }
}

pub fn get_side_info(
    conn: &mut TxnPgConn,
    id_doc: &IdentityDocument,
    should_collect_selfie: bool,
    side: Option<DocumentSide>,
) -> ApiResult<(MissingSides, Option<i64>)> {
    let existing_sides = id_doc
        .images(conn, true)?
        .into_iter()
        .map(|u| u.side)
        .collect_vec();
    let required_sides = id_doc
        .document_type
        .sides()
        .into_iter()
        .chain(should_collect_selfie.then_some(DocumentSide::Selfie))
        .collect_vec();
    let missing_sides = required_sides
        .into_iter()
        .filter(|s| !existing_sides.contains(s))
        .collect_vec();

    let attempts_for_side = if let Some(dside) = side {
        DocumentUpload::count_failed_attempts(conn, &id_doc.id)?
            .iter()
            .filter_map(|(s, n)| (dside == *s).then_some(*n))
            .next()
    } else {
        None
    };
    Ok((MissingSides(missing_sides), attempts_for_side))
}

pub async fn complete_proof_of_ssn(
    state: &State,
    id_doc: IdentityDocument,
    sv_id: ScopedVaultId,
) -> ApiResult<()> {
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<()> {
            let id_doc_id = id_doc.id.clone();
            let dk = id_doc.document_type;
            let uvw = VaultWrapper::lock_for_onboarding(conn, &sv_id)?;
            // TODO: doc_type might need to come from incode once we get to that point
            let (_, seqno) = vault_complete_images(conn, &uvw, dk, &id_doc)?;
            // Create a timeline event
            let info = newtypes::IdentityDocumentUploadedInfo {
                id: id_doc_id.clone(),
            };
            UserTimeline::create(conn, info, uvw.vault.id.clone(), sv_id.clone())?;
            // mark identity doc as complete

            let update = IdentityDocumentUpdate {
                completed_seqno: Some(seqno),
                document_score: None,
                selfie_score: None,
                ocr_confidence_score: None,
                status: Some(IdentityDocumentStatus::Complete),
                vaulted_document_type: Some(dk),
            };
            IdentityDocument::update(conn, &id_doc_id, update)?;

            Ok(())
        })
        .await?;

    Ok(())
}
