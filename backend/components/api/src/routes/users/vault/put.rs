use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::{CheckTenantGuard, SecretTenantAuthContext};
use crate::errors::ApiResult;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::fingerprint::build_fingerprints;
use crate::utils::headers::InsightHeaders;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use db::models::access_event::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_user::ScopedUser;
use itertools::Itertools;
use newtypes::put_data_request::PutDataRequest;
use newtypes::{AccessEventKind, FootprintUserId};
use paperclip::actix::{self, api_v2_operation, web, web::Json, web::Path};

#[api_v2_operation(
    description = "Updates data in a user vault. Can be used to update `id.` data or `custom.` data, but `id.` data can only be specified for user vaults created via API.",
    tags(Vault, PublicApi, Users)
)]
#[actix::put("/users/{footprint_user_id}/vault")]
pub async fn put(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Json<PutDataRequest>,
    tenant_auth: SecretTenantAuthContext,
    insight: InsightHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let footprint_user_id = path.into_inner();
    let insight = CreateInsightEvent::from(insight);

    // TODO what permissions do we need to add data to vault? Any API key will be able to right now
    let tenant_auth = tenant_auth.check_guard(TenantGuard::Admin)?;
    let tenant_id = tenant_auth.tenant().id.clone();
    let is_live = tenant_auth.is_live()?;
    let principal = tenant_auth.actor().into();

    let targets = request.keys().cloned().collect_vec();
    let request = request.into_inner();
    // Compose fingerprints from all
    // return email from put_all_data
    let (request, fingerprintable_data) = request.decompose(true)?;
    let fingerprints = build_fingerprints(&state, fingerprintable_data).await?;

    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let scoped_user = ScopedUser::get(conn, (&footprint_user_id, &tenant_id, is_live))?;

            let uvw = UserVaultWrapper::lock_for_onboarding(conn, &scoped_user.id)?;
            uvw.put_all_data(conn, request, fingerprints, false)?;

            // Create an access event to show data was added
            NewAccessEvent {
                scoped_user_id: scoped_user.id.clone(),
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
