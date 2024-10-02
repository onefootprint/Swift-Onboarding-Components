use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::State;
use actix_web::web::Json;
use api_core::auth::tenant::TenantApiKeyGated;
use api_core::types::OffsetPaginatedResponseNoCount;
use api_core::types::OffsetPaginationRequest;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::ApiResponse;
use api_wire_types::PublicDuplicateFingerprint;
use db::models::fingerprint::Fingerprint;
use db::models::scoped_vault::ScopedVault;
use db::models::scoped_vault_label::ScopedVaultLabel;
use db::models::scoped_vault_tag::ScopedVaultTag;
use db::DbResult;
use itertools::Itertools;
use newtypes::preview_api;
use newtypes::DupeKind;
use newtypes::FpId;
use newtypes::LabelKind;
use newtypes::ScopedVaultId;
use newtypes::TagKind;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;
use std::collections::HashMap;

#[api_v2_operation(
    description = "List users with duplicate attributes to the provided user.",
    tags(Users, Preview)
)]
#[get("/users/{fp_id}/duplicates")]
pub async fn get(
    state: web::Data<State>,
    request: FpIdPath,
    auth: TenantApiKeyGated<preview_api::ListDuplicateUsers>,
    pagination: web::Query<OffsetPaginationRequest>,
) -> ApiResponse<Json<OffsetPaginatedResponseNoCount<PublicDuplicateFingerprint>>> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = request.into_inner();
    let pagination = pagination.db_pagination(&state);

    let (fingerprints, scoped_vaults, labels, tags, next_page) = state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            let scoped_vault = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let (fingerprints, next_page) = Fingerprint::get_internal_dupes(conn, &scoped_vault, pagination)?;
            let sv_ids = fingerprints.iter().map(|fp| &fp.scoped_vault_id).collect_vec();
            let labels = ScopedVaultLabel::bulk_get_active(conn, sv_ids.clone())?;
            let tags = ScopedVaultTag::bulk_get_active(conn, sv_ids.clone())?;
            let scoped_vaults = ScopedVault::bulk_get(conn, sv_ids, &tenant_id, is_live)?
                .iter()
                .map(|(scoped_vault, _)| scoped_vault.clone())
                .collect_vec();
            Ok((fingerprints, scoped_vaults, labels, tags, next_page))
        })
        .await?;

    let sv_id_to_fp_id: HashMap<ScopedVaultId, FpId> = scoped_vaults
        .into_iter()
        .map(|scoped_vault| (scoped_vault.id.clone(), scoped_vault.fp_id.clone()))
        .collect();

    let sv_id_to_label: HashMap<ScopedVaultId, Vec<LabelKind>> = labels
        .into_iter()
        .map(|label| (label.scoped_vault_id.clone(), label.kind))
        .into_group_map();

    let sv_id_to_tag: HashMap<ScopedVaultId, Vec<TagKind>> = tags
        .into_iter()
        .map(|tag| (tag.scoped_vault_id.clone(), tag.kind))
        .into_group_map();

    let responses = fingerprints
        .into_iter()
        .filter_map(|fingerprint| {
            let tags = sv_id_to_tag
                .get(&fingerprint.scoped_vault_id)
                .cloned()
                .unwrap_or_default();

            let labels = sv_id_to_label
                .get(&fingerprint.scoped_vault_id)
                .cloned()
                .unwrap_or_default();

            let fp_id = sv_id_to_fp_id
                .get(&fingerprint.scoped_vault_id)
                .cloned()
                .unwrap_or_default();

            match DupeKind::try_from(fingerprint.kind) {
                Ok(kind) => Some(PublicDuplicateFingerprint {
                    fp_id: fp_id.clone(),
                    labels,
                    tags,
                    kind,
                }),
                Err(err) => {
                    tracing::error!(?err, "Unable to parse fingerprint kind");
                    None
                }
            }
        })
        .collect_vec();

    Ok(Json(OffsetPaginatedResponseNoCount::ok_no_count(
        responses, next_page,
    )))
}
