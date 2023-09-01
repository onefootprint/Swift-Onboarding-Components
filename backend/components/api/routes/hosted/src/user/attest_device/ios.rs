use crate::State;

use api_core::errors::ApiResult;

use app_attest::apple::AppleAppAttestationVerifier;

use crypto::base64;

use db::models::{
    apple_device_attest::{AppleDeviceMetadata, NewAppleDeviceAttestation},
    webauthn_credential::WebauthnCredential,
};
use newtypes::VaultId;
use webauthn_rs_proto::RegisterPublicKeyCredential;

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
pub(super) async fn attest(
    state: &State,
    vault_id: VaultId,
    challenge: String,
    attestation: String,
) -> ApiResult<NewAppleDeviceAttestation> {
    let verifier: AppleAppAttestationVerifier = AppleAppAttestationVerifier::new_default_ca(
        vec![
            "5F264K8AG4.com.onefootprint.my",
            "5F264K8AG4.com.onefootprint.my.Clip",
        ],
        &state.config.apple_config.apple_device_check_private_key_pem,
        &state.config.apple_config.apple_device_check_key_id,
        "5F264K8AG4",
    )?;

    let vault_id_copy = vault_id.clone();
    let creds = state
        .db_pool
        .db_query(move |conn| WebauthnCredential::list(conn, &vault_id_copy))
        .await??;

    let new_attestation = attest_inner(vault_id, &verifier, challenge, attestation, creds).await?;

    Ok(new_attestation)
}

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

    // Link the attestation to webauthn credential:
    // if a webauthn key was attested: look for the user's credential and associate
    // the attestation to that passkey
    let webauthn_credential_id =
        if let Some(webauthn_response) = attested_metadata.webauthn_device_response_json {
            let attested_registered_credential: RegisterPublicKeyCredential =
                serde_json::from_str(&webauthn_response)?;

            // credential.response.attestation_object
            webauthn_creds
                .into_iter()
                .filter_map(|cred| {
                    let attestation: crate::user::passkey::SavedAttestationData =
                        serde_cbor::from_slice(&cred.attestation_data).ok()?;

                    // match by the raw attestation blob
                    if attestation.raw_attestation_object
                        == attested_registered_credential.response.attestation_object.0
                    {
                        Some(cred.id)
                    } else {
                        None
                    }
                })
                .next()
        } else {
            None
        };

    Ok(NewAppleDeviceAttestation {
        vault_id,
        metadata: AppleDeviceMetadata {
            model: attested_metadata.model,
            os: attested_metadata.os,
        },
        receipt,
        raw_attestation: attestation_data,
        webauthn_credential_id,
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
