use itertools::Itertools;
use newtypes::{DataIdentifier, IdDocKind, TenantScope};

use crate::auth::tenant::{CanDecrypt, IsGuardMet};

use super::TenantUvw;

impl TenantUvw {
    /// Retrieve the fields that the tenant is allowed to see exist. Any field that was requested
    /// to be collected (by an authorized ob config) is visible to the tenant.
    ///
    /// NOTE: This is different from whether the tenant can decrypt the data
    pub fn get_visible_populated_fields(&self) -> (Vec<DataIdentifier>, Vec<IdDocKind>) {
        let can_see_scopes = self
            .authorized_ob_configs
            .iter()
            .flat_map(|x| x.visible_scopes())
            .collect_vec();

        let id_data = self
            .get_populated_identity_fields()
            .into_iter()
            .map(DataIdentifier::from)
            .collect_vec();
        let id_docs = if can_see_scopes.contains(&TenantScope::DecryptDocuments) {
            self.identity_documents()
                .iter()
                .map(|i| i.document_type)
                .unique()
                .collect()
        } else {
            vec![]
        };

        let dis = id_data
            .into_iter()
            // Reuse the tenant auth codepaths to filter out DataIdentifiers on this UserVaultWrapper
            // that are visible given the approved onboarding configurations
            .filter(|x| CanDecrypt::single(x.clone()).is_met(&can_see_scopes))
            .collect();

        (dis, id_docs)
    }
}
