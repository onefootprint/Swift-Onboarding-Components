use crate::utils::db2api::DbToApi;
use db::models::tenant_frequent_note::TenantFrequentNote;

impl DbToApi<TenantFrequentNote> for api_wire_types::OrgFrequentNote {
    fn from_db(tfn: TenantFrequentNote) -> Self {
        Self {
            id: tfn.id,
            kind: tfn.kind,
            content: tfn.content,
        }
    }
}
