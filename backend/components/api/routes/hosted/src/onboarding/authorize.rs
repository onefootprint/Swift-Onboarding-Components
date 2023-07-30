use crate::auth::user::UserAuthGuard;
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiResult;
use crate::onboarding::get_requirements;
use crate::onboarding::GetRequirementsArgs;
use crate::types::response::ResponseData;
use crate::State;
use api_core::auth::user::UserObAuthContext;
use api_core::decision::state::common;
use api_core::types::EmptyResponse;
use api_core::types::JsonApiResponse;
use db::models::onboarding::Onboarding;
use db::models::onboarding::OnboardingUpdate;
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
    span.record(
        "ob_configuration_id",
        &format!("{}", user_auth.onboarding()?.ob_configuration_id),
    );
    span.record(
        "workflow_id",
        &format!(
            "{}",
            user_auth.workflow().map(|wf| wf.id.clone()).unwrap_or_default()
        ),
    );

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

    let (biz_ob, set_biz_is_authorized) = state
        .db_pool
        .db_transaction(move |c| -> ApiResult<_> {
            let ob = Onboarding::lock(c, &ob_id)?;
            if ob.authorized_at.is_none() {
                Onboarding::update(ob, c, OnboardingUpdate::is_authorized())?;
                true
            } else {
                false
            };

            let biz_ob = user_auth.business_onboarding(c)?;
            let (set_biz_is_authorized, bizob) = if let Some(biz_ob) = biz_ob {
                let b = Onboarding::lock(c, &biz_ob.id)?;
                let (set_biz_is_authorized, bizob) = if b.authorized_at.is_none() {
                    (
                        true,
                        Onboarding::update(b, c, OnboardingUpdate::is_authorized_and_status_pending())?,
                    )
                } else {
                    (false, b.into_inner())
                };
                (set_biz_is_authorized, Some(bizob))
            } else {
                (false, biz_ob)
            };

            Ok((bizob, set_biz_is_authorized))
        })
        .await?;

    let sv_biz_id = biz_ob.as_ref().map(|biz| biz.scoped_vault_id.clone());
    if let Some(sv_biz_id) = sv_biz_id {
        if set_biz_is_authorized {
            common::write_authorized_fingerprints(&state, &sv_biz_id).await?;
        }
    }

    ResponseData::ok(EmptyResponse {}).json()
}
