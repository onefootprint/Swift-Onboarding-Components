use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthScopeDiscriminant;
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::hosted::onboarding::get_requirements;
use crate::types::response::ResponseData;
use crate::State;
use db::models::onboarding::Onboarding;
use db::models::onboarding::OnboardingUpdate;
use itertools::Itertools;
use newtypes::OnboardingStatus;
use newtypes::SessionAuthToken;
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};
use webhooks::events::WebhookEvent;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
pub struct CommitResponse {
    /// Footprint validation token
    validation_token: SessionAuthToken,
    status: OnboardingStatus,
}

#[api_v2_operation(
    tags(Hosted, Bifrost),
    description = "Finish onboarding the user. Returns the validation token that can be used for login."
)]
#[actix::post("/hosted/onboarding/authorize")]
pub async fn post(
    user_auth: UserAuthContext,
    state: web::Data<State>,
) -> actix_web::Result<Json<ResponseData<CommitResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::OrgOnboarding])?;

    let session_key = state.session_sealing_key.clone();
    let (validation_token, status, su, wh_event) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            // Verify there are no unmet requirements
            let ob_info = user_auth.assert_onboarding(conn)?;
            let (requirements, ob) = get_requirements(conn, &ob_info)?;
            if !requirements.is_empty() {
                let unmet_requirements = requirements.into_iter().map(|x| x.into()).collect_vec();
                return Err(OnboardingError::UnmetRequirements(unmet_requirements.into()).into());
            }

            // Mark the onboarding as authorized and create validation token
            let ob_id = ob.id.clone();
            ob.update(conn, OnboardingUpdate::is_authorized(true))?;

            // Return status as well
            let (ob, scoped_user, manual_review, latest_decision) = Onboarding::get(conn, &ob_id)?;

            let (status, timestamp) = latest_decision
                .and_then(|ld| ld.visible_status().map(|vs| (vs, ld.created_at)))
                .ok_or(OnboardingError::NonTerminalState)?;

            // create the webhook event to fire
            let wh_event = WebhookEvent::OnboardingCompleted {
                footprint_user_id: scoped_user.fp_user_id.clone(),
                timestamp,
                status,
                onboarding_configuration_id: ob.ob_configuration_id,
                requires_manual_review: manual_review.is_some(),
            };

            let validation_token = super::create_onboarding_validation_token(conn, &session_key, ob.id)?;
            Ok((validation_token, status, scoped_user, wh_event))
        })
        .await??;

    let tenant_id = su.tenant_id.clone();
    state
        .webhook_service_client
        .send_event_to_tenant_non_blocking(tenant_id, wh_event, None);
    if su.is_live && crate::decision::utils::should_bill(&state.feature_flag_client, &su.tenant_id) {
        billing::update_pii_charge(state.stripe_client.clone(), state.db_pool.clone(), su.tenant_id);
    }

    Ok(Json(ResponseData {
        data: CommitResponse {
            validation_token,
            status,
        },
    }))
}
