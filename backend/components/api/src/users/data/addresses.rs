use std::collections::HashMap;
use std::collections::HashSet;

use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::session_data::workos::WorkOsSession;
use crate::auth::Either;
use crate::auth::HasTenant;
use crate::auth::IsLive;
use crate::auth::Principal;
use crate::types::address::ApiAddress;
use crate::types::response::ApiResponseData;
use crate::utils::insight_headers::InsightHeaders;
use crate::utils::user_vault_wrapper::DecryptRequest;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use crate::{auth::SessionContext, errors::ApiError};
use db::models::access_events::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use newtypes::DataKind;
use newtypes::FootprintUserId;
use newtypes::PiiString;
use newtypes::SealedVaultBytes;
use paperclip::actix::{api_v2_operation, get, post, web, web::Json};

type ListResponse<D> = Vec<ApiAddress<D>>;

#[api_v2_operation(tags(PublicApi))]
#[get("/addresses")]
/// Allows a tenant to view a customer's audit trail
fn get(
    state: web::Data<State>,
    fp_user_id: web::Path<FootprintUserId>,
    auth: Either<SessionContext<WorkOsSession>, SecretTenantAuthContext>,
) -> actix_web::Result<Json<ApiResponseData<ListResponse<bool>>>, ApiError> {
    let tenant = auth.tenant(&state.db_pool).await?;
    let is_live = auth.is_live(&state.db_pool).await?;

    let (uvw, _) = state
        .db_pool
        .db_query(move |conn| UserVaultWrapper::from_fp_user_id(conn, &fp_user_id, &tenant.id, is_live))
        .await??;
    let serialize = |x| ApiAddress::serialize(x, |i| i.is_some());
    let response = uvw.addresses.into_iter().map(serialize).collect::<Vec<_>>();
    Ok(Json(ApiResponseData::ok(response)))
}

#[api_v2_operation(tags(PublicApi))]
#[post("/addresses/decrypt")]
/// Allows a tenant to view a customer's audit trail
fn decrypt(
    state: web::Data<State>,
    fp_user_id: web::Path<FootprintUserId>,
    request: web::Json<DecryptRequest>,
    auth: Either<SessionContext<WorkOsSession>, SecretTenantAuthContext>,
    insights: InsightHeaders,
) -> actix_web::Result<Json<ApiResponseData<ListResponse<Option<String>>>>, ApiError> {
    let tenant = auth.tenant(&state.db_pool).await?;
    let is_live = auth.is_live(&state.db_pool).await?;

    let (uvw, scoped_user) = state
        .db_pool
        .db_query(move |conn| UserVaultWrapper::from_fp_user_id(conn, &fp_user_id, &tenant.id, is_live))
        .await??;

    // Batch decrypt all encrypted data
    let (data_kinds, encrypted_bytes): (Vec<_>, Vec<_>) = uvw
        .addresses
        .iter()
        .flat_map(|address| address.clone().data_items().into_iter())
        .unzip();
    let decrypted_bytes = uvw.decrypt(&state, encrypted_bytes.iter().collect()).await?;
    let encrypted_to_decrypted = encrypted_bytes
        .into_iter()
        .zip(decrypted_bytes)
        .collect::<HashMap<SealedVaultBytes, PiiString>>();

    // Create access events
    let unique_data_kinds: Vec<_> = HashSet::<DataKind>::from_iter(data_kinds.into_iter())
        .into_iter()
        .collect();
    NewAccessEvent {
        scoped_user_id: scoped_user.id,
        data_kinds: unique_data_kinds,
        reason: request.into_inner().reason,
        principal: Some(auth.format_principal()),
        insight: CreateInsightEvent::from(insights),
    }
    .save(&state.db_pool)
    .await?;

    // Serialize the response
    let decrypt = |i: Option<SealedVaultBytes>| {
        i.and_then(|i| encrypted_to_decrypted.get(&i).map(|i| i.leak_to_string()))
    };
    let serialize = |x| ApiAddress::serialize(x, decrypt);
    let response = uvw.addresses.into_iter().map(serialize).collect::<Vec<_>>();
    Ok(Json(ApiResponseData::ok(response)))
}
