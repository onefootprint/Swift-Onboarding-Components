use super::entity;
use crate::auth::tenant::TenantAuth;
use crate::utils::db2api::DbToApi;
use crate::utils::vault_wrapper::Any;
use crate::utils::vault_wrapper::DecryptedData;
use crate::utils::vault_wrapper::TenantVw;
use newtypes::DupeKind;

pub type SameTenantDupeDetail<'a> = (
    Vec<DupeKind>,
    TenantVw<Any>,
    &'a Box<dyn TenantAuth>,
    DecryptedData,
);

impl<'a> DbToApi<SameTenantDupeDetail<'a>> for api_wire_types::SameTenantDupe {
    fn from_db((dupe_kinds, vw, auth, decrypted_data): SameTenantDupeDetail<'a>) -> Self {
        let status = entity::status_from_sv(&vw.scoped_vault);
        let data = entity::entity_attributes(&vw, auth, decrypted_data)
            .into_iter()
            // No reason to include all DIs - we only want to show the decrypted first name + last name
            .filter(|d| !d.transforms.is_empty() || d.value.is_some())
            .collect();

        api_wire_types::SameTenantDupe {
            dupe_kinds,
            fp_id: vw.scoped_vault.fp_id,
            status,
            start_timestamp: vw.scoped_vault.start_timestamp,
            data,
        }
    }
}
