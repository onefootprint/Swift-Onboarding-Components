use crate::State;
use api_core::auth::session::user::NewUserSessionContext;
use api_core::auth::session::user::TokenCreationPurpose;
use api_core::auth::user::UserAuthContext;
use api_core::auth::Any;
use api_core::errors::ValidationError;
use api_core::types::ApiResponse;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::utils::vault_wrapper::VwArgs;
use api_core::FpResult;
use api_wire_types::KbaResponse;
use itertools::Itertools;
use newtypes::put_data_request::ModernRawUserDataRequest;
use newtypes::put_data_request::PatchDataRequest;
use newtypes::DataIdentifier;
use newtypes::IdentityDataKind as IDK;
use newtypes::ValidateArgs;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    tags(Identify, Hosted),
    description = "Respond to a KBA challenge to prove knowledge of existing data in the vault."
)]
#[actix::post("/hosted/identify/kba")]
pub async fn post(
    request: Json<ModernRawUserDataRequest>,
    state: web::Data<State>,
    user_auth: UserAuthContext,
) -> ApiResponse<KbaResponse> {
    let user_auth = user_auth.check_guard(Any)?;

    // We reuse the same request structure that is used for adding data to the vault. This lets us
    // easily reuse validation and data cleaning.
    let args = ValidateArgs::for_bifrost(user_auth.user.is_live);
    let data = PatchDataRequest::clean_and_validate(request.into_inner(), args)?.updates;

    // Limit which fields can be used for KBA
    let allowable_kba_dis = [DataIdentifier::Id(IDK::PhoneNumber)];
    if let Some(k) = data.keys().find(|k| !allowable_kba_dis.iter().contains(k)) {
        return ValidationError(&format!("KBA not allowed for {}", k)).into();
    }

    let id = user_auth.user_identifier();
    let vw = state
        .db_query(move |conn| -> FpResult<_> {
            let args = VwArgs::from(&id);
            let vw = VaultWrapper::<Any>::build(conn, args)?;
            Ok(vw)
        })
        .await?;
    let dis = data.keys().cloned().collect_vec();
    let decrypted = vw.decrypt_unchecked(&state.enclave_client, &dis).await?;

    let successful_kba = data
        .data
        .into_iter()
        .map(|(di, kba_response)| -> FpResult<_> {
            let actual = decrypted.get_di(di.clone())?;
            if !crypto::safe_compare(actual.leak().as_bytes(), kba_response.leak().as_bytes()) {
                return ValidationError(&format!("Incorrect KBA response for {}", di)).into();
            }
            Ok(di)
        })
        .collect::<FpResult<Vec<_>>>()?;

    let session_key = state.session_sealing_key.clone();
    let token = state
        .db_transaction(move |conn| -> FpResult<_> {
            let context = NewUserSessionContext {
                kba: successful_kba,
                ..Default::default()
            };
            let session = user_auth.update(context, vec![], TokenCreationPurpose::Kba, None)?;
            let (token, _) = user_auth.create_derived(conn, &session_key, session, None)?;
            Ok(token)
        })
        .await?;

    let response = KbaResponse { token };
    Ok(response)
}
