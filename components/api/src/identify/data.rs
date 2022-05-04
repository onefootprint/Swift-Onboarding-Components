use crate::{
    auth::onboarding_session::OnboardingSessionContext, errors::ApiError,
    response::success::ApiResponseData, State,
};
use db::models::{types::Status, user_vaults::UpdateUserVault};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
struct UserPatchRequest {
    /// Key-value pairs of fields to update for the user_vault
    /// (all optional). Patch can be preformed in batch
    /// or all at once. *All fields are optional* & do
    /// not have to be represented in the request
    /// for example {"email_address": "test@test.com"}
    /// is a valid UserPatchRequest
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
}

#[api_v2_operation]
#[post("/data")]
async fn handler(
    state: web::Data<State>,
    session_context: OnboardingSessionContext,
    request: web::Json<UserPatchRequest>,
) -> actix_web::Result<Json<ApiResponseData<String>>, ApiError> {
    let user_vault = session_context.user_vault();
    fn seal(
        val: Option<Option<String>>,
        user_vault: &db::models::user_vaults::UserVault,
    ) -> Result<Option<Vec<u8>>, ApiError> {
        let val = match val {
            None | Some(None) => None,
            Some(Some(s)) => Some(super::seal(s, &user_vault.public_key)?),
        };
        Ok(val)
    }

    fn hash(val: Option<Option<String>>) -> Option<Vec<u8>> {
        match val {
            None | Some(None) => None,
            Some(Some(s)) => Some(super::hash(s)),
        }
    }

    let user_update = UpdateUserVault {
        id: user_vault.id.clone(),
        e_first_name: seal(request.first_name.clone(), user_vault)?,
        e_last_name: seal(request.last_name.clone(), user_vault)?,
        e_dob: seal(request.dob.clone(), user_vault)?,
        e_ssn: seal(request.ssn.clone(), user_vault)?,
        sh_ssn: hash(request.ssn.clone()),
        e_street_address: seal(request.street_address.clone(), user_vault)?,
        e_city: seal(request.city.clone(), user_vault)?,
        e_state: seal(request.state.clone(), user_vault)?,
        id_verified: Status::Processing,
        ..Default::default()
    };

    let _: usize = db::user_vault::update(&state.db_pool, user_update).await?;

    Ok(Json(ApiResponseData {
        data: "Succesful update".to_string(),
    }))
}
