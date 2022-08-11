use std::collections::HashMap;

use crate::auth::session_data::user::UserAuthScope;
use crate::auth::UserAuth;
use crate::auth::VerifiedUserAuth;
use crate::errors::user::UserError;
use crate::types::response::ApiResponseData;
use crate::types::EmptyResponse;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::{errors::ApiError, utils::email::send_email_challenge, State};
use db::models::user_vaults::UserVault;
use newtypes::address::Address;
use newtypes::dob::DateOfBirth;
use newtypes::email::Email;
use newtypes::name::FullName;
use newtypes::ssn::Ssn;
use newtypes::DataKind;
use newtypes::Decomposable;
use newtypes::Fingerprinter;
use newtypes::NewData;
use newtypes::NewSealedData;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, post, web, web::Json};

/// Key-value pairs of fields to update for the user_vault
/// (all optional). Patch can be preformed in batch
/// or all at once. *All fields are optional* & do
/// not have to be represented in the request
/// for example {"email_address": "test@test.com"}
/// is a valid UserPatchRequest
/// ssn is either last 4 of ssn or full ssn
#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
struct UserPatchRequest {
    pub name: Option<FullName>,
    pub ssn: Option<Ssn>,
    pub dob: Option<DateOfBirth>,
    pub address: Option<Address>,
    pub email: Option<Email>,
    #[serde(default)]
    pub speculative: bool,
}

impl UserPatchRequest {
    async fn decompose_and_seal(
        self,
        state: &State,
        user_vault: &UserVault,
    ) -> Result<HashMap<DataKind, NewSealedData>, ApiError> {
        let UserPatchRequest {
            name,
            ssn,
            dob,
            address,
            email,
            speculative: _,
        } = self;

        let results = vec![
            name.map(|n| n.decompose()),
            ssn.map(|ssn| ssn.decompose()),
            dob.map(|dob| dob.decompose()),
            address.map(|addr| addr.decompose()),
            email.map(|email| email.decompose()),
        ]
        .into_iter()
        .flatten()
        .flatten()
        .collect::<Vec<NewData>>();

        let mut new_data = HashMap::<DataKind, NewSealedData>::new();
        for NewData { data_kind, data } in results {
            // Compute the fingerprint and seal the data
            let sh_data = if data_kind.allows_fingerprint() {
                Some(state.compute_fingerprint(data_kind, &data).await?)
            } else {
                None
            };
            let e_data = user_vault.public_key.seal_pii(&data)?;
            new_data.insert(data_kind, NewSealedData { e_data, sh_data });
        }
        Ok(new_data)
    }
}

#[api_v2_operation(tags(User))]
#[post("/data")]
/// Operates as a PATCH request to update data in the user vault. Requires user authentication
/// sent in the cookie after a successful /identify/verify call.
async fn handler(
    state: web::Data<State>,
    user_auth: UserAuth,
    request: web::Json<UserPatchRequest>,
) -> actix_web::Result<Json<ApiResponseData<EmptyResponse>>, ApiError> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScope::SignUp])?;
    if request.speculative {
        // We've already parsed the request and done validation on the input. Return a successful
        // response before writing anything to the DB
        return Ok(Json(ApiResponseData::ok(EmptyResponse)));
    }

    let user_vault = user_auth.user_vault(&state.db_pool).await?;
    let request = request.into_inner();

    // Enforce that sandbox emails are used for sandbox users
    let email_update = request.email.clone();
    if let Some(email) = &email_update {
        if email.is_live() != user_vault.is_live {
            return Err(UserError::SandboxMismatch.into());
        }
    }

    let new_data = request.decompose_and_seal(&state, &user_vault).await?;
    let uvw = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let mut uvw = UserVaultWrapper::from_conn(conn, user_vault)?;
            uvw.process_updates(conn, new_data)?;
            Ok(uvw)
        })
        .await?;

    // If we updated the email address, send an async challenge to the new email address
    if let Some(email) = &email_update {
        // We only support one email per request, so there will be a UserData row
        // TODO support multiple emails per user vault
        let email_row = uvw.emails.first().ok_or(ApiError::NotImplemented)?;
        send_email_challenge(&state, email_row.id.clone(), &email.email).await?;
    }
    Ok(Json(ApiResponseData::ok(EmptyResponse)))
}
