use crate::{
    auth::{session::AuthSessionData, tenant::SecretTenantAuthContext},
    errors::onboarding::OnboardingError,
    types::response::ResponseData,
    utils::session::AuthSession,
    State,
};
use api_core::{
    auth::{
        session::user::ValidateUserToken,
        tenant::{CheckTenantGuard, TenantGuard},
    },
    errors::ApiResult,
    telemetry::RootSpan,
    types::JsonApiResponse,
    utils::db2api::DbToApi,
};
use api_wire_types::{
    EntityValidateResponse, UserAuthResponse, ValidateAuthEvent, ValidateRequest, ValidateResponse,
};
use db::models::{
    auth_event::AuthEvent,
    manual_review::ManualReview,
    ob_configuration::ObConfiguration,
    scoped_vault::ScopedVault,
    workflow::{Workflow, WorkflowIdentifier},
};
use newtypes::{ObConfigurationKind, VaultKind};
use paperclip::actix::{api_v2_operation, post, web};

#[api_v2_operation(
    description = "Validate a short-lived onboarding session token and exchange it for a long-lived fp_id",
    tags(Onboarding, PublicApi)
)]
#[post("/onboarding/session/validate")]
pub async fn post(
    state: web::Data<State>,
    request: web::Json<ValidateRequest>,
    auth: SecretTenantAuthContext,
    root_span: RootSpan,
) -> JsonApiResponse<ValidateResponse> {
    let auth = auth.check_guard(TenantGuard::Onboarding)?;

    root_span.record("auth_token_hash", request.validation_token.id().to_string());
    let session = AuthSession::get(&state, &request.validation_token).await?.data;

    let AuthSessionData::ValidateUserToken(ValidateUserToken {
        sv_id,
        wf_id,
        auth_event_ids,
    }) = session
    else {
        return Err(OnboardingError::ValidateTokenInvalid.into());
    };

    let (sv, auth_events, wf, biz_wf) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, &sv_id)?;
            let auth_events = AuthEvent::get_bulk(conn, &auth_event_ids)?;
            let (wf, biz_wf) = if let Some(wf_id) = wf_id {
                let (wf, sv) = Workflow::get_all(conn, &wf_id)?;
                let user_mrs = ManualReview::get_active(conn, &sv.id)?;
                let obc_id = wf
                    .ob_configuration_id
                    .as_ref()
                    .ok_or(OnboardingError::NoObcForWorkflow)?;
                let (ob_config, _) = ObConfiguration::get(conn, obc_id)?;
                let biz_wf = if ob_config.kind == ObConfigurationKind::Kyb {
                    let id = WorkflowIdentifier::BusinessOwner {
                        owner_vault_id: &sv.vault_id,
                        ob_config_id: &ob_config.id,
                        is_business: (),
                    };
                    let (biz_wf, biz_sv) = Workflow::get_all(conn, id)?;
                    let biz_mrs = ManualReview::get_active(conn, &biz_sv.id)?;
                    Some((biz_sv, biz_wf, biz_mrs))
                } else {
                    None
                };
                (Some((wf, user_mrs)), biz_wf)
            } else {
                (None, None)
            };
            Ok((sv, auth_events, wf, biz_wf))
        })
        .await?;

    // Some logging metadata
    root_span.record("fp_id", sv.fp_id.to_string());
    root_span.record("vault_id", sv.vault_id.to_string());
    root_span.record("tenant_id", sv.tenant_id.to_string());
    root_span.record("is_live", sv.is_live);

    // Composer integrated with an old version of this API that expects the obc ID...
    // https://onefootprint.slack.com/archives/C04QDTDM7TR/p1716407736679449?thread_ts=1710368278.003619&cid=C04QDTDM7TR
    // For now, we'll keep serializing this, but we should migrate them away as soon as we start
    // serializing the playbook key here.
    let onboarding_configuration_id = if auth.tenant().pinned_api_version.is_some_and(|v| v <= 2) {
        wf.as_ref().and_then(|(wf, _)| wf.ob_configuration_id.clone())
    } else {
        None
    };

    // Validate and serialize the user and optionally the business onboardings
    let validate_and_serialize = |sv: ScopedVault,
                                  mrs: Vec<ManualReview>,
                                  wf: Workflow,
                                  kind: VaultKind|
     -> ApiResult<EntityValidateResponse> {
        if sv.tenant_id != auth.tenant().id {
            return Err(OnboardingError::TenantMismatch.into());
        }
        if sv.is_live != auth.is_live()? {
            return Err(OnboardingError::InvalidSandboxState.into());
        }
        match kind {
            VaultKind::Person => match wf.status {
                None => return Err(OnboardingError::NonTerminalState.into()),
                Some(s) if s.requires_user_input() => return Err(OnboardingError::NonTerminalState.into()),
                _ => {}
            },
            // Businesses could still be in status = `incomplete` if we are still waiting for BO's to complete KYC
            VaultKind::Business => {}
        }

        let status = wf.status.ok_or(OnboardingError::NoStatusForWorkflow)?;
        let response = api_wire_types::EntityValidateResponse::from_db((status, sv, mrs));
        Ok(response)
    };
    let user_auth = UserAuthResponse {
        fp_id: sv.fp_id.clone(),
        auth_events: auth_events
            .into_iter()
            .map(|ae| ValidateAuthEvent {
                kind: ae.kind.into(),
                timestamp: ae.created_at,
            })
            .collect(),
    };
    let wf_id = wf.as_ref().map(|(wf, _)| wf.id.clone());
    let user = wf
        .map(|(wf, mrs)| validate_and_serialize(sv, mrs, wf, VaultKind::Person))
        .transpose()?;
    let business = biz_wf
        .map(|(sv, wf, mrs)| validate_and_serialize(sv, mrs, wf, VaultKind::Business))
        .transpose()?;

    if let Some(wf_id) = wf_id {
        // After all validation has occurred, updated the session_validated_at on the workflow
        state
            .db_pool
            .db_query(move |conn| Workflow::set_session_validated_at(conn, &wf_id))
            .await?;
    }

    let response = ValidateResponse {
        user_auth,
        user,
        business,
        onboarding_configuration_id,
    };
    ResponseData::ok(response).json()
}
