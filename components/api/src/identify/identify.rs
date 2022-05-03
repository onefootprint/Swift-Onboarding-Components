use crate::auth::identify_session::IdentifySessionContext;
use crate::identify::{clean_email, clean_phone_number, initiate, CreateChallengeRequest};
use crate::response::success::ApiResponseData;
use crate::State;
use crate::{auth::client_public_key::PublicTenantAuthContext, errors::ApiError};
use actix_session::Session;
use crypto::hex::ToHex;
use crypto::random::gen_random_alphanumeric_code;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, Apiv2Schema, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum IdentifyRequest {
    Email(String),
    PhoneNumber(String),
}

#[api_v2_operation]
#[post("/identify")]
pub async fn handler(
    request: Json<IdentifyRequest>,
    session: Session,
    pub_tenant_auth: PublicTenantAuthContext,
    state: web::Data<State>,
) -> actix_web::Result<Json<ApiResponseData<String>>, ApiError> {
    // clean data
    let validated_data = match request.0.clone() {
        IdentifyRequest::Email(s) => clean_email(s.clone()),
        IdentifyRequest::PhoneNumber(p) => clean_phone_number(&state, &p).await?,
    };

    // create a token to identify session for future lookup
    let token = format!("vtok_{}", gen_random_alphanumeric_code(34));
    let h_session_id: String = crypto::sha256(token.as_bytes()).encode_hex();

    // initiate a challenge to given identifier & set session data in db
    let _ = initiate(
        &state,
        validated_data.clone(),
        request.0.clone(),
        h_session_id,
        pub_tenant_auth.tenant().clone().id,
    )
    .await?;

    // set identifier & onboarding token
    IdentifySessionContext::set_token(&session, token.clone())?;
    IdentifySessionContext::set_identifier(&session, validated_data.clone())?;

    Ok(Json(ApiResponseData {
        data: "challenge initiated".to_string(),
    }))
}
