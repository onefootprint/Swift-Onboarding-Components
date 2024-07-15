use crate::models::data_lifetime::DataLifetime;
use crate::models::ob_configuration::IsLive;
use crate::DbResult;
use crate::PgConn;
use chrono::DateTime;
use chrono::Utc;
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
    // n.b. This query has been tuned for performance.
    let mut query = data_lifetime::table
        .inner_join(scoped_vault::table)
        .filter(scoped_vault::tenant_id.eq(tenant_id))
        .filter(scoped_vault::is_live.eq(is_live))
        .filter(diesel::dsl::not(diesel::dsl::exists(
            vault_dr_blob::table
                .filter(vault_dr_blob::dl_created_seqno.eq(data_lifetime::created_seqno))
                .filter(vault_dr_blob::config_id.eq(config_id)),
        )))
        .into_boxed();

    if let Some(fp_ids) = fp_id_filter {
        query = query.filter(scoped_vault::fp_id.eq_any(fp_ids));
    }

    let dls = query
        .select(DataLifetime::as_select())
        .order(data_lifetime::created_seqno)
        .limit(batch_size as i64)
        .load(conn)?;

    Ok(dls)
}

pub fn get_latest_vault_dr_backup_record_timestamp(
    conn: &mut PgConn,
    config_id: &VaultDrConfigId,
) -> DbResult<Option<DateTime<Utc>>> {
    let ts = vault_dr_blob::table
        .inner_join(data_lifetime::table)
        .filter(vault_dr_blob::config_id.eq(config_id))
        .select(data_lifetime::created_at)
        .order(vault_dr_blob::dl_created_seqno.desc())
        .first(conn)
        .optional()?;
    Ok(ts)
}

pub fn get_latest_vault_dr_online_record_timestamp(
    conn: &mut PgConn,
    tenant_id: &TenantId,
    is_live: IsLive,
) -> DbResult<Option<DateTime<Utc>>> {
    let ts = data_lifetime::table
        .inner_join(scoped_vault::table)
        .filter(scoped_vault::tenant_id.eq(tenant_id))
        .filter(scoped_vault::is_live.eq(is_live))
        .select(data_lifetime::created_at)
        .order(data_lifetime::created_seqno.desc())
        .first(conn)
        .optional()?;
    Ok(ts)
}
