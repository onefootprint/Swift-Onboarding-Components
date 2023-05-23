use super::TenantVw;
use crate::{
    auth::{tenant::TenantGuardDsl, CanDecrypt, IsGuardMet},
    errors::ApiResult,
};
use db::{models::data_lifetime::DataLifetime, TxnPgConn};
use newtypes::{DataIdentifier, TenantScope};

impl<Type> TenantVw<Type> {
    /// soft "delete" vault data by deactivating the data-lifetimes to prevent access
    pub fn soft_delete_vault_data(
        &self,
        conn: &mut TxnPgConn,
        dis: Vec<DataIdentifier>,
    ) -> ApiResult<Vec<DataIdentifier>> {
        let can_see_scopes: Vec<TenantScope> = self.can_see_scopes();

        let (dis, dls) = dis
            .into_iter()
            .filter(|x| CanDecrypt::single(x.clone()).or_admin().is_met(&can_see_scopes))
            .filter_map(|di| self.get(di.clone()).map(|vd| (di, vd)))
            .map(|(di, vd)| (di, vd.lifetime_id.clone()))
            .unzip();

        let seqno = DataLifetime::get_next_seqno(conn.conn())?;
        let _ = DataLifetime::bulk_deactivate(conn.conn(), dls, seqno)?;

        Ok(dis)
    }
}
