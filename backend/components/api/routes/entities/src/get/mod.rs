use std::collections::HashMap;

use crate::utils;
use crate::utils::vault_wrapper::TenantUvw;
use api_core::serializers::UserDetail;
use api_core::utils::db2api::DbToApi;
use api_wire_types::IdentityDocumentKindForUser;
use db::models::onboarding::SerializableOnboardingInfo;
use db::models::scoped_vault::ScopedVault;
use newtypes::BusinessDataKind as BDK;
use newtypes::DataIdentifier;
use newtypes::IdDocKind;
use newtypes::IdentityDataKind as IDK;

pub mod detail;
pub mod list;

type EntityDetailResponse = api_wire_types::Entity;
type EntityListResponse = Vec<EntityDetailResponse>;

/// Shared logic to map info on an entity into its serialized form.
/// Pulled out since we do some special logic to decrypt certain attributes
fn serialize_entity<T>(sv: ScopedVault, vw: &TenantUvw, ob: Option<SerializableOnboardingInfo>) -> T
where
    T: DbToApi<UserDetail>,
{
    // We only allow tenants to see data in the vault that they have requested to collected and ob config has been authorized
    let (attrs, idks, document_types, selfie_document_types) = get_visible_populated_fields(vw);
    let is_portable = vw.vault.is_portable;
    let doc_types: Vec<IdentityDocumentKindForUser> =
        create_identity_document_info_for_user(vw, document_types, selfie_document_types);
    // Don't require any permissions to decrypt business name - always show it in plaintext
    let plaintext_dis: Vec<DataIdentifier> = vec![BDK::Name.into()];
    let visible: HashMap<_, _> = plaintext_dis
        .into_iter()
        .flat_map(|di| vw.get_p_data(di.clone()).map(|p_data| (di, p_data.clone())))
        .collect();
    let vault_kind = vw.vault().kind;
    T::from_db((idks, doc_types, attrs, ob, sv, is_portable, vault_kind, visible))
}

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
