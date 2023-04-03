use crate::utils;
use crate::utils::vault_wrapper::TenantUvw;
use api_wire_types::IdentityDocumentKindForUser;
use newtypes::DataIdentifier;
use newtypes::IdDocKind;
use newtypes::IdentityDataKind as IDK;

pub mod detail;
pub mod list;

type EntityDetailResponse = api_wire_types::Entity;
type EntityListResponse = Vec<EntityDetailResponse>;

/// The UVW util to get_visible_populated_fields() has been updated to only return the more
/// modern DataIdentifiers.
/// This partition map logic converts the modern DataIdentifiers into the legacy IdentityDataKind
/// and IdDocKind. This will be removed when `GET /users` is modernized to return a list of
/// DataIdentifiers
fn get_visible_populated_fields(
    vw: &TenantUvw,
) -> (Vec<DataIdentifier>, Vec<IDK>, Vec<IdDocKind>, Vec<IdDocKind>) {
    let attributes = vw.get_visible_populated_fields();
    let mut idks = Vec::<IDK>::new();
    let mut docs = Vec::<IdDocKind>::new();
    let mut selfies = Vec::<IdDocKind>::new();
    attributes.iter().cloned().for_each(|di| match di {
        DataIdentifier::Id(idk) => idks.push(idk),
        DataIdentifier::IdDocument(doc_kind) => docs.push(doc_kind),
        DataIdentifier::Selfie(doc_kind) => selfies.push(doc_kind),
        _ => (),
    });

    (attributes, idks, docs, selfies)
}

fn create_identity_document_info_for_user(
    vw: &TenantUvw,
    document_types: Vec<IdDocKind>,
    selfie_document_types: Vec<IdDocKind>,
) -> Vec<IdentityDocumentKindForUser> {
    vw.identity_documents()
        .iter()
        .filter(|id_doc_and_req| document_types.contains(&id_doc_and_req.document_type))
        .filter_map(|id_doc_and_req| {
            utils::identity_document::user_facing_status_for_document(&id_doc_and_req.document_request).map(
                |status| {
                    // we could have collected selfie, but user did not authorize it
                    let selfie_collected = utils::identity_document::id_doc_collected_selfie(id_doc_and_req)
                        && selfie_document_types.contains(&id_doc_and_req.document_type);
                    IdentityDocumentKindForUser {
                        // Supporting this for backwards compatibility
                        kind: id_doc_and_req.document_type,
                        // Provide fully-fledged identifier to the frontend
                        data_identifier: DataIdentifier::IdDocument(id_doc_and_req.document_type),
                        status,
                        selfie_collected,
                    }
                },
            )
        })
        .collect()
}
