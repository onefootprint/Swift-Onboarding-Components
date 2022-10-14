use crate::auth::tenant::ParsedOnboardingSession;
use crate::auth::tenant::PublicOnboardingContext;
use crate::auth::user::{UserAuth, UserAuthContext, UserAuthScope};
use crate::auth::{Either, SessionContext};
use crate::decision::verification_request;
use crate::errors::onboarding::OnboardingError;
use crate::errors::ApiError;
use crate::types::{EmptyResponse, JsonApiResponse, ResponseData};
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use db::models::onboarding::Onboarding;
use newtypes::{KycStatus, RequirementStatus};
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

#[api_v2_operation(tags(Hosted), description = "Initiate KYC checks for a user")]
#[actix::post("/hosted/onboarding/kyc")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserAuthContext,
    onboarding_context: Either<PublicOnboardingContext, SessionContext<ParsedOnboardingSession>>,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::OrgOnboarding])?;
    let tenant_id = onboarding_context.tenant().id.clone();

    // Check if the user is a sandbox user. Sandbox users have the final KYC state encoded in their
    // phone number's sandbox suffix
    let uvw = state
        .db_pool
        .db_query(move |conn| UserVaultWrapper::get(conn, &user_auth.user_vault_id()))
        .await??;
    let decrypted_phone = if !uvw.user_vault.is_live {
        let phone_number = uvw.get_decrypted_primary_phone(&state).await?;
        Some(phone_number)
    } else {
        None
    };

    let (requests, scoped_user, ob_id) = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let (ob, su) =
                Onboarding::lock_by_config(conn, &uvw.user_vault.id, &onboarding_context.ob_config().id)?
                    .ok_or(OnboardingError::NoOnboarding)?;
            // Can only start KYC checks for onboardings whose KYC checks have not yet been started
            if ob.kyc_status != KycStatus::New {
                return Err(OnboardingError::WrongKycState(ob.kyc_status).into());
            }
            let ob_id = ob.id.clone();
            let requests =
                verification_request::initiate_verification(conn, ob, &uvw, &tenant_id, decrypted_phone)?;
            Ok((requests, su, ob_id))
        })
        .await?;

    // Fire off all IDV requests. Now that the requests are saved in the DB, even if we crash here,
    // we know where to continue processing.
    if !requests.is_empty() {
        verification_request::initiate_idv_requests(
            &state,
            ob_id,
            scoped_user.user_vault_id,
            scoped_user.tenant_id,
            requests,
        )
        .await?;
    }

    EmptyResponse::ok().json()
}
