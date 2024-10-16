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
use newtypes::BusinessDataKind as BDK;
use newtypes::DataIdentifier as DI;
use newtypes::DataLifetimeId;
use newtypes::DataLifetimeSeqno;
use newtypes::DataLifetimeSource;
use newtypes::DbActor;
use newtypes::IdentityDataKind as IDK;
use newtypes::KycedBusinessOwnerData;
use newtypes::PiiString;
use newtypes::ScopedVaultId;
use newtypes::SealedVaultBytes;
use newtypes::VaultDataFormat;
use newtypes::VaultId;
use std::collections::HashMap;
use std::collections::HashSet;

#[derive(serde::Serialize, macros::JsonResponder)]
#[allow(unused)]
struct BatchBackfillResponse {
    pub num_rows: usize,
    pub errors: HashMap<ScopedVaultId, String>,
}

#[post("/private/backfill/bos")]
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
        .db_query(move |conn| {
            data_lifetime::table
                .filter(data_lifetime::kind.eq(DI::Business(BDK::KycedBeneficialOwners)))
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

fn backfill_dl(conn: &mut TxnPgConn, dl: DataLifetime, v: Vault, kyced_bos: PiiString) -> FpResult<bool> {
    let mut updated = false;
    ScopedVault::lock(conn, &dl.scoped_vault_id)?;
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

    let vault_bos: Vec<KycedBusinessOwnerData> = kyced_bos.deserialize()?;
    let vault_bo_link_ids: HashSet<_> = vault_bos.iter().map(|bo| &bo.link_id).collect();
    let db_bo_link_ids: HashSet<_> = db_bos.iter().map(|bo| &bo.link_id).collect();

    if vault_bo_link_ids != db_bo_link_ids {
        // Validation while we are here
        return ValidationError(&format!(
            "User's BusinessOwner rows don't match KycedBeneficialOwners vault data: {}",
            dl.scoped_vault_id
        ))
        .into();
    }

    // Backfill the ownership_stake for each business_owner row in the DB
    // TODO also backfill primary ownership stake for users written before we started saving it. Maybe
    // will do this in a second backfill after this one
    for vault_bo in vault_bos.iter() {
        let db_bo = db_bos
            .iter()
            .find(|bo| bo.link_id == vault_bo.link_id)
            .ok_or(ValidationError("No BO"))?;
        let existing_stake = db_bo.ownership_stake;
        let new_stake = vault_bo.ownership_stake as i32;
        if existing_stake.is_some_and(|db_bo| db_bo == new_stake) {
            continue;
        }

        if existing_stake.is_some_and(|db_bo| db_bo != new_stake) {
            return ValidationError(&format!(
                "Ownership stake does not match before update: {}, {}",
                dl.scoped_vault_id, db_bo.link_id
            ))
            .into();
        }

        BusinessOwner::update_ownership_stake(conn, &dl.vault_id, &db_bo.link_id, new_stake)?;
        updated = true;
    }

    let vault_secondary_bos = vault_bos.into_iter().skip(1).collect_vec();
    if vault_secondary_bos.is_empty() {
        // Nothing to backfill since we only write the new DIs for secondary BOs
        return Ok(updated);
    }

    let possible_dis = vault_secondary_bos
        .iter()
        .flat_map(|bo| {
            [IDK::FirstName, IDK::LastName, IDK::PhoneNumber, IDK::Email]
                .map(|idk| DI::Business(BDK::bo_data(bo.link_id.clone(), idk)))
        })
        .collect_vec();
    let backfilled_dls = data_lifetime::table
        .filter(data_lifetime::kind.eq_any(possible_dis))
        .filter(data_lifetime::scoped_vault_id.eq(&dl.scoped_vault_id))
        .get_results::<DataLifetime>(conn.conn())
        .map_err(DbError::from)?;
    if !backfilled_dls.is_empty() {
        // Already backfilled
        return Ok(updated);
    }


    //
    // Now, actually backfill the data for the new DIs
    //

    let extra_data = vault_secondary_bos
        .into_iter()
        .flat_map(|bo| {
            let bo_di = |di| DI::Business(BDK::bo_data(bo.link_id.clone(), di));
            vec![
                bo.phone_number.map(|p| (bo_di(IDK::PhoneNumber), p.e164())),
                bo.email.map(|p| (bo_di(IDK::Email), p.email)),
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
