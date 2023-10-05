use crate::auth::user::UserAuthGuard;
use crate::business;
use crate::decision;
use crate::errors::onboarding::OnboardingError;
use crate::onboarding::get_requirements;
use crate::onboarding::GetRequirementsArgs;
use crate::types::response::ResponseData;
use crate::State;
use api_core::auth::user::CheckUserWfAuthContext;
use api_core::auth::user::UserWfAuthContext;
use api_core::decision::state::actions::WorkflowActions;
use api_core::decision::state::alpaca_kyc::AlpacaKycState;
use api_core::decision::state::document::DocumentState;
use api_core::decision::state::kyc::KycState;
use api_core::decision::state::BoKycCompleted;
use api_core::decision::state::DocCollected;
use api_core::decision::state::RunIncodeMachineAndWorkflowResult;
use api_core::decision::state::WorkflowKind;
use api_core::decision::state::WorkflowWrapper;
use api_core::errors::workflow::WorkflowError;
use api_core::errors::ApiResult;
use api_core::types::EmptyResponse;
use api_core::types::JsonApiResponse;
use api_core::utils::actix::OptionalJson;
use api_wire_types::ProcessRequest;
use chrono::Duration;
use chrono::Utc;
use db::models::task::Task;
use db::models::workflow::Workflow as DbWorkflow;
use db::DbPool;
use decision::state::Authorize;
use itertools::Itertools;
use newtypes::KybState;
use newtypes::OnboardingRequirement;
use newtypes::RunIncodeStuckWorkflowArgs;
use newtypes::TaskData;
use newtypes::WorkflowId;
use newtypes::WorkflowState;
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    tags(Hosted, Bifrost),
    description = "Continue processing the onboarding after user this stage of user input has finished"
)]
#[actix::post("/hosted/onboarding/process")]
pub async fn post(
    user_auth: UserWfAuthContext,
    state: web::Data<State>,
    request: OptionalJson<ProcessRequest>,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::SignUp)?;
    let fixture_result = request.into_inner().map(|r| r.fixture_result);

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
        WorkflowKind::Kyc(KycState::DataCollection(_))
        | WorkflowKind::AlpacaKyc(AlpacaKycState::DataCollection(_)) => {
            ww.action(&state, WorkflowActions::Authorize(Authorize {}))
                .await?
        }
        WorkflowKind::AlpacaKyc(AlpacaKycState::DocCollection(_))
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
            tracing::error!(?err, "Error running incode machine or workflow in /process")
        }
    }

    run_kyb_if_needed(&state, user_auth).await?;

    ResponseData::ok(EmptyResponse {}).json()
}

async fn enqueue_run_incode_stuck_workflow_task(db_pool: &DbPool, workflow_id: &WorkflowId) -> ApiResult<()> {
    let workflow_id = workflow_id.clone();

    db_pool
        .db_query(move |conn| {
            let task_data = TaskData::RunIncodeStuckWorkflow(RunIncodeStuckWorkflowArgs { workflow_id });
            let scheduled_for = Utc::now() + Duration::seconds(30);
            Task::create(conn, scheduled_for, task_data)
        })
        .await??;
    Ok(())
}

#[tracing::instrument(skip_all)]
async fn run_kyb_if_needed(state: &State, user_auth: CheckUserWfAuthContext) -> ApiResult<()> {
    // Run KYB
    let tenant = user_auth.tenant().clone();
    let biz_wf = state
        .db_pool
        .db_query(move |conn| user_auth.business_workflow(conn))
        .await??;

    if let Some(biz_wf) = biz_wf {
        let wf_id = biz_wf.id.clone();

        // First see if we have to run authorize
        if matches!(biz_wf.state, WorkflowState::Kyb(KybState::DataCollection)) {
            // Authorize is kind of a misnomer now - it doesn't actually mark the workflow as
            // authorized - it just does some processing that normally happens after authorize
            let ww = WorkflowWrapper::init(state, biz_wf.clone()).await?;
            let _ = ww
                .run(state, WorkflowActions::Authorize(Authorize {}))
                .await
                .map_err(|err| tracing::error!(?err, "Error running Authorize on KYB workflow"));
        }

        // Refresh the wf since it may have changed above
        let biz_wf = state
            .db_pool
            .db_query(move |conn| DbWorkflow::get(conn, &wf_id))
            .await??;
        let should_run_kyb = business::utils::should_run_kyb(state, &biz_wf, &tenant).await?;
        tracing::info!(should_run_kyb, "should_run_kyb");
        if should_run_kyb {
            let ww = WorkflowWrapper::init(state, biz_wf.clone()).await?;
            let res = ww
                .run(state, WorkflowActions::BoKycCompleted(BoKycCompleted {}))
                .await;
            match res {
                Ok(ww) => {
                    tracing::info!(new_state = ?newtypes::WorkflowState::from(&ww.state), "Ran KYB workflow BoKycCompleted");
                }
                Err(err) => {
                    tracing::error!(?err, "Error running BoKycCompleted on KYB workflow");
                }
            };
        }
    }
    Ok(())
}
