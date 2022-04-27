use crate::{
    auth::pk_tenant::PublicTenantAuthContext,
    auth::user_token::TenantUserTokenContext,
    errors::ApiError,
    State,
};
use actix_web::{patch, web, Responder};

use crypto::sha256;
use db::models::{types::Status, users::UpdateUser};

#[derive(Debug, Clone, serde::Deserialize)]
struct UserPatchRequest {
    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        with = "::serde_with::rust::double_option"
    )]
    first_name: Option<Option<String>>,
    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        with = "::serde_with::rust::double_option"
    )]
    last_name: Option<Option<String>>,
    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        with = "::serde_with::rust::double_option"
    )]
    dob: Option<Option<String>>,
    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        with = "::serde_with::rust::double_option"
    )]
    ssn: Option<Option<String>>,
    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        with = "::serde_with::rust::double_option"
    )]
    street_address: Option<Option<String>>,
    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        with = "::serde_with::rust::double_option"
    )]
    city: Option<Option<String>>,
    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        with = "::serde_with::rust::double_option"
    )]
    state: Option<Option<String>>,
    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        with = "::serde_with::rust::double_option"
    )]
    email: Option<Option<String>>,
    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        with = "::serde_with::rust::double_option"
    )]
    phone_number: Option<Option<String>>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
struct UserPatchResponse {
    tenant_user_id: String,
}

#[patch("/user")]
async fn handler(
    state: web::Data<State>,
    pub_tenant_auth: PublicTenantAuthContext,
    tenant_user_token_auth: TenantUserTokenContext,
    request: web::Json<UserPatchRequest>,
) -> actix_web::Result<impl Responder, ApiError> {
    if tenant_user_token_auth.token().tenant_id != pub_tenant_auth.tenant().id {
        // TODO this assertion feels like it should be done in an auth middleware
        return Err(ApiError::InvalidTenantUserAuthToken)
    }

    // look up user from tenant-scoped id
    let user = db::user::get_by_tenant_user_id(
        &state.db_pool,
        tenant_user_token_auth.token().tenant_user_id.clone(),
        pub_tenant_auth.tenant().id.clone(),
    ).await?;

    let seal = |val: Option<Option<String>>| match val {
        None | Some(None) => None,
        Some(Some(s)) => Some(
            crypto::seal::seal_ecies_p256_x963_sha256_aes_gcm(
                &user.public_key,
                s.as_str().as_bytes().to_vec(),
            )
            .ok()?
            .to_vec()
            .ok()?,
        ),
    };

    fn hash(val: Option<Option<String>>) -> Option<Vec<u8>> {
        match val {
            None | Some(None) => None,
            Some(Some(s)) => Some(sha256(s.as_bytes()).to_vec()),
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
        // TODO set to false when email is provided
        is_email_verified: None,
        sh_email: hash(request.email.clone()),
        e_phone_number: seal(request.phone_number.clone()),
        // TODO set to false when phone is provided
        is_phone_number_verified: None,
        sh_phone_number: hash(request.phone_number.clone()),
        id_verified: Status::Processing,
    };

    let size = db::user::update(&state.db_pool, user_update).await?;

    Ok(format!("Succesful update: total update size {}", size))
}
