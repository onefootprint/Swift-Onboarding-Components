use super::validate_challenge;
use crate::auth::client_public_key::PublicTenantAuthContext;
use crate::auth::logged_in_session::LoggedInSessionContext;
use crate::auth::login_session::LoginSessionContext;
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::State;
use actix_session::Session;
use aws_sdk_kms::model::DataKeyPairSpec;
use db::models::onboardings::{NewOnboarding, Onboarding};
use db::models::session_data::{LoggedInSessionData, SessionState as DbSessionState};
use db::models::types::Status;
use db::models::user_vaults::{MissingFields, NewUserVault, UserVault};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

use super::{hash, seal, send_email_challenge};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
struct VerifyRequest {
    email: String,
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
    /// Attributes needed to successfully onboard this user
    missing_attributes: String,
}

#[api_v2_operation]
#[post("/verify")]
/// Verify an SMS challenge sent to a user. If successful, this endpoint sets relevant cookies
/// that allow the client to update the user vault (/identify/data) and finalize user onboarding (/identify/commit)
async fn handler(
    state: web::Data<State>,
    session: Session,
    tenant_auth: PublicTenantAuthContext,
    user_auth: LoginSessionContext,
    request: Json<VerifyRequest>,
) -> actix_web::Result<Json<ApiResponseData<VerifyResponse>>, ApiError> {
    let challenge_data = user_auth.state.challenge_state;

    if !validate_challenge(request.code.clone(), &challenge_data).await? {
        return Err(ApiError::ChallengeNotValid);
    }

    let phone_number = challenge_data.phone_number;
    let sh_phone_number = hash(phone_number.clone());
    let existing_user_vault =
        db::user_vault::get_by_phone_number(&state.db_pool, sh_phone_number.clone()).await?;

    let (onboarding, kind, missing_attributes) = match existing_user_vault {
        Some(uv) => (
            // User with this phone number exists. Onboard the existing user to this tenant
            onboard_existing_user(&state, uv.clone(), tenant_auth.tenant().id.clone()).await?,
            VerifyKind::UserInherited,
            MissingFields::missing_fields(&uv).join(","),
        ),
        None => {
            // The user does not exist. Create a new user and onboard them to this tenant
            let (ob, missing_fields) = onboard_new_user(
                &state,
                tenant_auth.tenant().id.clone(),
                phone_number.clone(),
                request.email.clone(),
            )
            .await?;
            (ob, VerifyKind::UserCreated, missing_fields)
        }
    };

    // Save logged in session data into the DB
    let (_, token) = DbSessionState::LoggedInSession(LoggedInSessionData {
        user_vault_id: onboarding.user_vault_id,
    })
    .create(&state.db_pool)
    .await?;
    // Set the cookie that identifies this as a LoggedInSession and attaches it to the DB state
    LoggedInSessionContext::set(&session, token)?;

    Ok(Json(ApiResponseData {
        data: VerifyResponse {
            kind,
            missing_attributes,
        },
    }))
}

async fn onboard_existing_user(
    state: &web::Data<State>,
    uv: UserVault,
    tenant_id: String,
) -> Result<Onboarding, ApiError> {
    let new_onboarding = NewOnboarding {
        tenant_id,
        user_vault_id: uv.id,
        status: uv.id_verified,
    };

    let ob = db::onboarding::init_or_get_existing(&state.db_pool, new_onboarding).await?;
    Ok(ob)
}

async fn onboard_new_user(
    state: &web::Data<State>,
    tenant_id: String,
    phone_number: String,
    email: String,
) -> Result<(Onboarding, String), ApiError> {
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

    let (e_email, sh_email) = (
        Some(seal(email.clone(), &ec_pk_uncompressed)?),
        Some(hash(email.clone())),
    );

    // send async email challenge
    send_email_challenge(
        state,
        ec_pk_uncompressed.clone(),
        email.clone(),
        sh_email.clone().unwrap(),
    )
    .await?;

    let user = NewUserVault {
        e_private_key: new_key_pair
            .private_key_ciphertext_blob
            .unwrap()
            .into_inner(),
        public_key: ec_pk_uncompressed.clone(),
        e_phone_number: seal(phone_number.clone(), &ec_pk_uncompressed)?,
        sh_phone_number: hash(phone_number.clone()),
        e_email,
        sh_email,
        id_verified: Status::Incomplete,
    };

    let (user, onboarding) = db::user_vault::init(&state.db_pool, user.clone(), tenant_id).await?;

    let missing_fields = MissingFields::missing_fields(&user).join(",");
    // create new onboarding session data
    Ok((onboarding, missing_fields))
}
