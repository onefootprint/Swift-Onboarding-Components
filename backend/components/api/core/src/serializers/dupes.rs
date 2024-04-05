use crate::utils::{db2api::DbToApi, dupes::Dupes};


impl DbToApi<Dupes> for api_wire_types::Dupes {
    fn from_db(dupes: Dupes) -> Self {
        let same_tenant = dupes
            .same_tenant
            .into_iter()
            .map(|d| api_wire_types::SameTenantDupe {
                dupe_kinds: d.dupe_kinds,
                fp_id: d.sv.fp_id,
            })
            .collect();

        api_wire_types::Dupes {
            same_tenant,
            other_tenant: api_wire_types::OtherTenantDupes {
                num_matches: dupes.other_tenant.num_matches,
                num_tenants: dupes.other_tenant.num_tenants,
            },
        }
    }
}
