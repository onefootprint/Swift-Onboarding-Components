use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::{CheckTenantGuard, SecretTenantAuthContext};
use crate::errors::ApiResult;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::headers::InsightHeaders;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::utils::vault_wrapper::TenantUvw;
use db::models::access_event::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use itertools::Itertools;
use newtypes::put_data_request::RawDataRequest;
use newtypes::{AccessEventKind, FpId, ParseOptions};
use paperclip::actix::{self, api_v2_operation, web, web::Json, web::Path};

#[api_v2_operation(
    description = "Checks if provided data is valid before adding it to the vault",
    tags(Vault, PublicApi, Entities)
)]
#[actix::post("/entities/{fp_id}/vault/validate")]
pub async fn post_validate(
    state: web::Data<State>,
    path: Path<FpId>,
    request: Json<RawDataRequest>,
    tenant_auth: SecretTenantAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let result = post_validate_inner(state, path, request, tenant_auth).await?;
    Ok(result)
}

pub async fn post_validate_inner(
    state: web::Data<State>,
    path: Path<FpId>,
    request: Json<RawDataRequest>,
    tenant_auth: SecretTenantAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let fp_id = path.into_inner();

    let tenant_auth = tenant_auth.check_guard(TenantGuard::Admin)?;
    let tenant_id = tenant_auth.tenant().id.clone();
    let is_live = tenant_auth.is_live()?;

    let request = request
        .into_inner()
        .clean_and_validate(ParseOptions::for_non_portable())?;
    request.assert_no_business_data()?;
    let request = request.no_fingerprints(); // No fingerprints to check speculatively

    let uvw = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let scoped_user = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let uvw: TenantUvw = VaultWrapper::build_for_tenant(conn, &scoped_user.id)?;
            Ok(uvw)
        })
        .await??;
    uvw.validate_request(request)?;

    EmptyResponse::ok().json()
}

#[api_v2_operation(
    description = "Updates data in a user vault",
    tags(Vault, PublicApi, Entities)
)]
#[actix::put("/entities/{fp_id}/vault")]
pub async fn put(
    state: web::Data<State>,
    path: Path<FpId>,
    request: Json<RawDataRequest>,
    tenant_auth: SecretTenantAuthContext,
    insight: InsightHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let result = put_inner(state, path, request, tenant_auth, insight).await?;
    Ok(result)
}

pub async fn put_inner(
    state: web::Data<State>,
    path: Path<FpId>,
    request: Json<RawDataRequest>,
    tenant_auth: SecretTenantAuthContext,
    insight: InsightHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let fp_id = path.into_inner();
    let insight = CreateInsightEvent::from(insight);

    // TODO what permissions do we need to add data to vault? Any API key will be able to right now
    let tenant_auth = tenant_auth.check_guard(TenantGuard::Admin)?;
    let tenant_id = tenant_auth.tenant().id.clone();
    let is_live = tenant_auth.is_live()?;
    let principal = tenant_auth.actor().into();

    let targets = request.keys().cloned().collect_vec();
    let request = request
        .into_inner()
        .clean_and_validate(ParseOptions::for_non_portable())?;
    let request = request
        .build_tenant_fingerprints(state.as_ref(), &tenant_id)
        .await?;

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let scoped_user = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;

            let uvw = VaultWrapper::lock_for_onboarding(conn, &scoped_user.id)?;
            uvw.put_person_data(conn, request)?;

            // Create an access event to show data was added
            NewAccessEvent {
                scoped_vault_id: scoped_user.id.clone(),
                reason: None,
                principal,
                insight,
                kind: AccessEventKind::Update,
                targets,
            }
            .create(conn)?;

            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}
