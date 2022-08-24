use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::session_data::workos::WorkOs;
use crate::auth::IsLive;
use crate::auth::{Either, Principal};
use crate::auth::{HasTenant, SessionContext};
use crate::errors::ApiError;
use crate::hosted::user::{decrypt, DecryptFieldsResult};
use crate::types::response::ApiResponseData;
use crate::utils::insight_headers::InsightHeaders;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::State;
use db::models::access_event::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::user_vault::UserVault;
use newtypes::{AccessEventKind, DataAttribute, DataIdentifier, FootprintUserId, PiiString};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};
use std::collections::{HashMap, HashSet};

type UserDecryptResponse = HashMap<DataAttribute, Option<PiiString>>;

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct UserDecryptRequest {
    footprint_user_id: FootprintUserId,
    attributes: HashSet<DataAttribute>,
    reason: String,
}

#[api_v2_operation(tags(PublicApi))]
#[post("/decrypt")]
async fn post(
    state: web::Data<State>,
    auth: Either<SessionContext<WorkOs>, SecretTenantAuthContext>,
    request: Json<UserDecryptRequest>,
    insights: InsightHeaders,
) -> actix_web::Result<Json<ApiResponseData<UserDecryptResponse>>, ApiError> {
    post_inner(state, auth, request, insights).await
}

/// Allows a tenant to decrypt a specific user's data. The user requested must be onboarded onto
/// the requesting tenant.
/// Requires tenant secret key auth.
async fn post_inner(
    state: web::Data<State>,
    auth: Either<SessionContext<WorkOs>, SecretTenantAuthContext>,
    request: Json<UserDecryptRequest>,
    insights: InsightHeaders,
) -> actix_web::Result<Json<ApiResponseData<UserDecryptResponse>>, ApiError> {
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;
    let UserDecryptRequest {
        footprint_user_id,
        attributes,
        reason,
    } = request.into_inner();

    let fields_clone = attributes.clone();

    // look up tenant & user vault
    let (uvw, scoped_user) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let (user_vault, scoped_user) =
                UserVault::get_for_tenant(conn, &tenant_id, &footprint_user_id, is_live)?;

            let user_vault_wrapper = UserVaultWrapper::build(conn, user_vault)?;
            user_vault_wrapper.ensure_scope_allows_access(conn, &scoped_user, fields_clone)?;

            Ok((user_vault_wrapper, scoped_user))
        })
        .await??;

    let DecryptFieldsResult {
        decrypted_data_attributes,
        result_map,
    } = decrypt(&state, uvw.user_vault, attributes.into_iter().collect()).await?;

    // Create an AccessEvent log showing that the tenant accessed these fields
    NewAccessEvent {
        scoped_user_id: scoped_user.id.clone(),
        reason: Some(reason),
        principal: auth.format_principal(),
        insight: CreateInsightEvent::from(insights),
        kind: AccessEventKind::Decrypt,
        targets: DataIdentifier::list(decrypted_data_attributes),
    }
    .save(&state.db_pool)
    .await?;

    Ok(Json(ApiResponseData { data: result_map }))
}
