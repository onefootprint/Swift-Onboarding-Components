use crate::{EntityAttribute, EntityStatus};
use chrono::{DateTime, Utc};
use newtypes::{DupeKind, FpId};
use paperclip::actix::Apiv2Schema;
use serde::Serialize;

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct Dupes {
    pub same_tenant: Vec<SameTenantDupe>,
    pub other_tenant: OtherTenantDupes,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct SameTenantDupe {
    pub dupe_kinds: Vec<DupeKind>,
    pub fp_id: FpId,
    pub status: Option<EntityStatus>,
    pub start_timestamp: DateTime<Utc>,
    pub data: Vec<EntityAttribute>,
}

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct OtherTenantDupes {
    pub num_matches: usize, // number of distinct vaults that (1) have any sort of dupe match and (2) have not onboarded onto the same tenant as the the scoped_vault for which dupes are being queried for
    pub num_tenants: usize, // number of distinct tenants from the vaults described above ^
}
