//! Add data to a NON-portable user vault

use std::collections::{HashMap, HashSet};

use crate::auth::key_context::secret_key::SecretTenantAuthContext;
use crate::auth::session_data::workos::WorkOs;
use crate::auth::{AuthError, Either, HasTenant, IsLive, Principal, SessionContext};
use crate::hosted::user::DecryptFieldsResult;
use crate::types::identity_data_request::IdentityDataRequest;
use crate::types::{ApiResponseData, EmptyResponse, JsonApiResponse};

use crate::utils::insight_headers::InsightHeaders;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::{errors::ApiError, State};

use actix_web::web::Query;
use db::models::access_event::NewAccessEvent;
use db::models::identity_data::HasIdentityDataFields;
use db::models::insight_event::CreateInsightEvent;
use db::models::ob_configuration::ObConfiguration;
use db::models::user_vault::UserVault;
use newtypes::csv::Csv;
use newtypes::{
    flat_api_object_map_type, AccessEventKind, DataAttribute, DataIdentifier, FootprintUserId, PiiString,
};

use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, post, web, web::Json, web::Path};
use serde::{Deserialize, Serialize};

/**
 * Update (PUT) data in the identity vault
 */

#[api_v2_operation(tags(PublicApi))]
pub async fn put(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Json<IdentityDataRequest>,
    tenant_auth: SecretTenantAuthContext,
) -> JsonApiResponse<EmptyResponse> {
    let footprint_user_id = path.into_inner();
    let tenant_id = tenant_auth.tenant().id.clone();
    let is_live = tenant_auth.is_live()?;
    let request = request.into_inner();
    let fingerprints = request.fingerprints(&state).await?;
    let update = request.update;

    // TODO: add updates to security log

    let _uvw = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let (user_vault, _) = UserVault::get_for_tenant(conn, &tenant_id, &footprint_user_id, is_live)?;
            let mut uvw = UserVaultWrapper::lock(conn, &user_vault.id)?;
            if user_vault.is_portable {
                return Err(AuthError::CannotModifyPortableUser.into());
            }
            uvw.update_identity_data(conn, update, fingerprints)?;
            Ok(uvw)
        })
        .await?;

    ApiResponseData::ok(EmptyResponse).json()
}

/**
 * Fetch status of data kinds
 */

#[derive(Debug, Serialize, Deserialize, Apiv2Schema)]
pub struct FieldsParams {
    /// Comma separated list of fields to check
    #[openapi(example = "last_name, dob, ssn9")]
    fields: Csv<DataAttribute>,
}

flat_api_object_map_type!(
    GetIdentityDataResponse<DataAttribute, bool>,
    description="A key-value map indicating what identity fields are present",
    example=r#"{ "last_name": true, "dob": true, "ssn9": false }"#
);

/// check if fields exist
#[api_v2_operation(tags(PublicApi))]
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

    let (uvw, scoped_user) = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let (user_vault, scoped_user) =
                UserVault::get_for_tenant(conn, &tenant_id, &footprint_user_id, is_live)?;

            let user_vault_wrapper = UserVaultWrapper::build(conn, user_vault)?;
            Ok((user_vault_wrapper, scoped_user))
        })
        .await??;

    // if the vault is PORTABLE: check permissions on the scoped user onboarding configuration
    // don't allow the tenant to know if data is set without having permission for the the value
    if uvw.user_vault.is_portable {
        let ob_configs =
            ObConfiguration::list_for_scoped_user(&state.db_pool, scoped_user.id.clone()).await?;
        let can_access_kinds: HashSet<_> = ob_configs
            .into_iter()
            .flat_map(|x| x.can_access_data)
            .flat_map(|x| x.attributes())
            .collect();
        if !can_access_kinds.is_superset(&fields) {
            return Err(AuthError::UnauthorizedOperation.into());
        }
    }

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
    fields: HashSet<DataAttribute>,

    /// reason for the data decryption
    reason: String,
}

flat_api_object_map_type!(
    DecryptIdentityDataResponse<DataAttribute, Option<PiiString>>,
    description="A key-value map with the corresponding decrypted identity data values",
    example=r#"{ "last_name": "smith", "ssn9": "121121212", "dob": "12-12-1990" }"#
);

/// decrypt custom data
#[api_v2_operation(tags(PublicApi))]
#[post("/identity/decrypt")]
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

    let (vault, scoped_user) = state
        .db_pool
        .db_query(move |conn| UserVault::get_for_tenant(conn, &tenant_id, &footprint_user_id, is_live))
        .await??;

    let request = request.into_inner();
    let fields = request.fields;

    // if the vault is PORTABLE: check permissions on the scoped user onboarding configuration
    if vault.is_portable {
        let ob_configs =
            ObConfiguration::list_for_scoped_user(&state.db_pool, scoped_user.id.clone()).await?;
        let can_access_kinds: HashSet<_> = ob_configs
            .into_iter()
            .flat_map(|x| x.can_access_data)
            .flat_map(|x| x.attributes())
            .collect();
        if !can_access_kinds.is_superset(&fields) {
            return Err(AuthError::UnauthorizedOperation.into());
        }
    }

    let DecryptFieldsResult {
        decrypted_data_attributes,
        result_map,
    } = crate::hosted::user::decrypt(&state, vault, fields.into_iter().collect()).await?;

    // Create an AccessEvent log showing that the tenant accessed these fields
    NewAccessEvent {
        scoped_user_id: scoped_user.id.clone(),
        reason: request.reason,
        principal: Some(auth.format_principal()),
        insight: CreateInsightEvent::from(insights),
        kind: AccessEventKind::Decrypt,
        targets: DataIdentifier::list(decrypted_data_attributes.clone()),
    }
    .save(&state.db_pool)
    .await?;

    ApiResponseData::ok(DecryptIdentityDataResponse::from(result_map)).json()
}
