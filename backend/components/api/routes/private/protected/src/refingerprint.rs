use std::collections::HashMap;

use crate::{ProtectedAuth, State};
use actix_web::{post, web, web::Json};
use api_core::{
    errors::{ApiResult, DryRunResult, DryRunResultTrait, ValidationError},
    types::{JsonApiResponse, ResponseData},
};
use db::{
    models::fingerprint::{Fingerprint, NewFingerprint},
    schema::{data_lifetime, fingerprint, scoped_vault, vault, vault_data},
    DbError, PgConn,
};
use db::{
    models::{data_lifetime::DataLifetime, scoped_vault::ScopedVault, vault::Vault, vault_data::VaultData},
    TxnPgConn,
};
use diesel::{dsl::not, prelude::*};
use itertools::Itertools;
use newtypes::{
    fingerprinter::{FingerprintScope, GlobalFingerprintKind},
    DataIdentifier, DataLifetimeId, EncryptedVaultPrivateKey, FingerprintScopeKind, FingerprintVersion,
    SealedVaultBytes, VaultId,
};

#[derive(serde::Deserialize)]
pub struct RefingerprintRequest {
    // Use the VaultId as a cursor
    cursor: VaultId,
    dry_run: bool,
    limit: i64,
    #[serde(default)]
    verbose: bool,
}

#[derive(serde::Serialize)]
pub struct RefingerprintResponse {
    /// The next cursor to use
    next: VaultId,
    /// The number of new fingerprints we'll be creating
    count: usize,
    /// A list of the vaults that had fingerprints to create
    results: Option<HashMap<VaultId, HashMap<String, usize>>>,
}

#[post("/private/refingerprint")]
pub async fn post(
    state: web::Data<State>,
    request: Json<RefingerprintRequest>,
    _: ProtectedAuth,
) -> JsonApiResponse<RefingerprintResponse> {
    let RefingerprintRequest {
        cursor,
        dry_run,
        limit,
        verbose,
    } = request.into_inner();
    let (to_refingerprint, next) = state
        .db_pool
        .db_query(move |conn| get_dls_to_refingerprint(conn, cursor, limit))
        .await??;

    let data_to_fp = to_refingerprint
        .iter()
        .flat_map(|d| d.fp_requests())
        .into_group_map();

    // Get the new fingerprints from the enclave
    let mut fingerprints_to_create = vec![];
    for (key, data_to_fp) in data_to_fp {
        let fingerprints = state
            .enclave_client
            .batch_fingerprint_sealed(key, data_to_fp)
            .await?;
        for ((kind, dl_id, scope), sh_data) in fingerprints {
            fingerprints_to_create.push(NewFingerprint {
                kind,
                sh_data,
                lifetime_id: dl_id,
                scope,
                version: FingerprintVersion::current(),
            });
        }
    }
    let count = fingerprints_to_create.len();

    let res = state
        .db_pool
        .db_transaction(move |conn| backfill(conn, fingerprints_to_create, dry_run))
        .await;
    res.value()?;

    let results = to_refingerprint
        .into_iter()
        .map(|d| (d.vault.id, (d.dl.kind, d.missing_fps)))
        .into_group_map()
        .into_iter()
        .map(|(v_id, v)| {
            let counts = v
                .into_iter()
                .flat_map(|(d, missing_fps)| missing_fps.into_iter().map(move |fp| format!("{},{}", d, fp)))
                .collect_vec()
                .into_iter()
                .counts();
            (v_id, counts)
        })
        .collect();
    let results = verbose.then_some(results);
    let response = RefingerprintResponse { next, count, results };
    ResponseData::ok(response).json()
}

struct ToRefingerprint {
    dl: DataLifetime,
    vd: VaultData,
    vault: Vault,
    sv: ScopedVault,
    missing_fps: Vec<FingerprintScopeKind>,
}

type FingerprintRequest<'a> = (
    (DataIdentifier, DataLifetimeId, FingerprintScopeKind),
    (FingerprintScope<'a>, &'a SealedVaultBytes),
);
impl ToRefingerprint {
    fn fp_requests(&self) -> Vec<(&EncryptedVaultPrivateKey, FingerprintRequest)> {
        self.missing_fps
            .iter()
            .filter_map(|scope_kind| -> Option<_> {
                let di = &self.dl.kind;
                let scope = match scope_kind {
                    FingerprintScopeKind::Tenant => FingerprintScope::Tenant(di, &self.sv.tenant_id),
                    FingerprintScopeKind::Global => {
                        let gfpk = GlobalFingerprintKind::try_from(di).ok()?;
                        FingerprintScope::Global(gfpk)
                    }
                };
                let sealed_key = &self.vault.e_private_key;
                let k = (di.clone(), self.dl.id.clone(), *scope_kind);
                Some((sealed_key, (k, (scope, &self.vd.e_data))))
            })
            .collect()
    }
}

#[tracing::instrument(skip_all)]
fn get_dls_to_refingerprint(
    conn: &mut PgConn,
    cursor: VaultId,
    limit: i64,
) -> ApiResult<(Vec<ToRefingerprint>, VaultId)> {
    // Page through the vaults by ID, just because we have an index on it. We'll miss any vaults
    // newly created, but that's fine because they don't need to be backfilled
    let vaults = vault::table
        .filter(vault::id.ge(&cursor))
        .order_by(vault::id)
        .limit(limit)
        .get_results::<Vault>(conn)
        .map_err(DbError::from)?;
    let next = vaults
        .into_iter()
        .last()
        .ok_or(ValidationError("Page is empty - no next page"))?
        .id;

    let data = data_lifetime::table
        .inner_join(vault_data::table)
        .filter(data_lifetime::vault_id.ge(&cursor))
        .filter(data_lifetime::vault_id.le(&next))
        .get_results::<(DataLifetime, VaultData)>(conn)
        .map_err(DbError::from)?;
    // Bulk fetch the SVs and Vaults
    let sv_ids = data
        .iter()
        .map(|(dl, _)| &dl.scoped_vault_id)
        .unique()
        .collect_vec();
    let svs: HashMap<_, _> = scoped_vault::table
        .inner_join(vault::table)
        .filter(scoped_vault::id.eq_any(sv_ids))
        .filter(not(scoped_vault::tenant_id.eq_any([
            "_private_it_org_1",
            "_private_it_org_2",
            "_private_it_org_3",
        ])))
        .get_results::<(ScopedVault, Vault)>(conn)
        .map_err(DbError::from)?
        .into_iter()
        .map(|(sv, v)| (sv.id.clone(), (sv, v)))
        .collect();

    let dl_ids = data.iter().map(|(dl, _)| &dl.id).collect_vec();
    let mut fps = fingerprint::table
        .filter(fingerprint::lifetime_id.eq_any(dl_ids))
        .get_results::<Fingerprint>(conn)
        .map_err(DbError::from)?
        .into_iter()
        .into_group_map_by(|fp| fp.lifetime_id.clone());

    let dls_to_refingerprint = data
        .into_iter()
        .map(|(dl, vd)| -> ApiResult<_> {
            let fps = fps.remove(&dl.id).unwrap_or_default();
            // Check if this DL is missing a tenant-scoped or global fingerprint. If so, create it
            let di = &dl.kind;
            let Some((sv, vault)) = svs.get(&dl.scoped_vault_id).cloned() else {
                return Ok(None);
            };
            let missing_fps = vec![
                (FingerprintScopeKind::Tenant, di.is_fingerprintable()),
                (FingerprintScopeKind::Global, di.is_globally_fingerprintable()),
            ]
            .into_iter()
            .filter_map(|(scope, should_have_fp)| {
                let is_missing = should_have_fp && !fps.iter().any(|fp| fp.scope == scope);
                is_missing.then_some(scope)
            })
            .collect_vec();
            let res = (!missing_fps.is_empty()).then_some(ToRefingerprint {
                dl,
                vd,
                vault,
                sv,
                missing_fps,
            });
            Ok(res)
        })
        .collect::<ApiResult<Vec<_>>>()?
        .into_iter()
        .flatten()
        .collect_vec();

    Ok((dls_to_refingerprint, next))
}

#[tracing::instrument(skip_all)]
fn backfill(conn: &mut TxnPgConn, fps: Vec<NewFingerprint>, dry_run: bool) -> DryRunResult<()> {
    Fingerprint::bulk_create(conn, fps)?;
    DryRunResult::ok_or_rollback((), dry_run)
}
