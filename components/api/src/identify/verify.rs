use super::validate_challenge;
use crate::auth::logged_in_session::LoggedInSessionContext;
use crate::auth::login_session::LoginSessionContext;
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::State;
use actix_session::Session;
use aws_sdk_kms::model::DataKeyPairSpec;
use db::models::session_data::{LoggedInSessionData, SessionState as DbSessionState};
use db::models::types::Status;
use db::models::user_vaults::{NewUserVault, UserVault};
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
/// Verify an SMS challenge sent to a user. If successful, this endpoint sets relevant cookies
/// that allow the client to update the user vault (/identify/data) and finalize user onboarding (/identify/commit)
async fn handler(
    state: web::Data<State>,
    session: Session,
    user_auth: LoginSessionContext,
    request: Json<VerifyRequest>,
) -> actix_web::Result<Json<ApiResponseData<VerifyResponse>>, ApiError> {
    let challenge_data = user_auth.state.challenge_state;

    if !validate_challenge(request.code.clone(), &challenge_data).await? {
        return Err(ApiError::ChallengeNotValid);
    }

    let phone_number = challenge_data.phone_number;
    let sh_phone_number = hash(phone_number.clone());
    let existing_user =
        db::user_vault::get_by_phone_number(&state.db_pool, sh_phone_number.clone()).await?;

    let (user, kind) = match existing_user {
        Some(uv) => (uv, VerifyKind::UserInherited),
        None => {
            // The user does not exist. Create a new user vault
            let user = create_new_user_vault(&state, phone_number.clone()).await?;
            (user, VerifyKind::UserCreated)
        }
    };

    // Save logged in session data into the DB
    let (_, token) = DbSessionState::LoggedInSession(LoggedInSessionData {
        user_vault_id: user.id,
    })
    .create(&state.db_pool)
    .await?;
    // Set the cookie that identifies this as a LoggedInSession and attaches it to the DB state
    LoggedInSessionContext::set(&session, token)?;

    Ok(Json(ApiResponseData {
        data: VerifyResponse { kind },
    }))
}

async fn create_new_user_vault(
    state: &web::Data<State>,
    phone_number: String,
) -> Result<UserVault, ApiError> {
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
        public_key: ec_pk_uncompressed.clone(),
        e_phone_number: seal(phone_number.clone(), &ec_pk_uncompressed)?,
        sh_phone_number: hash(phone_number.clone()),
        id_verified: Status::Incomplete,
    }
    .save(&state.db_pool)
    .await?;

    Ok(user)
}
