use crate::auth::logged_in_session::LoggedInSessionContext;
use crate::identify::{clean_email, send_email_challenge};
use crate::{errors::ApiError, types::success::ApiResponseData, State};
use db::models::user_data::{NewUserData, NewUserDataBatch};
use newtypes::DataKind;
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
struct UserPatchRequest {
    /// Key-value pairs of fields to update for the user_vault
    /// (all optional). Patch can be preformed in batch
    /// or all at once. *All fields are optional* & do
    /// not have to be represented in the request
    /// for example {"email_address": "test@test.com"}
    /// is a valid UserPatchRequest
    first_name: Option<String>,
    last_name: Option<String>,
    dob: Option<String>,
    ssn: Option<String>,
    street_address: Option<String>,
    city: Option<String>,
    state: Option<String>,
    zip: Option<String>,
    country: Option<String>,
    email: Option<String>,
}

#[api_v2_operation]
#[post("/data")]
/// Operates as a PATCH request to update data in the user vault. Requires user authentication
/// sent in the cookie after a successful /identify/verify call.
async fn handler(
    state: web::Data<State>,
    user_auth: LoggedInSessionContext,
    request: web::Json<UserPatchRequest>,
) -> actix_web::Result<Json<ApiResponseData<String>>, ApiError> {
    // TODO don't allow updating every field if the user vault is already verified
    // TODO only allow adding duplicate UserData rows for certain types of data (like email/phone)
    let user_vault = user_auth.user_vault();

    let data_to_insert: Vec<(DataKind, String)> = vec![
        (DataKind::FirstName, request.first_name.clone()),
        (DataKind::LastName, request.last_name.clone()),
        (DataKind::Dob, request.dob.clone()),
        (DataKind::Ssn, request.ssn.clone()),
        (DataKind::StreetAddress, request.street_address.clone()),
        (DataKind::City, request.city.clone()),
        (DataKind::State, request.state.clone()),
        (DataKind::Zip, request.zip.clone()),
        (DataKind::Country, request.country.clone()),
        (DataKind::Email, request.email.clone()),
    ]
    .into_iter()
    .filter_map(|(data_kind, data_str)| {
        if let Some(data_str) = data_str {
            // Clean/validate data
            let data_str = match data_kind {
                DataKind::Email => clean_email(data_str),
                _ => data_str,
            };
            Some((data_kind, data_str))
        } else {
            None
        }
    })
    .collect();

    let mut uds = Vec::<NewUserData>::new();
    for (data_kind, data_str) in data_to_insert {
        let sh_data = match data_kind {
            DataKind::Ssn | DataKind::Email | DataKind::PhoneNumber => {
                Some(crate::identify::signed_hash(&state, data_str.clone()).await?)
            }
            _ => None,
        };
        uds.push(NewUserData {
            user_vault_id: user_vault.id.clone(),
            data_kind,
            e_data: crate::identify::seal(data_str, &user_vault.public_key)?,
            sh_data,
            is_verified: false,
        });
    }
    NewUserDataBatch(uds).bulk_insert(&state.db_pool).await?;

    // If we're updating the email address, send an async challenge to the new email address
    if let Some(email) = request.email.clone() {
        let cleaned_email = clean_email(email);
        send_email_challenge(&state, user_vault.public_key.clone(), cleaned_email).await?;
    }

    Ok(Json(ApiResponseData {
        data: "Successful update".to_string(),
    }))
}
