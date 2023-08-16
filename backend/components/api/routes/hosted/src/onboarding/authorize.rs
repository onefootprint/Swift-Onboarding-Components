use crate::auth::user::UserAuthGuard;
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiResult;
use crate::onboarding::get_requirements;
use crate::onboarding::GetRequirementsArgs;
use crate::types::response::ResponseData;
use crate::State;
use api_core::auth::user::UserObAuthContext;
use api_core::decision::state::actions::WorkflowActions;
use api_core::decision::state::Authorize;
use api_core::decision::state::WorkflowWrapper;
use api_core::types::EmptyResponse;
use api_core::types::JsonApiResponse;
use db::models::onboarding::Onboarding;
use db::models::onboarding::OnboardingUpdate;
use db::models::workflow::Workflow;
use itertools::Itertools;
use newtypes::OnboardingRequirement;
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    tags(Hosted, Bifrost),
    description = "Mark the onboarding as authorized and initiate IDV checks"
)]
#[actix::post("/hosted/onboarding/authorize")]
pub async fn post(user_auth: UserObAuthContext, state: web::Data<State>) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::OrgOnboarding)?;

    let span = tracing::Span::current();
    span.record("tenant_id", &format!("{:?}", user_auth.tenant()?.id.as_str()));
    span.record("tenant_name", &format!("{:?}", user_auth.tenant()?.id.as_str()));
    span.record("onboarding_id", &format!("{}", user_auth.onboarding()?.id));
    span.record("scoped_user_id", &format!("{}", user_auth.scoped_user.id));
    span.record("ob_configuration_id", &format!("{}", user_auth.ob_config()?.id));
    span.record("workflow_id", &format!("{}", user_auth.workflow()?.id));

    // Verify there are no unmet requirements
    let reqs = get_requirements(&state, GetRequirementsArgs::from(&user_auth)?).await?;
    let unmet_reqs = reqs
        .into_iter()
        .filter(|r| !r.is_met())
        // An Authorize/Process requirement shouldn't block the authorize endpoint!
        .filter(|r| !matches!(r, OnboardingRequirement::Authorize { .. } | OnboardingRequirement::Process))
        .collect_vec();
    if !unmet_reqs.is_empty() {
        let unmet_reqs = unmet_reqs.into_iter().map(|x| x.into()).collect_vec();
        return Err(OnboardingError::UnmetRequirements(unmet_reqs.into()).into());
    }

    // mark person and business ob as authorized
    let ob_id = user_auth.onboarding()?.id.clone();

    let wf_id = user_auth.workflow()?.id.clone();
    let (biz_wf, set_biz_is_authorized) = state
        .db_pool
        .db_transaction(move |c| -> ApiResult<_> {
            let ob = Onboarding::lock(c, &ob_id)?;
            // We're now updating the onboarding's authorized_at even if it's already set. This
            // representation is a little strange now, but we'll move away from reading it as the
            // source of truth shortly
            Onboarding::update(ob, c, &wf_id, OnboardingUpdate::is_authorized())?;

            let biz_wf = user_auth.business_workflow(c)?;
            let (set_biz_is_authorized, biz_wf) = if let Some(biz_wf) = biz_wf {
                let (biz_ob, _) = Onboarding::get(c, &biz_wf.id)?;
                let biz_ob = Onboarding::lock(c, &biz_ob.id)?;
                let (set_biz_is_authorized, biz_wf) = if biz_wf.authorized_at.is_none() {
                    let update = OnboardingUpdate::is_authorized();
                    Onboarding::update(biz_ob, c, &biz_wf.id, update)?;
                    // Refresh from DB
                    let biz_wf = Workflow::get(c, &biz_wf.id)?;
                    (true, biz_wf)
                } else {
                    (false, biz_wf)
                };

                (set_biz_is_authorized, Some(biz_wf))
            } else {
                (false, None)
            };

            Ok((biz_wf, set_biz_is_authorized))
        })
        .await?;

    if let Some(biz_wf) = biz_wf {
        if set_biz_is_authorized {
            let ww = WorkflowWrapper::init(&state, biz_wf.clone()).await?;
            let _res = ww.run(&state, WorkflowActions::Authorize(Authorize {})).await?;
        }
    }

    ResponseData::ok(EmptyResponse {}).json()
}
