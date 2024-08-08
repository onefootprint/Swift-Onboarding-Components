use crate::utils::db2api::DbToApi;
use db::models::tenant_tag::TenantTag;

impl DbToApi<TenantTag> for api_wire_types::OrgTenantTag {
    fn from_db(tt: TenantTag) -> Self {
        Self {
            id: tt.id,
            kind: tt.kind,
            tag: tt.tag,
        }
    }
}
