use super::TenantVw;
use crate::errors::ApiResult;
use db::{models::data_lifetime::DataLifetime, TxnPgConn};
use newtypes::{output::Csv, DataIdentifier};

impl<Type> TenantVw<Type> {
    /// soft "delete" vault data by deactivating the data-lifetimes to prevent access
    #[tracing::instrument("TenantVw::soft_delete_vault", skip_all)]
    pub fn soft_delete_vault_data(
        &self,
        conn: &mut TxnPgConn,
        dis: Vec<DataIdentifier>,
    ) -> ApiResult<Vec<DataIdentifier>> {
        tracing::info!(dis=%Csv::from(dis.clone()), "Deleting DIs");
        let (dis, dls) = dis
            .into_iter()
            .flat_map(|di| self.data(&di).map(|d| (di, d)))
            // Only allow deleting data that hasn't been portablized so we don't accidentally
            // affect other tenants' view of the world.
            .filter(|(_, d)| d.is_speculative())
            // And to be extra safe, make sure this tenant added the data
            .filter(|(_, d)| d.lifetime.scoped_vault_id == self.scoped_vault.id)
            .map(|(di, d)| (di, d.lifetime.id.clone()))
            .unzip();

        let seqno = DataLifetime::get_next_seqno(conn.conn())?;
        let _ = DataLifetime::bulk_deactivate(conn.conn(), dls, seqno)?;

        Ok(dis)
    }
}
