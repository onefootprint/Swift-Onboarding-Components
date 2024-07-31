use crate::auth::user::UserAuthScope;
use crate::decision;
use crate::errors::onboarding::OnboardingError;
use crate::State;
use api_core::auth::user::CheckUserWfAuthContext;
use api_core::auth::user::UserWfAuthContext;
use api_core::decision::state::actions::WorkflowActions;
use api_core::decision::state::document::DocumentState;
use api_core::decision::state::kyc::KycState;
use api_core::decision::state::DocCollected;
use api_core::decision::state::RunIncodeMachineAndWorkflowResult;
use api_core::decision::state::WorkflowKind;
use api_core::decision::state::WorkflowWrapper;
use api_core::errors::onboarding::UnmetRequirements;
use api_core::errors::workflow::WorkflowError;
use api_core::types::ApiResponse;
use api_core::utils::actix::OptionalJson;
use api_core::utils::requirements::GetRequirementsArgs;
use api_core::FpResult;
use api_wire_types::ProcessRequest;
use chrono::Duration;
use chrono::Utc;
use db::models::task::Task;
use db::models::workflow::Workflow as DbWorkflow;
use db::DbPool;
use decision::state::Authorize;
use itertools::Itertools;
use newtypes::OnboardingRequirement;
use newtypes::RunIncodeStuckWorkflowArgs;
use newtypes::WorkflowFixtureResult;
use newtypes::WorkflowId;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    tags(Onboarding, Hosted),
    description = "Continue processing the onboarding after user this stage of user input has finished"
)]
#[actix::post("/hosted/onboarding/process")]
pub async fn post(
    user_auth: UserWfAuthContext,
    state: web::Data<State>,
    request: OptionalJson<ProcessRequest>,
) -> ApiResponse<api_wire_types::Empty> {
    let user_auth = user_auth.check_guard(UserAuthScope::SignUp)?;
    let fixture_result = request.into_inner().and_then(|r| r.fixture_result);
    tracing::info!(fixture_result_provided=?fixture_result.is_some(), "Fixture result provided in process");

    // Verify there are no unmet requirements
    let reqs = api_core::utils::requirements::get_requirements_for_person_and_maybe_business(
        &state,
        GetRequirementsArgs::from(&user_auth)?,
    )
    .await?;
    let unmet_reqs = reqs
        .into_iter()
        .filter(|r| !r.is_met())
        // Process requirement shouldn't block the process endpoint
        .filter(|r| !matches!(r, OnboardingRequirement::Process))
        .collect_vec();
    if !unmet_reqs.is_empty() {
        return Err(OnboardingError::from(UnmetRequirements(unmet_reqs)).into());
    }

    // Update the fixture result on the workflow, if provided
    let wf = user_auth.workflow();
    let wf = if let Some(fixture_result) = fixture_result {
        if user_auth.user().is_live {
            return Err(OnboardingError::CannotCreateFixtureResultForNonSandbox.into());
        }
        let wf_id = wf.id.clone();
        state
            .db_pool
            .db_transaction(move |conn| DbWorkflow::update_fixture_result(conn, &wf_id, fixture_result))
            .await?
    } else {
        wf.clone()
    };

    let ww = WorkflowWrapper::init(&state, wf.clone()).await?;
    // Since actions are typed right now, infer which action needs to be sent to the workflow
    // in order to make it proceed
    // First run the Authorize action since this generates a requirement for Bifrost.
    let (ww, _) = match ww.state {
        WorkflowKind::Kyc(KycState::DataCollection(_)) => {
            ww.action(&state, WorkflowActions::Authorize(Authorize {}))
                .await?
        }
        WorkflowKind::Kyc(KycState::DocCollection(_))
        | WorkflowKind::Document(DocumentState::DataCollection(_)) => {
            ww.action(&state, WorkflowActions::DocCollected(DocCollected {}))
                .await?
        }
        s => return Err(WorkflowError::WorkflowCannotProceed(newtypes::WorkflowState::from(&s)).into()),
    };

    // Run Incode state machine if it's in a non terminal state due to polling timing out during /upload
    // if we timeout polling incode here still, then we enqueue a task which tries again async
    match decision::state::run_incode_machine_and_workflow(&state, ww).await {
        Ok(run) => match run {
            RunIncodeMachineAndWorkflowResult::IncodeStuck => {
                enqueue_run_incode_stuck_workflow_task(&state.db_pool, &wf.id).await?;
            }
            RunIncodeMachineAndWorkflowResult::WorkflowRan => {}
        },
        Err(err) => {
            tracing::error!(?err, "Error running incode machine or workflow in /process");
            enqueue_run_incode_stuck_workflow_task(&state.db_pool, &wf.id).await?;
        }
    }

    run_kyb_if_needed(&state, user_auth, fixture_result).await?;

    Ok(api_wire_types::Empty)
}

async fn enqueue_run_incode_stuck_workflow_task(db_pool: &DbPool, workflow_id: &WorkflowId) -> FpResult<()> {
    let workflow_id = workflow_id.clone();

    let task_data = RunIncodeStuckWorkflowArgs { workflow_id };
    let scheduled_for = Utc::now() + Duration::seconds(30);
    db_pool
        .db_query(move |conn| Task::create(conn, scheduled_for, task_data))
        .await?;
    Ok(())
}

#[tracing::instrument(skip_all)]
async fn run_kyb_if_needed(
    state: &State,
    user_auth: CheckUserWfAuthContext,
    fixture_result: Option<WorkflowFixtureResult>,
) -> FpResult<()> {
    // Run KYB
    let tenant = user_auth.tenant().clone();
    let biz_wf = state
        .db_pool
        .db_query(move |conn| user_auth.business_workflow(conn))
        .await?;

    if let Some(biz_wf) = biz_wf {
        if let Some(r) = fixture_result {
            let wf_id = biz_wf.id.clone();
            state
                .db_pool
                .db_transaction(move |conn| DbWorkflow::update_fixture_result(conn, &wf_id, r))
                .await?;
        }
        api_core::utils::kyb_utils::run_kyb(state, &tenant, biz_wf).await?;
    }
    Ok(())
}
