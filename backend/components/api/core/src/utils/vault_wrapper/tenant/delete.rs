use super::TenantVw;
use crate::errors::ApiResult;
use db::{models::data_lifetime::DataLifetime, TxnPgConn};
use newtypes::DataIdentifier;

impl<Type> TenantVw<Type> {
    /// soft "delete" vault data by deactivating the data-lifetimes to prevent access
    #[tracing::instrument("TenantVw::soft_delete_vault", skip_all)]
    pub fn soft_delete_vault_data(
        &self,
        conn: &mut TxnPgConn,
        dis: Vec<DataIdentifier>,
    ) -> ApiResult<Vec<DataIdentifier>> {
        tracing::info!(dis=?dis, "Deleting DIs");
        let (dis, dls) = dis
            .into_iter()
            // Only allow deleting speculative data so we don't accidentally affect other tenants'
            // view of the world.
            .filter_map(|di| self.speculative.get(di.clone()).map(|vd| (di, vd)))
            .map(|(di, vd)| (di, vd.lifetime_id().clone()))
            .unzip();

        let seqno = DataLifetime::get_next_seqno(conn.conn())?;
        let _ = DataLifetime::bulk_deactivate(conn.conn(), dls, seqno)?;

        Ok(dis)
    }
}
