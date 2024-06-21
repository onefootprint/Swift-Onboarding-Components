use crate::types::ModernApiResult;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::auth::user::UserAuthContext;
use api_core::auth::Any;
use api_core::auth::CanDecrypt;
use api_core::errors::ApiResult;
use api_core::utils::vault_wrapper::VwArgs;
use api_wire_types::DecryptResponse;
use itertools::Itertools;
use newtypes::DataIdentifier;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{
    self,
};
use std::collections::HashMap;
use std::collections::HashSet;

#[derive(serde::Deserialize, Apiv2Schema)]
pub struct UserDecryptRequest {
    /// List of data identifiers to decrypt. For example, `id.first_name`, `id.ssn4`,
    /// `business.name`
    fields: HashSet<DataIdentifier>,
}

#[api_v2_operation(
    tags(Vault, User, Hosted),
    description = "Decrypts the specified list of fields from the provided vault."
)]
#[actix::post("/hosted/user/vault/decrypt")]
pub async fn post(
    state: web::Data<State>,
    request: Json<UserDecryptRequest>,
    user_auth: UserAuthContext,
) -> ModernApiResult<DecryptResponse> {
    let fields = request.into_inner().fields.into_iter().collect_vec();
    let user_auth = user_auth.check_guard(CanDecrypt::new(fields.clone()))?;

    let uvw = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let id = user_auth.user_identifier();
            let args = VwArgs::from(&id);
            let uvw = VaultWrapper::<Any>::build(conn, args)?;
            Ok(uvw)
        })
        .await?;

    let mut results = uvw
        .decrypt_unchecked_value(&state.enclave_client, &fields)
        .await?;
    // Is this step necessary? Every key is present in the response if it was in the request?
    let results = HashMap::from_iter(
        fields
            .into_iter()
            .map(|di| (di.clone(), results.remove(&di.into()))),
    );
    let out = DecryptResponse::from(results);

    Ok(out)
}
