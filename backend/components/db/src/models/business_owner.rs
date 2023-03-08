use crate::{schema::business_owner, DbResult, TxnPgConn};
use diesel::prelude::*;
use newtypes::{BoId, VaultId};

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = business_owner)]
pub struct BusinessOwner {
    pub id: BoId,
    pub user_vault_id: VaultId,
    pub business_vault_id: VaultId,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = business_owner)]
struct NewBusinessOwnerRow {
    user_vault_id: VaultId,
    business_vault_id: VaultId,
}

impl BusinessOwner {
    #[tracing::instrument(skip(conn))]
    pub fn create(
        conn: &mut TxnPgConn,
        user_vault_id: VaultId,
        business_vault_id: VaultId,
    ) -> DbResult<Self> {
        let new = NewBusinessOwnerRow {
            user_vault_id,
            business_vault_id,
        };
        let result = diesel::insert_into(business_owner::table)
            .values(new)
            .get_result(conn.conn())?;
        Ok(result)
    }
}
