use crate::auth::{CanDecrypt, IsGuardMet};

use super::TenantVw;
use itertools::Itertools;
use newtypes::DataIdentifier;

impl<Type> TenantVw<Type> {
    /// Returns true if the DI was request to be collected by the onboarding config
    fn is_in_must_collect(&self, di: &DataIdentifier) -> bool {
        let must_collect = self
            .workflows
            .iter()
            .flat_map(|ob| ob.must_collect_scopes())
            .collect_vec();
        CanDecrypt::single(di.clone()).is_met(&must_collect)
    }

    /// Retrieve the fields that the tenant is allowed to see exist.
    ///
    /// NOTE: This is different from whether the tenant can decrypt the data
    pub fn get_visible_populated_fields(&self) -> Vec<DataIdentifier> {
        self.populated_dis()
            .into_iter()
            .filter(|di| self.can_see(di.clone()))
            .collect()
    }
}

impl<Type> TenantVw<Type> {
    /// Determines if the provided DI is visible through this VW.
    /// TODO make this private again after migration
    pub fn can_see(&self, di: DataIdentifier) -> bool {
        if self.is_in_must_collect(&di) {
            true
        } else {
            // If the piece of data wasn't requested to be collected, it is visible as long as
            // it was added by this tenant.
            self.get_lifetime(di)
                .map(|l| l.scoped_vault_id == self.scoped_vault.id)
                .unwrap_or_default()
        }
    }

    /// Determines if a provided DI is decryptable through this VW by the provided tenant, checking
    /// ob config can access rules.
    pub fn tenant_can_decrypt(&self, di: DataIdentifier) -> bool {
        if self.is_in_must_collect(&di) {
            // If the piece of data was requested to be collected, it is decryptable as long as the
            // workflow was authorized and the field is in can_decrypt
            let can_decrypt_scopes = self
                .workflows
                .iter()
                .flat_map(|wf| wf.can_decrypt_scopes())
                .collect_vec();
            CanDecrypt::single(di).is_met(&can_decrypt_scopes)
        } else {
            // If the piece of data wasn't requested to be collected, it is decryptable as long as
            // it was added by this tenant.
            self.get_lifetime(di)
                .map(|l| l.scoped_vault_id == self.scoped_vault.id)
                .unwrap_or_default()
        }
    }

    /// Returns true if there's data on this VW that was added by another tenant
    /// NOTE: our notion of one-click will evolve... it should be playbook-aware so we know which
    /// fields are being one-clicked
    pub fn is_one_click(&self) -> bool {
        // NOTE: be careful making changes to this. It affects implicit auth and authorization.
        self.populated_dis().into_iter().any(|di| {
            let Some(dl) = self.get_lifetime(di.clone()) else {
                return true; // Shouldn't happen
            };
            // This is a one-click onboarding IF there's data added by another scoped vault OR
            // there's exists data that isn't currently decryptable
            dl.scoped_vault_id != self.scoped_vault.id || !self.tenant_can_decrypt(di)
        })
    }
}
