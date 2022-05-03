use crate::auth::onboarding_session::OnboardingSessionContext;
use crate::onboarding::challenge::lib::CreateChallengeRequest;
use crate::response::success::ApiResponseData;
use crate::State;
use crate::{auth::client_public_key::PublicTenantAuthContext, errors::ApiError};
use actix_session::Session;
use crypto::hex::ToHex;
use crypto::random::gen_random_alphanumeric_code;
use db::models::session_data::ChallengeType;
use db::models::sessions::UpdateSession;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum IdentifyResponseKind {
    NoUserFound,
    ChallengeInitiated,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
pub struct IdentifyResponse {
    kind: IdentifyResponseKind,
}

#[api_v2_operation]
#[post("/identify")]
pub async fn handler(
    request: Json<crate::onboarding::challenge::lib::CreateChallengeRequest>,
    session: Session,
    _pub_tenant_auth: PublicTenantAuthContext,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<IdentifyResponse>>, ApiError> {
    let (user_vault, challenge_type) = match request.0 {
        // TODO don't store unencrypted PII in this challenge
        CreateChallengeRequest::Email(s) => {
            let validated_data = crate::onboarding::clean_email(s.clone());
            let sh_data = crate::onboarding::hash(validated_data.clone());
            (
                db::user_vault::get_by_email(&state.db_pool, sh_data.clone()).await?,
                ChallengeType::Email(validated_data),
            )
        }
        CreateChallengeRequest::PhoneNumber(p) => {
            let validated_data = crate::onboarding::clean_phone_number(&state, &p).await?;
            let sh_data = crate::onboarding::hash(validated_data.clone());
            (
                db::user_vault::get_by_phone_number(&state.db_pool, sh_data.clone()).await?,
                ChallengeType::PhoneNumber(validated_data),
            )
        }
    };

    let response_kind = match user_vault {
        None => IdentifyResponseKind::NoUserFound, // TODO could probably just init vault here
        Some(_) => {
            // User vault already exists, initiate a challenge to prove ownership
            let challenge_data =
                crate::onboarding::challenge::lib::initiate(&state, challenge_type).await?;

            // Update session to show that we are in the middle of an IdentifySession challenge
            let token = format!("vtok_{}", gen_random_alphanumeric_code(34));
            OnboardingSessionContext::set(&session, token.clone())?;
            let h_session_id: String = crypto::sha256(token.as_bytes()).encode_hex();
            let session_data = UpdateSession {
                h_session_id: h_session_id.clone(),
                session_data: db::models::session_data::SessionState::IdentifySession(
                    challenge_data,
                ),
            };
            // force overwrites previous challenges from this session
            let _: usize = db::session::update(&state.db_pool, session_data).await?;

            IdentifyResponseKind::ChallengeInitiated
        }
    };

    Ok(Json(ApiResponseData {
        data: IdentifyResponse {
            kind: response_kind,
        },
    }))
}
