use api_core::utils::passkey::SavedAttestationData;
use api_core::FpResult;
use newtypes::WebauthnCredentialId;

/// helper function to link a webauthn cred to an attestation
/// Link the attestation to webauthn credential:
/// if a webauthn key was attested: look for the user's credential and associate
/// the attestation to that passkey
pub(super) fn link_webauthn_credential(
    creds: Vec<db::models::webauthn_credential::WebauthnCredential>,
    webauthn_device_response_json: Option<String>,
) -> FpResult<Option<WebauthnCredentialId>> {
    let Some(webauthn_device_response_json) = webauthn_device_response_json else {
        return Ok(None);
    };

    let attested_registered_credential: webauthn_rs_proto::RegisterPublicKeyCredential =
        serde_json::from_str(&webauthn_device_response_json)?;

    // credential.response.attestation_object
    Ok(creds
        .into_iter()
        .filter_map(|cred| {
            let attestation: SavedAttestationData = serde_cbor::from_slice(&cred.attestation_data).ok()?;

            // match by the raw attestation blob
            if attestation.raw_attestation_object
                == attested_registered_credential.response.attestation_object.0
            {
                Some(cred.id)
            } else {
                None
            }
        })
        .next())
}
