use crate::types::{JsonApiResponse, ResponseData};
use crate::utils::vault_wrapper::VaultWrapper;
use crate::{errors::ApiError, State};
use api_core::auth::user::UserObAuthContext;
use api_core::auth::CanDecrypt;
use itertools::Itertools;
use newtypes::DataIdentifier;
use newtypes::{flat_api_object_map_type, PiiString};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{self, api_v2_operation, web, web::Json};
use std::collections::{HashMap, HashSet};

#[derive(serde::Deserialize, Apiv2Schema)]
pub struct DecryptRequest {
    /// List of data identifiers to decrypt. For example, `id.first_name`, `id.ssn4`, `business.name`
    fields: HashSet<DataIdentifier>,
}

flat_api_object_map_type!(
    DecryptResponse<DataIdentifier, Option<PiiString>>,
    description="A key-value map with the corresponding decrypted values",
    example=r#"{ "id.last_name": "smith", "id.ssn9": "121121212", "custom.credit_card": "1234 1234 1234 1234" }"#
);

#[api_v2_operation(
    tags(Vault, User, Hosted),
    description = "Decrypts the specified list of fields from the provided vault."
)]
#[actix::post("/hosted/user/vault/decrypt")]
pub async fn post(
    state: web::Data<State>,
    request: Json<DecryptRequest>,
    // is it worth having an OnboardingAuth that only extracts if onboarding is present
    user_auth: UserObAuthContext,
) -> JsonApiResponse<DecryptResponse> {
    let fields = request.into_inner().fields.into_iter().collect_vec();
    let user_auth = user_auth.check_guard(CanDecrypt::new(fields.clone()))?;

    let uvw = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let uvw = VaultWrapper::build_for_tenant(conn, &user_auth.data.scoped_user.id)?;
            Ok(uvw)
        })
        .await??;

    let mut results = uvw.decrypt_unchecked(&state.enclave_client, &fields).await?;
    // Is this step necessary? Every key is present in the response if it was in the request?
    let results = HashMap::from_iter(fields.into_iter().map(|di| (di.clone(), results.remove(&di))));
    let out = DecryptResponse { map: results };

    ResponseData::ok(out).json()
}
