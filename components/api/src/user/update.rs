use crate::{
    auth::user_token::TenantUserTokenContext,
    errors::ApiError,
    response::success::ApiResponseData,
    State,
};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

use crypto::sha256;
use db::models::{types::Status, users::UpdateUser};

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
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

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
struct UserPatchResponse {
    tenant_user_id: String,
}

#[api_v2_operation]
#[post("/user")]
async fn handler(
    state: web::Data<State>,
    tenant_user_token_auth: TenantUserTokenContext,
    request: web::Json<UserPatchRequest>,
) -> actix_web::Result<Json<ApiResponseData<String>>, ApiError> {
    let user = tenant_user_token_auth.user();

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
    let validated_phone_number = match &request.phone_number {
        Some(Some(phone_number)) => {
            let req = aws_sdk_pinpoint::model::NumberValidateRequest::builder().phone_number(phone_number).build();
            let validated_phone_number = state.pinpoint_client.phone_number_validate()
                .number_validate_request(req)
                .send().await?
                .number_validate_response.ok_or(ApiError::PhoneNumberValidationError)?
                .cleansed_phone_number_e164.ok_or(ApiError::PhoneNumberValidationError)?;
            Some(Some(validated_phone_number))
        },
        _ => request.phone_number.clone(),
    };

    let user_update = UpdateUser {
        id: user.id.clone(),
        e_first_name: seal(request.first_name.clone()),
        e_last_name: seal(request.last_name.clone()),
        e_dob: seal(request.dob.clone()),
        e_ssn: seal(request.ssn.clone()),
        sh_ssn: hash(request.ssn.clone()),
        e_street_address: seal(request.street_address.clone()),
        e_city: seal(request.city.clone()),
        e_state: seal(request.state.clone()),
        e_email: seal(request.email.clone()),
        is_email_verified: match request.email {
            Some(Some(_)) => Some(false),
            _ => None,
        },
        sh_email: hash(request.email.clone()),
        e_phone_number: seal(validated_phone_number.clone()),
        is_phone_number_verified: match validated_phone_number {
            Some(Some(_)) => Some(false),
            _ => None,
        },
        sh_phone_number: hash(validated_phone_number.clone()),
        id_verified: Status::Processing,
    };

    let size = db::user::update(&state.db_pool, user_update).await?;

    Ok(Json(ApiResponseData {
        data: format!("Succesful update: total update size {}", size),
    }))
}
