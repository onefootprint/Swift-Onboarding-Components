use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::{CheckTenantGuard, SecretTenantAuthContext};
use crate::errors::ApiResult;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::headers::InsightHeaders;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
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
        "/businesses/{fp_id}/vault",
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
        .clean_and_validate(ValidateArgs::for_non_portable(is_live))?;
    let request = request
        .build_tenant_fingerprints(state.as_ref(), &tenant_id)
        .await?;

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let scoped_user = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;

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
