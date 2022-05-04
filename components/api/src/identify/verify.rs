use crate::response::success::ApiResponseData;
use crate::State;
use crate::{auth::identify_session::IdentifySessionContext, errors::ApiError};
use aws_sdk_kms::model::DataKeyPairSpec;
use chrono::{Duration, Utc};
use crypto::hex::ToHex;
use db::models::onboardings::{NewOnboarding, Onboarding};
use db::models::session_data::{ChallengeData, LoggedInSessionData};
use db::models::session_data::{ChallengeType, SessionState};
use db::models::sessions::UpdateSession;
use db::models::types::Status;
use db::models::user_vaults::{NewUserVault, UpdateUserVault, UserVault};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

use super::{hash, seal};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
struct VerifyRequest {
    code: String,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
#[serde(rename_all = "snake_case")]
enum VerifyKind {
    UserCreated,
    UserInherited,
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
struct VerifyResponse {
    kind: VerifyKind,
}

#[api_v2_operation]
#[post("/verify")]
async fn handler(
    state: web::Data<State>,
    session_context: IdentifySessionContext,
    request: Json<VerifyRequest>,
) -> actix_web::Result<Json<ApiResponseData<VerifyResponse>>, ApiError> {
    let challenge_data = session_context.challenge_data;
    let identifier = session_context.state.user_identifier;
    let request_h_code = crypto::sha256(request.code.as_bytes()).to_vec();

    if !verify_code(request_h_code, &challenge_data).await? {
        return Err(ApiError::ChallengeNotValid);
    }

    let (onboarding, kind) =
        get_or_create_user_onboarding(&state, &challenge_data, identifier.clone()).await?;

    // Update the session to a logged in state
    let updated_session = UpdateSession {
        h_session_id: crypto::sha256(session_context.state.session_id.as_bytes()).encode_hex(),
        session_data: SessionState::LoggedInSession(LoggedInSessionData {
            user_ob_id: Some(onboarding.user_ob_id),
        }),
    };
    let _: usize = db::session::update(&state.db_pool, updated_session).await?;

    // TODO do we need to send the set-cookie header in every response? Probably not

    Ok(Json(ApiResponseData {
        data: VerifyResponse { kind },
    }))
}

async fn get_or_create_user_onboarding(
    state: &web::Data<State>,
    challenge_data: &ChallengeData,
    identifier: String,
) -> Result<(Onboarding, VerifyKind), ApiError> {
    let sh_data = hash(identifier.clone());
    let existing_user_vault = match &challenge_data.challenge_type {
        ChallengeType::Email => {
            db::user_vault::get_by_email(&state.db_pool, sh_data.clone()).await?
        }
        ChallengeType::PhoneNumber => {
            db::user_vault::get_by_phone_number(&state.db_pool, sh_data.clone()).await?
        }
    };

    if let Some(uv) = existing_user_vault {
        Ok((
            onboard_existing_user(state, uv.clone(), challenge_data.tenant_id.clone()).await?,
            VerifyKind::UserInherited,
        ))
    } else {
        Ok((
            onboard_new_user(state, challenge_data, identifier.clone()).await?,
            VerifyKind::UserCreated,
        ))
    }
}

async fn onboard_existing_user(
    state: &web::Data<State>,
    uv: UserVault,
    tenant_id: String,
) -> Result<Onboarding, ApiError> {
    // TODO what do we do if there's already an onboarding for this tenant/user combo?
    // Error out, or return the same footprint_user_id?
    let new_onboarding = NewOnboarding {
        tenant_id,
        user_vault_id: uv.id,
        status: uv.id_verified,
    };

    let ob = db::onboarding::init(&state.db_pool, new_onboarding).await?;
    Ok(ob)
}

async fn onboard_new_user(
    state: &web::Data<State>,
    challenge_data: &ChallengeData,
    identifier: String,
) -> Result<Onboarding, ApiError> {
    // create new user vault
    let (user, onboarding) = init_new_user_vault(state, challenge_data.tenant_id.clone()).await?;

    // update user vault with validated phone number
    // TODO could combine into one query - only init a vault with a phone number / email
    let user_vault = match challenge_data.challenge_type {
        ChallengeType::Email => UpdateUserVault {
            id: user.clone().id,
            e_email: Some(seal(identifier.clone(), &user.public_key)?),
            sh_email: Some(hash(identifier.clone())),
            is_email_verified: Some(true),
            ..Default::default()
        },
        ChallengeType::PhoneNumber => UpdateUserVault {
            id: user.clone().id,
            e_phone_number: Some(seal(identifier.clone(), &user.public_key)?),
            sh_phone_number: Some(hash(identifier.clone())),
            is_phone_number_verified: Some(true),
            ..Default::default()
        },
    };

    let _ = db::user_vault::update(&state.db_pool, user_vault).await?;

    // create new onboarding session data
    Ok(onboarding)
}

async fn init_new_user_vault(
    state: &web::Data<State>,
    tenant_id: String,
) -> Result<(UserVault, Onboarding), ApiError> {
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

    let (user, onboarding) = db::user_vault::init(&state.db_pool, user.clone(), tenant_id).await?;
    Ok((user, onboarding))
}

async fn verify_code(
    request_h_code: Vec<u8>,
    challenge_data: &ChallengeData,
) -> Result<bool, ApiError> {
    let now = Utc::now().naive_utc();

    Ok((challenge_data.h_challenge_code == request_h_code)
        & (challenge_data.created_at.signed_duration_since(now) < Duration::minutes(15)))
}
