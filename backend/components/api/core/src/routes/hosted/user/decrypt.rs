use crate::auth::user::UserAuth;
use crate::auth::user::UserAuthContext;
use crate::auth::user::UserAuthScope;
use crate::errors::ApiError;
use crate::types::response::ResponseData;
use crate::utils::vault_wrapper::Person;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::vault_wrapper::VwArgs;
use crate::State;
use newtypes::DataIdentifier;
use newtypes::IdentityDataKind;
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};
use std::collections::HashMap;

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct UserDecryptRequest {
    attributes: Vec<IdentityDataKind>,
}

type UserDecryptResponse = HashMap<IdentityDataKind, Option<String>>;

#[api_v2_operation(
    tags(Hosted),
    description = "Allows a user to decrypt their own data. Requires user auth provided in the header."
)]
#[actix::post("/hosted/user/decrypt")]
fn post(
    state: web::Data<State>,
    user_auth: UserAuthContext,
    request: Json<UserDecryptRequest>,
) -> actix_web::Result<Json<ResponseData<UserDecryptResponse>>, ApiError> {
    let UserDecryptRequest { attributes } = request.into_inner();
    let required_scope = if attributes.contains(&IdentityDataKind::Ssn9) {
        UserAuthScope::ExtendedProfile
    } else {
        UserAuthScope::BasicProfile
    };
    let user_auth = user_auth.check_permissions(vec![required_scope])?;
    let user_vault = user_auth.user_vault(&state.db_pool).await?;
    let uv_id = user_vault.id.clone();
    let uvw = state
        .db_pool
        .db_query(move |conn| VaultWrapper::<Person>::build(conn, VwArgs::User(&uv_id)))
        .await??;

    let ids: Vec<_> = attributes.iter().cloned().map(DataIdentifier::Id).collect();
    let results = uvw.decrypt_unchecked(&state.enclave_client, &ids).await?;

    let results = attributes
        .into_iter()
        .map(|idk| {
            let value = results.get(&DataIdentifier::Id(idk)).map(|v| v.leak_to_string());
            (idk, value)
        })
        .collect();
    Ok(Json(ResponseData { data: results }))
}
