//! Add/get/decrypt identity data to a NON-portable user vault

use std::collections::{HashMap, HashSet};

use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::session_data::workos::WorkOs;
use crate::auth::{AuthError, Either, SessionContext, TenantAuth};
use crate::errors::ApiResult;
use crate::hosted::user::DecryptFieldsResult;
use crate::types::identity_data_request::{ComputedFingerprints, IdentityDataRequest, IdentityDataUpdate};
use crate::types::{ApiResponseData, EmptyResponse, JsonApiResponse};

use crate::utils::insight_headers::InsightHeaders;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::{errors::ApiError, State};

use actix_web::web::Query;
use db::models::access_event::NewAccessEvent;
use db::models::identity_data::HasIdentityDataFields;
use db::models::insight_event::CreateInsightEvent;
use db::PgConnection;

use db::models::scoped_user::ScopedUser;
use db::models::user_vault::UserVault;
use newtypes::csv::Csv;
use newtypes::{
    flat_api_object_map_type, AccessEventKind, DataAttribute, DataIdentifier, FootprintUserId, PiiString,
};

use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, web, web::Json, web::Path};
use serde::{Deserialize, Serialize};

#[api_v2_operation(
    summary = "/users/{footprint_user_id}/identity",
    operation_id = "users-footprint_user_id-identity-post",
    description = "Updates data in the identity vault.",
    tags(PublicApi)
)]
pub async fn put(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Json<IdentityDataRequest>,
    tenant_auth: SecretTenantAuthContext,
    insight: InsightHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let footprint_user_id = path.into_inner();
    let tenant_id = tenant_auth.tenant().id.clone();
    let is_live = tenant_auth.is_live()?;
    let request = request.into_inner();
    let update = IdentityDataUpdate::try_from(request)?;
    let fingerprints = update.fingerprints(&state).await?;
    let insight = CreateInsightEvent::from(insight);

    state
        .db_pool
        .db_transaction(move |conn| -> Result<(), ApiError> {
            let (user_vault, scoped_user) =
                UserVault::get_for_tenant(conn, &tenant_id, &footprint_user_id, is_live)?;
            let mut uvw = UserVaultWrapper::lock(conn, &user_vault.id)?;
            put_internal(
                conn,
                &mut uvw,
                &tenant_auth,
                &scoped_user,
                insight,
                update,
                fingerprints,
            )?;
            Ok(())
        })
        .await?;

    EmptyResponse::ok().json()
}

pub fn put_internal(
    conn: &mut PgConnection,
    uvw: &mut UserVaultWrapper,
    tenant_auth: &SecretTenantAuthContext,
    scoped_user: &ScopedUser,
    insight: CreateInsightEvent,
    update: IdentityDataUpdate,
    fingerprints: ComputedFingerprints,
) -> ApiResult<()> {
    if uvw.user_vault.is_portable {
        return Err(AuthError::CannotModifyPortableUser.into());
    }

    // Create an AccessEvent log showing that the tenant updated these fields
    NewAccessEvent {
        scoped_user_id: scoped_user.id.clone(),
        reason: None,
        principal: tenant_auth.format_principal(),
        insight,
        kind: AccessEventKind::Update,
        targets: fingerprints
            .iter()
            .map(|fp| fp.0)
            .map(DataIdentifier::Identity)
            .collect(),
    }
    .create(conn)?;
    uvw.update_identity_data(conn, update, fingerprints)?;
    Ok(())
}

/**
 * Fetch status of data kinds
 */

#[derive(Debug, Serialize, Deserialize, Apiv2Schema)]
pub struct FieldsParams {
    /// Comma separated list of fields to check
    #[openapi(example = "last_name, dob, ssn9")]
    pub fields: Csv<DataAttribute>,
}

flat_api_object_map_type!(
    GetIdentityDataResponse<DataAttribute, bool>,
    description="A key-value map indicating what identity fields are present",
    example=r#"{ "last_name": true, "dob": true, "ssn9": false }"#
);

#[api_v2_operation(
    summary = "/users/{footprint_user_id}/identity",
    operation_id = "users-footprint_user_id-identity",
    description = "Checks if fields exist.",
    tags(PublicApi)
)]
pub async fn get(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Query<FieldsParams>,
    tenant_auth: SecretTenantAuthContext,
) -> JsonApiResponse<GetIdentityDataResponse> {
    let footprint_user_id = path.into_inner();
    let tenant_id = tenant_auth.tenant().id.clone();
    let is_live = tenant_auth.is_live()?;
    let fields = HashSet::from_iter(request.into_inner().fields.0);

    let fields_clone = fields.clone();
    let uvw = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let (user_vault, scoped_user) =
                UserVault::get_for_tenant(conn, &tenant_id, &footprint_user_id, is_live)?;

            let user_vault_wrapper = UserVaultWrapper::build(conn, user_vault)?;
            user_vault_wrapper.ensure_scope_allows_access(conn, &scoped_user, fields_clone)?;

            Ok(user_vault_wrapper)
        })
        .await??;

    let output = HashMap::from_iter(fields.into_iter().map(|field| {
        let exists = uvw.has_field(field);
        (field, exists)
    }));

    ApiResponseData::ok(GetIdentityDataResponse::from(output)).json()
}

/**
 * Decryt data kinds
 */
#[derive(Debug, Serialize, Deserialize, Apiv2Schema)]
pub struct DecryptIdentityFieldsRequest {
    /// attributes to decrypt
    pub fields: HashSet<DataAttribute>,

    /// reason for the data decryption
    pub reason: String,
}

flat_api_object_map_type!(
    DecryptIdentityDataResponse<DataAttribute, Option<PiiString>>,
    description="A key-value map with the corresponding decrypted identity data values",
    example=r#"{ "last_name": "smith", "ssn9": "121121212", "dob": "12-12-1990" }"#
);

#[api_v2_operation(
    summary = "/users/{footprint_user_id}/identity/decrypt",
    operation_id = "users-footprint_user_id-identity-decrypt",
    description = "Decrypts custom data.",
    tags(PublicApi)
)]
pub async fn post_decrypt(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Json<DecryptIdentityFieldsRequest>,
    auth: Either<SessionContext<WorkOs>, SecretTenantAuthContext>,
    insights: InsightHeaders,
) -> JsonApiResponse<DecryptIdentityDataResponse> {
    let footprint_user_id = path.into_inner();
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;

    let request = request.into_inner();
    let fields = request.fields;

    let fields_clone = fields.clone();
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
    } = crate::hosted::user::decrypt(&state, uvw.user_vault, fields.into_iter().collect()).await?;

    // Create an AccessEvent log showing that the tenant accessed these fields
    NewAccessEvent {
        scoped_user_id: scoped_user.id.clone(),
        reason: Some(request.reason),
        principal: auth.format_principal(),
        insight: CreateInsightEvent::from(insights),
        kind: AccessEventKind::Decrypt,
        targets: DataIdentifier::list(decrypted_data_attributes.clone()),
    }
    .save(&state.db_pool)
    .await?;

    ApiResponseData::ok(DecryptIdentityDataResponse::from(result_map)).json()
}
