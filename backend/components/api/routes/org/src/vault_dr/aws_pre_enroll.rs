use actix_web::web;
use api_core::auth::tenant::{
    CheckTenantGuard,
    SecretTenantAuthContext,
    TenantGuard,
};
use api_core::errors::ApiResult;
use api_core::types::ModernApiResult;
use api_core::{
    ApiErrorKind,
    State,
};
use crypto::hex::ToHex;
use db::models::vault_dr::{
    NewVaultDrAwsPreEnrollment,
    VaultDrAwsPreEnrollment,
};
use paperclip::actix::{
    self,
    api_v2_operation,
};

#[api_v2_operation(
    tags(VaultDisasterRecovery, Private),
    description = "Generates an AWS external ID for the tenant if necessary."
)]
#[actix::post("/org/vault_dr/aws_pre_enrollment")]
pub async fn post(
    state: web::Data<State>,
    auth: SecretTenantAuthContext,
) -> ModernApiResult<api_wire_types::VaultDrAwsPreEnrollResponse> {
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
    auth: SecretTenantAuthContext,
) -> ModernApiResult<api_wire_types::VaultDrAwsPreEnrollResponse> {
    let auth = auth.check_guard(TenantGuard::Admin)?;
    let tenant_id = auth.tenant().id.clone();
    let is_live = auth.is_live()?;

    let pre_enrollment = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            Ok(VaultDrAwsPreEnrollment::get(conn, &tenant_id, is_live)?)
        })
        .await?;

    let Some(pre_enrollment) = pre_enrollment else {
        return Err(ApiErrorKind::ResourceNotFound.into());
    };

    Ok(api_wire_types::VaultDrAwsPreEnrollResponse {
        external_id: pre_enrollment.aws_external_id,
    })
}
