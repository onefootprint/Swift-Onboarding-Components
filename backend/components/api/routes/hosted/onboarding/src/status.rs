use crate::auth::user::UserAuthScope;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::auth::user::UserWfAuthContext;
use api_core::errors::ApiResult;
use api_core::types::ModernApiResult;
use api_core::utils::headers::InsightHeaders;
use api_core::utils::requirements::GetRequirementsArgs;
use api_wire_types::hosted::onboarding_status::ApiOnboardingRequirement;
use api_wire_types::hosted::onboarding_status::OnboardingStatusResponse;
use db::models::insight_event::CreateInsightEvent;
use db::models::liveness_event::LivenessEvent;
use db::models::liveness_event::NewLivenessEvent;
use db::models::webauthn_credential::WebauthnCredential;
use itertools::Itertools;
use newtypes::LivenessSource;
use newtypes::SkipLivenessClientType;
use newtypes::SkipLivenessContext;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    tags(Onboarding, Hosted),
    description = "Returns the status of the onboarding."
)]
#[actix::get("/hosted/onboarding/status")]
pub async fn get(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
    insights: InsightHeaders,
) -> ModernApiResult<OnboardingStatusResponse> {
    let user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;

    if user_auth.tenant().id.is_flexcar() {
        let vault_id = user_auth.user().id.clone();
        let sv_id = user_auth.scoped_user.id.clone();
        state
            .db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let credentials = WebauthnCredential::list(conn, &vault_id)?;

                let liveness_skip_events = LivenessEvent::get_by_scoped_vault_id(conn, &sv_id)?
                    .into_iter()
                    .filter(|evt| matches!(evt.liveness_source, LivenessSource::Skipped))
                    .collect_vec();

                let has_registered_passkey = !liveness_skip_events.is_empty() || !credentials.is_empty();
                let is_desktop = insights.is_desktop_viewer.as_ref().is_some_and(|d| !d.is_empty());
                if has_registered_passkey || is_desktop {
                    return Ok(());
                }

                let insight_event = CreateInsightEvent::from(insights).insert_with_conn(conn)?;
                let skip_context = SkipLivenessContext {
                    reason: "skip_for_flexcar".to_string(),
                    client_type: SkipLivenessClientType::Mobile,
                    num_attempts: 0,
                    attempts: vec![],
                };

                let _ = NewLivenessEvent {
                    scoped_vault_id: sv_id,
                    attributes: None,
                    liveness_source: newtypes::LivenessSource::Skipped,
                    insight_event_id: Some(insight_event.id),
                    skip_context: Some(skip_context),
                }
                .insert(conn)?;

                Ok(())
            })
            .await?;
    }

    let reqs = api_core::utils::requirements::get_requirements_for_person_and_maybe_business(
        &state,
        GetRequirementsArgs::from(&user_auth)?,
    )
    .await?;
    let all_requirements = reqs
        .into_iter()
        .map(|r| ApiOnboardingRequirement {
            is_met: r.is_met(),
            requirement: r,
        })
        .collect_vec();
    let ob_config = user_auth.ob_config().clone();
    let tenant = user_auth.tenant().clone();
    let ff_client = state.ff_client.clone();
    let ob_config =
        api_wire_types::PublicOnboardingConfiguration::from_db((ob_config, tenant, None, None, ff_client));

    Ok(OnboardingStatusResponse {
        all_requirements,
        // This is only used by the handoff app - we might be able to rm and move elsewhere
        ob_configuration: ob_config,
    })
}
