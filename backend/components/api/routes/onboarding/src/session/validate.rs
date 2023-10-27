use crate::auth::session::AuthSessionData;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::errors::onboarding::OnboardingError;
use crate::types::response::ResponseData;
use crate::utils::session::AuthSession;
use crate::State;
use api_core::auth::session::user::ValidateUserToken;
use api_core::auth::tenant::{CheckTenantGuard, TenantGuard};
use api_core::errors::ApiResult;
use api_core::types::JsonApiResponse;
use api_core::utils::db2api::DbToApi;
use api_wire_types::{
    EntityValidateResponse, UserAuthResponse, ValidateAuthEvent, ValidateRequest, ValidateResponse,
};
use db::models::auth_event::AuthEvent;
use db::models::manual_review::ManualReview;
use db::models::ob_configuration::ObConfiguration;
use db::models::scoped_vault::ScopedVault;
use db::models::workflow::{Workflow, WorkflowIdentifier};
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
) -> JsonApiResponse<ValidateResponse> {
    let auth = auth.check_guard(TenantGuard::Onboarding)?;

    let session = AuthSession::get(&state, &request.validation_token)
        .await?
        .ok_or(OnboardingError::ValidateTokenInvalidOrNotFound)?
        .data;

    let AuthSessionData::ValidateUserToken(ValidateUserToken { sv_id, wf_id, auth_event_ids }) = session else {
        return Err(OnboardingError::ValidateTokenInvalidOrNotFound.into());
    };

    let (sv, auth_events, wf, biz_wf) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let sv = ScopedVault::get(conn, &sv_id)?;
            let auth_events = AuthEvent::get_bulk(conn, &auth_event_ids)?;
            let (wf, biz_wf) = if let Some(wf_id) = wf_id {
                let (wf, _) = Workflow::get_all(conn, &wf_id)?;
                let user_mr = ManualReview::get_active(conn, &wf_id)?;
                let obc_id = wf
                    .ob_configuration_id
                    .as_ref()
                    .ok_or(OnboardingError::NoObcForWorkflow)?;
                let (ob_config, _) = ObConfiguration::get(conn, obc_id)?;
                let biz_wf = if ob_config.kind == ObConfigurationKind::Kyb {
                    let id = WorkflowIdentifier::BusinessOwner {
                        owner_vault_id: &sv.vault_id,
                        ob_config_id: &ob_config.id,
                    };
                    let (biz_wf, biz_sv) = Workflow::get_all(conn, id)?;
                    let biz_mr = ManualReview::get_active(conn, &biz_wf.id)?;
                    Some((biz_sv, biz_wf, biz_mr))
                } else {
                    None
                };
                (Some((wf, user_mr)), biz_wf)
            } else {
                (None, None)
            };
            Ok((sv, auth_events, wf, biz_wf))
        })
        .await??;

    let (footprint_user_id, status, requires_manual_review, onboarding_configuration_id, timestamp) =
        // Support a version of the API that is backwards-compatible for some tenants that integrated
        // with an old version
        if auth.tenant().uses_legacy_serialization() {
            (
                Some(sv.fp_id.clone()),
                Some(wf.as_ref().and_then(|(wf, _)| wf.status).ok_or(OnboardingError::NoStatusForWorkflow)?),
                Some(wf.as_ref().and_then(|(_, mr)| mr.as_ref()).is_some()),
                wf.as_ref().and_then(|(wf, _)| wf.ob_configuration_id.clone()),
                wf.as_ref().map(|(wf, _)| wf.created_at),
            )
        } else {
            (None, None, None, None, None)
        };

    // Validate and serialize the user and optionally the business onboardings
    let validate_and_serialize = |sv: ScopedVault,
                                  mr: Option<ManualReview>,
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
        let response = api_wire_types::EntityValidateResponse::from_db((status, sv, mr));
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
    let user = wf
        .map(|(wf, mr)| validate_and_serialize(sv, mr, wf, VaultKind::Person))
        .transpose()?;
    let business = biz_wf
        .map(|(sv, wf, mr)| validate_and_serialize(sv, mr, wf, VaultKind::Business))
        .transpose()?;
    let response = ValidateResponse {
        user_auth,
        user,
        business,
        footprint_user_id,
        status,
        requires_manual_review,
        onboarding_configuration_id,
        timestamp,
    };
    ResponseData::ok(response).json()
}
