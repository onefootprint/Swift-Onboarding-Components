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
use api_wire_types::TriggerRequest;
use chrono::Duration;
use db::models::document_request::DocumentRequest;
use db::models::document_request::NewDocumentRequestArgs;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::user_timeline::UserTimeline;
use db::models::vault::Vault;
use db::models::workflow::Workflow;
use newtypes::AlpacaKycConfig;
use newtypes::CipKind;
use newtypes::DocumentConfig;
use newtypes::FpId;
use newtypes::KycConfig;
use newtypes::TriggerInfo;
use newtypes::VaultKind;
use newtypes::WorkflowTriggeredInfo;
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
    let TriggerRequest { trigger, note } = request.into_inner();
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let fp_id = fp_id.into_inner();
    let session_key = state.session_sealing_key.clone();
    let actor = auth.actor().into();

    // Generate an auth token for the user and send to their phone number on file
    let trigger_kind = trigger.into();
    let (vw, auth_token) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let cip_kind = if let Some(obc_id) = sv.ob_configuration_id {
                let (obc, _) = ObConfiguration::get(conn, &obc_id)?;
                obc.cip_kind
            } else {
                None
            };
            let vw = VaultWrapper::<Any>::build_for_tenant(conn, &sv.id)?;

            let vault = Vault::get(conn, &sv.vault_id)?;
            // TODO: Other validation conditions to trigger RedoKyc
            if vault.kind != VaultKind::Person {
                return Err(TenantError::IncorrectVaultKindForRedoKyc.into());
            }
            if !vault.is_portable {
                return Err(TenantError::CannotTriggerKycForNonPortable.into());
            }

            let wf = match trigger {
                TriggerInfo::RedoKyc => {
                    let config = if matches!(cip_kind, Some(CipKind::Alpaca)) {
                        AlpacaKycConfig { is_redo: true }.into()
                    } else {
                        KycConfig { is_redo: true }.into()
                    };
                    Workflow::create(conn, &sv.id, config, None)?
                }
                TriggerInfo::IdDocument { collect_selfie } => {
                    let wf = Workflow::create(conn, &sv.id, DocumentConfig {}.into(), None)?;
                    let args = NewDocumentRequestArgs {
                        scoped_vault_id: sv.id.clone(),
                        ref_id: None,
                        workflow_id: Some(wf.id.clone()),
                        should_collect_selfie: collect_selfie,
                        // TODO should these come from the last doc request? or be tenant-specific? or from workflow?
                        only_us: false,
                        doc_type_restriction: None,
                    };
                    DocumentRequest::create(conn, args)?;
                    wf
                }
            };
            // Create a timeline event logging that the workflow was triggered
            let event = WorkflowTriggeredInfo {
                workflow_id: wf.id.clone(),
                actor,
            };
            UserTimeline::create(conn, event, sv.vault_id.clone(), sv.id.clone())?;
            // Create an auth token for this workflow that we will send to the user
            let scopes = vec![
                UserAuthScope::SignUp,
                // NOTE: when we remove this OrgOnboarding scope, make sure we're able to
                // look up the ob_config and tenant on UserObAuth via the Workflow scope
                UserAuthScope::OrgOnboarding { id: sv.id.clone() },
                UserAuthScope::Workflow { wf_id: wf.id },
            ];
            let duration = Duration::days(1);
            let data = UserSession::make(sv.vault_id, scopes);
            let (auth_token, _) = AuthSession::create_sync(conn, &session_key, data, duration)?;
            Ok((vw, auth_token))
        })
        .await?;

    let phone_number = vw.get_decrypted_primary_phone(&state).await?;
    let url = state
        .config
        .service_config
        .generate_verify_link(auth_token, "user");
    let org_name = auth.tenant().name.clone();
    state
        .twilio_client
        .send_trigger(&state, &phone_number, note, org_name, trigger_kind, url)
        .await?;

    ResponseData::ok(EmptyResponse {}).json()
}
