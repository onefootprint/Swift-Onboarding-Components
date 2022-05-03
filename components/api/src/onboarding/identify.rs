use crate::auth::onboarding_session::OnboardingSessionContext;
use crate::onboarding::challenge::lib::CreateChallengeRequest;
use crate::response::success::ApiResponseData;
use crate::State;
use crate::{auth::client_public_key::PublicTenantAuthContext, errors::ApiError};
use actix_session::Session;
use chrono::Utc;
use crypto::hex::ToHex;
use crypto::random::gen_random_alphanumeric_code;
use db::models::session_data::{ChallengeData, ChallengeType};
use db::models::sessions::UpdateSession;
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
    session: Session,
    _pub_tenant_auth: PublicTenantAuthContext,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<String>>, ApiError> {
    let code: String = crypto::random::gen_rand_n_digit_code(6);
    let h_code = crypto::sha256(code.as_bytes()).to_vec();

    let (_user_vault, challenge_data) = match request.0 {
        CreateChallengeRequest::Email(s) => {
            let validated_data = crate::onboarding::clean_email(s.clone());
            let sh_data = crate::onboarding::hash(validated_data.clone());
            (
                db::user_vault::get_by_email(&state.db_pool, sh_data.clone()).await?,
                ChallengeData {
                    challenge_type: ChallengeType::Email(validated_data),
                    created_at: Utc::now().naive_utc(),
                    h_challenge_code: h_code,
                },
            )
        }
        CreateChallengeRequest::PhoneNumber(p) => {
            let validated_data = crate::onboarding::clean_phone_number(&state, &p).await?;
            let sh_data = crate::onboarding::hash(validated_data.clone());
            (
                db::user_vault::get_by_phone_number(&state.db_pool, sh_data.clone()).await?,
                ChallengeData {
                    challenge_type: ChallengeType::PhoneNumber(validated_data),
                    created_at: Utc::now().naive_utc(),
                    h_challenge_code: h_code,
                },
            )
        }
    };
    let token = format!("vtok_{}", gen_random_alphanumeric_code(34));
    let h_session_id: String = crypto::sha256(token.as_bytes()).encode_hex();

    OnboardingSessionContext::set(&session, token)?;

    let session_data = UpdateSession {
        h_session_id: h_session_id.clone(),
        session_data: db::models::session_data::SessionState::IdentifySession(
            challenge_data.clone(),
        ),
    };

    // force overwrites previous challenges from this session
    let _ = db::session::update(&state.db_pool, session_data).await?;

    let _ = crate::onboarding::challenge::lib::challenge(&state, challenge_data, code).await?;

    Ok(Json(ApiResponseData {
        data: "Initiated challenge".to_string(),
    }))
}
