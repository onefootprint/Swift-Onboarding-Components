use crate::State;
use api_core::errors::ApiResult;
use app_attest::apple::AppleAppAttestationVerifier;
use crypto::base64;
use db::models::apple_device_attest::AppleDeviceMetadata;
use db::models::apple_device_attest::NewAppleDeviceAttestation;
use db::models::tenant::Tenant;
use db::models::tenant_ios_app_meta::TenantIosAppFilters;
use db::models::tenant_ios_app_meta::TenantIosAppMeta;
use db::models::webauthn_credential::WebauthnCredential;
use db::DbResult;
use newtypes::VaultId;

#[derive(Debug, Clone, serde::Deserialize)]
struct IosAttestationPayload {
    /// base64 encoded metadata json
    metadata_json_data: String,
    /// the attestation from
    attestation_data: String,
}

/// The object embedding what the device has attested
/// TODO: more to add here
#[derive(Debug, Clone, serde::Deserialize)]
struct AttestedMetadata {
    #[serde(rename = "footprint_attestation_challenge")]
    attested_challenge: String,
    webauthn_device_response_json: Option<String>,
    model: Option<String>,
    os: Option<String>,
    /// token to use with DC bit get/set
    /// if omiitted it means device could not generate it
    device_check_token: Option<String>,
}

/// Main entry point for attesting an iOS device
#[tracing::instrument(skip_all)]
pub(super) async fn attest(
    state: &State,
    tenant: &Tenant,
    vault_id: VaultId,
    challenge: String,
    attestation: String,
    app_bundle_id: Option<String>,
) -> ApiResult<NewAppleDeviceAttestation> {
    // If app bundle id is provided, fetch the tenant ios app metadata
    // Otherwise assume we are running inside app clip and use footprint verifier info
    let meta: Option<TenantIosAppMeta> = if app_bundle_id.is_some() {
        let filters = TenantIosAppFilters {
            tenant_id: tenant.id.clone(),
            app_bundle_id,
        };
        let metas = state
            .db_pool
            .db_query(move |conn| -> DbResult<_> { TenantIosAppMeta::list(conn, filters) })
            .await?;
        metas.into_iter().next()
    } else {
        None
    };

    let verifier = if let Some(meta) = meta {
        let decrypted_private_key = state
            .enclave_client
            .decrypt_to_piistring(&meta.e_device_check_private_key, &tenant.e_private_key)
            .await?
            .leak_to_string();
        AppleAppAttestationVerifier::new_default_ca(
            meta.app_bundle_ids,
            &decrypted_private_key,
            &meta.device_check_key_id,
            &meta.team_id,
        )?
    } else {
        AppleAppAttestationVerifier::new_default_ca(
            vec![
                "5F264K8AG4.com.onefootprint.my",
                "5F264K8AG4.com.onefootprint.my.Clip",
            ],
            &state.config.apple_config.apple_device_check_private_key_pem,
            &state.config.apple_config.apple_device_check_key_id,
            "5F264K8AG4",
        )?
    };

    let vault_id_copy = vault_id.clone();
    let creds = state
        .db_pool
        .db_query(move |conn| WebauthnCredential::list(conn, &vault_id_copy))
        .await?;

    let new_attestation = attest_inner(vault_id, &verifier, challenge, attestation, creds).await?;

    Ok(new_attestation)
}

#[tracing::instrument(skip_all)]
pub(super) async fn attest_inner(
    vault_id: VaultId,
    verifier: &AppleAppAttestationVerifier,
    challenge: String,
    attestation: String,
    webauthn_creds: Vec<WebauthnCredential>,
) -> ApiResult<NewAppleDeviceAttestation> {
    let payload: IosAttestationPayload = serde_json::from_slice(&base64::decode(attestation)?)?;
    let attestation_data = base64::decode(payload.attestation_data)?;

    let client_data = base64::decode(payload.metadata_json_data)?;
    let attested_metadata: AttestedMetadata = serde_json::from_slice(&client_data)?;

    if attested_metadata.attested_challenge != challenge {
        return Err(app_attest::error::AttestationError::InvalidChallenge)?;
    }

    let verified_attest = verifier.attest(&client_data, &attestation_data)?;
    let attest_receipt = verifier.verify_and_parse_receipt(verified_attest.receipt.clone())?;

    if attest_receipt.client_hash != crypto::sha256(&client_data).to_vec() {
        return Err(app_attest::error::AttestationError::InvalidChallenge)?;
    }

    tracing::info!(receipt=?attest_receipt, "verifed attested receipt");

    let (server_receipt, receipt) = verifier
        .fetch_device_check_receipt(verified_attest.is_development, verified_attest.receipt)
        .await?;

    tracing::info!(receipt=?server_receipt, "fetched and verified server receipt");

    let bits = if let Some(device_check_token) = attested_metadata.device_check_token.clone() {
        // fetch the device bits
        verifier
            .query_device_bits(device_check_token.clone(), verified_attest.is_development)
            .await?
    } else {
        None
    };

    Ok(NewAppleDeviceAttestation {
        vault_id,
        webauthn_credential_id: super::util::link_webauthn_credential(
            webauthn_creds,
            attested_metadata.webauthn_device_response_json,
        )?,
        metadata: AppleDeviceMetadata {
            model: attested_metadata.model,
            os: attested_metadata.os,
        },
        receipt,
        raw_attestation: attestation_data,
        is_development: server_receipt.is_sandbox,
        attested_key_id: verified_attest.att_key_id,
        attested_public_key: verified_attest.att_public_key,
        receipt_type: match server_receipt.receipt_type {
            app_attest::apple::device_check::ReceiptType::Attest => {
                newtypes::AppleAttestationReceiptType::Attest
            }
            app_attest::apple::device_check::ReceiptType::Receipt => {
                newtypes::AppleAttestationReceiptType::Receipt
            }
        },
        receipt_risk_metric: server_receipt.risk_metric,
        receipt_expiration: server_receipt.expiration_time,
        receipt_creation: server_receipt.creation_time,
        receipt_not_before: server_receipt.not_before,
        dc_token: attested_metadata.device_check_token,
        dc_bit0: bits.as_ref().map(|b| b.bit0),
        dc_bit1: bits.as_ref().map(|b| b.bit1),
        dc_last_updated: bits.map(|b| b.last_update_time),
        bundle_id: server_receipt.app_id,
    })
}
