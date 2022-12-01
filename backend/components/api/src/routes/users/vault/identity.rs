//! Add/get/decrypt identity data to a NON-portable user vault

use std::collections::{HashMap, HashSet};

use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::{
    tenant::{CheckTenantPermissions, TenantAuth, WorkOsAuthContext},
    AuthError, Either,
};
use crate::errors::ApiResult;
use crate::types::identity_data_request::{ComputedFingerprints, IdentityDataRequest, IdentityDataUpdate};
use crate::types::{EmptyResponse, JsonApiResponse, ResponseData};

use crate::utils::insight_headers::InsightHeaders;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::utils::uvw_decryption::DecryptFieldsResult;
use crate::{errors::ApiError, State};

use actix_web::web::Query;
use db::models::access_event::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use db::HasDataAttributeFields;
use db::TxnPgConnection;

use db::models::scoped_user::ScopedUser;
use db::models::user_vault::UserVault;
use newtypes::csv::Csv;
use newtypes::{
    flat_api_object_map_type, AccessEventKind, DataAttribute, DataIdentifier, FootprintUserId, PiiString,
    TenantPermission,
};

use paperclip::actix::Apiv2Schema;
use paperclip::actix::{self, api_v2_operation, web, web::Json, web::Path};
use serde::{Deserialize, Serialize};

#[api_v2_operation(
    description = "Updates data in the user's identity vault.",
    tags(Vault, PublicApi, Users)
)]
#[actix::put("/users/{footprint_user_id}/vault/identity")]
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
    conn: &mut TxnPgConnection,
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
    uvw.update_identity_data(conn, update, fingerprints, None)?;
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
    description = "Checks existence if items in the identity vault.",
    tags(Vault, PublicApi, Users)
)]
#[actix::get("/users/{footprint_user_id}/vault/identity")]
pub async fn get(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Query<FieldsParams>,
    tenant_auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
) -> JsonApiResponse<GetIdentityDataResponse> {
    get_internal(state, path, request, tenant_auth).await
}

pub(super) async fn get_internal(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Query<FieldsParams>,
    tenant_auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
) -> JsonApiResponse<GetIdentityDataResponse> {
    let tenant_auth = tenant_auth.check_permissions(vec![TenantPermission::Users])?;
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

    ResponseData::ok(GetIdentityDataResponse::from(output)).json()
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
    description = "Decrypts data from the identity vault",
    tags(Vault, PublicApi, Users)
)]
#[actix::post("/users/{footprint_user_id}/vault/identity/decrypt")]
pub async fn post_decrypt(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Json<DecryptIdentityFieldsRequest>,
    auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
    insights: InsightHeaders,
) -> JsonApiResponse<DecryptIdentityDataResponse> {
    post_decrypt_internal(state, path, request, auth, insights).await
}

pub(super) async fn post_decrypt_internal(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Json<DecryptIdentityFieldsRequest>,
    auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
    insights: InsightHeaders,
) -> JsonApiResponse<DecryptIdentityDataResponse> {
    let request = request.into_inner();
    let fields = request.fields;
    // TODO: fix this
    if fields.contains(&DataAttribute::IdentityDocument) {
        return Err(ApiError::InvalidFieldForDecryption(String::from(
            "IdentityDocument",
        )));
    }
    let auth = auth.can_decrypt(fields.iter().cloned().collect())?;

    let footprint_user_id = path.into_inner();
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;

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
    } = uvw
        .decrypt_data_attributes(&state, fields.into_iter().collect())
        .await?;

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

    ResponseData::ok(DecryptIdentityDataResponse::from(result_map)).json()
}
