use crate::{
    auth::tenant::TenantAuth,
    utils::{
        db2api::DbToApi,
        dupes::{OtherTenantDupes, SameTenantDupe},
        vault_wrapper::{Any, DecryptedData, TenantVw},
    },
};

use super::entity;


impl
    DbToApi<(
        Vec<api_wire_types::SameTenantDupe>,
        api_wire_types::OtherTenantDupes,
    )> for api_wire_types::Dupes
{
    fn from_db(
        (same_tenant, other_tenant): (
            Vec<api_wire_types::SameTenantDupe>,
            api_wire_types::OtherTenantDupes,
        ),
    ) -> Self {
        api_wire_types::Dupes {
            same_tenant,
            other_tenant,
        }
    }
}

impl DbToApi<OtherTenantDupes> for api_wire_types::OtherTenantDupes {
    fn from_db(other_tenant_dupes: OtherTenantDupes) -> Self {
        api_wire_types::OtherTenantDupes {
            num_matches: other_tenant_dupes.num_matches,
            num_tenants: other_tenant_dupes.num_tenants,
        }
    }
}

pub type SameTenantDupeDetail<'a> = (
    SameTenantDupe,
    &'a TenantVw<Any>,
    &'a Box<dyn TenantAuth>,
    DecryptedData,
);

impl<'a> DbToApi<SameTenantDupeDetail<'a>> for api_wire_types::SameTenantDupe {
    fn from_db((dupe, vw, auth, decrypted_data): SameTenantDupeDetail<'a>) -> Self {
        let status = entity::status_from_sv(&dupe.scoped_vault);
        let data = entity::entity_attributes(vw, auth, decrypted_data);

        api_wire_types::SameTenantDupe {
            dupe_kinds: dupe.dupe_kinds,
            fp_id: dupe.scoped_vault.fp_id,
            status,
            start_timestamp: dupe.scoped_vault.start_timestamp,
            data,
        }
    }
}
