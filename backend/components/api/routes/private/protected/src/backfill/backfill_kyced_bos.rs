use crate::backfill::BatchBackfillRequest;
use crate::backfill::BatchBackfillResponse;
use crate::ProtectedAuth;
use actix_web::post;
use actix_web::web;
use actix_web::web::Json;
use api_core::enclave_client::DecryptReq;
use api_core::ApiResponse;
use api_core::State;
use api_errors::AssertionError;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db::models::data_lifetime::DataLifetime;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use db::models::vault_data::VaultData;
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
use newtypes::KycedBusinessOwnerData;
use newtypes::PiiString;
use newtypes::ScopedVaultId;
use newtypes::SealedVaultBytes;
use newtypes::VaultDataFormat;
use newtypes::VaultId;

#[post("/private/backfill/kyced_bos")]
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
            state
                .db_pool
                .db_transaction(move |conn| backfill_dl(conn, dl, v, bos))
                .await
        })
        .collect_vec();
    let futs = futures::stream::iter(futs).buffer_unordered(concurrency);
    futs.collect::<Vec<_>>()
        .await
        .into_iter()
        .collect::<FpResult<Vec<_>>>()?;

    let response = BatchBackfillResponse {};
    Ok(response)
}

fn backfill_dl(conn: &mut TxnPgConn, dl: DataLifetime, v: Vault, bos: PiiString) -> FpResult<()> {
    ScopedVault::lock(conn, &dl.scoped_vault_id)?;
    let backfilled_dls = data_lifetime::table
        .filter(data_lifetime::kind.eq(DI::Business(BDK::KycedBeneficialOwners)))
        .filter(data_lifetime::created_seqno.eq(dl.created_seqno))
        .get_results::<DataLifetime>(conn.conn())
        .map_err(DbError::from)?;
    if !backfilled_dls.is_empty() {
        return Ok(());
    }

    let bos: Vec<BusinessOwnerData> = bos.deserialize()?;

    if bos.len() > 1 {
        // Don't backfill `kyced_beneficial_owners` if there are more than one BO.
        // Right now, KYCed BOs _require_ that we have have a phone/email for secondary BOs.
        return Ok(());
    }
    let Some(bo) = bos.into_iter().next() else {
        return AssertionError("Misisng BO").into();
    };

    let kind = BusinessOwnerKind::Primary;
    let kyced_bo = KycedBusinessOwnerData {
        first_name: bo.first_name,
        last_name: bo.last_name,
        ownership_stake: bo.ownership_stake,
        link_id: BoLinkId::generate(kind),
        // It's okay to omit these for the primary BO
        phone_number: Option::<()>::None,
        email: Option::<()>::None,
    };


    //
    // Save the new business.kyced_beneficial_owners vault data
    //
    let serialized_value = PiiString::from(serde_json::ser::to_string(&[kyced_bo])?);
    let e_data = v.public_key.seal_pii(&serialized_value)?;
    let new_dl = NewDataLifetime {
        vault_id: dl.vault_id,
        scoped_vault_id: dl.scoped_vault_id,
        created_at: dl.created_at,
        portablized_at: dl.portablized_at,
        deactivated_at: dl.deactivated_at,
        created_seqno: dl.created_seqno,
        portablized_seqno: dl.portablized_seqno,
        deactivated_seqno: dl.deactivated_seqno,
        kind: DI::Business(BDK::KycedBeneficialOwners),
        source: dl.source,
        actor: dl.actor,
        origin_id: dl.origin_id,
    };
    let new_dl = diesel::insert_into(data_lifetime::table)
        .values(new_dl)
        .get_result::<DataLifetime>(conn.conn())
        .map_err(DbError::from)?;
    let new_vd = NewVaultDataRow {
        lifetime_id: new_dl.id,
        kind: new_dl.kind,
        e_data,
        p_data: None,
        format: VaultDataFormat::Json,
    };
    diesel::insert_into(vault_data::table)
        .values(new_vd)
        .execute(conn.conn())
        .map_err(DbError::from)?;

    Ok(())
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
