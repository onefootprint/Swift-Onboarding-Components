use crate::response::success::ApiResponseData;
use crate::State;
use crate::{auth::identify_session::IdentifySessionContext, errors::ApiError};
use aws_sdk_kms::model::DataKeyPairSpec;
use chrono::{Duration, Utc};
use db::models::onboardings::NewOnboarding;
use db::models::session_data::{ChallengeType, SessionState};
use db::models::sessions::Session;
use db::models::types::Status;
use db::models::user_vaults::{NewUserVault, UpdateUserVault, UserVault};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

use super::{hash, seal};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
struct ChallengeVerifyRequest {
    code: String,
}

#[api_v2_operation]
#[post("/verify")]
async fn handler(
    state: web::Data<State>,
    session_context: IdentifySessionContext,
    request: Json<ChallengeVerifyRequest>,
) -> actix_web::Result<Json<ApiResponseData<String>>, ApiError> {
    let session_data = session_context.session_info();
    let identifier = session_context.user_identifier();
    let request_h_code = crypto::sha256(request.code.as_bytes()).to_vec();

    let success = verify_code(request_h_code, session_data.clone()).await?;

    // TODO instead of responding with user_ob_id mod the state with it and/or login?
    let user_ob_id = match success {
        true => {
            Ok(onboard_or_identify_user(state, session_data.clone(), identifier.clone()).await?)
        }
        false => Err(ApiError::ChallengeNotValid),
    }?;

    Ok(Json(ApiResponseData { data: user_ob_id }))
}

async fn onboard_or_identify_user(
    state: web::Data<State>,
    session_data: Session,
    identifier: String,
) -> Result<String, ApiError> {
    let sh_data = hash(identifier.clone());
    let (tenant_id, existing_user_vault) = match session_data.clone().session_data {
        SessionState::IdentifySession(c) => match c.challenge_type {
            ChallengeType::Email => Ok((
                c.tenant_id,
                db::user_vault::get_by_email(&state.db_pool, sh_data.clone()).await?,
            )),
            ChallengeType::PhoneNumber => Ok((
                c.tenant_id,
                db::user_vault::get_by_phone_number(&state.db_pool, sh_data.clone()).await?,
            )),
            _ => Err(ApiError::ChallengeNotValid),
        },
        _ => Err(ApiError::ChallengeNotValid),
    }?;

    match existing_user_vault {
        Some(uv) => onboard_existing_user(state, uv.clone(), tenant_id.clone()).await,
        None => onboard_new_user(state, session_data, identifier.clone(), tenant_id.clone()).await,
    }
}

async fn onboard_new_user(
    state: web::Data<State>,
    session_data: Session,
    identifier: String,
    tenant_id: String,
) -> Result<String, ApiError> {
    // create new user vault
    let (onboarding_session_token, user) = init_new_user_vault(state.clone(), tenant_id).await?;

    // update user vault with validated phone number
    let user_vault = match session_data.clone().session_data {
        SessionState::IdentifySession(c) => match c.challenge_type {
            ChallengeType::Email => Ok(UpdateUserVault {
                id: user.clone().id,
                e_email: Some(seal(identifier, &user.public_key)?),
                is_email_verified: Some(true),
                ..Default::default()
            }),
            ChallengeType::PhoneNumber => Ok(UpdateUserVault {
                id: user.clone().id,
                e_phone_number: Some(seal(identifier, &user.public_key)?),
                ..Default::default()
            }),
            _ => Err(ApiError::ChallengeDataNotSet),
        },
        _ => Err(ApiError::ChallengeNotValid),
    }?;

    let _ = db::user_vault::update(&state.db_pool, user_vault).await?;

    // create new onboarding session data
    Ok(onboarding_session_token)
}
async fn onboard_existing_user(
    state: web::Data<State>,
    uv: UserVault,
    tenant_id: String,
) -> Result<String, ApiError> {
    let new_onboarding = NewOnboarding {
        tenant_id,
        user_vault_id: uv.id,
        status: uv.id_verified,
    };

    let ob = db::onboarding::init(&state.db_pool, new_onboarding).await?;

    Ok(ob.user_ob_id)
}

async fn init_new_user_vault(
    state: web::Data<State>,
    tenant_id: String,
) -> Result<(String, UserVault), ApiError> {
    let new_key_pair = state
        .kms_client
        .generate_data_key_pair_without_plaintext()
        .key_id(&state.config.enclave_root_key_id)
        .key_pair_spec(DataKeyPairSpec::EccNistP256)
        .send()
        .await?;

    let der_public_key = new_key_pair.public_key.unwrap().into_inner();
    let ec_pk_uncompressed =
        crypto::conversion::public_key_der_to_raw_uncompressed(&der_public_key)?;

    let _pk = crypto::hex::encode(&ec_pk_uncompressed);

    let user = NewUserVault {
        e_private_key: new_key_pair
            .private_key_ciphertext_blob
            .unwrap()
            .into_inner(),
        public_key: ec_pk_uncompressed,
        id_verified: Status::Incomplete,
    };

    let (user, token) = db::user_vault::init(&state.db_pool, user.clone(), tenant_id).await?;

    Ok((token, user))
}

async fn verify_code(request_h_code: Vec<u8>, session_data: Session) -> Result<bool, ApiError> {
    let (stored_h_code, created_at) = match session_data.session_data {
        SessionState::OnboardingSession(s) => Ok((
            s.challenge_data.h_challenge_code,
            s.challenge_data.created_at,
        )),
        SessionState::IdentifySession(s) => Ok((s.h_challenge_code, s.created_at)),
        // todo, handle identify
        _ => Err(ApiError::ChallengeDataNotSet),
    }?;

    let now = Utc::now().naive_utc();

    Ok((stored_h_code == request_h_code)
        & (created_at.signed_duration_since(now) < Duration::minutes(15)))
}
