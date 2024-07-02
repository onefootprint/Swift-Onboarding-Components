use crate::models::data_lifetime::DataLifetime;
use crate::models::ob_configuration::IsLive;
use crate::DbResult;
use crate::PgConn;
use db_schema::schema::data_lifetime;
use db_schema::schema::scoped_vault;
use db_schema::schema::vault_dr_blob;
use diesel::prelude::*;
use diesel::QueryDsl;
use newtypes::FpId;
use newtypes::TenantId;
use newtypes::VaultDrConfigId;


// Load up to `batch_size` DataLifetime records for the given tenant/is_live that do not have
// corresponding blobs for the given config.
pub fn load_vault_dr_data_lifetime_batch(
    conn: &mut PgConn,
    tenant_id: &TenantId,
    is_live: IsLive,
    config_id: &VaultDrConfigId,
    batch_size: u32,
    fp_id_filter: Option<Vec<FpId>>,
) -> DbResult<Vec<DataLifetime>> {
    let mut query = data_lifetime::table
        .inner_join(scoped_vault::table)
        .left_join(
            vault_dr_blob::table.on(vault_dr_blob::dl_created_seqno
                .eq(data_lifetime::created_seqno)
                .and(vault_dr_blob::config_id.eq(config_id))),
        )
        .filter(scoped_vault::tenant_id.eq(tenant_id))
        .filter(scoped_vault::is_live.eq(is_live))
        .into_boxed();

    if let Some(fp_ids) = fp_id_filter {
        query = query.filter(scoped_vault::fp_id.eq_any(fp_ids));
    }

    let dls = query
        .filter(vault_dr_blob::id.is_null())
        .select(DataLifetime::as_select())
        .order(data_lifetime::created_seqno)
        .limit(batch_size as i64)
        .load(conn)?;

    Ok(dls)
}
