use crate::auth::onboarding_session::OnboardingSessionContext;
use crate::response::success::ApiResponseData;
use crate::State;
use crate::{auth::client_public_key::PublicTenantAuthContext, errors::ApiError};
use actix_session::Session;
use paperclip::actix::{api_v2_operation, web, web::Json, Apiv2Schema};

use aws_sdk_kms::model::DataKeyPairSpec;
use db::models::{types::Status, user_vaults::NewUserVault};

/// empty data
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
pub struct Empty;

#[api_v2_operation]
pub async fn handler(
    pub_tenant_auth: PublicTenantAuthContext,
    session: Session,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<Empty>>, ApiError> {
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

    let (_, token) =
        db::user_vault::init(&state.db_pool, user, pub_tenant_auth.tenant().id.clone()).await?;

    OnboardingSessionContext::set(&session, token)?;

    Ok(Json(ApiResponseData { data: Empty }))
}
// TODO clean up empty user vaults
