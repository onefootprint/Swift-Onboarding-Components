use crate::auth::user::UserAuthScope;
use crate::errors::onboarding::OnboardingError;
use crate::FpResult;
use crate::State;
use api_core::auth::user::UserWfAuthContext;
use api_core::errors::onboarding::UnmetRequirements;
use api_core::types::ApiResponse;
use api_core::utils::requirements::get_requirements_for_person_and_maybe_business;
use api_core::utils::requirements::GetRequirementsArgs;
use db::models::workflow::Workflow;
use itertools::Itertools;
use newtypes::OnboardingRequirement;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    tags(Onboarding, Hosted),
    description = "Mark the onboarding as authorized and initiate IDV checks"
)]
#[actix::post("/hosted/onboarding/authorize")]
pub async fn post(
    user_auth: UserWfAuthContext,
    state: web::Data<State>,
) -> ApiResponse<api_wire_types::Empty> {
    let user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;

    let span = tracing::Span::current();
    span.record("tenant_id", &format!("{:?}", user_auth.tenant().id.as_str()));
    span.record("tenant_name", &format!("{:?}", user_auth.tenant().name.as_str()));
    span.record("scoped_user_id", &format!("{}", user_auth.scoped_user.id));
    span.record("ob_configuration_id", &format!("{}", user_auth.ob_config().id));
    span.record("workflow_id", &format!("{}", user_auth.workflow().id));

    // Verify there are no unmet requirements
    let reqs = get_requirements_for_person_and_maybe_business(&state, GetRequirementsArgs::from(&user_auth)?)
        .await?;
    let unmet_reqs = reqs
        .into_iter()
        .filter(|r| !r.is_met())
        // An Authorize/Process requirement shouldn't block the authorize endpoint!
        .filter(|r| !matches!(r, OnboardingRequirement::Authorize { .. } | OnboardingRequirement::Process ))
        .collect_vec();
    if !unmet_reqs.is_empty() {
        return Err(OnboardingError::from(UnmetRequirements(unmet_reqs)).into());
    }

    // mark person and business wf as authorized
    let wf_id = user_auth.workflow().id.clone();
    state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let wf = Workflow::lock(conn, &wf_id)?;
            if wf.authorized_at.is_none() {
                Workflow::set_is_authorized(wf, conn)?;
            }

            // TODO we eventually won't hit this anymore because business workflows are now
            // automatically authorized
            let biz_wf = user_auth.business_workflow(conn)?;
            if let Some(biz_wf) = biz_wf {
                let biz_wf = Workflow::lock(conn, &biz_wf.id)?;
                if biz_wf.authorized_at.is_none() {
                    Workflow::set_is_authorized(biz_wf, conn)?;
                }
            }
            Ok(())
        })
        .await?;

    Ok(api_wire_types::Empty)
}
