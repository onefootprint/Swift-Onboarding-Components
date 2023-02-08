use super::TenantUvw;
use crate::auth::tenant::{CanDecrypt, IsGuardMet, TenantGuardDsl};
use itertools::Itertools;
use newtypes::{DataIdentifier, TenantScope};

impl TenantUvw {
    /// Returns the list of TenantScopes representing permissions to see data on this user vault.
    /// For portable vaults, the visible data is granted by approved onboarding configurations.
    /// For non-portable vaults, all data is visible
    fn can_see_scopes(&self) -> Vec<TenantScope> {
        if !self.user_vault.is_portable {
            // All fields are visible in non-portable vaults
            return vec![TenantScope::Admin];
        }

        // Visibility of fields in portable vaults is controlled by approved onboarding configs
        self.authorized_ob_configs
            .iter()
            .flat_map(|x| x.visible_scopes())
            // Always allowed to see custom data
            .chain([TenantScope::DecryptCustom])
            .collect_vec()
    }

    /// Retrieve the fields that the tenant is allowed to see exist. Any field that was requested
    /// to be collected (by an authorized ob config) is visible to the tenant.
    ///
    /// NOTE: This is different from whether the tenant can decrypt the data
    pub fn get_visible_populated_fields(&self) -> Vec<DataIdentifier> {
        let can_see_scopes = self.can_see_scopes();

        let id_data = self.get_populated_identity_fields().into_iter().map(|k| k.into());
        let kv_data = self.get_populated_custom_data().into_iter().map(|k| k.into());
        let id_docs = self
            .identity_documents()
            .iter()
            .flat_map(|i| {
                if i.selfie_image_s3_url.is_some() {
                    vec![
                        DataIdentifier::IdDocument(i.document_type),
                        DataIdentifier::Selfie(i.document_type),
                    ]
                } else {
                    vec![DataIdentifier::IdDocument(i.document_type)]
                }
            })
            .unique();

        id_docs
        .chain(id_data)
        .chain(kv_data)
        // Reuse the tenant auth codepaths to filter out DataIdentifiers on this UserVaultWrapper
        // that are visible given the approved onboarding configurations
        .filter(|x| {
            CanDecrypt::single(x.clone()).or_admin().is_met(&can_see_scopes)
        })
        .collect()
    }
}
