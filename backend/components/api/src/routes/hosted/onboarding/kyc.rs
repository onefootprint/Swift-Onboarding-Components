use crate::auth::tenant::ParsedOnboardingSession;
use crate::auth::tenant::PublicOnboardingContext;
use crate::auth::user::{UserAuth, UserAuthContext, UserAuthScope};
use crate::auth::{Either, SessionContext};
use crate::decision;
use crate::errors::onboarding::OnboardingError;
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
pub async fn get(
    state: web::Data<State>,
    user_auth: UserAuthContext,
    onboarding_context: Either<PublicOnboardingContext, SessionContext<ParsedOnboardingSession>>,
) -> JsonApiResponse<StatusResponse> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::OrgOnboarding])?;

    let ob = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let ob_config = onboarding_context.ob_config();
            let ob = Onboarding::get_by_config(conn, &user_auth.user_vault_id(), &ob_config.id)?
                .ok_or(OnboardingError::NoOnboarding)?;
            Ok(ob)
        })
        .await??;

    let response = StatusResponse {
        status: ob.kyc_status.public_status(),
    };
    ResponseData::ok(response).json()
}

#[api_v2_operation(
    tags(Hosted),
    description = "Indicate data collection has finished and is ready to be processed by Footprint"
)]
#[actix::post("/hosted/onboarding/submit")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserAuthContext,
    onboarding_context: Either<PublicOnboardingContext, SessionContext<ParsedOnboardingSession>>,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::OrgOnboarding])?;
    let tenant_id = onboarding_context.tenant().id.clone();

    decision::engine::run(
        &state,
        user_auth.user_vault_id(),
        onboarding_context.ob_config().clone(),
        tenant_id,
    )
    .await?;

    EmptyResponse::ok().json()
}
