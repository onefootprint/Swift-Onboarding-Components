use crate::errors::ApiError;
use crate::State;
use actix_web::{
    patch, web, Responder,
};

use db::models::{
    users::{UpdateUser},
    types::{Status},
};
use crypto::{sha256};


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
async fn handler(
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