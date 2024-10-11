use crate::backfill::BatchBackfillRequest;
use crate::ProtectedAuth;
use actix_web::post;
use actix_web::web;
use actix_web::web::Json;
use api_core::enclave_client::DecryptReq;
use api_core::ApiResponse;
use api_core::State;
use api_errors::FpResult;
use api_errors::ValidationError;
use chrono::DateTime;
use chrono::Utc;
use db::models::business_owner::BusinessOwner;
use db::models::business_owner::NewSecondaryBo;
use db::models::data_lifetime::DataLifetime;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use db::models::vault_data::VaultData;
use db::schema::business_owner;
use db::schema::data_lifetime;
use db::schema::vault;
use db::schema::vault_data;
use db::DbError;
use db::TxnPgConn;
use diesel::prelude::*;
use diesel::QueryDsl;
use futures::StreamExt;
use itertools::Itertools;
use newtypes::BoLinkId;
use newtypes::BusinessDataKind as BDK;
use newtypes::BusinessOwnerData;
use newtypes::BusinessOwnerKind;
use newtypes::DataIdentifier as DI;
use newtypes::DataLifetimeId;
use newtypes::DataLifetimeSeqno;
use newtypes::DataLifetimeSource;
use newtypes::DbActor;
use newtypes::IdentityDataKind as IDK;
use newtypes::PiiString;
use newtypes::ScopedVaultId;
use newtypes::SealedVaultBytes;
use newtypes::VaultDataFormat;
use newtypes::VaultId;
use std::collections::HashMap;

#[derive(serde::Serialize, macros::JsonResponder)]
#[allow(unused)]
struct BatchBackfillResponse {
    pub num_rows: usize,
    pub errors: HashMap<ScopedVaultId, String>,
}

#[post("/private/backfill/bos_non_kyced")]
pub async fn post(
    state: web::Data<State>,
    request: Json<BatchBackfillRequest<ScopedVaultId>>,
    _: ProtectedAuth,
) -> ApiResponse<BatchBackfillResponse> {
    let BatchBackfillRequest {
        concurrency,
        entity_ids: sv_ids,
        shard_config: _,
    } = request.into_inner();

    let dls: Vec<_> = state
        .db_pool
        .db_query(move |conn| {
            data_lifetime::table
                .filter(data_lifetime::kind.eq(DI::Business(BDK::BeneficialOwners)))
                // Since `business.beneficial_owners` could be updated, we could have multiple. Only want to
                // take the active one
                .filter(data_lifetime::deactivated_seqno.is_null())
                .inner_join(vault_data::table)
                .inner_join(vault::table)
                .filter(data_lifetime::scoped_vault_id.eq_any(sv_ids))
                .get_results::<(DataLifetime, VaultData, Vault)>(conn)
                .map_err(DbError::from)
        })
        .await?;

    let data = dls
        .iter()
        .map(|(dl, vd, v)| {
            let req = DecryptReq(&v.e_private_key, &vd.e_data, vec![]);
            ((dl.clone(), vd.clone(), v.clone()), req)
        })
        .collect();
    let decrypted_data = state.enclave_client.batch_decrypt_to_piistring(data).await?;

    let futs = decrypted_data
        .into_iter()
        .map(|((dl, _, v), bos)| async {
            let sv_id = dl.scoped_vault_id.clone();
            let result = state
                .db_pool
                .db_transaction(move |conn| backfill_dl(conn, dl, v, bos))
                .await;
            match result {
                Ok(r) => Ok((sv_id, r)),
                Err(e) => Err((sv_id, e)),
            }
        })
        .collect_vec();
    let futs = futures::stream::iter(futs).buffer_unordered(concurrency);
    let (success, errors): (Vec<_>, Vec<_>) = futs.collect::<Vec<_>>().await.into_iter().partition_result();
    let errors = errors
        .into_iter()
        .map(|(sv_id, e)| (sv_id, e.to_string()))
        .collect();

    let num_rows = success.iter().flat_map(|(_, updated)| updated.then_some(1)).sum();

    let response = BatchBackfillResponse { num_rows, errors };
    Ok(response)
}

fn backfill_dl(conn: &mut TxnPgConn, dl: DataLifetime, v: Vault, vault_bos: PiiString) -> FpResult<bool> {
    ScopedVault::lock(conn, &dl.scoped_vault_id)?;

    let kyced_bos = data_lifetime::table
        .filter(data_lifetime::kind.eq(DI::Business(BDK::KycedBeneficialOwners)))
        .filter(data_lifetime::scoped_vault_id.eq(&dl.scoped_vault_id))
        .get_results::<DataLifetime>(conn.conn())
        .map_err(DbError::from)?;
    if !kyced_bos.is_empty() {
        // Already backfilled into KycedBos
        return Ok(false);
    }

    let db_bos = business_owner::table
        .filter(business_owner::business_vault_id.eq(&dl.vault_id))
        .get_results::<BusinessOwner>(conn.conn())
        .map_err(DbError::from)?;
    if db_bos.is_empty() {
        return ValidationError(&format!(
            "User with kyced BOs doesn't have any BO rows: {}",
            dl.scoped_vault_id
        ))
        .into();
    }

    // TODO need to short circuit if this work has already been done, maybe if primary bo has ownership
    // stake?

    let primary_bo = db_bos.iter().find(|bo| bo.kind == BusinessOwnerKind::Primary);
    if primary_bo.is_some_and(|bo| bo.ownership_stake.is_some()) {
        // Already updated
        return Ok(false);
    }

    let vault_bos: Vec<BusinessOwnerData> = vault_bos.deserialize()?;
    let mut vault_bos = vault_bos.into_iter();
    let primary_bo = vault_bos.next();

    // Backfill primary BO ownership stake
    if let Some(primary_bo) = primary_bo {
        let link_id = BoLinkId::generate(BusinessOwnerKind::Primary);
        let ownership_stake = primary_bo.ownership_stake as i32;
        BusinessOwner::update_ownership_stake(conn, &dl.vault_id, &link_id, ownership_stake)?;
    }

    // Make a secondary BO for each remaining BO
    let secondary_bos = vault_bos
        .map(|bo| (BoLinkId::generate(BusinessOwnerKind::Secondary), bo))
        .collect_vec();
    let new_bos = secondary_bos
        .iter()
        .map(|(link_id, bo)| NewSecondaryBo {
            link_id: link_id.clone(),
            ownership_stake: bo.ownership_stake as i32,
        })
        .collect_vec();
    BusinessOwner::bulk_create_secondary(conn, new_bos, &dl.vault_id)?;

    //
    // Now, actually backfill the data for the new DIs
    //

    let extra_data = secondary_bos
        .into_iter()
        .flat_map(|(link_id, bo)| {
            let bo_di =
                |idk| DI::Business(BDK::BeneficialOwnerData(link_id.clone(), Box::new(DI::from(idk))));
            vec![
                Some((bo_di(IDK::FirstName), bo.first_name)),
                Some((bo_di(IDK::LastName), bo.last_name)),
            ]
        })
        .flatten()
        .collect_vec();

    // Make a new backdated DL for every piece of vault data we're about to insert
    let new_dls = extra_data
        .iter()
        .map(|(di, _)| NewDataLifetime {
            vault_id: dl.vault_id.clone(),
            scoped_vault_id: dl.scoped_vault_id.clone(),
            created_at: dl.created_at,
            portablized_at: dl.portablized_at,
            deactivated_at: dl.deactivated_at,
            created_seqno: dl.created_seqno,
            portablized_seqno: dl.portablized_seqno,
            deactivated_seqno: dl.deactivated_seqno,
            kind: di.clone(),
            source: dl.source,
            actor: dl.actor.clone(),
            origin_id: dl.origin_id.clone(),
        })
        .collect_vec();
    let new_dls = diesel::insert_into(data_lifetime::table)
        .values(new_dls)
        .get_results::<DataLifetime>(conn.conn())
        .map_err(DbError::from)?;
    let mut new_dls: HashMap<_, _> = new_dls.into_iter().map(|dl| (dl.kind.clone(), dl)).collect();

    let new_vd = extra_data
        .into_iter()
        .map(|(di, pii)| -> FpResult<_> {
            let e_data = v.public_key.seal_pii(&pii)?;
            let new_dl = new_dls.remove(&di).ok_or(ValidationError("No DL found"))?;
            let new_vd = NewVaultDataRow {
                lifetime_id: new_dl.id,
                kind: new_dl.kind,
                e_data,
                p_data: None,
                format: VaultDataFormat::String,
            };
            Ok(new_vd)
        })
        .collect::<FpResult<Vec<_>>>()?;

    diesel::insert_into(vault_data::table)
        .values(new_vd)
        .execute(conn.conn())
        .map_err(DbError::from)?;

    // Normally, we'd have to invalidate some SVVs at this point in order to trigger VDR to update the
    // historical DIs.
    // Luckily, Grid (the only tenant using VDR) is not using KYB so we can do this backfill without
    // worrying about VDR

    Ok(true)
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
struct NewVaultDataRow {
    lifetime_id: DataLifetimeId,
    kind: DI,
    e_data: SealedVaultBytes,
    p_data: Option<PiiString>,
    format: VaultDataFormat,
}
