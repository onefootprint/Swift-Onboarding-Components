use actix_web::web;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantApiKeyGated;
use api_core::auth::tenant::TenantGuard;
use api_core::types::ApiResponse;
use api_core::FpResult;
use api_core::State;
use crypto::hex::ToHex;
use db::models::vault_dr::NewVaultDrAwsPreEnrollment;
use db::models::vault_dr::VaultDrAwsPreEnrollment;
use newtypes::preview_api;
use paperclip::actix::api_v2_operation;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    tags(VaultDisasterRecovery, Private),
    description = "Generates an AWS external ID for the tenant if necessary."
)]
#[actix::post("/org/vault_dr/aws_pre_enrollment")]
pub async fn post(
    state: web::Data<State>,
    auth: TenantApiKeyGated<preview_api::VaultDisasterRecovery>,
) -> ApiResponse<api_wire_types::VaultDrAwsPreEnrollResponse> {
    let auth = auth.check_guard(TenantGuard::Admin)?;
    let tenant = auth.tenant().clone();
    let is_live = auth.is_live()?;

    let pre_enrollment = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let new_pre_enrollment = NewVaultDrAwsPreEnrollment {
                tenant_id: &tenant.id,
                is_live,
                aws_external_id: crypto::random::gen_rand_bytes(16).encode_hex::<String>().into(),
            };

            Ok(VaultDrAwsPreEnrollment::get_or_create(conn, new_pre_enrollment)?)
        })
        .await?;

    Ok(api_wire_types::VaultDrAwsPreEnrollResponse {
        external_id: pre_enrollment.aws_external_id,
    })
}

#[api_v2_operation(
    tags(VaultDisasterRecovery, Private),
    description = "Returns the AWS external ID for the tenant if it exists"
)]
#[actix::get("/org/vault_dr/aws_pre_enrollment")]
pub async fn get(
    state: web::Data<State>,
    auth: TenantApiKeyGated<preview_api::VaultDisasterRecovery>,
) -> ApiResponse<api_wire_types::VaultDrAwsPreEnrollResponse> {
    let auth = auth.check_guard(TenantGuard::Admin)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;

    let pre_enrollment = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            Ok(VaultDrAwsPreEnrollment::get(conn, (&tenant_id, is_live))?)
        })
        .await?;

    Ok(api_wire_types::VaultDrAwsPreEnrollResponse {
        external_id: pre_enrollment.aws_external_id,
    })
}
