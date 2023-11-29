use std::collections::HashMap;

use crate::{ProtectedAuth, State};
use actix_web::post;
use actix_web::web;
use actix_web::web::Json;
use api_core::migrations::m112223_backfill_portable_data;
use api_core::types::JsonApiResponse;
use api_core::types::ResponseData;
use newtypes::ScopedVaultId;
use newtypes::VaultId;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct BackfillDlsRequest {
    is_live: bool,
    vault_ids: Option<Vec<VaultId>>,
    skip_vault_ids: Option<Vec<VaultId>>,
    dry_run: bool,
    limit: usize,
}

#[post("/private/protected/backfill_dls")]
pub async fn post(
    state: web::Data<State>,
    _: ProtectedAuth,
    request: Json<BackfillDlsRequest>,
) -> JsonApiResponse<HashMap<VaultId, Vec<ScopedVaultId>>> {
    let BackfillDlsRequest {
        is_live,
        vault_ids,
        skip_vault_ids,
        dry_run,
        limit,
    } = request.into_inner();
    let result =
        m112223_backfill_portable_data::run(&state, vault_ids, skip_vault_ids, is_live, dry_run, limit)
            .await?;
    ResponseData::ok(result.into_iter().collect()).json()
}
