use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::{CheckTenantGuard, SecretTenantAuthContext};
use crate::errors::ApiResult;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::headers::InsightHeaders;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::auth::tenant::{ClientTenantAuthContext, TenantAuth, TenantSessionAuth};
use api_core::auth::{CanVault, Either};
use api_core::errors::AssertionError;
use api_core::utils::headers::IgnoreLuhnValidation;
use api_core::utils::vault_wrapper::Any;
use db::models::access_event::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use itertools::Itertools;
use macros::route_alias;
use newtypes::put_data_request::RawDataRequest;
use newtypes::{AccessEventKind, AccessEventPurpose, FpId, ValidateArgs};
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
        tags(Businesses, Vault, Private)
    )
)]
#[api_v2_operation(
    description = "Works for either person or business entities. Updates data in a vault.",
    tags(Vault, Entities, Vault, Private)
)]
#[actix::patch("/entities/{fp_id}/vault")]
pub async fn patch(
    state: web::Data<State>,
    path: Path<FpId>,
    request: Json<RawDataRequest>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
    insight: InsightHeaders,
    ignore_luhn_validation: IgnoreLuhnValidation,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_guard(TenantGuard::WriteEntities)?;

    let path = path.into_inner();
    let request = request.into_inner();
    let result = patch_inner(&state, path, request, auth, insight, *ignore_luhn_validation).await?;
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

    let result = patch_inner(&state, fp_id, request, Box::new(auth), insight, false).await?;
    Ok(result)
}

async fn patch_inner(
    state: &State,
    fp_id: FpId,
    request: RawDataRequest,
    auth: Box<dyn TenantAuth>,
    insight: InsightHeaders,
    ignore_luhn_validation: bool,
) -> JsonApiResponse<EmptyResponse> {
    let insight = CreateInsightEvent::from(insight);

    let tenant_id: newtypes::TenantId = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let principal = auth.actor().into();

    // If the initial request has an ssn4, see if the vault already has the same ssn4 and if so no-op
    // TODO we'll probably want to generalize this logic for all pieces of info later. Could store
    // a hash(uv_id || di || value) inline on vault_data purely for duplicate checking
    use newtypes::IdentityDataKind as IDK;
    let ssn4 = IDK::Ssn4.into();
    let mut request = request;
    if let Some(new_ssn4) = request.get(&ssn4) {
        let fp_id = fp_id.clone();
        let tenant_id = tenant_id.clone();
        let uvw = state
            .db_pool
            .db_query(move |conn| -> ApiResult<_> {
                let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
                let vw = VaultWrapper::<Any>::build_for_tenant(conn, &sv.id)?;
                Ok(vw)
            })
            .await??;
        if uvw.get(ssn4.clone()).is_some() {
            let existing_ssn4 = uvw
                .decrypt_unchecked_single(&state.enclave_client, ssn4.clone())
                .await?
                .ok_or(AssertionError("No ssn4 found"))?;
            // If the ssn4 being added to the vault exactly matches the ssn4 on the vault, remove
            // it from the request to be added to the vault.
            // This is a special request from grid to prevent us from erroring when an ssn4 is
            // added that is consistent with the ssn9
            // This is pretty hacky since no other vaulting endpoints have this logic, and this isn't
            // represented in POST /validate
            // TODO https://linear.app/footprint/issue/FP-4973/make-all-vault-writes-idempotent
            let new_ssn4 = new_ssn4.clone().as_string().map_err(newtypes::Error::from)?;
            if existing_ssn4.safe_compare(&new_ssn4) {
                request.remove(&ssn4);
            }
        }
    }
    let targets = request.keys().cloned().collect_vec();
    let mut args = ValidateArgs::for_non_portable(is_live);
    args.ignore_luhn_validation = ignore_luhn_validation;
    let request = request.clean_and_validate(args)?;
    let request = request.build_tenant_fingerprints(state, &tenant_id).await?;

    let source = auth.source();
    let actor = auth.actor();
    state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let scoped_user: ScopedVault = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;

            let uvw = VaultWrapper::<Any>::lock_for_onboarding(conn, &scoped_user.id)?;
            uvw.patch_data(conn, request, source, Some(actor))?;

            // Create an access event to show data was added
            NewAccessEvent {
                scoped_vault_id: scoped_user.id.clone(),
                tenant_id: scoped_user.tenant_id,
                is_live: scoped_user.is_live,
                reason: None,
                principal,
                insight,
                kind: AccessEventKind::Update,
                targets,
                purpose: AccessEventPurpose::Api,
            }
            .create(conn)?;

            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}
