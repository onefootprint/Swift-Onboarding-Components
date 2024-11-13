use crate::auth::session::AuthSessionData;
use crate::auth::tenant::TenantApiKeyAuth;
use crate::errors::onboarding::OnboardingError;
use crate::utils::session::AuthSession;
use crate::State;
use api_core::auth::session::user::ValidateUserToken;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantGuard;
use api_core::telemetry::RootSpan;
use api_core::types::ApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::utils::requirements::requires_biz_workflow;
use api_core::FpResult;
use api_errors::BadRequest;
use api_wire_types::EntityValidateResponse;
use api_wire_types::UserAuthResponse;
use api_wire_types::ValidateAuthEvent;
use api_wire_types::ValidateRequest;
use api_wire_types::ValidateResponse;
use db::models::auth_event::AuthEvent;
use db::models::manual_review::ManualReview;
use db::models::manual_review::ManualReviewFilters;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::Workflow;
use newtypes::AuthEventKind;
use newtypes::OnboardingStatus;
use newtypes::VaultKind;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;

#[api_v2_operation(
    description = "After a user finishes an interactive Footprint onboarding flow through one of our SDKs, your application will be given a validation token. This API allows you to exchange that short-lived validation token for the long-lived `fp_id` of the user who finished the flow. This also returns some information about the flow that the user has completed.",
    tags(Onboarding, PublicApi)
)]
#[post("/onboarding/session/validate")]
pub async fn post(
    state: web::Data<State>,
    request: web::Json<ValidateRequest>,
    auth: TenantApiKeyAuth,
    root_span: RootSpan,
) -> ApiResponse<ValidateResponse> {
    let auth = auth.check_guard(TenantGuard::Onboarding)?;

    root_span.record("auth_token_hash", request.validation_token.id().to_string());
    let session = AuthSession::get(&state, &request.validation_token).await?.data;

    let AuthSessionData::ValidateUserToken(ValidateUserToken {
        sv_id,
        wf_id,
        biz_wf_id,
        auth_event_ids,
    }) = session
    else {
        return Err(OnboardingError::ValidateTokenInvalid.into());
    };

    let (sv, auth_events, wf, biz_wf) = state
        .db_query(move |conn| -> FpResult<_> {
            let sv = ScopedVault::get(conn, &sv_id)?;
            let auth_events = AuthEvent::get_bulk(conn, &auth_event_ids)?;
            let (wf, biz_wf) = if let Some(wf_id) = wf_id {
                let (wf, sv) = Workflow::get_all(conn, &wf_id)?;
                let mr_filters = ManualReviewFilters::get_active();
                let user_mrs = ManualReview::get(conn, &sv.id, mr_filters.clone())?;
                let (obc, _) = ObConfiguration::get(conn, &wf.ob_configuration_id)?;
                let biz_wf = if requires_biz_workflow(&wf, &obc)? {
                    let biz_wf_id = biz_wf_id.ok_or(BadRequest("Missing business workflow"))?;
                    let (biz_wf, biz_sv) = Workflow::get_all(conn, &biz_wf_id)?;
                    let biz_mrs = ManualReview::get(conn, &biz_sv.id, mr_filters)?;
                    Some((biz_sv, biz_wf, biz_mrs, obc.clone()))
                } else {
                    None
                };
                (Some((wf, user_mrs, obc)), biz_wf)
            } else {
                (None, None)
            };
            Ok((sv, auth_events, wf, biz_wf))
        })
        .await?;

    root_span.record_su(&sv);

    // Composer integrated with an old version of this API that expects the obc ID...
    // https://onefootprint.slack.com/archives/C04QDTDM7TR/p1716407736679449?thread_ts=1710368278.003619&cid=C04QDTDM7TR
    // For now, we'll keep serializing this, but we should migrate them away as soon as we start
    // serializing the playbook key here.
    let onboarding_configuration_id = if auth.tenant().pinned_api_version.is_some_and(|v| v <= 2) {
        wf.as_ref().map(|(_, _, obc)| obc.id.clone())
    } else {
        None
    };

    // Validate and serialize the user and optionally the business onboardings
    let validate_and_serialize = |sv: ScopedVault,
                                  mrs: Vec<ManualReview>,
                                  wf: Workflow,
                                  obc: ObConfiguration|
     -> FpResult<EntityValidateResponse> {
        if sv.tenant_id != auth.tenant().id {
            return Err(OnboardingError::TenantMismatch.into());
        }
        if sv.is_live != auth.is_live()? {
            return Err(OnboardingError::InvalidSandboxState.into());
        }
        if matches!(sv.kind, VaultKind::Person) && matches!(wf.status, OnboardingStatus::Incomplete) {
            // For now, tenants aren't expecting this enum values in the response
            return Err(OnboardingError::NonTerminalState.into());
        }

        let response = api_wire_types::EntityValidateResponse::from_db((wf.status, sv, mrs, obc));
        Ok(response)
    };
    let user_auth = UserAuthResponse {
        fp_id: sv.fp_id.clone(),
        auth_events: auth_events
            .into_iter()
            // Not sure if we'll keep this around forever, so hide from validate response
            .filter(|ae| ae.kind != AuthEventKind::ThirdParty)
            .map(|ae| ValidateAuthEvent {
                kind: ae.kind.into(),
                timestamp: ae.created_at,
            })
            .collect(),
    };
    let wf_id = wf.as_ref().map(|(wf, _, _)| wf.id.clone());
    let user = wf
        .map(|(wf, mrs, obc)| validate_and_serialize(sv, mrs, wf, obc))
        .transpose()?;
    let business = biz_wf
        .map(|(sv, wf, mrs, obc)| validate_and_serialize(sv, mrs, wf, obc))
        .transpose()?;

    if let Some(wf_id) = wf_id {
        // After all validation has occurred, updated the session_validated_at on the workflow
        state
            .db_query(move |conn| Workflow::set_session_validated_at(conn, &wf_id))
            .await?;
    }

    let response = ValidateResponse {
        user_auth,
        user,
        business,
        onboarding_configuration_id,
    };
    Ok(response)
}
