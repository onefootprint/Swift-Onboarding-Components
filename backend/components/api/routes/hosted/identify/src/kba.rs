use crate::State;
use api_core::{
    auth::{
        session::user::{NewUserSessionContext, TokenCreationPurpose},
        user::UserAuthContext,
        Any,
    },
    errors::{ApiResult, ValidationError},
    types::{JsonApiResponse, ResponseData},
    utils::{
        session::AuthSession,
        vault_wrapper::{VaultWrapper, VwArgs},
    },
};
use api_wire_types::KbaResponse;
use itertools::Itertools;
use newtypes::{put_data_request::RawDataRequest, DataIdentifier, IdentityDataKind as IDK, ValidateArgs};
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(
    tags(Identify, Hosted),
    description = "Respond to a KBA challenge to prove knowledge of existing data in the vault."
)]
#[actix::post("/hosted/identify/kba")]
pub async fn post(
    request: Json<RawDataRequest>,
    state: web::Data<State>,
    user_auth: UserAuthContext,
) -> JsonApiResponse<KbaResponse> {
    let user_auth = user_auth.check_guard(Any)?;

    // We reuse the same request structure that is used for adding data to the vault. This lets us
    // easily reuse validation and data cleaning.
    let args = ValidateArgs::for_bifrost(user_auth.user.is_live);
    let data = request.into_inner().clean_and_validate(args)?.updates;

    // Limit which fields can be used for KBA
    let allowable_kba_dis = vec![DataIdentifier::Id(IDK::PhoneNumber)];
    if let Some(k) = data.keys().find(|k| !allowable_kba_dis.iter().contains(k)) {
        return ValidationError(&format!("KBA not allowed for {}", k)).into();
    }

    let id = user_auth.user_identifier();
    let vw = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let args = VwArgs::from(&id);
            let vw = VaultWrapper::<Any>::build(conn, args)?;
            Ok(vw)
        })
        .await?;
    let dis = data.keys().cloned().collect_vec();
    let decrypted = vw.decrypt_unchecked(&state.enclave_client, &dis).await?;

    let (data, _, _) = data.decompose();
    let successful_kba = data
        .into_iter()
        .map(|(di, kba_response)| -> ApiResult<_> {
            let actual = decrypted.get_di(di.clone())?;
            if !crypto::safe_compare(actual.leak().as_bytes(), kba_response.leak().as_bytes()) {
                return ValidationError(&format!("Incorrect KBA response for {}", di)).into();
            }
            Ok(di)
        })
        .collect::<ApiResult<Vec<_>>>()?;

    let session_key = state.session_sealing_key.clone();
    let token = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let context = NewUserSessionContext {
                kba: successful_kba,
                ..Default::default()
            };
            let expires_at = user_auth.expires_at();
            let session = user_auth.data.session;
            let session = session.update(context, vec![], TokenCreationPurpose::Kba, None)?;
            let (token, _) = AuthSession::create_sync(conn, &session_key, session, expires_at)?;
            Ok(token)
        })
        .await?;

    let response = KbaResponse { token };
    ResponseData::ok(response).json()
}
