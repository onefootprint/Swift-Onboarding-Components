use crate::{
    auth::user::UserAuthGuard,
    errors::{onboarding::OnboardingError, ApiResult},
    types::response::ResponseData,
    State,
};
use api_core::{
    auth::user::UserWfAuthContext,
    types::{EmptyResponse, JsonApiResponse},
    utils::requirements::{get_requirements_for_person_and_maybe_business, GetRequirementsArgs},
};
use db::models::workflow::{Workflow, WorkflowUpdate};
use itertools::Itertools;
use newtypes::OnboardingRequirement;
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    tags(Onboarding, Hosted),
    description = "Mark the onboarding as authorized and initiate IDV checks"
)]
#[actix::post("/hosted/onboarding/authorize")]
pub async fn post(user_auth: UserWfAuthContext, state: web::Data<State>) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::SignUp)?;

    let span = tracing::Span::current();
    span.record("tenant_id", &format!("{:?}", user_auth.tenant().id.as_str()));
    span.record("tenant_name", &format!("{:?}", user_auth.tenant().name.as_str()));
    span.record("scoped_user_id", &format!("{}", user_auth.scoped_user.id));
    span.record("ob_configuration_id", &format!("{}", user_auth.ob_config()?.id));
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
        let unmet_reqs = unmet_reqs.into_iter().map(|x| x.into()).collect_vec();
        return Err(OnboardingError::UnmetRequirements(unmet_reqs.into()).into());
    }

    // mark person and business wf as authorized
    let wf_id = user_auth.workflow().id.clone();
    state
        .db_pool
        .db_transaction(move |c| -> ApiResult<_> {
            let wf = Workflow::lock(c, &wf_id)?;
            if wf.authorized_at.is_none() {
                Workflow::update(wf, c, WorkflowUpdate::is_authorized())?;
            }

            // TODO we eventually won't hit this anymore because business workflows are now
            // automatically authorized
            let biz_wf = user_auth.business_workflow(c)?;
            if let Some(biz_wf) = biz_wf {
                let biz_wf = Workflow::lock(c, &biz_wf.id)?;
                if biz_wf.authorized_at.is_none() {
                    Workflow::update(biz_wf, c, WorkflowUpdate::is_authorized())?;
                }
            }
            Ok(())
        })
        .await?;

    ResponseData::ok(EmptyResponse {}).json()
}
