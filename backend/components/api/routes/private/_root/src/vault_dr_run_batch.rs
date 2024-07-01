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
use newtypes::TenantId;
use paperclip::actix::Apiv2Response;
use paperclip::actix::Apiv2Schema;
use vault_dr::VaultDrWriter;

#[derive(serde::Deserialize, Apiv2Schema)]
struct VaultDrRunBatchRequest {
    pub tenant_id: TenantId,
    pub is_live: IsLive,

    pub batch_size: u32,
}

#[derive(serde::Serialize, macros::JsonResponder, Apiv2Response)]
struct VaultDrRunBatchResponse {
    pub num_blobs: u32,
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
        batch_size,
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

    let writer = VaultDrWriter::new(&state, &config.id).await?;

    let num_blobs = writer.write_blobs_batch(&state, batch_size).await?;

    Ok(VaultDrRunBatchResponse { num_blobs })
}
