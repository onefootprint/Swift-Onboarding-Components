use crate::auth::logged_in_session::LoggedInSessionContext;
use crate::identify::{clean_email, send_email_challenge};
use crate::{errors::ApiError, types::success::ApiResponseData, State};
use db::models::user_vaults::UpdateUserVault;
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
    #[serde(
        default,
        skip_serializing_if = "Option::is_none",
        with = "::serde_with::rust::double_option"
    )]
    email: Option<Option<String>>,
}

#[api_v2_operation]
#[post("/data")]
/// Operates as a PATCH request to update data in the user vault. Client is authenticated
/// via state set upon successful call to /identify/verify endpoint (see OnboardingSessionState).
async fn handler(
    state: web::Data<State>,
    user_auth: LoggedInSessionContext,
    request: web::Json<UserPatchRequest>,
) -> actix_web::Result<Json<ApiResponseData<String>>, ApiError> {
    // TODO don't allow updating every field if the user vault is already verified
    let user_vault = user_auth.user_vault();
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

    let cleaned_email = if let Some(Some(email)) = request.email.clone() {
        let cleaned_email = clean_email(email);
        // If we're updating the email address, send an async challenge to the new email address
        send_email_challenge(&state, user_vault.public_key.clone(), cleaned_email.clone()).await?;
        Some(Some(cleaned_email))
    } else {
        None
    };

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
        e_email: seal(cleaned_email.clone(), user_vault)?,
        sh_email: hash(cleaned_email.clone()),
        is_email_verified: match cleaned_email {
            // Mark email as unverified if we're setting a new email
            Some(Some(_)) => Some(false),
            _ => None,
        },
        ..Default::default()
    };

    let _: usize = db::user_vault::update(&state.db_pool, user_update).await?;

    Ok(Json(ApiResponseData {
        data: "Succesful update".to_string(),
    }))
}
