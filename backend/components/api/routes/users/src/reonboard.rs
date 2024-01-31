use crate::{
    auth::tenant::{CheckTenantGuard, TenantGuard},
    types::{response::ResponseData, JsonApiResponse},
    State,
};
use api_core::{
    auth::{
        session::user::{NewUserSessionArgs, NewUserSessionContext, UserSession, UserSessionPurpose},
        tenant::SecretTenantAuthContext,
    },
    config::LinkKind,
    errors::{tenant::TenantError, user::UserError, ApiResult},
    utils::{
        fp_id_path::FpIdPath,
        session::AuthSession,
        vault_wrapper::{Any, VaultWrapper},
    },
};
use api_wire_types::ReonboardResponse;
use chrono::Duration;
use db::models::{scoped_vault::ScopedVault, workflow::Workflow};
use newtypes::{PreviewApi, VaultKind};
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
                ..Default::default()
            };
            let args = NewUserSessionArgs {
                user_vault_id: sv.vault_id,
                purpose: UserSessionPurpose::ApiReonboard,
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
