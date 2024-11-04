use crate::backfill::BatchBackfillRequest;
use crate::ProtectedAuth;
use actix_web::post;
use actix_web::web;
use actix_web::web::Json;
use api_core::utils::vault_wrapper::Business;
use api_core::utils::vault_wrapper::FingerprintedDataRequest;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::ApiResponse;
use api_core::State;
use api_errors::AssertionError;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db::models::business_owner::BusinessOwner;
use db::models::data_lifetime::DataLifetime;
use db::models::scoped_vault_version::ScopedVaultVersion;
use db::schema::business_owner;
use db::schema::data_lifetime;
use db::schema::scoped_vault;
use db::schema::vault_data;
use db::DbError;
use diesel::prelude::*;
use diesel::QueryDsl;
use itertools::Itertools;
use newtypes::BoId;
use newtypes::BusinessOwnerSource;
use newtypes::DataIdentifier as DI;
use newtypes::DataLifetimeId;
use newtypes::DataLifetimeSeqno;
use newtypes::DataLifetimeSource;
use newtypes::DataRequest;
use newtypes::DbActor;
use newtypes::PiiString;
use newtypes::ScopedVaultId;
use newtypes::SealedVaultBytes;
use newtypes::VaultDataFormat;
use newtypes::VaultId;

#[derive(serde::Serialize, macros::JsonResponder)]
#[allow(unused)]
struct BatchBackfillResponse {
    pub num_bos: usize,
    pub num_vault_updates: usize,
}

#[derive(Clone, Insertable)]
#[diesel(table_name = data_lifetime)]
struct NewDataLifetime {
    vault_id: VaultId,
    scoped_vault_id: ScopedVaultId,
    created_at: DateTime<Utc>,
    portablized_at: Option<DateTime<Utc>>,
    deactivated_at: Option<DateTime<Utc>>,
    created_seqno: DataLifetimeSeqno,
    portablized_seqno: Option<DataLifetimeSeqno>,
    deactivated_seqno: Option<DataLifetimeSeqno>,
    kind: DI,
    source: DataLifetimeSource,
    actor: Option<DbActor>,
    origin_id: Option<DataLifetimeId>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = vault_data)]
struct NewVaultData {
    lifetime_id: DataLifetimeId,
    kind: DI,
    e_data: SealedVaultBytes,
    p_data: Option<PiiString>,
    format: VaultDataFormat,
}

#[post("/private/backfill/bo_ownership_stake")]
pub async fn post(
    state: web::Data<State>,
    request: Json<BatchBackfillRequest<BoId>>,
    _: ProtectedAuth,
) -> ApiResponse<BatchBackfillResponse> {
    let BatchBackfillRequest {
        concurrency: _,
        entity_ids: bo_ids,
        shard_config: _,
    } = request.into_inner();

    let (num_bos, num_vault_updates) = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            // We don't need to lock the business_owner rows since we're only reading
            // ownership_stake and the vault_id, which are not updated.
            let db_bos: Vec<(BusinessOwner, ScopedVaultId)> = business_owner::table
                .inner_join(
                    scoped_vault::table.on(business_owner::business_vault_id.eq(scoped_vault::vault_id)),
                )
                .filter(business_owner::id.eq_any(&bo_ids))
                .select((business_owner::all_columns, scoped_vault::id))
                .load(conn.conn())
                .map_err(DbError::from)?;
            let num_bos = db_bos.len();

            let mut num_vault_updates = 0;
            for (bo, sv_id) in db_bos {
                tracing::info!("Backfilling for BO {}", bo.id);

                let bvw = VaultWrapper::<Business>::lock_for_onboarding(conn, &sv_id)?;

                #[allow(deprecated)]
                let ownership_stake: Option<u32> = bo
                    .ownership_stake
                    .map(|stake| stake.try_into())
                    .transpose()
                    .map_err(|_| AssertionError("can't convert ownership stake to a u32"))?;

                if ownership_stake.is_none() {
                    // There's no ownership stake in the DB to backfill.
                    continue;
                }

                let request =
                    DataRequest::empty().into_beneficial_owner_data(&bo.link_id, ownership_stake)?;
                let request = FingerprintedDataRequest::manual_fingerprints(request, vec![]);

                // If the new DI is already present on the vault, don't overwrite it. We've stopped
                // writing new ownership stakes to the DB, so the vault value at no older than the
                // DB value.
                let new_data = request
                    .data
                    .iter()
                    .map(|(di, pii)| (di.clone(), pii.clone()))
                    .collect_vec();
                if new_data.len() != 1 {
                    return AssertionError(&format!("Expected only one new DI, got {:?}", new_data)).into();
                }
                let (new_di, new_ownership_stake) =
                    new_data.into_iter().next().ok_or(AssertionError("No new DI"))?;
                if bvw.has_field(&new_di) {
                    continue;
                }

                let source = match bo.source {
                    BusinessOwnerSource::Hosted => DataLifetimeSource::LikelyHosted,
                    BusinessOwnerSource::Tenant => DataLifetimeSource::Tenant,
                };

                // Since we don't have an edit history for the ownership_stake column, we create the
                // new DL for the ownership_stake as if it were created in first vault write for the
                // business vault. This makes all historical constructions of the business vault
                // prior to the time of the backfill yield the DB ownership_stake value.
                let min_seqno_dl: Option<DataLifetime> = data_lifetime::table
                    .filter(data_lifetime::scoped_vault_id.eq(&bvw.scoped_vault.id))
                    .select(DataLifetime::as_select())
                    .order_by(data_lifetime::created_seqno)
                    .first(conn.conn())
                    .optional()
                    .map_err(DbError::from)?;

                let (created_at, created_seqno) = match min_seqno_dl {
                    Some(min_seqno_dl) => (min_seqno_dl.created_at, min_seqno_dl.created_seqno),
                    None => {
                        // No existing vault data for this vault.
                        // Patch at the current timestamp (not inserted retroactively).
                        tracing::info!("No existing vault data for BO {}", bo.id);

                        let txn = DataLifetime::new_sv_txn(conn, &bvw.sv)?;
                        let svv = ScopedVaultVersion::get_or_create(conn, &txn)?;

                        tracing::info!("Created SVV {:?}", &svv);

                        (Utc::now(), svv.seqno)
                    }
                };

                let new_dl = NewDataLifetime {
                    vault_id: bvw.vault.id.clone(),
                    scoped_vault_id: bvw.scoped_vault.id.clone(),
                    created_at,
                    portablized_at: None,
                    deactivated_at: None,
                    created_seqno,
                    portablized_seqno: None,
                    deactivated_seqno: None,
                    kind: new_di,
                    source,
                    actor: None,
                    origin_id: None,
                };

                let new_dl = diesel::insert_into(data_lifetime::table)
                    .values(new_dl)
                    .get_result::<DataLifetime>(conn.conn())
                    .map_err(DbError::from)?;

                let e_data = bvw.vault.public_key.seal_pii(&new_ownership_stake)?;

                let new_vd = NewVaultData {
                    lifetime_id: new_dl.id,
                    kind: new_dl.kind,
                    e_data,
                    p_data: Some(new_ownership_stake),
                    format: VaultDataFormat::String,
                };

                diesel::insert_into(vault_data::table)
                    .values(new_vd)
                    .execute(conn.conn())
                    .map_err(DbError::from)?;

                num_vault_updates += 1;
            }

            // Normally, we'd have to invalidate some SVVs at this point in order to trigger VDR to update the
            // historical DIs.
            // Luckily, Grid (the only tenant using VDR) is not using KYB so we can do this backfill without
            // worrying about VDR

            Ok((num_bos, num_vault_updates))
        })
        .await?;

    Ok(BatchBackfillResponse {
        num_bos,
        num_vault_updates,
    })
}
