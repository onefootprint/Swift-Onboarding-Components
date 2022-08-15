use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::session_data::workos::WorkOsSession;
use crate::auth::{AuthError, IsLive};
use crate::auth::{Either, Principal};
use crate::auth::{HasTenant, SessionContext};
use crate::errors::ApiError;
use crate::hosted::user::{decrypt, DecryptFieldsResult};
use crate::types::response::ApiResponseData;
use crate::utils::insight_headers::InsightHeaders;
use crate::State;
use db::models::access_events::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::ob_configurations::ObConfiguration;
use db::models::user_vaults::UserVault;
use newtypes::{DataKind, FootprintUserId};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};
use std::collections::{HashMap, HashSet};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct UserDecryptRequest2 {
    attributes: HashSet<DataKind>,
    reason: String,
}

type UserDecryptResponse = HashMap<DataKind, Option<String>>;

#[api_v2_operation(tags(PublicApi))]
#[post("/{footprint_user_id}/decrypt")]
async fn post2(
    state: web::Data<State>,
    auth: Either<SessionContext<WorkOsSession>, SecretTenantAuthContext>,
    path: web::Path<FootprintUserId>,
    request: Json<UserDecryptRequest2>,
    insights: InsightHeaders,
) -> actix_web::Result<Json<ApiResponseData<UserDecryptResponse>>, ApiError> {
    let UserDecryptRequest2 { attributes, reason } = request.into_inner();

    post_inner(
        state,
        auth,
        Json(UserDecryptRequest {
            footprint_user_id: path.into_inner(),
            attributes,
            reason,
        }),
        insights,
    )
    .await
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct UserDecryptRequest {
    footprint_user_id: FootprintUserId,
    attributes: HashSet<DataKind>,
    reason: String,
}

#[api_v2_operation(tags(PublicApi))]
#[post("/decrypt")]
async fn post(
    state: web::Data<State>,
    auth: Either<SessionContext<WorkOsSession>, SecretTenantAuthContext>,
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
    auth: Either<SessionContext<WorkOsSession>, SecretTenantAuthContext>,
    request: Json<UserDecryptRequest>,
    insights: InsightHeaders,
) -> actix_web::Result<Json<ApiResponseData<UserDecryptResponse>>, ApiError> {
    let tenant = auth.tenant(&state.db_pool).await?;
    // look up tenant & user vault
    let (vault, scoped_user) = UserVault::get_for_tenant(
        &state.db_pool,
        tenant.id.clone(),
        request.footprint_user_id.clone(),
        auth.is_live(&state.db_pool).await?,
    )
    .await?
    .ok_or(AuthError::InvalidTenantKeyOrUserId)?;

    // if the vault is PORTABLE: check permissions on the scoped user onboarding configuration
    if vault.is_portable {
        let ob_configs =
            ObConfiguration::list_for_scoped_user(&state.db_pool, scoped_user.id.clone()).await?;
        let can_access_kinds: HashSet<_> = ob_configs
            .into_iter()
            .flat_map(|x| x.can_access_data_kinds)
            .flat_map(|x| x.permissioning_kinds())
            .collect();
        if !can_access_kinds.is_superset(&request.attributes) {
            return Err(AuthError::UnauthorizedOperation.into());
        }
    }

    let DecryptFieldsResult {
        decrypted_data_kinds,
        result_map,
    } = decrypt(&state, vault, request.attributes.clone().into_iter().collect()).await?;

    // Create an AccessEvent log showing that the tenant accessed these fields
    NewAccessEvent {
        scoped_user_id: scoped_user.id.clone(),
        data_kinds: decrypted_data_kinds.clone(),
        reason: request.reason.clone(),
        principal: Some(auth.format_principal()),
        insight: CreateInsightEvent::from(insights),
    }
    .save(&state.db_pool)
    .await?;

    let result_map = result_map
        .into_iter()
        .map(|(k, v)| (k, v.map(|x| x.leak_to_string())))
        .collect();
    Ok(Json(ApiResponseData { data: result_map }))
}
