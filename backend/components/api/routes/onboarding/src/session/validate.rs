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
use api_wire_types::{EntityValidateResponse, ValidateRequest, ValidateResponse};
use db::models::manual_review::ManualReview;
use db::models::ob_configuration::ObConfiguration;
use db::models::onboarding::{BasicOnboardingInfo, Onboarding, OnboardingIdentifier};
use db::models::workflow::Workflow;
use newtypes::{DataIdentifierDiscriminant, VaultKind};
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

    let AuthSessionData::ValidateUserToken(ValidateUserToken { ob_id, wf_id }) = session else {
        return Err(OnboardingError::ValidateTokenInvalidOrNotFound.into());
    };

    let (wf, user_ob, user_mr, biz_ob) = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let wf = wf_id.map(|wf_id| Workflow::get(conn, &wf_id)).transpose()?;
            let ob = Onboarding::get(conn, &ob_id)?;
            let wf_id = ob.0.workflow_id(wf.as_ref());
            let user_mr = ManualReview::get_active(conn, wf_id)?;
            let obc_id = ob.0.ob_configuration_id(wf.as_ref());
            let (ob_config, _) = ObConfiguration::get(conn, obc_id)?;
            let biz_ob = if ob_config.must_collect(DataIdentifierDiscriminant::Business) {
                let id = OnboardingIdentifier::BusinessOwner {
                    owner_vault_id: &ob.1.vault_id,
                    ob_config_id: &ob_config.id,
                };
                let biz_ob = Onboarding::get(conn, id)?;
                // TODO this is weird
                let biz_mr = ManualReview::get_active_for_sv(conn, &biz_ob.1.id)?
                    .into_iter()
                    .next();
                Some((biz_ob, biz_mr))
            } else {
                None
            };
            Ok((wf, ob, user_mr, biz_ob))
        })
        .await??;

    let (footprint_user_id, status, requires_manual_review, onboarding_configuration_id, timestamp) =
        // Support a version of the API that is backwards-compatible for some tenants that integrated
        // with an old version
        if auth.tenant().uses_legacy_serialization() {
            (
                Some(user_ob.1.fp_id.clone()),
                Some(user_ob.0.status(wf.as_ref())),
                Some(user_mr.is_some()),
                Some(user_ob.0.ob_configuration_id(wf.as_ref()).clone()),
                Some(user_ob.0.start_timestamp),
            )
        } else {
            (None, None, None, None, None)
        };

    // Validate and serialize the user and optionally the business onboardings
    let validate_and_serialize = |ob_info: BasicOnboardingInfo<Onboarding>,
                                  mr: Option<ManualReview>,
                                  wf: Option<Workflow>,
                                  kind: VaultKind|
     -> ApiResult<EntityValidateResponse> {
        if ob_info.1.tenant_id != auth.tenant().id {
            return Err(OnboardingError::TenantMismatch.into());
        }
        if ob_info.1.is_live != auth.is_live()? {
            return Err(OnboardingError::InvalidSandboxState.into());
        }
        match kind {
            VaultKind::Person => {
                if ob_info.0.status(wf.as_ref()).requires_user_input() {
                    return Err(OnboardingError::NonTerminalState.into());
                }
            }
            // Businesses could still be in status = `incomplete` if we are still waiting for BO's to complete KYC
            VaultKind::Business => {}
        }

        let response = api_wire_types::EntityValidateResponse::from_db((ob_info, mr, wf));
        Ok(response)
    };
    let user = validate_and_serialize(user_ob, user_mr, wf, VaultKind::Person)?;
    let business = biz_ob
        .map(|(ob, mr)| validate_and_serialize(ob, mr, None, VaultKind::Business))
        .transpose()?;

    let response = ValidateResponse {
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
