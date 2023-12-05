use crate::auth::{CanDecrypt, IsGuardMet};

use super::TenantVw;
use itertools::Itertools;
use newtypes::DataIdentifier;

impl<Type> TenantVw<Type> {
    /// Returns true if the DI was request to be collected by a playbook that has been onboarded onto
    fn is_collected_by_playbooks(&self, di: &DataIdentifier) -> bool {
        let must_collect = self
            .workflows
            .iter()
            .flat_map(|ob| ob.collection_scopes())
            .collect_vec();
        CanDecrypt::single(di.clone()).is_met(&must_collect)
    }

    /// Determines if a provided DI is decryptable through this VW by the provided tenant, checking
    /// ob config can access rules.
    pub fn tenant_can_decrypt(&self, di: DataIdentifier) -> bool {
        if self.is_collected_by_playbooks(&di) {
            // If the piece of data was requested to be collected, it is decryptable as long as the
            // workflow was authorized and the field is in can_decrypt
            let can_decrypt_scopes = self
                .workflows
                .iter()
                .flat_map(|wf| wf.can_decrypt_scopes())
                .collect_vec();
            CanDecrypt::single(di).is_met(&can_decrypt_scopes)
        } else {
            // If the piece of data wasn't requested to be collected, it was added via API by the
            // tenant and should be decryptable
            true
        }
    }

    /// Returns true if authorizing this workflow won't immediately give additional access to
    /// anything new.
    /// When true, we create new Workflows as auto-authorized and skip the authorize screen.
    /// NOTE: our notion of one-click will evolve... it should be playbook-aware so we know which
    /// fields are being one-clicked
    /// NOTE: be careful making changes to this. It affects implicit auth and wf authorization.
    pub fn can_auto_authorize(&self, has_prefill_data: bool) -> bool {
        let can_decrypt_all_dis = self
            .populated_dis()
            .into_iter()
            .all(|di| self.tenant_can_decrypt(di));
        !has_prefill_data && can_decrypt_all_dis
    }
}
