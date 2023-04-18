use super::TenantUvw;
use crate::auth::{tenant::TenantGuardDsl, CanDecrypt, IsGuardMet};
use itertools::Itertools;
use newtypes::{DataIdentifier, TenantScope};

impl<Type> TenantUvw<Type> {
    /// Returns the list of TenantScopes representing permissions to see data on this user vault.
    /// For portable vaults, the visible data is granted by approved onboarding configurations.
    /// For non-portable vaults, all data is visible
    fn can_see_scopes(&self) -> Vec<TenantScope> {
        if !self.vault.is_portable {
            // All fields are visible in non-portable vaults
            return vec![TenantScope::Admin];
        }

        // Visibility of fields in portable vaults is controlled by onboarding configs.
        self.onboarding
            .iter()
            .flat_map(|ob| ob.visible_scopes())
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

        self.populated_dis()
        .into_iter()
        // Reuse the tenant auth codepaths to filter out DataIdentifiers on this VaultWrapper
        // that are visible given the approved onboarding configurations
        .filter(|x| {
            CanDecrypt::single(x.clone()).or_admin().is_met(&can_see_scopes)
        })
        .collect()
    }
}
