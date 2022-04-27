use crate::State;
use crate::{auth::pk_tenant::PublicTenantAuthContext, errors::ApiError};
use actix_web::{post, web, Responder};

use aws_sdk_kms::model::DataKeyPairSpec;
use db::models::{types::Status, users::NewUser};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct UserInitResponse {
    tenant_user_id: String,
    tenant_user_auth_token: String,
}

#[post("/user/init")]
async fn handler(
    pub_tenant_auth: PublicTenantAuthContext,
    state: web::Data<State>,
) -> actix_web::Result<impl Responder, ApiError> {
    // TODO, add email & phone number to request & check against existing entries

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

    let user = NewUser {
        e_private_key: new_key_pair
            .private_key_ciphertext_blob
            .unwrap()
            .into_inner(),
        public_key: ec_pk_uncompressed,
        id_verified: Status::Incomplete,
        is_phone_number_verified: false,
        is_email_verified: false,
    };

    let (user_tenant_record, token) =
        db::user::init(&state.db_pool, user, pub_tenant_auth.tenant().id.clone()).await?;

    Ok(web::Json(UserInitResponse {
        tenant_user_id: user_tenant_record.tenant_user_id,
        tenant_user_auth_token: token,
    }))
}
