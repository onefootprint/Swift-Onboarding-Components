use crate::{
    errors::{ApiResult, AssertionError},
    utils::vault_wrapper::{
        bulk_decrypt, Any, BulkDecryptReq, DataLifetimeSources, DecryptAccessEventInfo,
        EnclaveDecryptOperation, VaultWrapper,
    },
    State,
};
use itertools::Itertools;
use newtypes::{
    put_data_request::RawDataRequest, CardDataKind, CleanAndValidate, DataIdentifier, DataLifetimeSeqno,
    FpId, PiiJsonValue, ScopedVaultId, ValidateArgs,
};
use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;


#[derive(Deserialize, Clone, PartialEq, Eq, Hash)]
pub struct ScopedVaultIdAndSeqno {
    sv_id: ScopedVaultId,
    data_identifier: DataIdentifier,
    seqno: DataLifetimeSeqno,
}

#[derive(Deserialize)]
pub struct FixCardExpirationYearRequest {
    sv_seqnos: Vec<ScopedVaultIdAndSeqno>,
    dry_run: bool,
}

#[derive(Serialize)]
pub struct FixCardExpirationYearResult {
    updated: HashMap<FpId, Vec<DataIdentifier>>,
    would_update: HashMap<FpId, Vec<DataIdentifier>>,
    skipped_already_correct: HashMap<FpId, Vec<DataIdentifier>>,
    skipped_old_seqno: HashMap<FpId, Vec<DataIdentifier>>,
}


pub async fn fix_card_expiration_year(
    state: &State,
    req: FixCardExpirationYearRequest,
) -> ApiResult<FixCardExpirationYearResult> {
    let FixCardExpirationYearRequest { sv_seqnos, dry_run } = req;

    if sv_seqnos.iter().unique().collect_vec().len() != sv_seqnos.len() {
        return AssertionError("sv_seqnos has duplicates").into();
    }

    if sv_seqnos
        .iter()
        .map(|sv_seqno| (sv_seqno.sv_id.clone(), sv_seqno.data_identifier.clone()))
        .unique()
        .collect_vec()
        .len()
        != sv_seqnos.len()
    {
        return AssertionError("sv_seqnos has multiple seqnos for the same DI").into();
    }

    let vw_dis: HashMap<_, _> = state
        .db_pool
        .db_query(
            move |conn| -> ApiResult<_> {
                let vw_dis = sv_seqnos
                    .into_iter()
                    .map(|sv_seqno| {
                        let ScopedVaultIdAndSeqno {
                            sv_id,
                            data_identifier,
                            seqno,
                        } = sv_seqno;

                        let vw = VaultWrapper::<Any>::build_for_tenant_version(conn, &sv_id, Some(seqno))?;

                        if !matches!(&data_identifier, DataIdentifier::Card(c) if c.kind == CardDataKind::Expiration) {
                            return AssertionError("Migration can only operate on card expiration DIs")
                                .into();
                        }

                        Ok((
                            (
                                sv_id.clone(),
                                data_identifier.clone(),
                                seqno,
                                vw.scoped_vault.fp_id.clone(),
                                vw.scoped_vault.tenant_id.clone(),
                                vw.scoped_vault.is_live,
                            ),
                            vw,
                        ))
                    })
                    .collect::<ApiResult<HashMap<_, _>>>()?;

                Ok(vw_dis)
            }
        )
        .await?;

    let mut requests = HashMap::new();
    let mut original_dl_sources = HashMap::new();
    for (key, vw) in vw_dis.iter() {
        let (_, di, seqno, _, _, _) = key;
        let data_lifetime = vw
            .get_lifetime(di)
            .ok_or(AssertionError("No visible lifetime for DI"))?;
        original_dl_sources.insert(
            (vw.scoped_vault.id.clone(), di.clone(), *seqno),
            data_lifetime.source,
        );

        requests.insert(
            key.clone(),
            BulkDecryptReq {
                vw,
                targets: vec![EnclaveDecryptOperation {
                    identifier: di.clone(),
                    transforms: vec![],
                }],
            },
        );
    }

    let decrypted = bulk_decrypt(state, requests, DecryptAccessEventInfo::NoAccessEvent).await?;

    let mut skipped_already_correct_dis: HashMap<FpId, Vec<DataIdentifier>> = HashMap::new();

    let correct_date_format = Regex::new(r"^\d{2}/\d{4}$")?;

    let mut updates = vec![];
    let mut sv_id_to_fp_id = HashMap::new();
    for ((sv_id, di, seqno, fp_id, tenant_id, is_live), decrypt_ops) in decrypted.iter() {
        let mut ops = decrypt_ops.iter();
        let (op, pii_json) = ops.next().ok_or(AssertionError("Missing decrypt op"))?;
        if ops.next().is_some() {
            return AssertionError("Expected one decrypt op per key").into();
        }

        if op.identifier != *di {
            return AssertionError("Mismatched DI").into();
        }

        // Check if the date is already in the correct format.
        let expiration = pii_json.clone().as_string().map_err(newtypes::Error::from)?;

        let div = di.clone().clean_and_validate(
            pii_json.clone(),
            ValidateArgs {
                // Card expiration parsing doesn't branch on any of these arguments.
                for_bifrost: false,
                allow_dangling_keys: false,
                ignore_luhn_validation: false,
                is_live: *is_live,
            },
            // Not used for card expiration.
            &HashMap::new(),
        )?;
        let fixed_expiration = div.value;

        if !correct_date_format.is_match(fixed_expiration.leak()) {
            // We can assert this since validation was not broken, just the vaulted format.
            return AssertionError("Fixed expiration should match correct date format").into();
        };

        if fixed_expiration == expiration {
            skipped_already_correct_dis
                .entry(fp_id.clone())
                .or_default()
                .push(op.identifier.clone());
            continue;
        }

        // Double check that we got the transformation right.
        let (original_month, original_year) = expiration
            .leak()
            .split_once(['-', '/'])
            .ok_or(AssertionError("No month"))?;

        if original_year.len() == 2 && &fixed_expiration.leak()[2..5] != "/20" {
            return AssertionError("Incorrect middle characters").into();
        }

        if fixed_expiration.leak()[..2].trim_start_matches('0') != original_month.trim_start_matches('0') {
            return AssertionError("Incorrect month").into();
        }
        if fixed_expiration.leak()[5..] != original_year[original_year.len() - 2..] {
            return AssertionError("Incorrect year").into();
        }

        // Build the data update request.
        let raw_dr = RawDataRequest {
            map: HashMap::from([(
                op.identifier.clone(),
                PiiJsonValue::from_piistring(fixed_expiration),
            )]),
        };
        let patch_dr = raw_dr.clean_and_validate(ValidateArgs {
            for_bifrost: false,
            allow_dangling_keys: false,
            ignore_luhn_validation: false,
            is_live: *is_live,
        })?;
        let dr = patch_dr
            .updates
            .build_fingerprints(&state.enclave_client, tenant_id)
            .await?;
        let source = original_dl_sources
            .get(&(sv_id.clone(), op.identifier.clone(), *seqno))
            .ok_or(AssertionError("Missing original data lifetime source"))?;

        updates.push((sv_id.clone(), (dr, *source, *seqno)));
        sv_id_to_fp_id.insert(sv_id.clone(), fp_id.clone());
    }

    let mut updated_dis: HashMap<FpId, Vec<DataIdentifier>> = HashMap::new();
    let mut would_update_dis: HashMap<FpId, Vec<DataIdentifier>> = HashMap::new();
    let mut skipped_old_seqno_dis: HashMap<FpId, Vec<DataIdentifier>> = HashMap::new();

    for (sv_id, drs) in updates.into_iter().into_group_map() {
        let fp_id = sv_id_to_fp_id
            .get(&sv_id)
            .ok_or(AssertionError("Missing fp_id"))?
            .clone();

        let (txn_updated, txn_would_update, txn_skipped) = state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let mut txn_updated: HashMap<FpId, Vec<DataIdentifier>> = HashMap::new();
                let mut txn_would_update: HashMap<FpId, Vec<DataIdentifier>> = HashMap::new();
                let mut txn_skipped_old_seqno: HashMap<FpId, Vec<DataIdentifier>> = HashMap::new();

                for (data_request, data_lifetime_source, decrypted_seqno) in drs.into_iter() {
                    let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &sv_id)?;
                    let dis = data_request.keys().cloned().collect_vec();

                    if dis.len() != 3 {
                        // Should be Expiration, ExpYear, ExpMonth
                        return AssertionError("Expected 3 DIs").into();
                    }

                    // Check that the sequence numbers are all the same as the decrypted seqno.
                    // If the sequence numbers are different, we skip the update to avoid
                    // overwriting data.
                    let seqnos_match = dis
                        .iter()
                        .map(|di| {
                            match di {
                                DataIdentifier::Card(c) if c.kind == CardDataKind::Expiration => {}
                                DataIdentifier::Card(c) if c.kind == CardDataKind::ExpYear => {}
                                DataIdentifier::Card(c) if c.kind == CardDataKind::ExpMonth => {}
                                _ => return AssertionError("Unexpected DI").into(),
                            };

                            Ok(uvw
                                .get_lifetime(di)
                                .ok_or(AssertionError("No visible lifetime for DI"))?
                                .created_seqno)
                        })
                        .collect::<ApiResult<Vec<DataLifetimeSeqno>>>()?
                        .into_iter()
                        .all(|latest_seqno| latest_seqno == decrypted_seqno);

                    if !seqnos_match {
                        txn_skipped_old_seqno
                            .entry(fp_id.clone())
                            .or_default()
                            .extend(dis);
                        continue;
                    }

                    if dry_run {
                        txn_would_update.entry(fp_id.clone()).or_default().extend(dis);
                    } else {
                        uvw.patch_data(
                            conn,
                            data_request,
                            DataLifetimeSources::single(data_lifetime_source),
                            None, // AuthActor
                        )?;

                        txn_updated.entry(fp_id.clone()).or_default().extend(dis)
                    }
                }

                Ok((txn_updated, txn_would_update, txn_skipped_old_seqno))
            })
            .await?;

        updated_dis.extend(txn_updated);
        would_update_dis.extend(txn_would_update);
        skipped_old_seqno_dis.extend(txn_skipped);
    }

    Ok(FixCardExpirationYearResult {
        updated: updated_dis,
        would_update: would_update_dis,
        skipped_already_correct: skipped_already_correct_dis,
        skipped_old_seqno: skipped_old_seqno_dis,
    })
}
