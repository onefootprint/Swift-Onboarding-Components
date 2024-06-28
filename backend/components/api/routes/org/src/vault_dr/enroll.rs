use actix_web::web;
use age::secrecy::ExposeSecret;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::SecretTenantAuthContext;
use api_core::auth::tenant::TenantGuard;
use api_core::types::ApiResponse;
use api_core::FpResult;
use api_core::State;
use chrono::Utc;
use db::errors::FpOptionalExtension;
use db::models::vault_dr::NewVaultDrConfig;
use db::models::vault_dr::VaultDrAwsPreEnrollment;
use db::models::vault_dr::VaultDrConfig;
use paperclip::actix::api_v2_operation;
use paperclip::actix::{
    self,
};
use vault_dr::EnrollmentKeys;
use vault_dr::PublicKey;
use vault_dr::VaultDrWriter;

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
    let tenant = auth.tenant();
    let is_live = auth.is_live()?;

    let api_wire_types::VaultDrEnrollRequest {
        aws_account_id,
        aws_role_name,
        s3_bucket_name,
        org_public_key,
        re_enroll,
    } = request.into_inner();

    let org_public_key: PublicKey = org_public_key.parse()?;

    let tenant_id = tenant.id.clone();
    let pre_enrollment = state
        .db_pool
        .db_query(move |conn| -> FpResult<_> {
            Ok(VaultDrAwsPreEnrollment::get(conn, (&tenant_id, is_live))
                .optional()?
                .ok_or(vault_dr::Error::MissingAwsPreEnrollment)?)
        })
        .await?;
    let pre_enrollment_id = pre_enrollment.id.clone();

    let writer = VaultDrWriter {
        config: state.config.vault_dr_config.clone(),

        tenant_id: tenant.id.clone(),
        is_live,
        aws_account_id,
        aws_external_id: pre_enrollment.aws_external_id.clone(),
        aws_role_name,
        s3_bucket_name,
    };

    writer.validate_aws_config().await?;

    let EnrollmentKeys {
        recovery_public_key,
        wrapped_recovery_key,
    } = EnrollmentKeys::generate(&org_public_key)?;

    let tenant_id = tenant.id.clone();
    state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let existing_config = VaultDrConfig::lock(conn, &tenant_id, is_live)?;
            if let Some(existing_config) = existing_config {
                if re_enroll != Some(true) {
                    return Err(vault_dr::Error::AlreadyEnrolled.into());
                }
                VaultDrConfig::deactivate(conn, existing_config)?;
            }

            let VaultDrWriter {
                aws_account_id,
                aws_role_name,
                s3_bucket_name,
                ..
            } = writer;

            let new_config = NewVaultDrConfig {
                created_at: Utc::now(),
                tenant_id: &tenant_id,
                is_live,
                aws_pre_enrollment_id: &pre_enrollment_id,
                aws_account_id,
                aws_role_name,
                s3_bucket_name,
                org_public_key: org_public_key.to_string(),
                recovery_public_key,
                wrapped_recovery_key: wrapped_recovery_key.expose_secret().clone(),
            };

            VaultDrConfig::create(conn, new_config)?;

            Ok(())
        })
        .await?;

    Ok(api_wire_types::VaultDrEnrollResponse {})
}
