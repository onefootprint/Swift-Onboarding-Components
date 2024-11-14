use actix_web::web;
use age::secrecy::ExposeSecret;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::TenantApiKeyGated;
use api_core::auth::tenant::TenantGuard;
use api_core::types::ApiResponse;
use api_core::State;
use api_errors::FpDbOptionalExtension;
use api_errors::FpErrorCode;
use chrono::Utc;
use db::models::vault_dr::NewVaultDrConfig;
use db::models::vault_dr::VaultDrAwsPreEnrollment;
use db::models::vault_dr::VaultDrConfig;
use newtypes::preview_api;
use paperclip::actix::api_v2_operation;
use paperclip::actix::{
    self,
};
use rand::distributions::Alphanumeric;
use rand::thread_rng;
use rand::Rng;
use vault_dr::EnrollmentKeys;
use vault_dr::PublicKey;
use vault_dr::PublicKeySet;
use vault_dr::VaultDrAwsConfig;

#[api_v2_operation(
    tags(VaultDisasterRecovery, Private),
    description = "Enrolls the authorized tenant in Vault Disaster Recovery"
)]
#[actix::post("/org/vault_dr/enroll")]
pub async fn post(
    state: web::Data<State>,
    auth: TenantApiKeyGated<preview_api::VaultDisasterRecovery>,
    request: web::Json<api_wire_types::VaultDrEnrollRequest>,
) -> ApiResponse<api_wire_types::VaultDrEnrollResponse> {
    let auth = auth.check_guard(TenantGuard::Admin)?;
    let tenant = auth.tenant();
    let is_live = auth.is_live()?;

    let api_wire_types::VaultDrEnrollRequest {
        aws_account_id,
        aws_role_name,
        s3_bucket_name,
        org_public_keys,
        re_enroll,
    } = request.into_inner();

    let org_public_keys = org_public_keys
        .into_iter()
        .map(|pubkey| pubkey.parse::<PublicKey>())
        .collect::<Result<Vec<_>, _>>()?;

    let org_public_key_set = PublicKeySet::new(org_public_keys)?;

    let tenant_id = tenant.id.clone();
    let pre_enrollment = state
        .db_query(move |conn| {
            Ok(VaultDrAwsPreEnrollment::get(conn, (&tenant_id, is_live))
                .optional()?
                .ok_or(vault_dr::Error::MissingAwsPreEnrollment)?)
        })
        .await?;
    let pre_enrollment_id = pre_enrollment.id.clone();

    let aws_config = VaultDrAwsConfig {
        state_config: state.config.vault_dr_config.clone(),
        aws_account_id,
        aws_external_id: pre_enrollment.aws_external_id.clone(),
        aws_role_name,
        s3_bucket_name,
    };

    aws_config.validate(true).await?;

    let EnrollmentKeys {
        recovery_public_key,
        wrapped_recovery_key,
    } = EnrollmentKeys::generate(&org_public_key_set)?;


    let tenant_id = tenant.id.clone();
    state
        .db_transaction(move |conn| {
            let existing_config = VaultDrConfig::lock(conn, &tenant_id, is_live)?;
            if let Some(existing_config) = existing_config {
                if re_enroll != Some(true) {
                    return Err(vault_dr::Error::AlreadyEnrolled.into());
                }
                VaultDrConfig::deactivate(conn, existing_config)?;
            }

            let VaultDrAwsConfig {
                aws_account_id,
                aws_role_name,
                s3_bucket_name,
                ..
            } = aws_config;

            let bucket_path_namespace = thread_rng()
                .sample_iter(&Alphanumeric)
                .map(char::from)
                .filter(|c| !c.is_uppercase())
                .take(32)
                .collect();

            let new_config = NewVaultDrConfig {
                created_at: Utc::now(),
                tenant_id: &tenant_id,
                is_live,
                aws_pre_enrollment_id: &pre_enrollment_id,
                aws_account_id,
                aws_role_name,
                s3_bucket_name,
                recovery_public_key,
                wrapped_recovery_key: wrapped_recovery_key.expose_secret().clone(),
                org_public_keys: org_public_key_set.into(),
                bucket_path_namespace,
            };

            VaultDrConfig::create(conn, new_config).map_err(|err| match err.code() {
                Some(FpErrorCode::DbUniqueConstraintViolation) => vault_dr::Error::AlreadyEnrolled.into(),
                _ => err,
            })?;

            Ok(())
        })
        .await?;

    Ok(api_wire_types::VaultDrEnrollResponse {})
}
