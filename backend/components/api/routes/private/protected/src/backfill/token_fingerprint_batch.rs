use crate::backfill::BatchBackfillRequest;
use crate::backfill::BatchBackfillResponse;
use crate::ProtectedAuth;
use actix_web::post;
use actix_web::web;
use actix_web::web::Json;
use api_core::ApiResponse;
use api_core::State;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db::models::data_lifetime::DataLifetime;
use db::models::fingerprint::Fingerprint as DbFingerprint;
use db::models::fingerprint::NewFingerprintArgs;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use db::schema::data_lifetime;
use db::schema::fingerprint;
use db::schema::fingerprint_junction;
use db::schema::scoped_vault_version;
use db::schema::vault;
use db::schema::vault_data;
use db::DbError;
use db_schema::schema::scoped_vault;
use diesel::prelude::*;
use diesel::QueryDsl;
use futures::StreamExt;
use itertools::Itertools;
use newtypes::BankDataKind;
use newtypes::BankInfo;
use newtypes::CardDataKind;
use newtypes::CardInfo;
use newtypes::CompositeFingerprintKind;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeId;
use newtypes::DataLifetimeSeqno;
use newtypes::DataLifetimeSource;
use newtypes::DbActor;
use newtypes::FingerprintKind;
use newtypes::FingerprintScope;
use newtypes::PiiString;
use newtypes::ScopedVaultId;
use newtypes::SealedVaultBytes;
use newtypes::VaultDataFormat;
use newtypes::VaultId;
use std::collections::HashSet;

#[post("/private/backfill/batch_token_fingerprints")]
pub async fn post(
    state: web::Data<State>,
    request: Json<BatchBackfillRequest<ScopedVaultId>>,
    _: ProtectedAuth,
) -> ApiResponse<BatchBackfillResponse> {
    let BatchBackfillRequest {
        concurrency,
        entity_ids,
        shard_config,
    } = request.into_inner();
    let svs = state
        .db_query(move |conn| {
            // Filter out deactivated scoped vaults - causes other utils to crash
            let svs: Vec<(ScopedVault, Vault)> = scoped_vault::table
                .inner_join(vault::table)
                .filter(scoped_vault::id.eq_any(entity_ids))
                .filter(scoped_vault::deactivated_at.is_null())
                .select((scoped_vault::all_columns, vault::all_columns))
                .get_results::<(ScopedVault, Vault)>(conn)?;
            Ok(svs)
        })
        .await?;

    let svs = if let Some(shard_config) = shard_config {
        svs.into_iter()
            .filter(|(sv, _)| shard_config.select(&sv.id))
            .collect()
    } else {
        svs
    };

    let vws_fut = svs
        .into_iter()
        .map(|(sv, v)| backfill_token_fingerprints(&state, sv.clone(), v.clone()))
        .collect_vec();

    let futs = futures::stream::iter(vws_fut).buffer_unordered(concurrency);
    futs.collect::<Vec<_>>()
        .await
        .into_iter()
        .collect::<FpResult<Vec<_>>>()?;

    let response = BatchBackfillResponse {};
    Ok(response)
}

#[tracing::instrument(skip_all)]
async fn backfill_token_fingerprints<'a>(state: &'a State, sv: ScopedVault, v: Vault) -> FpResult<()> {
    state
        .db_transaction(move |conn| {
            ScopedVault::lock(conn, &sv.id)?;
            let results: Vec<(DbFingerprint, DataLifetime)> = fingerprint::table
                .inner_join(fingerprint_junction::table)
                .inner_join(data_lifetime::table.on(data_lifetime::id.eq(fingerprint_junction::lifetime_id)))
                .filter(fingerprint::scoped_vault_id.eq(&sv.id))
                .filter(fingerprint::deactivated_at.is_null())
                .filter(fingerprint::kind.eq_any(&[
                    FingerprintKind::Composite(CompositeFingerprintKind::BankRoutingAccount),
                    FingerprintKind::Composite(CompositeFingerprintKind::CardNumberCvc),
                ]))
                .select((fingerprint::all_columns, data_lifetime::all_columns))
                .get_results::<(DbFingerprint, DataLifetime)>(conn.conn())
                .map_err(DbError::from)?;

            let existing_token_dis = data_lifetime::table
                .filter(data_lifetime::scoped_vault_id.eq(&sv.id))
                .filter(data_lifetime::deactivated_at.is_null())
                .filter(
                    data_lifetime::kind
                        .ilike("bank.%.fingerprint")
                        .or(data_lifetime::kind.ilike("card.%.fingerprint")),
                )
                .select(data_lifetime::kind)
                .get_results::<DataIdentifier>(conn.conn())
                .map_err(DbError::from)?;

            let existing_token_dis: HashSet<_> = existing_token_dis.iter().collect();
            let lowest_dl = results
                .iter()
                .map(|(_, dl)| dl)
                .min_by_key(|dl| dl.created_seqno)
                .cloned();

            let latest_dl_per_fp = results
                .into_iter()
                .into_group_map_by(|(fp, _)| fp.id.clone())
                .into_iter()
                .flat_map(|(_, fps)| fps.into_iter().max_by_key(|(_, dl)| dl.created_seqno))
                .collect_vec();

            let results = latest_dl_per_fp
                .into_iter()
                .map(|(fp, dl)| -> FpResult<()> {
                    let token_di = match fp.kind {
                        FingerprintKind::Composite(cfk) => match (cfk, dl.kind) {
                            (CompositeFingerprintKind::BankRoutingAccount, DataIdentifier::Bank(bi)) => {
                                DataIdentifier::Bank(BankInfo {
                                    kind: BankDataKind::Fingerprint,
                                    alias: bi.alias.clone(),
                                })
                            }
                            (CompositeFingerprintKind::CardNumberCvc, DataIdentifier::Card(ci)) => {
                                DataIdentifier::Card(CardInfo {
                                    kind: CardDataKind::Fingerprint,
                                    alias: ci.alias.clone(),
                                })
                            }
                            (_, _) => {
                                return Ok(());
                            }
                        },
                        _ => {
                            return Ok(());
                        }
                    };

                    // Don't try to insert anything if we have a fingerprinted token already.
                    if existing_token_dis.contains(&token_di) {
                        return Ok(());
                    }

                    let p_data = match fp.sh_data {
                        Some(fp) => fp.to_token(),
                        None => {
                            return Ok(());
                        }
                    };

                    let e_data = v.public_key.seal_pii(&p_data)?;
                    let new_dl = NewDataLifetime {
                        vault_id: dl.vault_id,
                        scoped_vault_id: dl.scoped_vault_id,
                        created_at: dl.created_at,
                        portablized_at: dl.portablized_at,
                        deactivated_at: dl.deactivated_at,
                        created_seqno: dl.created_seqno,
                        portablized_seqno: dl.portablized_seqno,
                        deactivated_seqno: dl.deactivated_seqno,
                        kind: token_di.clone(),
                        source: dl.source,
                        actor: dl.actor,
                        origin_id: dl.origin_id,
                    };

                    let new_dl = diesel::insert_into(data_lifetime::table)
                        .values(new_dl)
                        .get_result::<DataLifetime>(conn.conn())
                        .map_err(DbError::from)?;

                    let new_vd = NewVaultDataRow {
                        lifetime_id: new_dl.id.clone(),
                        kind: new_dl.kind,
                        e_data,
                        p_data: Some(p_data.clone()),
                        format: VaultDataFormat::String,
                    };

                    diesel::insert_into(vault_data::table)
                        .values(new_vd)
                        .execute(conn.conn())
                        .map_err(DbError::from)?;

                    let new_fp = NewFingerprintArgs {
                        kind: FingerprintKind::DI(token_di.clone()),
                        data: p_data.clone().into(),
                        lifetime_ids: vec![&new_dl.id],
                        scope: FingerprintScope::Plaintext,
                        version: newtypes::FingerprintVersion::current(),
                        // Denormalized fields
                        scoped_vault_id: &sv.id,
                        vault_id: &sv.vault_id,
                        tenant_id: &sv.tenant_id,
                        is_live: sv.is_live,
                    };

                    DbFingerprint::bulk_create(conn, vec![new_fp])?;
                    Ok(())
                })
                .collect_vec();

            for result in results {
                result?
            }

            if let Some(lowest_dl) = lowest_dl {
                let _ = diesel::update(scoped_vault_version::table)
                    .filter(scoped_vault_version::scoped_vault_id.eq(&sv.id))
                    .filter(scoped_vault_version::seqno.ge(&lowest_dl.created_seqno))
                    .set(scoped_vault_version::backed_up_by_vdr_config_id.eq(None as Option<String>))
                    .execute(conn.conn())
                    .map_err(DbError::from)?;
            }

            Ok(())
        })
        .await?;
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
    kind: DataIdentifier,
    source: DataLifetimeSource,
    actor: Option<DbActor>,
    origin_id: Option<DataLifetimeId>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = vault_data)]
struct NewVaultDataRow {
    lifetime_id: DataLifetimeId,
    kind: DataIdentifier,
    e_data: SealedVaultBytes,
    p_data: Option<PiiString>,
    format: VaultDataFormat,
}
