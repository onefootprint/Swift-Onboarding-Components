use crate::response::success::ApiResponseData;
use crate::State;
use crate::{auth::client_public_key::PublicTenantAuthContext, errors::ApiError};
use db::models::types::ChallengeKind;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};
use uuid::Uuid;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum IdentifyResponseKind {
    NoUserFound,
    ChallengeInitiated,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
pub struct IdentifyResponse {
    kind: IdentifyResponseKind,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    challenge_id: Option<Uuid>,
}

#[api_v2_operation]
#[post("/identify")]
pub async fn handler(
    request: Json<crate::onboarding::challenge::lib::CreateChallengeRequest>,
    _pub_tenant_auth: PublicTenantAuthContext,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<IdentifyResponse>>, ApiError> {
    let (challenge_kind, validated_data) =
        crate::onboarding::challenge::lib::validate(&state, request).await?;
    let sh_data = crate::onboarding::hash(validated_data.clone());

    let user_vault = match challenge_kind {
        ChallengeKind::PhoneNumber => {
            db::user_vault::find_by_phone_number(&state.db_pool, sh_data.clone()).await?
        }
        ChallengeKind::Email => {
            db::user_vault::find_by_email(&state.db_pool, sh_data.clone()).await?
        }
    };

    let (response_kind, challenge_id) = match user_vault {
        None => (IdentifyResponseKind::NoUserFound, None), // TODO could probably just init vault here
        Some(user_vault) => {
            // TODO mark the challenge as used for login to allow issuing a new token at verification time
            let challenge_id = crate::onboarding::challenge::lib::initiate(
                &state,
                &user_vault,
                validated_data,
                sh_data,
                challenge_kind,
            )
            .await?;
            (IdentifyResponseKind::ChallengeInitiated, Some(challenge_id))
        }
    };

    Ok(Json(ApiResponseData {
        data: IdentifyResponse {
            kind: response_kind,
            challenge_id,
        },
    }))
}
