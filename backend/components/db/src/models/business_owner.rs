use newtypes::{BoId, VaultId};

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = business_owner)]
pub struct BusinessOwner {
    pub id: BoId,
    pub user_vault_id: VaultId,
    pub business_vault_id: VaultId,
}
