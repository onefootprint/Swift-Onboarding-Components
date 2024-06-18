use crate::utils::db2api::DbToApi;
use db::models::scoped_vault_tag::ScopedVaultTag;

impl DbToApi<ScopedVaultTag> for api_wire_types::UserTag {
    fn from_db(tag: ScopedVaultTag) -> Self {
        api_wire_types::UserTag {
            id: tag.id,
            tag: tag.kind,
            created_at: tag.created_at,
        }
    }
}

impl DbToApi<ScopedVaultTag> for api_wire_types::EntityTag {
    fn from_db(tag: ScopedVaultTag) -> Self {
        api_wire_types::EntityTag {
            tag: tag.kind,
            created_at: tag.created_at,
        }
    }
}
