use super::{clean_for_fingerprint, clean_for_storage};
use crate::auth::logged_in_session::LoggedInSessionContext;
use crate::identify::{clean_email, send_email_challenge};
use crate::{errors::ApiError, types::success::ApiResponseData, State};
use db::models::user_data::{NewUserData, NewUserDataBatch};
use db::models::user_vaults::{UserVault, UserVaultWrapper};
use newtypes::{DataKind, DataPriority, UserDataId, UserVaultId};
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
    street_address2: Option<String>,
    city: Option<String>,
    state: Option<String>,
    zip: Option<String>,
    country: Option<String>,
    email: Option<String>,
}

impl UserPatchRequest {
    fn to_vec(self) -> Vec<(DataKind, String)> {
        let Self {
            first_name,
            last_name,
            dob,
            ssn,
            street_address,
            street_address2,
            city,
            state,
            zip,
            country,
            email,
        } = self;

        vec![
            (DataKind::FirstName, first_name),
            (DataKind::LastName, last_name),
            (DataKind::Dob, dob),
            (DataKind::Ssn, ssn),
            (DataKind::StreetAddress, street_address),
            (DataKind::StreetAddress2, street_address2),
            (DataKind::City, city),
            (DataKind::State, state),
            (DataKind::Zip, zip),
            (DataKind::Country, country),
            (DataKind::Email, email),
        ]
        .into_iter()
        .filter_map(|(data_kind, d)| d.map(|d| (data_kind, d)))
        .collect()
    }
}

#[api_v2_operation(tags(User))]
#[post("/data")]
/// Operates as a PATCH request to update data in the user vault. Requires user authentication
/// sent in the cookie after a successful /identify/verify call.
async fn handler(
    state: web::Data<State>,
    user_auth: LoggedInSessionContext,
    request: web::Json<UserPatchRequest>,
) -> actix_web::Result<Json<ApiResponseData<String>>, ApiError> {
    let mut data_to_insert = Vec::<DataUpdateRequest>::new();
    let email = request.email.clone();
    for (data_kind, data_str) in request.into_inner().to_vec() {
        // Clean/validate data
        let data_str = clean_for_storage(data_kind, data_str);
        let sh_data = if data_kind.is_fingerprintable() {
            let cleaned_data = clean_for_fingerprint(data_str.clone());
            Some(crate::identify::signed_hash(&state, cleaned_data).await?)
        } else {
             None
        };
        let e_data = crate::identify::seal(data_str, &user_auth.user_vault().public_key)?;
        data_to_insert.push(DataUpdateRequest(data_kind, e_data, sh_data))
    }

    // Atomically lock the user, insert the new UserData rows, and optionally deactivate the old
    // rows
    let user_vault_id = user_auth.user_vault().id.clone();
    let _: () = state
        .db_pool
        .get()
        .await
        .map_err(db::DbError::from)?
        .interact(move |conn| {
            conn.build_transaction()
                .run(|| process_data_update_request(conn, user_vault_id, data_to_insert))
        })
        .await
        .map_err(db::DbError::from)??;

    // If we're updating the email address, send an async challenge to the new email address
    if let Some(email) = email {
        let cleaned_email = clean_email(email);
        send_email_challenge(
            &state,
            user_auth.user_vault().public_key.clone(),
            cleaned_email,
        )
        .await?;
    }

    Ok(Json(ApiResponseData {
        data: "Successful update".to_string(),
    }))
}

struct DataUpdateRequest(DataKind, Vec<u8>, Option<Vec<u8>>);

fn process_data_update_request(
    conn: &db::PgConnection,
    user_vault_id: UserVaultId,
    data_to_insert: Vec<DataUpdateRequest>,
) -> Result<(), db::DbError> {
    // TODO don't allow updating every field if the user vault is already verified
    if data_to_insert.is_empty() {
        return Ok(());
    }

    // Lock the user vault to prevent someone else from editing the data while we're editing it
    let user_vault = UserVault::lock(conn, user_vault_id.clone())?;
    let uvw = UserVaultWrapper::from_conn(conn, user_vault)?;

    let (uds, uds_to_deactivate): (Vec<NewUserData>, Vec<Option<UserDataId>>) = data_to_insert
        .into_iter()
        .map(|DataUpdateRequest(data_kind, e_data, sh_data)| {
            let (data_priority, ud_id_to_deactivate) = match uvw.get_data(data_kind) {
                Some(existing_user_data) => {
                    // There's an existing piece of data with this kind
                    if data_kind.allow_multiple() {
                        // Multiple pieces of data are allowed for this kind. We assume there's already
                        // a primary, so we make this a secondary piece of data
                        (DataPriority::Secondary, None)
                    } else {
                        // We're only allowed to have one piece of data with this kind. Deactivate the
                        // last piece of data
                        (DataPriority::Primary, Some(existing_user_data.id.clone()))
                    }
                }
                None => (DataPriority::Primary, None),
            };
            let new_ud = NewUserData {
                user_vault_id: user_vault_id.clone(),
                data_kind,
                data_priority,
                e_data,
                sh_data,
                is_verified: false,
            };
            Ok((new_ud, ud_id_to_deactivate))
        })
        .collect::<Result<Vec<_>, db::DbError>>()?
        .into_iter()
        .unzip();

    let uds_to_deactivate = uds_to_deactivate.into_iter().flatten().collect();

    db::user_data::bulk_deactivate(conn, uds_to_deactivate)?;
    NewUserDataBatch(uds).bulk_insert(conn)?;
    Ok(())
}
