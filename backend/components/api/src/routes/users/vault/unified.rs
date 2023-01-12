//! Add/get/decrypt identity data to a NON-portable user vault

use super::custom::{self, PutCustomDataRequest};
use super::identity::{self};
use crate::auth::tenant::{CanDecrypt, CheckTenantGuard, SecretTenantAuthContext};
use crate::auth::{
    tenant::{TenantAuth, TenantUserAuthContext},
    Either,
};
use crate::types::identity_data_request::{IdentityDataRequest, IdentityDataUpdate};
use crate::types::{EmptyResponse, JsonApiResponse, ResponseData};
use crate::utils::fingerprint_builder::FingerprintBuilder;
use crate::utils::headers::InsightHeaders;
use crate::utils::user_vault_wrapper::{DecryptRequest, UserVaultWrapper, UvwArgs};
use crate::{errors::ApiError, State};
use actix_web::web::Query;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_user::ScopedUser;
use itertools::Itertools;
use newtypes::csv::Csv;
use newtypes::{flat_api_object_map_type, PiiString};
use newtypes::{DataIdentifier, FootprintUserId};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{self, api_v2_operation, web, web::Json, web::Path};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

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
        let fingerprints = FingerprintBuilder::fingerprints(&state, update.clone()).await?;
        (Some(update), fingerprints)
    } else {
        (None, vec![])
    };

    //NOTE: these operations on the different parts of the user vault must be atomic
    state
        .db_pool
        .db_transaction(move |conn| -> Result<_, ApiError> {
            let scoped_user = ScopedUser::get(conn, (&footprint_user_id, &tenant_id, is_live))?;

            // TODO can we use the same UVW to add both kinds of data?
            if let Some(custom_update) = request.custom {
                let uvw = UserVaultWrapper::lock_for_onboarding(conn, &scoped_user.id)?;
                custom::put_internal(
                    conn,
                    uvw,
                    &tenant_auth,
                    &scoped_user,
                    insight.clone(),
                    custom_update,
                )?;
            }
            if let Some(update) = update {
                let uvw = UserVaultWrapper::lock_for_onboarding(conn, &scoped_user.id)?;
                identity::put_internal(
                    conn,
                    uvw,
                    &tenant_auth,
                    &scoped_user,
                    insight,
                    update,
                    fingerprints,
                )?
            }

            Ok(())
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
    #[openapi(example = "id.last_name, custom.ach_account, id.dob, id.ssn9")]
    fields: Csv<DataIdentifier>,
}

flat_api_object_map_type!(
    GetUnifiedResponse<DataIdentifier, bool>,
    description="A key-value map of identifier to whether the identifier exists in the vault",
    example=r#"{ "id.last_name": "smith", "id.ssn9": "121121212", "custom.credit_card": "1234 1234 1234 1234" }"#
);

#[api_v2_operation(
    description = "Check for the existence of items in a vault",
    tags(Vault, PublicApi, Users)
)]
#[actix::get("/users/{footprint_user_id}/vault")]
pub async fn get(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Query<FieldsParams>,
    auth: Either<TenantUserAuthContext, SecretTenantAuthContext>,
) -> JsonApiResponse<GetUnifiedResponse> {
    let footprint_user_id = path.into_inner();

    let request = request.into_inner();
    let FieldsParams { fields } = request;
    let fields = fields.clone().into_iter().collect_vec();

    let auth = auth.check_guard(CanDecrypt::new(fields.clone()))?;
    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();

    let fields_clone = fields.clone();
    let uvw = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let scoped_user = ScopedUser::get(conn, (&footprint_user_id, &tenant_id, is_live))?;
            let uvw = UserVaultWrapper::build(conn, UvwArgs::Tenant(&scoped_user.id))?;
            // TODO bake this access checking into get_e_datas, when decrypting for a tenant.
            // Shouldn't be allowed to gete_datas without doing this
            uvw.ensure_scope_allows_access(conn, &scoped_user, fields_clone)?;
            Ok(uvw)
        })
        .await??;

    let mut results = uvw.get_e_datas(&fields);
    let results = HashMap::from_iter(
        fields
            .into_iter()
            .map(|di| (di.clone(), results.remove(&di).is_some())),
    );
    let out = GetUnifiedResponse { map: results };

    ResponseData::ok(out).json()
}

#[derive(Debug, Serialize, Deserialize, Apiv2Schema)]
pub struct DecryptUnifiedFieldsRequest {
    /// list of data identifiers to decrypt
    fields: HashSet<DataIdentifier>,
    /// reason for the data decryption
    reason: String,
}

flat_api_object_map_type!(
    DecryptUnifiedResponse<DataIdentifier, Option<PiiString>>,
    description="A key-value map with the corresponding decrypted values",
    example=r#"{ "id.last_name": "smith", "id.ssn9": "121121212", "custom.credit_card": "1234 1234 1234 1234" }"#
);

#[api_v2_operation(tags(Vault, PublicApi, Users), description = "Decrypts items from the vault")]
#[actix::post("/users/{footprint_user_id}/vault/decrypt")]
pub async fn post_decrypt(
    state: web::Data<State>,
    path: Path<FootprintUserId>,
    request: Json<DecryptUnifiedFieldsRequest>,
    auth: Either<TenantUserAuthContext, SecretTenantAuthContext>,
    insights: InsightHeaders,
) -> JsonApiResponse<DecryptUnifiedResponse> {
    // TODO if we get only id data here, don't require the `id.` prefix
    let footprint_user_id = path.into_inner();

    let request = request.into_inner();
    let DecryptUnifiedFieldsRequest { fields, reason } = request;
    let fields = fields.clone().into_iter().collect_vec();

    let auth = auth.check_guard(CanDecrypt::new(fields.clone()))?;
    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();

    let fields_clone = fields.clone();
    let uvw = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let scoped_user = ScopedUser::get(conn, (&footprint_user_id, &tenant_id, is_live))?;
            let uvw = UserVaultWrapper::build(conn, UvwArgs::Tenant(&scoped_user.id))?;
            // TODO bake this access checking into decrypt, when decrypting for a tenant.
            // Shouldn't be allowed to decrypt without doing this
            uvw.ensure_scope_allows_access(conn, &scoped_user, fields_clone)?;
            Ok(uvw)
        })
        .await??;

    let req = DecryptRequest {
        reason,
        principal: auth.actor().into(),
        insight: CreateInsightEvent::from(insights),
    };
    let mut results = uvw.decrypt(&state, &fields, Some(req)).await?;
    // Is this step necessary? Every key is present in the response if it was in the request?
    let results = HashMap::from_iter(fields.into_iter().map(|di| (di.clone(), results.remove(&di))));
    let out = DecryptUnifiedResponse { map: results };

    ResponseData::ok(out).json()
}
