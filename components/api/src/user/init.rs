use crate::errors::ApiError;
use crate::State;
use actix_web::{
    post, web, Responder,
};

use aws_sdk_kms::model::DataKeyPairSpec;
use db::models::{
    users::{NewUser},
    types::{Status},
};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct UserInitResponse {
    tenant_user_id: String,
    tenant_user_auth_token: String
}

#[post("/tenant/authz/{tenant_pub_key}/user/init")]
async fn handler(
    state: web::Data<State>, 
    path: web::Path<String>
) ->  actix_web::Result<impl Responder, ApiError> {

    let tenant_pub_key = path.into_inner();

    let tenant_api_key = db::tenant::pub_auth_check(&state.db_pool, tenant_pub_key).await?;

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
    };

    let (user_tenant_record, token) = db::user::init(&state.db_pool, user, tenant_api_key.tenant_id).await?;

    Ok(web::Json(UserInitResponse{
        tenant_user_id: user_tenant_record.tenant_user_id,
        tenant_user_auth_token: token,
    }))
}