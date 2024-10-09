use crate::State;
use actix_web::post;
use actix_web::web;
use actix_web::web::Json;
use api_core::auth::custodian::CustodianAuthContext;
use api_core::types::ApiResponse;
use api_core::FpResult;
use api_errors::ValidationError;
use db::models::ob_configuration::IsLive;
use db::models::vault_dr::VaultDrConfig;
use newtypes::FpId;
use newtypes::TenantId;
use paperclip::actix::Apiv2Response;
use paperclip::actix::Apiv2Schema;
use vault_dr::BatchResult;
use vault_dr::VaultDrWriter;

#[derive(serde::Deserialize, Apiv2Schema)]
struct VaultDrRunBatchRequest {
    pub tenant_id: TenantId,
    pub is_live: IsLive,

    pub fp_ids: Option<Vec<FpId>>,

    pub manifest_batch_size: u32,
    pub blob_batch_size: u32,

    pub skip_client_validation: Option<bool>,
}

#[derive(serde::Serialize, macros::JsonResponder, Apiv2Response)]
struct VaultDrRunBatchResponse {
    pub num_blobs: u32,
    pub num_manifests: u32,
}


#[post("/private/vault_dr/run_batch")]
pub async fn post(
    state: web::Data<State>,
    request: Json<VaultDrRunBatchRequest>,
    _auth: CustodianAuthContext,
) -> ApiResponse<VaultDrRunBatchResponse> {
    let VaultDrRunBatchRequest {
        tenant_id,
        is_live,
        manifest_batch_size,
        blob_batch_size,
        fp_ids,
        skip_client_validation,
    } = request.into_inner();

    if !tenant_id.is_integration_test_tenant() {
        return ValidationError("Unsupported tenant for this API").into();
    }

    let config = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            let config = VaultDrConfig::get(conn, (&tenant_id, is_live))?;
            Ok(config)
        })
        .await?;

    let knobs = vault_dr::Knobs {
        manifest_batch_size,
        blob_batch_size,
        skip_client_validation: skip_client_validation.unwrap_or_default(),
        ..Default::default()
    };

    let writer = VaultDrWriter::new(&state, &config.id, knobs).await?;

    let BatchResult {
        num_blobs,
        num_manifests,
    } = writer.run_batch(&state, fp_ids).await?;

    Ok(VaultDrRunBatchResponse {
        num_blobs: num_blobs as u32,
        num_manifests: num_manifests as u32,
    })
}
