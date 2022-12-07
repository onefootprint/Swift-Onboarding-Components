//! Add/get/decrypt identity data to a NON-portable user vault

use std::collections::HashSet;

use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::{
    tenant::{TenantAuth, WorkOsAuthContext},
    Either,
};

use crate::types::identity_data_request::{IdentityDataRequest, IdentityDataUpdate};
use crate::types::{EmptyResponse, JsonApiResponse, ResponseData};

use crate::utils::headers::InsightHeaders;
use crate::utils::user_vault_wrapper::UserVaultWrapper;
use crate::{errors::ApiError, State};

use actix_web::web::Query;

use db::models::insight_event::CreateInsightEvent;
use db::models::user_vault::UserVault;
use newtypes::csv::Csv;
use newtypes::{DataAttribute, DataIdentifier, FootprintUserId, KvDataKey};

use paperclip::actix::Apiv2Schema;
use paperclip::actix::{self, api_v2_operation, web, web::Json, web::Path};
use serde::{Deserialize, Serialize};

use super::custom::{self, DecryptCustomDataResponse, GetCustomDataResponse, PutCustomDataRequest};
use super::identity::{self, DecryptIdentityDataResponse, GetIdentityDataResponse};

#[derive(Debug, Clone, serde::Deserialize, Apiv2Schema)]
pub struct UnifiedUserVaultPutRequest {
    /// identity data
    identity: Option<IdentityDataRequest>,
    /// custom data fields
    custom: Option<PutCustomDataRequest>,
}

#[api_v2_operation(
    description = "Updates data in the identity vault.",
    tags(Vault, PublicApi, Users)
)]
#[actix::put("/users/{footprint_user_id}/vault")]
pub async fn put(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Json<UnifiedUserVaultPutRequest>,
    tenant_auth: SecretTenantAuthContext,
    insight: InsightHeaders,
) -> JsonApiResponse<EmptyResponse> {
    let request = request.into_inner();

    let footprint_user_id = path.into_inner();
    let tenant_id = tenant_auth.tenant().id.clone();
    let is_live = tenant_auth.is_live()?;
    let insight = CreateInsightEvent::from(insight);

    let (update, fingerprints) = if let Some(identity) = request.identity {
        let update = IdentityDataUpdate::try_from(identity)?;
        let fingerprints = update.fingerprints(&state).await?;
        (Some(update), fingerprints)
    } else {
        (None, vec![])
    };

    //NOTE: these operations on the different parts of the user vault must be atomic
    let _uvw = state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let (user_vault, scoped_user) =
                UserVault::get_for_tenant(conn, &tenant_id, &footprint_user_id, is_live)?;
            let mut uvw = UserVaultWrapper::lock(conn, &user_vault.id)?;

            if let Some(update) = update {
                identity::put_internal(
                    conn,
                    &mut uvw,
                    &tenant_auth,
                    &scoped_user,
                    insight.clone(),
                    update,
                    fingerprints,
                )?
            }

            if let Some(custom_update) = request.custom {
                custom::put_internal(conn, &mut uvw, &tenant_auth, &scoped_user, insight, custom_update)?;
            }

            Ok(uvw)
        })
        .await?;

    EmptyResponse::ok().json()
}

/**
 * Fetch status of data kinds
 */
#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema)]
pub struct FieldsParams {
    /// Comma separated list of fields to check
    #[openapi(example = "identity.last_name, custom.ach_account, identity.dob, identity.ssn9")]
    fields: Csv<DataIdentifier>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema)]
pub struct UnifiedUserVaultGetDataResponse {
    /// identity data
    identity: GetIdentityDataResponse,
    /// custom data fields
    custom: GetCustomDataResponse,
}

#[api_v2_operation(
    description = "Check for the existence of items in a vault",
    tags(Vault, PublicApi, Users)
)]
#[actix::get("/users/{footprint_user_id}/vault")]
pub async fn get(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Query<FieldsParams>,
    tenant_auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
) -> JsonApiResponse<UnifiedUserVaultGetDataResponse> {
    let footprint_id = path.into_inner();
    let request = request.into_inner();

    let mut requested_identity_fields: Vec<DataAttribute> = Vec::new();
    let mut requested_custom_fields: Vec<KvDataKey> = Vec::new();

    request.fields.into_iter().for_each(|f| match f {
        DataIdentifier::Identity(attr) => {
            requested_identity_fields.push(attr);
        }
        DataIdentifier::Custom(data_key) => {
            requested_custom_fields.push(data_key);
        }
    });

    let id_results_fut = identity::get_internal(
        state.clone(),
        Path::from(footprint_id.clone()),
        Query(identity::FieldsParams {
            fields: Csv(requested_identity_fields),
        }),
        tenant_auth.clone(),
    );

    let custom_results_fut = custom::get_internal(
        state,
        Path::from(footprint_id),
        Query(custom::FieldsParams {
            fields: Csv(requested_custom_fields),
        }),
        tenant_auth,
    );

    let (id_results, custom_results) = futures::try_join!(id_results_fut, custom_results_fut)?;

    let out = UnifiedUserVaultGetDataResponse {
        identity: id_results.into_inner().data,
        custom: custom_results.into_inner().data,
    };

    ResponseData::ok(out).json()
}

/**
 * Decryt data kinds
 */
#[derive(Debug, Serialize, Deserialize, Apiv2Schema)]
pub struct DecryptUnifiedFieldsRequest {
    /// attributes to decrypt
    fields: HashSet<DataIdentifier>,

    /// reason for the data decryption
    reason: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Apiv2Schema)]
pub struct UnifiedUserVaultDecryptResponse {
    /// identity data
    identity: DecryptIdentityDataResponse,
    /// custom data fields
    custom: DecryptCustomDataResponse,
}

#[api_v2_operation(tags(Vault, PublicApi, Users), description = "Decrypts items from the vault")]
#[actix::post("/users/{footprint_user_id}/vault/decrypt")]
pub async fn post_decrypt(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Json<DecryptUnifiedFieldsRequest>,
    auth: Either<WorkOsAuthContext, SecretTenantAuthContext>,
    insights: InsightHeaders,
) -> JsonApiResponse<UnifiedUserVaultDecryptResponse> {
    let footprint_id = path.into_inner();
    let request = request.into_inner();

    let mut requested_identity_fields: HashSet<DataAttribute> = HashSet::new();
    let mut requested_custom_fields: Vec<KvDataKey> = Vec::new();

    request.fields.into_iter().for_each(|f| match f {
        DataIdentifier::Identity(attr) => {
            requested_identity_fields.insert(attr);
        }
        DataIdentifier::Custom(data_key) => {
            requested_custom_fields.push(data_key);
        }
    });

    let id_results_fut = identity::post_decrypt_internal(
        state.clone(),
        Path::from(footprint_id.clone()),
        Json(identity::DecryptIdentityFieldsRequest {
            fields: requested_identity_fields,
            reason: request.reason.clone(),
        }),
        auth.clone(),
        insights.clone(),
    );

    let custom_results_fut = custom::post_decrypt_internal(
        state,
        Path::from(footprint_id),
        Json(custom::DecryptCustomFieldsRequest {
            fields: requested_custom_fields,
            reason: request.reason,
        }),
        auth,
        insights,
    );

    let (id_results, custom_results) = futures::try_join!(id_results_fut, custom_results_fut)?;

    let out = UnifiedUserVaultDecryptResponse {
        identity: id_results.into_inner().data,
        custom: custom_results.into_inner().data,
    };

    ResponseData::ok(out).json()
}
