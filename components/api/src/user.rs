use crate::errors::ApiError;
use crate::State;
use actix_web::{
    post, patch, web, Responder,
};

use aws_sdk_kms::model::DataKeyPairSpec;
use db::models::{
    users::{NewUser, UpdateUser},
    temp_tenant_user_tokens::{PartialTempTenantUserToken},
    types::{Status},
};
use crypto::{
    random::gen_random_alphanumeric_code,
    hex::ToHex,
    sha256,
};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct UserInitResponse {
    tenant_user_id: String,
    tenant_user_auth_token: String
}

#[post("/tenant/authz/{tenant_pub_key}/user/init")]
async fn init(
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
        .await
        .map_err(ApiError::from)?;
    
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

    let temp_token = "vtok_".to_owned() + &gen_random_alphanumeric_code(34);

    let partial_temp_tenant_token = PartialTempTenantUserToken {
        tenant_id: tenant_api_key.tenant_id,
        h_token: sha256(&temp_token.as_bytes()).encode_hex()
    };

    let uuid = db::user::init(&state.db_pool, user, partial_temp_tenant_token).await?;

    Ok(web::Json(UserInitResponse{
        tenant_user_id: uuid,
        tenant_user_auth_token: temp_token
    }))
}

#[derive(Debug, Clone, serde::Deserialize)]
struct UserPatchRequest {
    #[serde(
        default,
        skip_serializing_if = "Option::is_none", 
        with = "::serde_with::rust::double_option",
    )]
    first_name: Option<Option<String>>,
    #[serde(
        default,
        skip_serializing_if = "Option::is_none", 
        with = "::serde_with::rust::double_option",
    )]
    last_name: Option<Option<String>>,
    #[serde(
        default,
        skip_serializing_if = "Option::is_none", 
        with = "::serde_with::rust::double_option",
    )]
    dob: Option<Option<String>>,
    #[serde(
        default,
        skip_serializing_if = "Option::is_none", 
        with = "::serde_with::rust::double_option",
    )]
    ssn: Option<Option<String>>,
    #[serde(
        default,
        skip_serializing_if = "Option::is_none", 
        with = "::serde_with::rust::double_option",
    )]
    street_address: Option<Option<String>>,
    #[serde(
        default,
        skip_serializing_if = "Option::is_none", 
        with = "::serde_with::rust::double_option",
    )]
    city: Option<Option<String>>,
    #[serde(
        default,
        skip_serializing_if = "Option::is_none", 
        with = "::serde_with::rust::double_option",
    )]
    state: Option<Option<String>>,
    #[serde(
        default,
        skip_serializing_if = "Option::is_none", 
        with = "::serde_with::rust::double_option",
    )]
    email: Option<Option<String>>,
    #[serde(
        default,
        skip_serializing_if = "Option::is_none", 
        with = "::serde_with::rust::double_option",
    )]
    phone_number: Option<Option<String>>
} 

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct UserPatchResponse {
    tenant_user_id: String
}


#[patch("/tenant/authz/{tenant_user_token}/user/{tenant_user_id}/update")]
async fn update(
    state: web::Data<State>, 
    path: web::Path<(String, String)>,
    request: web::Json<UserPatchRequest>
) ->  actix_web::Result<impl Responder, ApiError> {
    
    let (tenant_user_token, tenant_user_id) = path.into_inner();

    // look up real uuid from tenant scoped uuid
    let user = db::user::lookup(
        &state.db_pool, tenant_user_token, tenant_user_id
    ).await?;


    let seal = |val: Option<Option<String>>| {
        match val {
            None | Some(None) => None,
            Some(Some(s)) => {
                Some(crypto::seal::seal_ecies_p256_x963_sha256_aes_gcm(
                    &user.public_key,
                    s.as_str().as_bytes().to_vec(),
                ).ok()?.to_vec().ok()?)
            }
        }
    };

    fn hash(val: Option<Option<String>>) -> Option<Vec<u8>> {
        match val {
            None | Some(None) => None,
            Some(Some(s)) => {
                Some(sha256(s.as_bytes()).to_vec())
            }
        }
    }
    
    let user_update = UpdateUser {
        id: user.id,
        e_first_name: seal(request.first_name.clone()),
        e_last_name: seal(request.last_name.clone()),
        e_dob: seal(request.dob.clone()),
        e_ssn: seal(request.ssn.clone()),
        sh_ssn: hash(request.ssn.clone()),
        e_street_address: seal(request.street_address.clone()),
        e_city: seal(request.city.clone()),
        e_state: seal(request.state.clone()),
        e_email: seal(request.email.clone()),
        is_email_verified: None,
        sh_email: hash(request.email.clone()),
        e_phone_number: seal(request.phone_number.clone()),
        is_phone_number_verified: None,
        sh_phone_number: hash(request.phone_number.clone()),
        id_verified: Status::Processing
    };

    let size = db::user::update(&state.db_pool, user_update).await?;

    Ok(format!("Succesful update: total update size {}", size))

}