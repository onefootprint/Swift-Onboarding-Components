use super::WriteableVw;
use crate::errors::ApiResult;
use db::{models::data_lifetime::DataLifetime, TxnPgConn};
use newtypes::{output::Csv, DataIdentifier};

impl<Type> WriteableVw<Type> {
    /// soft "delete" vault data by deactivating the data-lifetimes to prevent access
    #[tracing::instrument("WriteableVw::soft_delete_vault", skip_all)]
    pub fn soft_delete_vault_data(
        // NOTE: VW becomes stale after this operation
        &self,
        conn: &mut TxnPgConn,
        dis: Vec<DataIdentifier>,
    ) -> ApiResult<Vec<DataIdentifier>> {
        if dis.is_empty() {
            return Ok(dis);
        }
        tracing::info!(dis=%Csv::from(dis.clone()), "Deleting DIs");
        let (dis, dls) = dis
            .into_iter()
            .flat_map(|di| self.data(&di).map(|d| (di, d)))
            // To be extra safe, make sure this tenant added the data
            .filter(|(_, d)| d.lifetime.scoped_vault_id == self.scoped_vault_id)
            .map(|(di, d)| (di, d.lifetime.id.clone()))
            .unzip();

        let seqno = DataLifetime::get_next_seqno(conn.conn())?;
        let _ = DataLifetime::bulk_deactivate(conn.conn(), dls, seqno)?;

        Ok(dis)
    }
}
