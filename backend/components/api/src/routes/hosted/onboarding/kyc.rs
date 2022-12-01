use crate::auth::user::{UserAuthContext, UserAuthScopeDiscriminant};
use crate::decision;
use crate::errors::ApiError;
use crate::types::{EmptyResponse, JsonApiResponse, ResponseData};
use crate::State;
use db::models::onboarding::Onboarding;
use newtypes::RequirementStatus;
use paperclip::actix::{self, api_v2_operation, web, Apiv2Schema};

#[derive(Debug, serde::Serialize, Apiv2Schema)]
pub struct StatusResponse {
    status: RequirementStatus,
}

#[api_v2_operation(tags(Hosted), description = "Check the status of KYC checks for a user")]
#[actix::get("/hosted/onboarding/kyc")]
pub async fn get(state: web::Data<State>, user_auth: UserAuthContext) -> JsonApiResponse<StatusResponse> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::OrgOnboarding])?;
    let (_, _, _, latest_decision) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let ob_info = user_auth.assert_onboarding(conn)?;
            let ob = Onboarding::get(conn, (&ob_info.onboarding.id, &ob_info.user_vault_id))?;
            Ok(ob)
        })
        .await??;

    // The identity_check requirement is done as soon as the decision engine makes a decision,
    // regardless of what the decision is
    let status = if latest_decision.is_some() {
        RequirementStatus::Complete
    } else {
        RequirementStatus::Pending
    };
    let response = StatusResponse { status };
    ResponseData::ok(response).json()
}

#[api_v2_operation(
    tags(Hosted),
    description = "Indicate data collection has finished and is ready to be processed by Footprint"
)]
#[actix::post("/hosted/onboarding/submit")]
pub async fn post(state: web::Data<State>, user_auth: UserAuthContext) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::OrgOnboarding])?;
    let ob_info = state
        .db_pool
        .db_query(move |c| user_auth.assert_onboarding(c))
        .await??;

    // Check we can proceed
    let should_make_idv_requests_and_decision = decision::engine::perform_pre_run_operations(
        &state,
        ob_info.onboarding.clone(),
        ob_info.ob_config.clone(),
    )
    .await?;

    // produce our decision
    if should_make_idv_requests_and_decision {
        decision::engine::run(&state, ob_info.onboarding).await?;
    }

    EmptyResponse::ok().json()
}
