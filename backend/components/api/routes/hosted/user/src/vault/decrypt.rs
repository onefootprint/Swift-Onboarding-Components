use crate::types::{JsonApiResponse, ResponseData};
use crate::utils::vault_wrapper::VaultWrapper;
use crate::{errors::ApiError, State};
use api_core::auth::user::{UserAuth, UserAuthContext};
use api_core::auth::{Any, CanDecrypt};
use api_core::utils::vault_wrapper::VwArgs;
use api_wire_types::DecryptResponse;
use itertools::Itertools;
use newtypes::DataIdentifier;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{self, api_v2_operation, web, web::Json};
use std::collections::{HashMap, HashSet};

#[derive(serde::Deserialize, Apiv2Schema)]
pub struct DecryptRequest {
    /// List of data identifiers to decrypt. For example, `id.first_name`, `id.ssn4`, `business.name`
    fields: HashSet<DataIdentifier>,
}

#[api_v2_operation(
    tags(Vault, User, Hosted),
    description = "Decrypts the specified list of fields from the provided vault."
)]
#[actix::post("/hosted/user/vault/decrypt")]
pub async fn post(
    state: web::Data<State>,
    request: Json<DecryptRequest>,
    user_auth: UserAuthContext,
) -> JsonApiResponse<DecryptResponse> {
    let fields = request.into_inner().fields.into_iter().collect_vec();
    let user_auth = user_auth.check_guard(CanDecrypt::new(fields.clone()))?;

    let uvw = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let su_id = user_auth.scoped_user_id();
            let args = if let Some(su_id) = su_id.as_ref() {
                // If the auth token is during an onboarding session, create a UVW that sees all
                // speculative data for the tenant in order to see a speculative phone number
                // that was added by this tenant.
                VwArgs::Tenant(su_id)
            } else {
                // Otherwise, create a UVW that only sees portable data
                VwArgs::Vault(user_auth.user_vault_id())
            };
            let uvw = VaultWrapper::<Any>::build(conn, args)?;
            Ok(uvw)
        })
        .await??;

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
    out.log_invalid_serializations();

    ResponseData::ok(out).json()
}
