use super::validate_challenge;
use crate::auth::logged_in_session::LoggedInSessionContext;
use crate::auth::login_session::LoginSessionContext;
use crate::errors::ApiError;
use crate::identify::signed_hash;
use crate::types::success::ApiResponseData;
use crate::State;
use actix_session::Session;
use aws_sdk_kms::model::DataKeyPairSpec;
use db::models::session_data::{LoggedInSessionData, SessionState as DbSessionState};
use db::models::user_vaults::{NewUserVault, UserVault};
use newtypes::Status;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

use super::seal;

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
/// Used to verify the two-factor challenge sent to a phone number. If the challenge code matches
/// what was sent to the phone number, we will get or create the user vault associated with this
/// phone number. Returns an HTTP 200 and specifies whether a user was created or inherited. Also
/// sets some session state in the cookie that allows the client to update the logged-in user vault
/// and onboard the user vault onto new tenants.
async fn handler(
    state: web::Data<State>,
    session: Session,
    user_auth: LoginSessionContext,
    request: Json<VerifyRequest>,
) -> actix_web::Result<Json<ApiResponseData<VerifyResponse>>, ApiError> {
    let challenge_data = user_auth.challenge_state;

    if !validate_challenge(request.code.clone(), &challenge_data).await? {
        return Err(ApiError::ChallengeNotValid);
    }

    let phone_number = challenge_data.phone_number;
    let sh_phone_number = signed_hash(&state, phone_number.clone()).await?;
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
        sh_phone_number: signed_hash(state, phone_number.clone()).await?,
        id_verified: Status::Incomplete,
    }
    .save(&state.db_pool)
    .await?;

    Ok(user)
}
