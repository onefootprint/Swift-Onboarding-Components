use crate::auth::{CanDecrypt, IsGuardMet};

use super::TenantVw;
use itertools::Itertools;
use newtypes::DataIdentifier;

impl<Type> TenantVw<Type> {
    /// Retrieve the fields that the tenant is allowed to see exist.
    ///
    /// NOTE: This is different from whether the tenant can decrypt the data
    pub fn get_visible_populated_fields(&self) -> Vec<DataIdentifier> {
        // Right now, this is a simple shim method, but we might change this logic in the future
        // so it helps to group callsites
        // TODO do we want to filter out portable data added by other tenants that isn't requested
        // by the ob config?
        // For ex, if another tenant adds a portable credit card, should this tenant be able to see it?
        self.populated_dis()
    }

    /// Determines if a provided DI is decryptable.
    /// Only DIs that were not authorized by the onboarding config are unable to be decrypted.
    pub fn can_decrypt(&self, di: DataIdentifier) -> bool {
        if self.portable.populated_dis().contains(&di) {
            // TODO this condition should include `&& not added by this tenant` to support the case
            // where progressively collected data is made portable
            let can_decrypt_scopes = self
                .onboarding
                .iter()
                .flat_map(|ob| ob.can_decrypt_scopes())
                .collect_vec();
            // If portable (TODO and not added by this tenant), decryptable if the ob config allows it
            CanDecrypt::single(di).is_met(&can_decrypt_scopes)
        } else {
            let cannot_decrypt_scopes = self
                .onboarding
                .iter()
                .flat_map(|ob| ob.cannot_decrypt_scopes())
                .collect_vec();
            // If not portable (TODO or added by this tenant), decryptable if the ob config doesn't _dis_allow it.
            !CanDecrypt::single(di).is_met(&cannot_decrypt_scopes)
        }
    }
}
