use actix_web::web;
use api_core::auth::tenant::{
    CheckTenantGuard,
    SecretTenantAuthContext,
    TenantGuard,
};
use api_core::errors::ApiResult;
use api_core::types::{
    JsonApiResponse,
    ResponseData,
};
use api_core::State;
use crypto::hex::ToHex;
use db::models::vault_dr::{
    NewVaultDrAwsPreEnrollment,
    VaultDrAwsPreEnrollment,
};
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
    api_v2_operation,
};

#[api_v2_operation(
    tags(VaultDisasterRecovery, Private),
    description = "Generates an AWS external ID for the tenant if necessary."
)]
#[actix::post("/org/vault_dr/aws_pre_enroll")]
pub async fn post(
    state: web::Data<State>,
    auth: SecretTenantAuthContext,
) -> JsonApiResponse<api_wire_types::VaultDrAwsPreEnrollResponse> {
    let auth = auth.check_guard(TenantGuard::Admin)?;
    let tenant = auth.tenant().clone();
    let is_live = auth.is_live()?;

    let pre_enrollment = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let new_pre_enrollment = NewVaultDrAwsPreEnrollment {
                tenant_id: &tenant.id,
                is_live,
                aws_external_id: crypto::random::gen_rand_bytes(16).encode_hex::<String>().into(),
            };


            Ok(VaultDrAwsPreEnrollment::get_or_create(conn, new_pre_enrollment)?)
        })
        .await?;

    Ok(Json(ResponseData::ok(
        api_wire_types::VaultDrAwsPreEnrollResponse {
            external_id: pre_enrollment.aws_external_id,
        },
    )))
}
