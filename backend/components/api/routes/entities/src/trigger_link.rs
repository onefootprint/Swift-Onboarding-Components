use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::TenantSessionAuth;
use crate::types::response::ResponseData;
use crate::types::JsonApiResponse;
use crate::State;
use api_core::auth::session::user::UserSession;
use api_core::auth::session::user::UserSessionArgs;
use api_core::errors::ApiResult;
use api_core::errors::ValidationError;
use api_core::utils::fp_id_path::FpIdPathPlus;
use api_core::utils::session::AuthSession;
use api_wire_types::TriggerLinkResponse;
use chrono::Duration;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow_request::WorkflowRequest;
use newtypes::WorkflowRequestId;
use paperclip::actix::{api_v2_operation, post, web};

#[api_v2_operation(
    description = "Trigger a workflow for the provided user.",
    tags(EntityDetails, Entities, Private)
)]
#[post("/entities/{fp_id}/triggers/{id}/link")]
pub async fn post(
    state: web::Data<State>,
    path: FpIdPathPlus<WorkflowRequestId>,
    auth: TenantSessionAuth,
) -> JsonApiResponse<TriggerLinkResponse> {
    let auth = auth.check_guard(TenantGuard::ManualReview)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let (fp_id, wfr_id) = path.into_inner();
    let session_key = state.session_sealing_key.clone();

    // Generate an auth token using the existing wfr.
    // This is safe since each wfr only allows creating on workflow
    let auth_token = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let wfr = WorkflowRequest::get(conn, &wfr_id, &sv.id)?;
            if wfr.deactivated_at.is_some() {
                return Err(ValidationError("This trigger is no longer active").into());
            }
            let (obc, _) = ObConfiguration::get(conn, &wfr.ob_configuration_id)?;

            let auth_args = UserSessionArgs {
                su_id: Some(sv.id.clone()),
                obc_id: Some(obc.id),
                wfr_id: Some(wfr.id),
                is_from_api: true,
                ..Default::default()
            };

            // No scopes or auth factors - require the user to re-auth when using this token
            let duration = Duration::days(3);
            let data = UserSession::make(sv.vault_id, auth_args, vec![], vec![], vec![])?;
            let (auth_token, _) = AuthSession::create_sync(conn, &session_key, data, duration)?;
            // Create an auth token for this workflow that we will send to the user
            Ok(auth_token)
        })
        .await?;

    let link = state
        .config
        .service_config
        .generate_verify_link(&auth_token, "user");

    let response = TriggerLinkResponse { link };
    ResponseData::ok(response).json()
}
