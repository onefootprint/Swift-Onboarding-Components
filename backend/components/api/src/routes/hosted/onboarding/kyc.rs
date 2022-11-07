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
    let ob = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let ob_info = user_auth.assert_onboarding(conn)?;
            let (ob, _) = Onboarding::get_for_user(conn, &ob_info.onboarding.id, &ob_info.user_vault_id)?;
            Ok(ob)
        })
        .await??;

    let response = StatusResponse {
        status: ob.status.public_status(),
    };
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
    decision::engine::can_decide(
        &state,
        ob_info.user_vault_id.clone(),
        ob_info.onboarding.id.clone(),
        ob_info.ob_config.clone(),
    )
    .await?;

    // produce our decision
    decision::engine::decide(
        &state,
        ob_info.user_vault_id,
        ob_info.onboarding,
        ob_info.ob_config,
    )
    .await?;

    EmptyResponse::ok().json()
}
