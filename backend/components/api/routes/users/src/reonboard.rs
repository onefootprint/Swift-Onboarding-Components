use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::State;
use api_core::auth::session::user::NewUserSessionArgs;
use api_core::auth::session::user::NewUserSessionContext;
use api_core::auth::session::user::UserSession;
use api_core::auth::session::user::UserSessionPurpose;
use api_core::auth::tenant::SecretTenantAuthContext;
use api_core::config::LinkKind;
use api_core::errors::tenant::TenantError;
use api_core::errors::user::UserError;
use api_core::errors::ApiResult;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::session::AuthSession;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_wire_types::ReonboardResponse;
use chrono::Duration;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::Workflow;
use newtypes::PreviewApi;
use newtypes::VaultKind;
use paperclip::actix::{api_v2_operation, post, web};

// TODO rm after findigs stops using it
#[api_v2_operation(
    description = "Generate a link that can be sent to the user to ask them to reonboard to the last playbook they onboarded onto.",
    tags(Users, Deprecated)
)]
#[post("/users/{fp_id}/reonboard")]
pub async fn post(
    state: web::Data<State>,
    fp_id: FpIdPath,
    auth: SecretTenantAuthContext,
) -> JsonApiResponse<ReonboardResponse> {
    auth.check_preview_guard(PreviewApi::ReonboardUser)?;
    let auth = auth.check_guard(TenantGuard::AuthToken)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let session_key = state.session_sealing_key.clone();

    let (auth_token, session) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let vw = VaultWrapper::<Any>::build_for_tenant(conn, &sv.id)?;

            // TODO: Other validation conditions to trigger RedoKyc
            if vw.vault.kind != VaultKind::Person {
                return Err(TenantError::IncorrectVaultKindForRedoKyc.into());
            }

            let (_, obc) = Workflow::latest(conn, &sv.id, true)?.ok_or(UserError::NoCompleteOnboardings)?;

            let duration = Duration::days(1);
            let context = NewUserSessionContext {
                su_id: Some(sv.id),
                obc_id: Some(obc.id),
                is_from_api: true,
                ..Default::default()
            };
            let args = NewUserSessionArgs {
                user_vault_id: sv.vault_id,
                purpose: Some(UserSessionPurpose::ApiReonboard),
                context,
                scopes: vec![],
                auth_events: vec![],
            };
            let data = UserSession::make(args)?;
            let (auth_token, session) = AuthSession::create_sync(conn, &session_key, data, duration)?;
            Ok((auth_token, session))
        })
        .await?;

    let link = state
        .config
        .service_config
        .generate_link(LinkKind::VerifyUser, &auth_token);

    let result = ReonboardResponse {
        link,
        expires_at: session.expires_at,
    };
    ResponseData::ok(result).json()
}
