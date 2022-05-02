use crate::response::success::ApiResponseData;
use crate::State;
use crate::{auth::onboarding_token::OnboardingSessionTokenContext, errors::ApiError};
use paperclip::actix::{api_v2_operation, web, web::Json, Apiv2Schema};

use uuid::Uuid;

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct CreateChallengeResponse {
    id: Uuid,
}

// TODO Switch challenge APIs to use correct auth and tenant_user_id
// TODO then switch user update to have a proper auth handler
#[api_v2_operation]
pub async fn handler(
    state: web::Data<State>,
    onboarding_token_auth: OnboardingSessionTokenContext,
    request: Json<crate::onboarding::challenge::lib::CreateChallengeRequest>,
) -> actix_web::Result<Json<ApiResponseData<CreateChallengeResponse>>, ApiError> {
    let (kind, validated_data) =
        crate::onboarding::challenge::lib::validate(&state, request).await?;
    let user_vault = onboarding_token_auth.user_vault();

    let challenge_id =
        crate::onboarding::challenge::lib::initiate(&state, user_vault, validated_data, kind)
            .await?;

    Ok(Json(ApiResponseData {
        data: CreateChallengeResponse { id: challenge_id },
    }))
}
