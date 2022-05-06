use crate::auth::identify_session::ChallengeState;
use crate::auth::onboarding_session::OnboardingSessionContext;
use crate::response::success::ApiResponseData;
use crate::State;
use crate::{auth::identify_session::IdentifySessionContext, errors::ApiError};
use actix_session::Session;
use aws_sdk_kms::model::DataKeyPairSpec;
use chrono::{Duration, Utc};
use crypto::hex::ToHex;
use crypto::random::gen_random_alphanumeric_code;
use db::models::onboardings::{NewOnboarding, Onboarding};
use db::models::session_data::OnboardingSessionData;
use db::models::session_data::SessionState;
use db::models::sessions::NewSession;
use db::models::types::Status;
use db::models::user_vaults::{MissingFields, NewUserVault, UserVault};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

use super::{hash, seal, send_email_challenge};

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
    /// Attributes needed to successfully onbaord this user
    missing_attributes: String,
}

#[api_v2_operation]
#[post("/verify")]
/// Verify an SMS challenge sent to a user. If successful, this endpoint sets relavent cookies
/// that allow the client to update the user vault (/identify/data) and finalize user onboarding (/identify/commit)
async fn handler(
    state: web::Data<State>,
    session: Session,
    session_context: IdentifySessionContext,
    request: Json<VerifyRequest>,
) -> actix_web::Result<Json<ApiResponseData<VerifyResponse>>, ApiError> {
    let session_state = session_context.state;
    let opt_challenge_data = session_state.challenge_state;

    let challenge_data = match opt_challenge_data {
        None => Err(ApiError::ChallengeNotValid),
        Some(d) => Ok(d),
    }?;

    if !verify_code(request.code.clone(), &challenge_data).await? {
        return Err(ApiError::ChallengeNotValid);
    }

    let phone_number = challenge_data.phone_number;
    let sh_phone_number = hash(phone_number.clone());
    let existing_user_vault =
        db::user_vault::get_by_phone_number(&state.db_pool, sh_phone_number.clone()).await?;

    let (onboarding, kind, missing_attributes) = match existing_user_vault {
        Some(uv) => (
            // User with this phone number exists. Onboard the existing user to this tenant
            onboard_existing_user(&state, uv.clone(), session_state.tenant_id.clone()).await?,
            VerifyKind::UserInherited,
            MissingFields::missing_fields(&uv).join(","),
        ),
        None => {
            // The user does not exist. Create a new user and onboard them to this tenant
            let (ob, missing_fields) = onboard_new_user(
                &state,
                session_state.tenant_id.clone(),
                phone_number.clone(),
                session_state.email.clone(),
            )
            .await?;
            (ob, VerifyKind::UserCreated, missing_fields)
        }
    };

    // Update the session to onboarding session
    // create a token to identify session for future lookup
    let token = format!("vtok_{}", gen_random_alphanumeric_code(34));
    let h_session_id: String = crypto::sha256(token.as_bytes()).encode_hex();

    let new_session = NewSession {
        h_session_id,
        session_data: SessionState::OnboardingSession(OnboardingSessionData {
            user_ob_id: Some(onboarding.user_ob_id),
        }),
    };
    let _ = db::session::init(&state.db_pool, new_session).await?;

    OnboardingSessionContext::set(&session, token)?;

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

async fn verify_code(
    request_code: String,
    challenge_data: &ChallengeState,
) -> Result<bool, ApiError> {
    let now = Utc::now().naive_utc();

    Ok((challenge_data.challenge_code == request_code)
        & (challenge_data
            .challenge_created_at
            .signed_duration_since(now)
            < Duration::minutes(15)))
}
