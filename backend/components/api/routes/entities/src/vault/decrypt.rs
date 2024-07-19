use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::SecretTenantAuthContext;
use crate::auth::tenant::TenantSessionAuth;
use crate::auth::Either;
use crate::types::ApiResponse;
use crate::utils::headers::InsightHeaders;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::auth::tenant::ClientTenantAuthContext;
use api_core::auth::tenant::TenantAuth;
use api_core::auth::CanDecrypt;
use api_core::errors::tenant::TenantError;
use api_core::errors::AssertionError;
use api_core::telemetry::RootSpan;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::vault_wrapper::bulk_decrypt;
use api_core::utils::vault_wrapper::BulkDecryptReq;
use api_core::utils::vault_wrapper::DecryptAccessEventInfo;
use api_core::utils::vault_wrapper::EnclaveDecryptOperation;
use api_core::utils::vault_wrapper::TenantVw;
use api_core::FpResult;
use api_wire_types::BusinessDecryptResponse;
use api_wire_types::DecryptResponse;
use api_wire_types::UserDecryptResponse;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use itertools::Itertools;
use macros::route_alias;
use newtypes::output::Csv;
use newtypes::AccessEventPurpose;
use newtypes::BusinessDataIdentifier;
use newtypes::DataLifetimeSeqno;
use newtypes::FilterFunction;
use newtypes::FpId;
use newtypes::UserDataIdentifier;
use newtypes::VersionedDataIdentifier;
use paperclip::actix::api_v2_operation;
use paperclip::actix::post;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::Apiv2Schema;
use serde::Deserialize;
use std::collections::HashMap;
use std::collections::HashSet;

#[derive(Debug, Deserialize, Apiv2Schema)]
pub struct UserDecryptRequest {
    /// List of data identifiers to decrypt. For example, `id.first_name`, `id.ssn4`,
    /// `custom.bank_account`
    #[openapi(example = r#"["id.first_name", "id.last_name"]"#)]
    // NOTE: We are not serializing that this request can include versioned DIs
    #[openapi(serialize_as = "Option<Vec<UserDataIdentifier>>")]
    pub(super) fields: HashSet<VersionedDataIdentifier>,
    /// Reason for the data decryption. This will be logged
    #[openapi(example = "Lorem ipsum dolor")]
    pub(super) reason: String,

    /// A list of filter and transform functions to apply to each decrypted datum.
    /// Omit or leave empty to apply no transforms.
    /// Can find more information on allowed transform functions on our docs
    #[openapi(example = "null")]
    pub(super) transforms: Option<Vec<FilterFunction>>,
}

#[derive(Debug, Deserialize, Apiv2Schema)]
pub struct BusinessDecryptRequest {
    /// List of data identifiers to decrypt. For example, `business.name`, `business.website`,
    #[openapi(example = r#"["business.name", "business.website"]"#)]
    #[openapi(serialize_as = "Option<Vec<BusinessDataIdentifier>>")]
    pub(super) fields: HashSet<VersionedDataIdentifier>,
    /// Reason for the data decryption. This will be logged
    #[openapi(example = "Lorem ipsum dolor")]
    pub(super) reason: String,

    /// A list of filter and transform functions to apply to each decrypted datum.
    /// Omit or leave empty to apply no transforms.
    /// Can find more information on allowed transform functions on our docs
    #[openapi(example = "null")]
    pub(super) transforms: Option<Vec<FilterFunction>>,
}

#[derive(Debug, Deserialize, Apiv2Schema)]
pub struct ClientDecryptRequest {
    /// List of data identifiers to decrypt. For example, `id.first_name`, `id.ssn4`,
    /// `custom.bank_account`
    #[openapi(example = r#"["id.first_name", "id.last_name"]"#)]
    #[openapi(serialize_as = "Option<Vec<UserDataIdentifier>>")]
    fields: HashSet<VersionedDataIdentifier>,
    /// Reason for the data decryption. This will be logged.
    /// The reason must be provided either here or in the client token
    #[openapi(example = "Lorem ipsum dolor")]
    reason: Option<String>,

    /// A list of filter and transform functions to apply to each decrypted datum.
    /// Omit or leave empty to apply no transforms
    /// Can find more information on allowed transform functions on our docs
    #[serde(default)]
    #[openapi(example = "null")]
    transforms: Option<Vec<FilterFunction>>,
}

#[route_alias(post(
    "/users/{fp_id}/vault/decrypt",
    tags(Users, Vault, PublicApi),
    description = "Decrypts the specified list of fields from the provided user vault."
))]
#[api_v2_operation(
    tags(Vault, Entities, Private),
    description = "Works for either person or business entities. Decrypts the specified list of fields from the provided vault."
)]
#[post("/entities/{fp_id}/vault/decrypt")]
pub async fn post(
    state: web::Data<State>,
    path: FpIdPath,
    request: Json<UserDecryptRequest>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
    insights: InsightHeaders,
    root_span: RootSpan,
) -> ApiResponse<UserDecryptResponse> {
    let request = request.into_inner();
    let dis = request.fields.iter().map(|id| id.di.clone()).collect();
    let auth = auth.check_guard(CanDecrypt::new(dis))?;

    let result = post_inner(&state, path.into_inner(), request, auth, insights, root_span).await?;
    Ok(UserDecryptResponse(result))
}

#[api_v2_operation(
    tags(Businesses, Vault, PublicApi),
    description = "Decrypts the specified list of fields from the provided business vault."
)]
#[post("/businesses/{fp_bid}/vault/decrypt")]
pub async fn post_business(
    state: web::Data<State>,
    path: FpIdPath,
    request: Json<BusinessDecryptRequest>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
    insights: InsightHeaders,
    root_span: RootSpan,
) -> ApiResponse<BusinessDecryptResponse> {
    let dis = request.fields.iter().map(|id| id.di.clone()).collect();
    let auth = auth.check_guard(CanDecrypt::new(dis))?;

    let BusinessDecryptRequest {
        fields,
        reason,
        transforms,
    } = request.into_inner();
    let request = UserDecryptRequest {
        reason,
        fields,
        transforms,
    };

    let result = post_inner(&state, path.into_inner(), request, auth, insights, root_span).await?;
    Ok(BusinessDecryptResponse(result))
}

#[route_alias(post(
    "/users/vault/decrypt",
    tags(Client, Vault, Users, PublicApi),
    description = "Decrypts the specified list of fields given a short-lived, entity-scoped client token"
))]
#[api_v2_operation(
    tags(Client, Vault, Entities, Private),
    description = "Works for either person or business entities. Decrypts the specified list of fields given a short-lived, entity-scoped client token"
)]
#[post("/entities/vault/decrypt")]
pub async fn post_client(
    state: web::Data<State>,
    request: Json<ClientDecryptRequest>,
    auth: ClientTenantAuthContext,
    insights: InsightHeaders,
    root_span: RootSpan,
) -> ApiResponse<UserDecryptResponse> {
    let dis = request.fields.iter().map(|id| id.di.clone()).collect();
    let auth = auth.check_guard(CanDecrypt::new(dis))?;
    let fp_id = auth.fp_id.clone();

    // Compose the UserDecryptRequest
    let ClientDecryptRequest {
        fields,
        reason,
        transforms,
    } = request.into_inner();
    let reason = reason
        .or(auth.data.decrypt_reason.clone())
        .ok_or(TenantError::NoDecryptionReasonProvided)?;
    let request = UserDecryptRequest {
        reason,
        fields,
        transforms,
    };

    let result = post_inner(&state, fp_id, request, Box::new(auth), insights, root_span).await?;
    Ok(UserDecryptResponse(result))
}

pub(super) async fn post_inner(
    state: &State,
    fp_id: FpId,
    request: UserDecryptRequest,
    auth: Box<dyn TenantAuth>,
    insights: InsightHeaders,
    root_span: RootSpan,
) -> ApiResponse<DecryptResponse> {
    let UserDecryptRequest {
        fields,
        reason,
        transforms,
    } = request;

    // Record the fields being decrypted
    root_span.record(
        "meta",
        Csv::from(fields.iter().cloned().collect_vec()).to_string(),
    );

    // Create a VW for each version in fields
    let version_to_targets = fields
        .into_iter()
        .map(|f| {
            let target = EnclaveDecryptOperation::new(f.di, transforms.clone().unwrap_or_default());
            (f.version, target)
        })
        .into_group_map();
    let versions = version_to_targets.keys().cloned().collect_vec();

    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();

    let vws: HashMap<Option<DataLifetimeSeqno>, TenantVw> = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let scoped_user = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            // Build a VW for every version requested
            let vws = versions
                .into_iter()
                .map(|v| VaultWrapper::build_for_tenant_version(conn, &scoped_user.id, v).map(|vw| (v, vw)))
                .collect::<FpResult<_>>()?;
            Ok(vws)
        })
        .await?;

    let reqs = version_to_targets
        .clone()
        .into_iter()
        .map(|(v, targets)| -> FpResult<_> {
            let vw = vws.get(&v).ok_or(AssertionError("No VW found for version"))?;
            Ok((v, BulkDecryptReq { vw, targets }))
        })
        .collect::<FpResult<_>>()?;
    let insight = CreateInsightEvent::from(insights);
    let actor = auth.actor().into();
    let purpose = AccessEventPurpose::Api;
    let access_event = DecryptAccessEventInfo::AccessEvent {
        insight,
        reason,
        principal: actor,
        purpose,
    };
    let mut decrypted_results = bulk_decrypt(state, reqs, access_event)
        .await?
        .into_iter()
        .collect::<HashMap<_, _>>();

    let mut results = HashMap::new();
    for (v, targets) in version_to_targets {
        let mut v_results = decrypted_results.remove(&v).unwrap_or_default();
        // Is this step necessary? Every key is present in the response if it was in the request?
        let v_results: HashMap<_, _> = targets
            .iter()
            .map(|target| (target.identifier.clone(), v_results.remove(target)))
            .collect();
        for (di, result) in v_results {
            let id = VersionedDataIdentifier { di, version: v };
            results.insert(id, result);
        }
    }
    Ok(results)
}
