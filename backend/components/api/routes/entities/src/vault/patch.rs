use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::{CheckTenantGuard, SecretTenantAuthContext};
use crate::errors::ApiResult;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::headers::InsightHeaders;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::auth::tenant::{ClientTenantAuthContext, TenantAuth};
use api_core::auth::CanVault;
use api_core::utils::vault_wrapper::Any;
use db::models::access_event::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use itertools::Itertools;
use macros::route_alias;
use newtypes::put_data_request::RawDataRequest;
use newtypes::{AccessEventKind, FpId, ValidateArgs};
use paperclip::actix::{self, api_v2_operation, web, web::Json, web::Path};

#[route_alias(
    actix::patch(
        "/users/{fp_id}/vault",
        description = "Updates data in a user vault.",
        tags(Users, Vault, PublicApi)
    ),
    actix::patch(
        "/businesses/{fp_bid}/vault",
        description = "Updates data in a business vault.",
        tags(Businesses, Vault, PublicApi)
    )
)]
#[api_v2_operation(
    description = "Works for either person or business entities. Updates data in a vault.",
    tags(Entities, Vault, Preview)
)]
#[actix::patch("/entities/{fp_id}/vault")]
pub async fn patch(
    state: web::Data<State>,
    path: Path<FpId>,
    request: Json<RawDataRequest>,
    auth: SecretTenantAuthContext,
    insight: InsightHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_guard(TenantGuard::WriteEntities)?;

    let result = patch_inner(&state, path.into_inner(), request.into_inner(), auth, insight).await?;
    Ok(result)
}

#[tracing::instrument(skip(state, auth))]
#[route_alias(actix::patch(
    "/users/vault",
    tags(Client, Vault, Users, PublicApi),
    description = "Updates data in a vault given a short-lived, entity-scoped client token."
))]
#[api_v2_operation(
    description = "Works for either person or business entities. Updates data in a vault given a short-lived, entity-scoped client token.",
    tags(Client, Vault, Entities, Private)
)]
#[actix::patch("/entities/vault")]
pub async fn patch_client(
    state: web::Data<State>,
    request: Json<RawDataRequest>,
    auth: ClientTenantAuthContext,
    insight: InsightHeaders,
) -> JsonApiResponse<EmptyResponse> {
    // This is a little different - we actually require a permission to update the data in the
    // vault since the ClientTenantAuth tokens are scoped to specific fields
    let request = request.into_inner();
    let auth = auth.check_guard(CanVault::new(request.keys().cloned().collect()))?;
    let fp_id = auth.fp_id.clone();

    let result = patch_inner(&state, fp_id, request, Box::new(auth), insight).await?;
    Ok(result)
}

async fn patch_inner(
    state: &State,
    fp_id: FpId,
    request: RawDataRequest,
    auth: Box<dyn TenantAuth>,
    insight: InsightHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let insight = CreateInsightEvent::from(insight);

    let tenant_id: newtypes::TenantId = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let principal = auth.actor().into();

    let targets = request.keys().cloned().collect_vec();
    let request = request.clean_and_validate(ValidateArgs::for_non_portable(is_live))?;
    let request = request.build_tenant_fingerprints(state, &tenant_id).await?;

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let scoped_user: ScopedVault = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;

            let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &scoped_user.id)?;
            uvw.patch_data(conn, request)?;

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
