use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::decision::duplicates;
use crate::State;
use actix_web::web::Json;
use api_core::auth::tenant::TenantApiKeyGated;
use api_core::types::OffsetPaginatedResponseNoCount;
use api_core::types::OffsetPaginationRequest;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::ApiResponse;
use api_wire_types::PublicDuplicateFingerprint;
use newtypes::preview_api;
use paperclip::actix::api_v2_operation;
use paperclip::actix::get;
use paperclip::actix::web;

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

    let (fingerprints, scoped_vaults, labels, tags, next_page) =
        duplicates::fetch_duplicate_data(&state, fp_id, tenant_id, is_live, pagination).await?;

    let responses = duplicates::build_duplicate_data(fingerprints, scoped_vaults, labels, tags)
        .into_iter()
        .map(|dd| {
            let duplicates::DuplicateData {
                fp_id,
                label,
                tags,
                kind,
                sv_id: _,
            } = dd;
            PublicDuplicateFingerprint {
                fp_id,
                label,
                tags,
                kind,
            }
        })
        .collect();


    Ok(Json(OffsetPaginatedResponseNoCount::ok_no_count(
        responses, next_page,
    )))
}
