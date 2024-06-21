use actix_web::web;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::SecretTenantAuthContext;
use api_core::auth::tenant::TenantGuard;
use api_core::types::ApiResponse;
use api_core::FpResult;
use api_core::State;
use chrono::Utc;
use db::models::vault_dr::NewVaultDrConfig;
use db::models::vault_dr::VaultDrAwsPreEnrollment;
use db::models::vault_dr::VaultDrConfig;
use paperclip::actix::api_v2_operation;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    tags(VaultDisasterRecovery, Private),
    description = "Enrolls the authorized tenant in Vault Disaster Recovery"
)]
#[actix::post("/org/vault_dr/enroll")]
pub async fn post(
    state: web::Data<State>,
    auth: SecretTenantAuthContext,
    request: web::Json<api_wire_types::VaultDrEnrollRequest>,
) -> ApiResponse<api_wire_types::VaultDrEnrollResponse> {
    let auth = auth.check_guard(TenantGuard::Admin)?;
    let tenant = auth.tenant().clone();
    let is_live = auth.is_live()?;

    let api_wire_types::VaultDrEnrollRequest {
        aws_account_id,
        aws_role_name,
        s3_bucket_name,
        re_enroll,
    } = request.into_inner();

    state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let Some(pre_enrollment) = VaultDrAwsPreEnrollment::get(conn, &tenant.id, is_live)? else {
                return Err(vault_dr::Error::MissingAwsPreEnrollment.into());
            };

            let existing_config = VaultDrConfig::lock(conn, &tenant.id, is_live)?;
            if let Some(existing_config) = existing_config {
                if re_enroll != Some(true) {
                    return Err(vault_dr::Error::AlreadyEnrolled.into());
                }
                VaultDrConfig::deactivate(conn, existing_config)?;
            }

            let new_config = NewVaultDrConfig {
                created_at: Utc::now(),
                tenant_id: &tenant.id,
                is_live,
                aws_pre_enrollment_id: &pre_enrollment.id,
                aws_account_id,
                aws_role_name,
                s3_bucket_name,
                org_public_key: "TODO".into(),
                recovery_public_key: "TODO".into(),
                wrapped_recovery_key: "TODO".into(),
            };
            VaultDrConfig::create(conn, new_config)?;

            Ok(())
        })
        .await?;

    Ok(api_wire_types::VaultDrEnrollResponse {
        org_private_key: "todo".into(),
    })
}
