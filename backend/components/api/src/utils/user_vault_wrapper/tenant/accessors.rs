use itertools::Itertools;
use newtypes::{DataIdentifier, IdDocKind, IdentityDataKind};

use super::TenantUvw;

// TODO: might be able to dedupe this logic
impl TenantUvw {
    /// Retrieve the fields that the tenant has requested/gotten authorized access to collect
    ///
    /// Note: This is not checking `READ` permissions of data, e.g. fields that the tenant can actually decrypt.
    ///    For that, use `ensure_scope_allows_access`. This is just for displaying what data the tenant _collected_.
    ///    This is what we display in /users, and it would be a little weird to collect, but then not display the info we collected anywhere.
    /// TODO migrate to DataIdentifier and DocumentType
    pub fn get_visible_populated_fields(&self) -> (Vec<IdentityDataKind>, Vec<IdDocKind>) {
        let must_collect = self
            .authorized_ob_configs
            .iter()
            .flat_map(|x| x.must_collect())
            .collect_vec();

        let accessible_id_data = self
            .get_populated_identity_fields()
            .into_iter()
            .filter(|x| must_collect.contains(&DataIdentifier::Id(*x)))
            .collect();
        let accessible_document_types = if must_collect.contains(&DataIdentifier::IdDocument) {
            self.identity_documents()
                .iter()
                .map(|i| i.document_type)
                .unique()
                .collect()
        } else {
            vec![]
        };
        (accessible_id_data, accessible_document_types)
    }
}
