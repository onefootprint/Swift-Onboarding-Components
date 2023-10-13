use crate::auth::tenant::{CheckTenantGuard, SecretTenantAuthContext};
use crate::auth::{tenant::TenantSessionAuth, Either};
use crate::types::{JsonApiResponse, ResponseData};
use crate::utils::headers::InsightHeaders;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::{errors::ApiError, State};
use api_core::auth::tenant::{ClientTenantAuthContext, TenantAuth};
use api_core::auth::CanDecrypt;
use api_core::errors::tenant::TenantError;
use api_core::errors::{ApiResult, AssertionError};
use api_core::proxy::filter_function_to_transform;
use api_core::telemetry::RootSpan;
use api_core::utils::vault_wrapper::{bulk_decrypt, BulkDecryptReq, EnclaveDecryptOperation, TenantVw};
use api_wire_types::DecryptResponse;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use itertools::Itertools;
use macros::route_alias;
use newtypes::output::Csv;
use newtypes::{
    AccessEventPurpose, DataLifetimeSeqno, FilterFunctionName, FilterFunctionStr, VersionedDataIdentifier,
};
use newtypes::{FilterFunction, FpId};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{api_v2_operation, post, web, web::Json, web::Path};
use serde::Deserialize;
use std::collections::{HashMap, HashSet};

#[derive(Debug, Deserialize)]
pub struct DecryptRequest {
    /// List of data identifiers to decrypt. For example, `id.first_name`, `id.ssn4`, `custom.bank_account`
    pub(super) fields: HashSet<VersionedDataIdentifier>,
    /// Reason for the data decryption. This will be logged
    pub(super) reason: String,

    /// A list of filter functions to apply to each decrypted data
    /// Omit or leave empty to apply no filters
    /// DEPRECATED
    pub(super) filters: Option<Vec<FilterFunction>>,

    /// A list of filter and transform functions to apply to each decrypted datum.
    /// Omit or leave empty to apply no transforms.
    /// Can find more information on allowed transform functions on our docs
    pub(super) transforms: Option<Vec<FilterFunctionStr>>,
}

impl paperclip::v2::schema::Apiv2Schema for DecryptRequest {
    fn name() -> Option<String> {
        Some("DecryptRequest".to_string())
    }
    fn description() -> &'static str {
        DONOTUSEUseDecryptRequest::description()
    }
    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        let mut schema = DONOTUSEUseDecryptRequest::raw_schema();
        schema.name = Self::name();
        schema
    }
}
impl paperclip::actix::OperationModifier for DecryptRequest {}

// This struct isn't used anywhere - its auto-generated Apiv2Schema is simply used in place of
// autogenerating one for DecryptRequest above - there doesn't seem to be a way to hide the
// deprecated fields in the open API spec...

#[derive(Apiv2Schema)]
struct DONOTUSEUseDecryptRequest {
    /// List of data identifiers to decrypt. For example, `id.first_name`, `id.ssn4`, `custom.bank_account`
    #[allow(unused)]
    fields: HashSet<VersionedDataIdentifier>,
    /// Reason for the data decryption. This will be logged
    #[allow(unused)]
    reason: String,
    /// A list of filter and transform functions to apply to each decrypted datum.
    /// Omit or leave empty to apply no transforms.
    /// Can find more information on allowed transform functions on our docs
    #[allow(unused)]
    transforms: Option<Vec<FilterFunctionStr>>,
}

#[derive(Debug, Deserialize)]
pub struct ClientDecryptRequest {
    /// List of data identifiers to decrypt. For example, `id.first_name`, `id.ssn4`, `custom.bank_account`
    fields: HashSet<VersionedDataIdentifier>,
    /// Reason for the data decryption. This will be logged.
    /// The reason must be provided either here or in the client token
    reason: Option<String>,
    /// A list of filter functions to apply to each decrypted data
    /// Omit or leave empty to apply no filters
    /// DEPRECATED
    #[serde(skip_serializing_if = "Option::is_none")]
    filters: Option<Vec<FilterFunction>>,

    /// A list of filter and transform functions to apply to each decrypted datum.
    /// Omit or leave empty to apply no transforms
    /// Can find more information on allowed transform functions on our docs
    #[serde(default)]
    transforms: Option<Vec<FilterFunctionStr>>,
}

impl paperclip::v2::schema::Apiv2Schema for ClientDecryptRequest {
    fn name() -> Option<String> {
        Some("ClientDecryptRequest".to_string())
    }
    fn description() -> &'static str {
        DONOTUSEClientDecryptRequest::description()
    }
    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        let mut schema = DONOTUSEClientDecryptRequest::raw_schema();
        schema.name = Self::name();
        schema
    }
}
impl paperclip::actix::OperationModifier for ClientDecryptRequest {}

#[derive(Apiv2Schema)]
pub struct DONOTUSEClientDecryptRequest {
    /// List of data identifiers to decrypt. For example, `id.first_name`, `id.ssn4`, `custom.bank_account`
    #[allow(unused)]
    fields: HashSet<VersionedDataIdentifier>,
    /// Reason for the data decryption. This will be logged.
    /// The reason must be provided either here or in the client token
    #[allow(unused)]
    reason: Option<String>,
    /// A list of filter and transform functions to apply to each decrypted datum.
    /// Omit or leave empty to apply no transforms
    /// Can find more information on allowed transform functions on our docs
    #[allow(unused)]
    transforms: Option<Vec<FilterFunctionStr>>,
}

#[tracing::instrument(skip(state, auth, root_span))]
#[route_alias(
    post(
        "/users/{fp_id}/vault/decrypt",
        tags(Users, Vault, PublicApi),
        description = "Decrypts the specified list of fields from the provided vault."
    ),
    post(
        "/businesses/{fp_bid}/vault/decrypt",
        tags(Businesses, Vault, PublicApi),
        description = "Decrypts the specified list of fields from the provided vault."
    )
)]
#[api_v2_operation(
    tags(Vault, Entities, Private),
    description = "Works for either person or business entities. Decrypts the specified list of fields from the provided vault."
)]
#[post("/entities/{fp_id}/vault/decrypt")]
pub async fn post(
    state: web::Data<State>,
    path: Path<FpId>,
    request: Json<DecryptRequest>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
    insights: InsightHeaders,
    root_span: RootSpan,
) -> JsonApiResponse<DecryptResponse> {
    let request = request.into_inner();
    let dis = request.fields.iter().map(|id| id.di.clone()).collect();
    let auth = auth.check_guard(CanDecrypt::new(dis))?;

    let result = post_inner(&state, path.into_inner(), request, auth, insights, root_span).await?;
    Ok(result)
}

#[tracing::instrument(skip(state, auth, root_span))]
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
) -> JsonApiResponse<DecryptResponse> {
    let dis = request.fields.iter().map(|id| id.di.clone()).collect();
    let auth = auth.check_guard(CanDecrypt::new(dis))?;
    let fp_id = auth.fp_id.clone();

    // Compose the DecryptRequest
    let ClientDecryptRequest {
        fields,
        reason,
        filters,
        transforms,
    } = request.into_inner();
    let reason = reason
        .or(auth.data.decrypt_reason.clone())
        .ok_or(TenantError::NoDecryptionReasonProvided)?;
    let request = DecryptRequest {
        reason,
        fields,
        filters,
        transforms,
    };

    // TODO would be really cool if we could share the handler - the only difference is one gets
    // the fp_id from the path while the other gets it from the token. could we make an extractor
    // for this?
    let result = post_inner(&state, fp_id, request, Box::new(auth), insights, root_span).await?;
    Ok(result)
}

pub(super) async fn post_inner(
    state: &State,
    fp_id: FpId,
    request: DecryptRequest,
    auth: Box<dyn TenantAuth>,
    insights: InsightHeaders,
    root_span: RootSpan,
) -> JsonApiResponse<DecryptResponse> {
    let DecryptRequest {
        fields,
        reason,
        filters,
        transforms,
    } = request;

    // Record the fields being decrypted
    root_span.record(
        "meta",
        Csv::from(fields.iter().cloned().collect_vec()).to_string(),
    );

    // Parse transforms to apply. We're still supprting a legacy format for now
    let transforms = if filters.is_some() && transforms.is_none() {
        let filters = filters.unwrap_or_default();
        tracing::warn!(filters=%Csv::from(filters.iter().map(FilterFunctionName::from).collect_vec()), "Used legacy filter functions");
        filters.iter().map(filter_function_to_transform).collect_vec()
    } else {
        let transforms = transforms.unwrap_or_default();
        tracing::warn!(filters=%Csv::from(transforms.iter().map(FilterFunctionName::from).collect_vec()), "Used modern filter functions");
        transforms
            .into_iter()
            .map(|t| t.into_inner())
            .map(|f| filter_function_to_transform(&f))
            .collect()
    };

    // Create a VW for each version in fields
    let version_to_targets = fields
        .into_iter()
        .map(|f| {
            let target = EnclaveDecryptOperation {
                identifier: f.di,
                transforms: transforms.clone(),
            };
            (f.version, target)
        })
        .into_group_map();
    let versions = version_to_targets.keys().cloned().collect_vec();

    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();

    let vws: HashMap<Option<DataLifetimeSeqno>, TenantVw> = state
        .db_pool
        .db_query(move |conn| -> Result<_, ApiError> {
            let scoped_user = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            // Build a VW for every version requested
            let vws = versions
                .into_iter()
                .map(|v| VaultWrapper::build_for_tenant_version(conn, &scoped_user.id, v).map(|vw| (v, vw)))
                .collect::<ApiResult<_>>()?;
            Ok(vws)
        })
        .await??;

    let reqs = version_to_targets
        .clone()
        .into_iter()
        .map(|(v, targets)| -> ApiResult<_> {
            let vw = vws.get(&v).ok_or(AssertionError("No VW found for version"))?;
            Ok((v, BulkDecryptReq { vw, targets }))
        })
        .collect::<ApiResult<_>>()?;
    let insight = CreateInsightEvent::from(insights);
    let actor = auth.actor().into();
    let purpose = AccessEventPurpose::Api;
    let mut decrypted_results = bulk_decrypt(state, reqs, insight, reason, actor, purpose)
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
    let out = DecryptResponse::from(results);

    ResponseData::ok(out).json()
}
