use crate::errors::ApiResult;
use db::models::document::{
    Document,
    DocumentImageArgs,
};
use db::models::document_upload::DocumentUpload;
use db::TxnPgConn;
use itertools::Itertools;
use newtypes::DocumentSide;

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
    id_doc: &Document,
    should_collect_selfie: bool,
    side: Option<DocumentSide>,
) -> ApiResult<(MissingSides, Option<i64>)> {
    let existing_sides = id_doc
        .images(conn, DocumentImageArgs::default())?
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
