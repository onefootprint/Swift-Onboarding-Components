use crate::auth::either::Either;
use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::session_context::{HasTenant, SessionContext};
use crate::auth::session_data::tenant::workos::WorkOsSession;
use crate::auth::{AuthError, IsLive};
use crate::errors::ApiError;
use crate::types::success::ApiResponseData;
use crate::user::{decrypt, DecryptFieldsResult};
use crate::utils::insight_headers::InsightHeaders;
use crate::State;
use db::models::access_events::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::user_vaults::UserVault;
use newtypes::{DataKind, FootprintUserId};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};
use std::collections::{HashMap, HashSet};

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
struct UserDecryptRequest {
    footprint_user_id: FootprintUserId,
    attributes: HashSet<DataKind>,
    reason: String,
}

type UserDecryptResponse = HashMap<DataKind, Option<String>>;

#[api_v2_operation(tags(Org))]
#[post("/decrypt")]
/// Allows a tenant to decrypt a specific user's data. The user requested must be onboarded onto
/// the requesting tenant.
/// Requires tenant secret key auth.
fn handler(
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
        auth.is_live()?,
    )
    .await?
    .ok_or(AuthError::InvalidTenantKeyOrUserId)?;

    let principal = if let Either::Left(workos) = auth.clone() {
        // A user in admin dashboard is decrypting - log the user's name and email
        Some(workos.data.format_principal())
    } else {
        // A secret key is decrypting via API - this is designated as None for now
        None
    };

    let DecryptFieldsResult {
        decrypted_data_kinds,
        result_map,
    } = decrypt(
        &auth,
        &state,
        vault,
        Some(&scoped_user.id),
        request.attributes.clone().into_iter().collect(),
    )
    .await?;

    // Create an AccessEvent log showing that the tenant accessed these fields
    NewAccessEvent {
        scoped_user_id: scoped_user.id.clone(),
        data_kinds: decrypted_data_kinds.clone(),
        reason: request.reason.clone(),
        principal: principal.clone(),
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
