use crate::{
    auth::{
        tenant::{CheckTenantGuard, SecretTenantAuthContext, TenantSessionAuth},
        Either,
    },
    errors::ApiError,
    types::{JsonApiResponse, ResponseData},
    utils::{headers::InsightHeaders, vault_wrapper::VaultWrapper},
    State,
};
use api_core::{
    auth::{
        tenant::{ClientTenantAuthContext, TenantAuth},
        CanDecrypt,
    },
    errors::{tenant::TenantError, ApiResult, AssertionError},
    telemetry::RootSpan,
    utils::{
        fp_id_path::FpIdPath,
        vault_wrapper::{
            bulk_decrypt, BulkDecryptReq, DecryptAccessEventInfo, EnclaveDecryptOperation, TenantVw,
        },
    },
};
use api_wire_types::DecryptResponse;
use db::models::{insight_event::CreateInsightEvent, scoped_vault::ScopedVault};
use itertools::{chain, Itertools};
use macros::route_alias;
use newtypes::{
    output::Csv, AccessEventPurpose, DataIdentifier, DataLifetimeSeqno, DocumentDiKind, FilterFunction, FpId,
    PiiJsonValue, VersionedDataIdentifier,
};
use paperclip::actix::{api_v2_operation, post, web, web::Json, Apiv2Schema};
use serde::Deserialize;
use std::collections::{HashMap, HashSet};

#[derive(Debug, Deserialize, Apiv2Schema)]
pub struct DecryptRequest {
    /// List of data identifiers to decrypt. For example, `id.first_name`, `id.ssn4`, `custom.bank_account`
    pub(super) fields: HashSet<VersionedDataIdentifier>,
    /// Reason for the data decryption. This will be logged
    pub(super) reason: String,

    /// A list of filter and transform functions to apply to each decrypted datum.
    /// Omit or leave empty to apply no transforms.
    /// Can find more information on allowed transform functions on our docs
    pub(super) transforms: Option<Vec<FilterFunction>>,
}

#[derive(Debug, Deserialize, Apiv2Schema)]
pub struct ClientDecryptRequest {
    /// List of data identifiers to decrypt. For example, `id.first_name`, `id.ssn4`, `custom.bank_account`
    fields: HashSet<VersionedDataIdentifier>,
    /// Reason for the data decryption. This will be logged.
    /// The reason must be provided either here or in the client token
    reason: Option<String>,

    /// A list of filter and transform functions to apply to each decrypted datum.
    /// Omit or leave empty to apply no transforms
    /// Can find more information on allowed transform functions on our docs
    #[serde(default)]
    transforms: Option<Vec<FilterFunction>>,
}

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
    path: FpIdPath,
    request: Json<DecryptRequest>,
    auth: Either<TenantSessionAuth, SecretTenantAuthContext>,
    insights: InsightHeaders,
    root_span: RootSpan,
) -> JsonApiResponse<TempDecryptResponse> {
    let request = request.into_inner();
    let dis = request.fields.iter().map(|id| id.di.clone()).collect();
    let auth = auth.check_guard(CanDecrypt::new(dis))?;

    let result = post_inner(&state, path.into_inner(), request, auth, insights, root_span).await?;
    let result = TempDecryptResponse::build(result.0.data);
    ResponseData::ok(result).json()
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
) -> JsonApiResponse<DecryptResponse> {
    let dis = request.fields.iter().map(|id| id.di.clone()).collect();
    let auth = auth.check_guard(CanDecrypt::new(dis))?;
    let fp_id = auth.fp_id.clone();

    // Compose the DecryptRequest
    let ClientDecryptRequest {
        fields,
        reason,
        transforms,
    } = request.into_inner();
    let reason = reason
        .or(auth.data.decrypt_reason.clone())
        .ok_or(TenantError::NoDecryptionReasonProvided)?;
    let request = DecryptRequest {
        reason,
        fields,
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
        .db_query(move |conn| -> Result<_, ApiError> {
            let scoped_user = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            // Build a VW for every version requested
            let vws = versions
                .into_iter()
                .map(|v| VaultWrapper::build_for_tenant_version(conn, &scoped_user.id, v).map(|vw| (v, vw)))
                .collect::<ApiResult<_>>()?;
            Ok(vws)
        })
        .await?;

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
    let out = DecryptResponse::from(results);

    ResponseData::ok(out).json()
}


impl TempDecryptResponse {
    fn build(resp: DecryptResponse) -> Self {
        // Temporarily, while we're migrating away from old ProofOfAddress DIs, manually include
        // the old DI in the response.
        // This assumes we're not decrypting with versions
        let map = resp
            .into_iter()
            .flat_map(|(vdi, val)| {
                let extra_entry =
                    if matches!(vdi.di, DataIdentifier::Document(DocumentDiKind::ProofOfAddress)) {
                        Some(("document.proof_of_address.front.image".to_string(), val.clone()))
                    } else if matches!(vdi.di, DataIdentifier::Document(DocumentDiKind::SsnCard)) {
                        Some(("document.ssn_card.front.image".to_string(), val.clone()))
                    } else {
                        None
                    };
                chain(extra_entry, Some((vdi.to_string(), val)))
            })
            .collect();
        Self { map }
    }
}

/// Temporary to support these in-progress DI migrations
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, derive_more::Deref, derive_more::DerefMut)]
pub struct TempDecryptResponse {
    #[serde(flatten)]
    pub map: std::collections::HashMap<String, Option<PiiJsonValue>>,
}

impl paperclip::v2::schema::Apiv2Schema for TempDecryptResponse {
    fn name() -> Option<String> {
        DecryptResponse::name()
    }

    fn description() -> &'static str {
        DecryptResponse::description()
    }

    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        DecryptResponse::raw_schema()
    }
}
impl paperclip::actix::OperationModifier for TempDecryptResponse {}
