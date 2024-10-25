use crate::types::ApiResponse;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::auth::user::UserBizWfAuthContext;
use api_core::auth::Any;
use api_core::auth::CanDecrypt;
use api_wire_types::BusinessDecryptResponse;
use itertools::Itertools;
use newtypes::DataIdentifier;
use newtypes::VersionedDataIdentifier as VDI;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{
    self,
};
use std::collections::HashSet;

#[derive(serde::Deserialize, Apiv2Schema)]
pub struct UserDecryptRequest {
    fields: HashSet<DataIdentifier>,
}

#[api_v2_operation(
    tags(Vault, User, Hosted),
    description = "Decrypts the specified list of fields from the provided vault."
)]
#[actix::post("/hosted/business/vault/decrypt")]
pub async fn post(
    state: web::Data<State>,
    request: Json<UserDecryptRequest>,
    user_auth: UserBizWfAuthContext,
) -> ApiResponse<BusinessDecryptResponse> {
    let fields = request.into_inner().fields.into_iter().collect_vec();
    let user_auth = user_auth.check_guard(CanDecrypt::new(fields.clone()))?;
    let sb_id = user_auth.sb_id().clone();

    let bvw = state
        .db_query(move |conn| VaultWrapper::<Any>::build_for_tenant(conn, &sb_id))
        .await?;

    let mut results = bvw
        .decrypt_unchecked_value(&state.enclave_client, &fields)
        .await?;

    let results = fields
        .into_iter()
        .map(|di| (VDI::new(di.clone()), results.remove(&di.into())))
        .collect();
    Ok(results)
}
