use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::auth::Either;
use crate::errors::ApiError;
use crate::get::EntityDetailResponse;
use crate::types::JsonApiResponse;
use crate::types::ResponseData;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::ApiErrorKind;
use api_core::utils::db2api::DbToApi;
use api_core::utils::vault_wrapper::TenantVw;
use db::models::scoped_vault::ScopedVault;
use db::scoped_vault::ScopedVaultListQueryParams;
use itertools::Itertools;
use newtypes::CardDataKind;
use newtypes::CardInfo;
use newtypes::DataIdentifier;
use newtypes::FpId;
use paperclip::actix::{api_v2_operation, get, web};

#[api_v2_operation(
    description = "View details of a specific entity (business or user)",
    tags(Entities, Preview)
)]
#[get("/entities/{fp_id}")]
pub async fn get(
    state: web::Data<State>,
    fp_id: web::Path<FpId>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> JsonApiResponse<EntityDetailResponse> {
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();

    let query_params = ScopedVaultListQueryParams {
        tenant_id: tenant.id.clone(),
        is_live: auth.is_live()?,
        only_billable: false,
        requires_manual_review: None,
        watchlist_hit: None,
        statuses: vec![],
        search: None,
        fp_id: Some(fp_id.into_inner()),
        timestamp_lte: None,
        timestamp_gte: None,
        kind: None,
    };
    let (entity, vw) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let (sv, _) = db::scoped_vault::list_authorized_for_tenant(conn, query_params, None, 1)?
                .pop()
                .ok_or(ApiErrorKind::ResourceNotFound)?;
            let vw: TenantVw = VaultWrapper::build_for_tenant(conn, &sv.id)?;
            let entity = ScopedVault::bulk_get_serializable_info(conn, vec![&sv.id])?
                .remove(&sv.id)
                .ok_or(ApiErrorKind::ResourceNotFound)?;

            Ok((entity, vw))
        })
        .await??;

    // Always decrypt card last4.
    // TODO it's strange we don't make an access event here, but we would if you requested to
    // decrypt it
    let additional_visible_dis = vw
        .populated_dis()
        .into_iter()
        .filter(|di| {
            matches!(
                di,
                DataIdentifier::Card(CardInfo {
                    alias: _,
                    kind: CardDataKind::Last4,
                })
            )
        })
        .collect_vec();
    let additional_visible_attrs = vw
        .decrypt_unchecked(&state.enclave_client, &additional_visible_dis)
        .await?
        .results_by_data_identifier();

    let result = api_wire_types::Entity::from_db((entity, &vw, &auth, additional_visible_attrs));
    ResponseData::ok(result).json()
}
