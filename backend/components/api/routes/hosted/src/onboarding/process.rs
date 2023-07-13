use crate::auth::user::UserAuthGuard;
use crate::decision;
use crate::errors::onboarding::OnboardingError;
use crate::onboarding::get_requirements;
use crate::onboarding::GetRequirementsArgs;
use crate::types::response::ResponseData;
use crate::State;
use api_core::auth::user::UserObAuthContext;
use api_core::decision::state::actions::WorkflowActions;
use api_core::decision::state::alpaca_kyc::AlpacaKycState;
use api_core::decision::state::document::DocumentState;
use api_core::decision::state::kyc::KycState;
use api_core::decision::state::DocCollected;
use api_core::decision::state::WorkflowKind;
use api_core::decision::state::WorkflowWrapper;
use api_core::errors::workflow::WorkflowError;
use api_core::errors::AssertionError;
use api_core::types::EmptyResponse;
use api_core::types::JsonApiResponse;
use decision::state::Authorize;
use itertools::Itertools;
use newtypes::OnboardingRequirement;
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    tags(Hosted, Bifrost),
    description = "Continue processing the onboarding after user this stage of user input has finished"
)]
#[actix::post("/hosted/onboarding/process")]
pub async fn post(user_auth: UserObAuthContext, state: web::Data<State>) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::OrgOnboarding)?;

    // Verify there are no unmet requirements
    let reqs = get_requirements(&state, GetRequirementsArgs::from(&user_auth)?).await?;
    let unmet_reqs = reqs
        .into_iter()
        .filter(|r| !r.is_met())
        // Process requirement shouldn't block the process endpoint
        .filter(|r| !matches!(r, OnboardingRequirement::Process))
        .collect_vec();
    if !unmet_reqs.is_empty() {
        let unmet_reqs = unmet_reqs.into_iter().map(|x| x.into()).collect_vec();
        return Err(OnboardingError::UnmetRequirements(unmet_reqs.into()).into());
    }

    let wf = user_auth
        .workflow()
        .ok_or(AssertionError("User doesn't have a workflow"))?;
    let ww = WorkflowWrapper::init(&state, wf.clone()).await?;
    // Since actions are typed right now, infer which action needs to be sent to the workflow
    // in order to make it proceed
    match ww.state {
        WorkflowKind::Kyc(KycState::DataCollection(_))
        | WorkflowKind::AlpacaKyc(AlpacaKycState::DataCollection(_)) => {
            // If Authorize fails, we don't want to block the user from finishing onboarding onto bifrost
            let res = ww.run(&state, WorkflowActions::Authorize(Authorize {})).await;
            match res {
                Ok(ww) => {
                    tracing::info!(new_state = ?newtypes::WorkflowState::from(&ww.state), "[Authorize] Ran workflow");
                }
                Err(e) => {
                    tracing::error!(error=%e, "[Authorize] Error running workflow");
                }
            };
        }
        WorkflowKind::AlpacaKyc(AlpacaKycState::DocCollection(_))
        | WorkflowKind::Document(DocumentState::DataCollection(_)) => {
            ww.run(&state, WorkflowActions::DocCollected(DocCollected {}))
                .await?;
        }
        s => return Err(WorkflowError::WorkflowCannotProceed(newtypes::WorkflowState::from(&s)).into()),
    }
    ResponseData::ok(EmptyResponse {}).json()
}
