use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::auth::Either;
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::State;
use api_core::auth::session::user::UserSession;
use api_core::auth::user::UserAuthScope;
use api_core::errors::tenant::TenantError;
use api_core::errors::ApiResult;
use api_core::types::EmptyResponse;
use api_core::utils::session::AuthSession;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_wire_types::TriggerKind;
use api_wire_types::TriggerRequest;
use chrono::Duration;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use db::models::workflow::Workflow;
use newtypes::FpId;
use newtypes::IdentityDataKind as IDK;
use newtypes::VaultKind;
use paperclip::actix::{api_v2_operation, post, web};

#[api_v2_operation(
    description = "Trigger a workflow for the provided user.",
    tags(Entities, Private)
)]
#[post("/entities/{fp_id}/trigger")]
pub async fn post(
    state: web::Data<State>,
    fp_id: web::Path<FpId>,
    request: web::Json<TriggerRequest>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
) -> JsonApiResponse<EmptyResponse> {
    let auth = auth.check_guard(TenantGuard::ManualReview)?;
    let TriggerRequest { kind } = request.into_inner();
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let session_key = state.session_sealing_key.clone();

    // Generate an auth token for the user and send to their phone number on file
    let (vw, auth_token) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let vw = VaultWrapper::<Any>::build_for_tenant(conn, &sv.id)?;

            let (scopes, duration) = match kind {
                TriggerKind::RedoKyc => {
                    let vault = Vault::get(conn, &sv.vault_id)?;
                    // TODO: Other validation conditions to trigger RedoKyc
                    if vault.kind != VaultKind::Person {
                        return Err(TenantError::IncorrectVaultKindForRedoKyc.into());
                    }
                    if !vault.is_portable {
                        return Err(TenantError::CannotTriggerKycForNonPortable.into());
                    }
                    let wf = Workflow::create_redo_kyc(conn, &sv.id)?;
                    let scopes = vec![
                        UserAuthScope::SignUp,
                        // NOTE: when we remove this OrgOnboarding scope, make sure we're able to
                        // look up the ob_config and tenant on UserObAuth via the Workflow scope
                        UserAuthScope::OrgOnboarding { id: sv.id },
                        UserAuthScope::Workflow { wf_id: wf.id },
                    ];
                    let duration = Duration::days(1);
                    (scopes, duration)

                    // TODO make a timeline event?
                }
            };
            let data = UserSession::make(sv.vault_id, scopes);
            let (auth_token, _) = AuthSession::create_sync(conn, &session_key, data, duration)?;
            Ok((vw, auth_token))
        })
        .await??;

    let phone_number = vw.get_decrypted_primary_phone(&state).await?;
    let first_name = vw
        .decrypt_unchecked_single(&state.enclave_client, IDK::FirstName.into())
        .await?;
    let url = state.config.service_config.generate_verify_link(auth_token);
    let org_name = auth.tenant().name.clone();
    state
        .twilio_client
        .send_trigger(&state, &phone_number, first_name, org_name, kind, url)
        .await?;

    ResponseData::ok(EmptyResponse {}).json()
}
