use crate::{schema::business_owner, DbResult, PgConn, TxnPgConn};
use diesel::prelude::*;
use newtypes::{BoId, ObConfigurationId, VaultId};

use super::scoped_vault::ScopedVault;

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

    pub fn list(
        conn: &mut PgConn,
        bv_id: &VaultId,
        ob_config_id: &ObConfigurationId,
    ) -> DbResult<Vec<(Self, ScopedVault)>> {
        use crate::schema::scoped_vault;
        let result = business_owner::table
            .filter(business_owner::business_vault_id.eq(bv_id))
            .inner_join(
                scoped_vault::table.on(scoped_vault::vault_id
                    .eq(business_owner::user_vault_id)
                    // Only get the ScopedVault for the owner's user vault that onboarded onto the
                    // same ob config
                    .and(scoped_vault::ob_configuration_id.eq(ob_config_id))),
            )
            .get_results(conn)?;
        Ok(result)
    }
}
