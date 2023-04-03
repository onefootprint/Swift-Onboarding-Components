use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::auth::Either;
use crate::errors::ApiError;
use crate::get::EntityDetailResponse;
use crate::serializers::UserDetail;
use crate::types::JsonApiResponse;
use crate::types::ResponseData;
use crate::utils::db2api::DbToApi;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_wire_types::IdentityDocumentKindForUser;
use db::models::onboarding::Onboarding;
use db::scoped_vault::ScopedVaultListQueryParams;
use newtypes::FpId;
use paperclip::actix::{api_v2_operation, get, web};

use super::create_identity_document_info_for_user;
use super::get_visible_populated_fields;

pub async fn get_entity<T>(
    state: web::Data<State>,
    fp_id: web::Path<FpId>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> JsonApiResponse<T>
where
    T: DbToApi<UserDetail>,
{
    let auth = auth.check_guard(TenantGuard::Read)?;
    let tenant = auth.tenant();

    let query_params = ScopedVaultListQueryParams {
        tenant_id: tenant.id.clone(),
        is_live: auth.is_live()?,
        only_billable: false,
        requires_manual_review: None,
        statuses: vec![],
        fingerprints: None,
        fp_id: Some(fp_id.into_inner()),
        timestamp_lte: None,
        timestamp_gte: None,
        kind: None,
    };
    let (su, ob, vw) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let (su, _) = db::scoped_vault::list_authorized_for_tenant(conn, query_params, None, 1)?
                .pop()
                .ok_or(ApiError::ResourceNotFound)?;
            let vw = VaultWrapper::build_for_tenant(conn, &su.id)?;
            let ob = Onboarding::get_for_scoped_users(conn, vec![&su.id])?.remove(&su.id);

            Ok((su, ob, vw))
        })
        .await??;
    // We only allow tenants to see data in the vault that they have requested to collected and ob config has been authorized
    let (attributes, idks, document_types, selfie_document_types) = get_visible_populated_fields(&vw);
    let is_portable = vw.vault.is_portable;
    let doc_types: Vec<IdentityDocumentKindForUser> =
        create_identity_document_info_for_user(&vw, document_types, selfie_document_types);
    let result = T::from_db((idks, doc_types, attributes, ob, su, is_portable, vw.vault().kind));
    ResponseData::ok(result).json()
}

#[api_v2_operation(
    description = "View details of a specific entity (business or user)",
    tags(Entities, Private)
)]
#[get("/entities/{fp_id}")]
pub async fn get(
    state: web::Data<State>,
    fp_id: web::Path<FpId>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> JsonApiResponse<EntityDetailResponse> {
    let result = get_entity(state, fp_id, auth).await?;
    Ok(result)
}
