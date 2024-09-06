use crate::auth::user::CheckedUserAuthContext;
use crate::auth::user::UserAuth;
use crate::config::Config;
use crate::FpResult;
use api_errors::AssertionError;
use api_errors::FpErrorCode;
use db::models::liveness_event::NewLivenessEvent;
use db::models::user_timeline::UserTimeline;
use db::models::webauthn_credential::NewWebauthnCredential;
use db::models::webauthn_credential::WebauthnCredential;
use db::TxnPgConn;
use newtypes::AttestationType;
use newtypes::InsightEventId;
use newtypes::LivenessAttributes;
use newtypes::LivenessInfo;
use newtypes::LivenessIssuer;
use newtypes::VaultId;
use serde::Deserialize;
use serde::Serialize;
use webauthn_rs_core::proto::AttestationCaList;
use webauthn_rs_core::proto::AttestationMetadata;
use webauthn_rs_core::proto::Credential;
use webauthn_rs_core::proto::RegistrationState;
use webauthn_rs_core::AttestationFormat;
use webauthn_rs_core::WebauthnCore;
use webauthn_rs_proto::AttestationConveyancePreference;
use webauthn_rs_proto::AuthenticatorAttachment;
use webauthn_rs_proto::COSEAlgorithm;
use webauthn_rs_proto::CreationChallengeResponse;
use webauthn_rs_proto::RegisterPublicKeyCredential;
use webauthn_rs_proto::UserVerificationPolicy;

pub struct WebauthnConfig {
    webauthn: WebauthnCore,
    android_webauthn: WebauthnCore,
}

impl WebauthnConfig {
    pub fn new(config: &Config) -> Self {
        let scheme = if config.rp_id.as_str() == "localhost" {
            "http"
        } else {
            "https"
        };

        let url = format!("{scheme}://{}", &config.rp_id);
        #[allow(clippy::unwrap_used)]
        let url = url::Url::parse(&url).unwrap();
        Self {
            webauthn: WebauthnCore::new_unsafe_experts_only(
                "Footprint",
                &config.rp_id,
                vec![url],
                Some(120 * 1000),
                Some(true),
                Some(true),
            ),
            android_webauthn: Self::android_config(&config.rp_id),
        }
    }

    /// TEMPORARY: workaround for this bug: https://github.com/android/identity-samples/issues/49
    pub fn android_config(rp_id: &str) -> WebauthnCore {
        WebauthnCore::new_unsafe_experts_only(
            "Footprint",
            rp_id,
            vec![
                #[allow(clippy::unwrap_used)]
                url::Url::parse("android:apk-key-hash:D_woKFaP1yeRthdVOKrD03l1Dx6xKjgv7cCoE13UXcg").unwrap(),
            ],
            Some(120 * 1000),
            Some(false),
            Some(true),
        )
    }

    pub fn webauthn(&self) -> &WebauthnCore {
        &self.webauthn
    }

    /// Proxy between the webauthn and webauthn_android credential
    pub fn register_credential(
        self,
        reg: &RegisterPublicKeyCredential,
        reg_state: &RegistrationState,
        cas: Option<&AttestationCaList>,
    ) -> FpResult<Credential> {
        let cred = if is_android(&reg.response.client_data_json.0)? {
            self.android_webauthn.register_credential(reg, reg_state, cas)?
        } else {
            self.webauthn.register_credential(reg, reg_state, cas)?
        };
        Ok(cred)
    }
}

impl WebauthnConfig {
    pub fn initiate_challenge(
        self,
        vault_id: VaultId,
    ) -> FpResult<(CreationChallengeResponse, RegistrationState)> {
        let (challenge, reg_state) = self.webauthn().generate_challenge_register_options(
            vault_id.to_string().as_bytes(),
            "Footprint",
            "Footprint",
            AttestationConveyancePreference::Direct,
            Some(UserVerificationPolicy::Required),
            None,
            None,
            COSEAlgorithm::all_possible_algs(),
            false,
            Some(AuthenticatorAttachment::Platform),
            false,
        )?;
        Ok((challenge, reg_state))
    }

    pub fn verify_challenge(
        self,
        reg_state: RegistrationState,
        challenge_response: String,
    ) -> FpResult<VerifyChallengeResult> {
        let reg: RegisterPublicKeyCredential = serde_json::from_str(&challenge_response)?;

        // Validate the challenge response
        let cred = match self.register_credential(&reg, &reg_state, None) {
            Ok(cred) => cred,
            // temporary addition to detect some webauthn issues on windows devices
            Err(err) if err.code() == Some(FpErrorCode::ParseNomFailure) => {
                tracing::info!(challenge_response=%challenge_response, "webauthn parse NOM failure");
                return Err(err);
            }
            Err(err) => return Err(err),
        };

        // if the attestation format is android or apple, verify the attestation chain
        // with a trust anchor
        if matches!(
            cred.attestation_format,
            AttestationFormat::AndroidKey
                | AttestationFormat::AndroidSafetyNet
                | AttestationFormat::AppleAnonymous
        ) {
            tracing::info!("verifying trust anchor for webauthn credential");
            let _ = webauthn_rs_core::verify_attestation_ca_chain(
                &cred.attestation.data,
                &AttestationCaList::apple_and_android(),
                false,
            )?;
            tracing::info!("successfully verified trust anchor for webauthn credential");
        }

        // Compose attestation data
        let attestation_data_to_save = SavedAttestationData {
            attested_metadata: cred.attestation.metadata.clone(),
            raw_attestation_object: reg.response.attestation_object.0,
        };
        let (attestation_type, liveness_event_attributes) = match &cred.attestation_format {
            AttestationFormat::AppleAnonymous => (
                AttestationType::Apple,
                Some(LivenessAttributes {
                    issuers: vec![LivenessIssuer::Apple, LivenessIssuer::Footprint],
                    ..Default::default()
                }),
            ),
            AttestationFormat::AndroidKey => (
                AttestationType::AndroidKey,
                Some(LivenessAttributes {
                    issuers: vec![LivenessIssuer::Google, LivenessIssuer::Footprint],
                    metadata: Some(serde_json::to_value(&attestation_data_to_save.attested_metadata)?),
                    ..Default::default()
                }),
            ),
            AttestationFormat::AndroidSafetyNet => (
                AttestationType::AndroidSafetyNet,
                Some(LivenessAttributes {
                    issuers: vec![LivenessIssuer::Google, LivenessIssuer::Footprint],
                    metadata: Some(serde_json::to_value(&attestation_data_to_save.attested_metadata)?),
                    ..Default::default()
                }),
            ),
            AttestationFormat::None => (AttestationType::None, None),
            _ => (AttestationType::Unknown, None),
        };
        tracing::info!(attestation=?attestation_data_to_save, "attestation details");

        let result = VerifyChallengeResult {
            liveness_event_attributes,
            cred,
            attestation_type,
            attestation_data: attestation_data_to_save,
        };
        Ok(result)
    }
}

pub struct VerifyChallengeResult {
    liveness_event_attributes: Option<LivenessAttributes>,
    cred: Credential,
    attestation_type: AttestationType,
    attestation_data: SavedAttestationData,
}

impl VerifyChallengeResult {
    pub fn save_credential(
        self,
        conn: &mut TxnPgConn,
        user_auth: &CheckedUserAuthContext,
        ie_id: InsightEventId,
    ) -> FpResult<WebauthnCredential> {
        let vault_id = user_auth.user_vault_id();
        let Self {
            liveness_event_attributes,
            cred,
            attestation_type,
            attestation_data,
        } = self;
        let attestation_data = serde_cbor::to_vec(&attestation_data)?;
        let su_id = user_auth
            .scoped_user_id()
            .ok_or(AssertionError("No scoped vault available"))?;

        if let Some(attributes) = liveness_event_attributes {
            // Create a liveness event and timeline event
            let liveness_event = NewLivenessEvent {
                scoped_vault_id: su_id.clone(),
                liveness_source: newtypes::LivenessSource::WebauthnAttestation,
                attributes: Some(attributes),
                insight_event_id: Some(ie_id.clone()),
                skip_context: None,
            }
            .insert(conn)?;
            // create the timeline event for a liveness
            let info = LivenessInfo {
                id: liveness_event.id,
            };
            UserTimeline::create(conn, info, vault_id.clone(), su_id.clone())?;
        }

        // Save the webauthn credential to the DB
        let public_key = crypto::serde_cbor::to_vec(&cred.cred).map_err(crypto::Error::Cbor)?;
        let credential = NewWebauthnCredential {
            scoped_vault_id: su_id,
            vault_id: vault_id.clone(),
            credential_id: cred.cred_id.0,
            public_key,
            attestation_data,
            backup_eligible: cred.backup_eligible,
            backup_state: cred.backup_state,
            attestation_type,
            insight_event_id: ie_id,
        }
        .save(conn)?;
        Ok(credential)
    }
}

/// this is the format of the stored attestation data
#[derive(Debug, Serialize, Deserialize)]
pub struct SavedAttestationData {
    #[serde(rename = "meta")]
    pub attested_metadata: AttestationMetadata,
    #[serde(rename = "raw")]
    pub raw_attestation_object: Vec<u8>,
}

/// currently android likely has a bug with the wrong origin
/// so we have a heuristic to check that here
fn is_android(client_data_json: &[u8]) -> FpResult<bool> {
    Ok(serde_json::from_slice::<serde_json::Value>(client_data_json)?
        .as_object()
        .map(|map| matches!(map.get("androidPackageName"), Some(serde_json::Value::String(val)) if val.as_str() == "com.onefootprint.my"))
        .unwrap_or(false))
}

#[cfg(test)]
mod tests {
    use super::is_android;
    use crate::utils::passkey::WebauthnConfig;
    use webauthn_rs_core::proto::AttestationCaList;
    use webauthn_rs_core::verify_attestation_ca_chain;
    use webauthn_rs_core::WebauthnCore;

    #[test]
    fn test_android_origin_workaround() {
        let json = serde_json::json!({
          "rawId": "ASgOR9O1Yuy2GP/QxpzTezkQbtSePp7kA7nVNk9Gd33RYgFjylr9PqXCBs5DN4w+/k0toSOhW3SWwHEYgL1u5Ks=",
          "id": "ASgOR9O1Yuy2GP/QxpzTezkQbtSePp7kA7nVNk9Gd33RYgFjylr9PqXCBs5DN4w+/k0toSOhW3SWwHEYgL1u5Ks=",
          "type": "public-key",
          "response": {
            "clientDataJSON": "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiWkdJWmV2aTVOX0pHR2Z6dXpiM2ltRFYxY3g1Vm45amtDeW43aDNSQ0VsOCIsIm9yaWdpbiI6ImFuZHJvaWQ6YXBrLWtleS1oYXNoOkRfd29LRmFQMXllUnRoZFZPS3JEMDNsMUR4NnhLamd2N2NDb0UxM1VYY2ciLCJhbmRyb2lkUGFja2FnZU5hbWUiOiJjb20ub25lZm9vdHByaW50Lm15In0",
            "attestationObject": "o2NmbXRxYW5kcm9pZC1zYWZldHluZXRnYXR0U3RtdKJjdmVyaTIzMzAxMzA0NGhyZXNwb25zZVkhYWV5SmhiR2NpT2lKU1V6STFOaUlzSW5nMVl5STZXeUpOU1VsR1lsUkRRMEpHVjJkQmQwbENRV2RKVVdWbFVVMU1lSEJJT0RselUyTlRUMEowYmsxVGVXcEJUa0puYTNGb2EybEhPWGN3UWtGUmMwWkJSRUpIVFZGemQwTlJXVVJXVVZGSFJYZEtWbFY2UldsTlEwRkhRVEZWUlVOb1RWcFNNamwyV2pKNGJFbEdVbmxrV0U0d1NVWk9iR051V25CWk1sWjZTVVY0VFZGNlJWUk5Ra1ZIUVRGVlJVRjRUVXRTTVZKVVNVVk9Ra2xFUmtWT1JFRmxSbmN3ZVUxNlFURk5la0YzVDBSRmQwNVVhR0ZHZHpCNVRYcEJORTFxWjNkUFJFVjNUbFJrWVUxQ01IaEhla0ZhUW1kT1ZrSkJUVlJGYlVZd1pFZFdlbVJETldoaWJWSjVZakpzYTB4dFRuWmlWRU5EUVZOSmQwUlJXVXBMYjFwSmFIWmpUa0ZSUlVKQ1VVRkVaMmRGVUVGRVEwTkJVVzlEWjJkRlFrRktWRlUyUjJwSVpHUlBjWE50UzNNNVRsWjRXbUZ0VEd4c1FsSjVLelZGYlhreE9HNVpXa05aVUZWVE9ITlRNekpJVTBGTVkwcHhibFJEYkVwWGRFeGtOaTlvWlc4MFYzcEpWbEJGYUZWVVdrWkRkRGgyYTNFdmFVWllUbWhMWWsxVVMwRTFVUzlPU0RReldFWjFWRmhXY0U0M09HOTZhbU5TTlhwVWFEaEJOUzltUm1GM2RERlVaMloxVTJzM05WVkhNekp1V1RjNVZVdG5lbE5MVUdaYWExaHJNVUY0TUVRNVJUbHBWRzFPTjJScGNrdHZUVzlDVlZGT1FrOUxSRWRyUVdsdU4zbENUa1JJVVc0M1EwNTNVemRHUWxvcllWSllVR1Y2YmxOM2VYQm1TMFJqZG1KUk9Vd3daM3ByUTIxUldXTlFkbWRzZWpWVGJHdDBaQ3RoV1c4M2RrUnJRalo0UzNCTlpEWnhORGhETWl0cmVUTjNTVkp0UVVwMlFtTnpPR0pST1dWSFoxQlJZMDVxVG10NlRVdDNaVU0xTWk5R1ZVTjJRbWx5VkRKT1ZrWmFRMFZKWkcxTlp6bDRZakJMZURWMFVqQkRRWGRGUVVGaFQwTkJialIzWjJkS05rMUJORWRCTVZWa1JIZEZRaTkzVVVWQmQwbEdiMFJCVkVKblRsWklVMVZGUkVSQlMwSm5aM0pDWjBWR1FsRmpSRUZVUVUxQ1owNVdTRkpOUWtGbU9FVkJha0ZCVFVJd1IwRXhWV1JFWjFGWFFrSlVVRkZTU1hORGVDOHpORmxPYnpGSk0yRndTMWxOYnpobVFtOXFRV1pDWjA1V1NGTk5SVWRFUVZkblFsRnNOR2huVDNOc1pWSnNRM0pzTVVZeVIydEpVR1ZWTjA4MGEycENOMEpuWjNKQ1owVkdRbEZqUWtGUlVuWk5SekIzVDBGWlNVdDNXVUpDVVZWSVRVRkhSMHhIYURCa1NFRTJUSGs1ZGxrelRuZE1ia0p5WVZNMWJtSXlPVzVNTTAxMldqTlNlazFYVVRCaFZ6VXdUREJLVlZOWFRtcFNSa1o2WVVWU1VrMUVSVWREUTNOSFFWRlZSa0o2UVVOb2FWWnZaRWhTZDA5cE9IWmpSM1J3VEcxa2RtSXlZM1pqYlZaM1luazVhbHBZU2pCamVUbHVaRWhOZUZwRVVYVmFSMVo1VFVJd1IwRXhWV1JGVVZGWFRVSlRRMFZ0UmpCa1IxWjZaRU0xYUdKdFVubGlNbXhyVEcxT2RtSlVRV2hDWjA1V1NGTkJSVWRxUVZsTlFXZEhRbTFsUWtSQlJVTkJWRUZOUW1kdmNrSm5SVVZCWkZvMVFXZFZSRTFFT0VkQk1WVmtTSGRSTkUxRVdYZE9TMEY1YjBSRFIweHRhREJrU0VFMlRIazVhbU50ZUhwTWJrSnlZVk0xYm1JeU9XNU1NbVF3WTNwR2EwNUhiSFZrUXpsWlRXdHZlVk5JU21aT01VSndWRk0xYW1OdGQzZG5aMFZFUW1kdmNrSm5SVVZCWkZvMVFXZFJRMEpKU0RCQ1NVaDRRVTg0UVdSUlEzUTVOemMyWmxBNFVYbEpkV1JRV25kbFVHaG9jWFJIWTNCWVl5dDRSRU5VUzJoWldUQTJPWGxEYVdkQlFVRlphSEkzVFRCTFFVRkJSVUYzUWtkTlJWRkRTVWR4TkhwUFpVNVpOMEV2ZFhKMlRsWTJjWFp4VlVrMGJYRmhVelZ0VkVvd2RGRXdOalppVlZoNWEwUkJhVUo0U1UxeUwwSlRTVnBrTDFCVU5tZHBSQ3Q1UTNWSVJHVktkVWxEYzBsS2JuZHRWRGhhTkhwd2N5OTNRakpCVEU1NlpIZG1hR2hHUkRSWk5HSlhRbUZ1WTBWUmJFdGxVeko0V25kM1RHZzVlbmRCZHpVMVRuRlhZVUZCUVVKcFIzWnplVk4zUVVGQlVVUkJSV04zVWxGSloyWnlTa2RTVjIwMlUwbG9lRFEzUkd4R0t6bFZiVU56WlVWRU9YSjJPVTFTU2xZeFExSTBPVGhhZFhORFNWRkRRV3R0TWpkQlFrcGhLMWxTUVhremVHOHpNWGx5ZHpCT2Nsb3hOalJVUXpjNUwzcGtSWEJWTkhCYWFrRk9RbWRyY1docmFVYzVkekJDUVZGelJrRkJUME5CVVVWQlkzTmtiV0pUV0UwdldYQldOalZCUXpsUVduUktlR0paTlUxemVFSkRSa05rTTJOV01sUkpNaklyWTJndmIxRjRLMmRCUkZGbE1tSnliV3MzYWxoRkx6UkhPV3BLUTA0dmRtOWxZbXgwVEVaV1NXNXNhRGgyVkZsbVJrNXhaMDl6TkZwRlduSTBTRTFIWkhaRWJWVmlVRUZ0ZDB4YVNrWTBWVVU1TjAxR1V6QXdZMmQ1TldGWWVYVmFiVFZJWlhBdmJEQjNTVEJGV1ZBM09FNW5VRmgxVWpsemEyNUhaa2N4YUN0elFUTjFUVVFyUnl0c2NrSnVkWGQzVGxodk1FVndaMjVDZDJ3NFowWlVkbVJLVEVKelVtSkRhRmxRVkZSUWNIQklVbk55VVZFNFZFUkRlVmxHVXk5elZTOVpOekJOTkRBMk1rUm9NM0l4SzJaQmJ5OUNPVFZ3ZEZOVVRtTnBkVXhyU0M5VFIwZFlVVUZ5VHk5eEsyMU1kRmg1U1VOb1NtWlNVRWd6WWtKU0syVmtXWFpTVkRWRFNVa3ZRak14YlVOdmFuZHFSMjU0VDNkamJXUjNRVXhZU3pJNFZFazRWMnRYTVdOUlBUMGlMQ0pOU1VsR2FrUkRRMEV6VTJkQmQwbENRV2RKVGtGblEwOXpaMGw2VG0xWFRGcE5NMkp0ZWtGT1FtZHJjV2hyYVVjNWR6QkNRVkZ6UmtGRVFraE5VWE4zUTFGWlJGWlJVVWRGZDBwV1ZYcEZhVTFEUVVkQk1WVkZRMmhOV2xJeU9YWmFNbmhzU1VaU2VXUllUakJKUms1c1kyNWFjRmt5Vm5wSlJYaE5VWHBGVlUxQ1NVZEJNVlZGUVhoTlRGSXhVbFJKUmtwMllqTlJaMVZxUlhkSWFHTk9UV3BCZDA5RVJYcE5SRUYzVFVSUmVWZG9ZMDVOYW1OM1QxUk5kMDFFUVhkTlJGRjVWMnBDUjAxUmMzZERVVmxFVmxGUlIwVjNTbFpWZWtWcFRVTkJSMEV4VlVWRGFFMWFVakk1ZGxveWVHeEpSbEo1WkZoT01FbEdUbXhqYmxwd1dUSldla2xGZUUxUmVrVlVUVUpGUjBFeFZVVkJlRTFMVWpGU1ZFbEZUa0pKUkVaRlRrUkRRMEZUU1hkRVVWbEtTMjlhU1doMlkwNUJVVVZDUWxGQlJHZG5SVkJCUkVORFFWRnZRMmRuUlVKQlMzWkJjWEZRUTBVeU4yd3dkemw2UXpoa1ZGQkpSVGc1WWtFcmVGUnRSR0ZITjNrM1ZtWlJOR01yYlU5WGFHeFZaV0pWVVhCTE1IbDJNbkkyTnpoU1NrVjRTekJJVjBScVpYRXJia3hKU0U0eFJXMDFhalp5UVZKYWFYaHRlVkpUYW1oSlVqQkxUMUZRUjBKTlZXeGtjMkY2ZEVsSlNqZFBNR2N2T0RKeGFpOTJSMFJzTHk4emREUjBWSEY0YVZKb1RGRnVWRXhZU21SbFFpc3lSR2hyWkZVMlNVbG5lRFozVGpkRk5VNWpWVWd6VW1OelpXcGpjV280Y0RWVGFqRTVka0p0Tm1reFJtaHhURWQ1YldoTlJuSnZWMVpWUjA4emVIUkpTRGt4WkhObmVUUmxSa3RqWmt0V1RGZExNMjh5TVRrd1VUQk1iUzlUYVV0dFRHSlNTalZCZFRSNU1XVjFSa3B0TWtwTk9XVkNPRFJHYTNGaE0ybDJjbGhYVldWV2RIbGxNRU5SWkV0MmMxa3lSbXRoZW5aNGRIaDJkWE5NU25wTVYxbElhelUxZW1OU1FXRmpSRUV5VTJWRmRFSmlVV1pFTVhGelEwRjNSVUZCWVU5RFFWaFpkMmRuUm5sTlFUUkhRVEZWWkVSM1JVSXZkMUZGUVhkSlFtaHFRV1JDWjA1V1NGTlZSVVpxUVZWQ1oyZHlRbWRGUmtKUlkwUkJVVmxKUzNkWlFrSlJWVWhCZDBsM1JXZFpSRlpTTUZSQlVVZ3ZRa0ZuZDBKblJVSXZkMGxDUVVSQlpFSm5UbFpJVVRSRlJtZFJWVXBsU1ZsRWNrcFlhMXBSY1RWa1VtUm9jRU5FTTJ4UGVuVktTWGRJZDFsRVZsSXdha0pDWjNkR2IwRlZOVXM0Y2twdVJXRkxNR2R1YUZNNVUxcHBlblk0U1d0VVkxUTBkMkZCV1VsTGQxbENRbEZWU0VGUlJVVllSRUpoVFVOWlIwTkRjMGRCVVZWR1FucEJRbWhvY0c5a1NGSjNUMms0ZG1JeVRucGpRelYzWVRKcmRWb3lPWFphZVRsdVpFaE9lVTFVUVhkQ1oyZHlRbWRGUmtKUlkzZEJiMWxyWVVoU01HTkViM1pNTTBKeVlWTTFibUl5T1c1TU0wcHNZMGM0ZGxreVZubGtTRTEyV2pOU2VtTnFSWFZhUjFaNVRVUlJSMEV4VldSSWQxRjBUVU56ZDB0aFFXNXZRMWRIU1RKb01HUklRVFpNZVRscVkyMTNkV05IZEhCTWJXUjJZakpqZGxvelVucGpha1YyV2pOU2VtTnFSWFZaTTBwelRVVXdSMEV4VldSSlFWSkhUVVZSZDBOQldVZGFORVZOUVZGSlFrMUVaMGREYVhOSFFWRlJRakZ1YTBOQ1VVMTNTMnBCYjBKblozSkNaMFZHUWxGalEwRlNXV05oU0ZJd1kwaE5Oa3g1T1hkaE1tdDFXakk1ZGxwNU9YbGFXRUoyWXpKc01HSXpTalZNZWtGT1FtZHJjV2hyYVVjNWR6QkNRVkZ6UmtGQlQwTkJaMFZCU1ZaVWIza3lOR3AzV0ZWeU1ISkJVR001TWpSMmRWTldZa3RSZFZsM00yNU1abXhNWmt4b05VRlpWMFZsVm13dlJIVXhPRkZCVjFWTlpHTktObTh2Y1VaYVltaFlhMEpJTUZCT1kzYzVOM1JvWVdZeVFtVnZSRmxaT1VOckwySXJWVWRzZFdoNE1EWjZaRFJGUW1ZM1NEbFFPRFJ1Ym5KM2NGSXJORWRDUkZwTEsxaG9NMGt3ZEhGS2VUSnlaMDl4VGtSbWJISTFTVTFST0ZwVVYwRXplV3gwWVd0NlUwSkxXalpZY0VZd1VIQnhlVU5TZG5BdlRrTkhkakpMV0RKVWRWQkRTblp6WTNBeEwyMHljRlpVZEhsQ2FsbFFVbEVyVVhWRFVVZEJTa3RxZEU0M1VqVkVSbkptVkhGTlYzWlpaMVpzY0VOS1FtdDNiSFUzS3pkTFdUTmpWRWxtZWtVM1kyMUJUSE5yVFV0T1RIVkVlaXRTZWtOamMxbFVjMVpoVlRkV2NETjRURFl3VDFsb2NVWnJkVUZQVDNoRVdqWndTRTlxT1N0UFNtMVpaMUJ0VDFRMFdETXJOMHcxTVdaWVNubFNTRGxMWmt4U1VEWnVWRE14UkRWdWJYTkhRVTluV2pJMkx6aFVPV2h6UWxjeGRXODVhblUxWmxwTVdsaFdWbE0xU0RCSWVVbENUVVZMZVVkTlNWQm9SbGR5YkhRdmFFWlRNamhPTVhwaFMwa3dXa0pIUkRObldXZEVUR0pwUkZRNVprZFljM1J3YXl0R2JXTTBiMnhXYkZkUWVsaGxPREYyWkc5RmJrWmljalZOTWpjeVNHUm5TbGR2SzFkb1ZEbENXVTB3U21rcmQyUldiVzVTWm1aWVoyeHZSVzlzZFZST1kxZDZZelF4WkVad1owcDFPR1pHTTB4SE1HZHNNbWxpVTFscFEyazVZVFpvZGxVd1ZIQndha3A1U1ZkWWFHdEtWR05OU214UWNsZDRNVlo1ZEVWVlIzSllNbXd3U2tSM1VtcFhMelkxTm5Jd1MxWkNNREo0U0ZKTGRtMHlXa3RKTUROVVoyeE1TWEJ0VmtOTE0ydENTMnRMVG5CQ1RtdEdkRGh5YUdGbVkwTkxUMkk1U25ndk9YUndUa1pzVVZSc04wSXpPWEpLYkVwWGExSXhOMUZ1V25GV2NIUkdaVkJHVDFKdldtMUdlazA5SWl3aVRVbEpSbGxxUTBOQ1JYRm5RWGRKUWtGblNWRmtOekJPWWs1ek1pdFNjbkZKVVM5Rk9FWnFWRVJVUVU1Q1oydHhhR3RwUnpsM01FSkJVWE5HUVVSQ1dFMVJjM2REVVZsRVZsRlJSMFYzU2tOU1ZFVmFUVUpqUjBFeFZVVkRhRTFSVWpKNGRsbHRSbk5WTW14dVltbENkV1JwTVhwWlZFVlJUVUUwUjBFeFZVVkRlRTFJVlcwNWRtUkRRa1JSVkVWaVRVSnJSMEV4VlVWQmVFMVRVako0ZGxsdFJuTlZNbXh1WW1sQ1UySXlPVEJKUlU1Q1RVSTBXRVJVU1hkTlJGbDRUMVJCZDAxRVFUQk5iRzlZUkZSSk5FMUVSWGxQUkVGM1RVUkJNRTFzYjNkU2VrVk1UVUZyUjBFeFZVVkNhRTFEVmxaTmVFbHFRV2RDWjA1V1FrRnZWRWRWWkhaaU1tUnpXbE5DVldOdVZucGtRMEpVV2xoS01tRlhUbXhqZVVKTlZFVk5lRVpFUVZOQ1owNVdRa0ZOVkVNd1pGVlZlVUpUWWpJNU1FbEdTWGhOU1VsRFNXcEJUa0puYTNGb2EybEhPWGN3UWtGUlJVWkJRVTlEUVdjNFFVMUpTVU5EWjB0RFFXZEZRWFJvUlVOcGVEZHFiMWhsWWs4NWVTOXNSRFl6YkdGa1FWQkxTRGxuZG13NVRXZGhRMk5tWWpKcVNDODNOazUxT0dGcE5saHNOazlOVXk5cmNqbHlTRFY2YjFGa2MyWnVSbXc1TjNaMVprdHFObUozVTJsV05tNXhiRXR5SzBOTmJuazJVM2h1UjFCaU1UVnNLemhCY0dVMk1tbHRPVTFhWVZKM01VNUZSRkJxVkhKRlZHODRaMWxpUlhaekwwRnRVVE0xTVd0TFUxVnFRalpITURCcU1IVlpUMFJRTUdkdFNIVTRNVWs0UlRORGQyNXhTV2x5ZFRaNk1XdGFNWEVyVUhOQlpYZHVha2g0WjNOSVFUTjVObTFpVjNkYVJISllXV1pwV1dGU1VVMDVjMGh0YTJ4RGFYUkVNemh0TldGblNTOXdZbTlRUjJsVlZTczJSRTl2WjNKR1dsbEtjM1ZDTm1wRE5URXhjSHB5Y0RGYWEybzFXbEJoU3pRNWJEaExSV280UXpoUlRVRk1XRXd6TW1nM1RURmlTM2RaVlVnclJUUkZlazVyZEUxbk5sUlBPRlZ3YlhaTmNsVndjM2xWY1hSRmFqVmpkVWhMV2xCbWJXZG9RMDQyU2pORGFXOXFOazlIWVVzdlIxQTFRV1pzTkM5WWRHTmtMM0F5YUM5eWN6TTNSVTlsV2xaWWRFd3diVGM1V1VJd1pYTlhRM0oxVDBNM1dFWjRXWEJXY1RsUGN6WndSa3hMWTNkYWNFUkpiRlJwY25oYVZWUlJRWE0yY1hwcmJUQTJjRGs0WnpkQ1FXVXJaRVJ4Tm1SemJ6UTVPV2xaU0RaVVMxZ3ZNVmszUkhwcmRtZDBaR2w2YW10WVVHUnpSSFJSUTNZNVZYY3JkM0E1VlRkRVlrZExiMmRRWlUxaE0wMWtLM0IyWlhvM1Z6TTFSV2xGZFdFckszUm5lUzlDUW1wR1JrWjVNMnd6VjBad1R6bExWMmQ2TjNwd2JUZEJaVXRLZERoVU1URmtiR1ZEWm1WWWEydFZRVXRKUVdZMWNXOUpZbUZ3YzFwWGQzQmlhMDVHYUVoaGVESjRTVkJGUkdkbVp6RmhlbFpaT0RCYVkwWjFZM1JNTjFSc1RHNU5VUzh3YkZWVVltbFRkekZ1U0RZNVRVYzJlazh3WWpsbU5rSlJaR2RCYlVRd05ubExOVFp0UkdOWlFscFZRMEYzUlVGQllVOURRVlJuZDJkblJUQk5RVFJIUVRGVlpFUjNSVUl2ZDFGRlFYZEpRbWhxUVZCQ1owNVdTRkpOUWtGbU9FVkNWRUZFUVZGSUwwMUNNRWRCTVZWa1JHZFJWMEpDVkd0eWVYTnRZMUp2Y2xORFpVWk1NVXB0VEU4dmQybFNUbmhRYWtGbVFtZE9Wa2hUVFVWSFJFRlhaMEpTWjJVeVdXRlNVVEpZZVc5c1VVd3pNRVY2VkZOdkx5OTZPVk42UW1kQ1oyZHlRbWRGUmtKUlkwSkJVVkpWVFVaSmQwcFJXVWxMZDFsQ1FsRlZTRTFCUjBkSFYyZ3daRWhCTmt4NU9YWlpNMDUzVEc1Q2NtRlROVzVpTWpsdVRESmtlbU5xUlhkTFVWbEpTM2RaUWtKUlZVaE5RVXRIU0Zkb01HUklRVFpNZVRsM1lUSnJkVm95T1haYWVUbHVZek5KZUV3eVpIcGpha1YxV1ROS01FMUVTVWRCTVZWa1NIZFJjazFEYTNkS05rRnNiME5QUjBsWGFEQmtTRUUyVEhrNWFtTnRkM1ZqUjNSd1RHMWtkbUl5WTNaYU0wNTVUVk01Ym1NelNYaE1iVTU1WWtSQk4wSm5UbFpJVTBGRlRrUkJlVTFCWjBkQ2JXVkNSRUZGUTBGVVFVbENaMXB1WjFGM1FrRm5TWGRFVVZsTVMzZFpRa0pCU0ZkbFVVbEdRWGRKZDBSUldVeExkMWxDUWtGSVYyVlJTVVpCZDAxM1JGRlpTa3R2V2tsb2RtTk9RVkZGVEVKUlFVUm5aMFZDUVVSVGEwaHlSVzl2T1VNd1pHaGxiVTFZYjJnMlpFWlRVSE5xWW1SQ1drSnBUR2M1VGxJemREVlFLMVEwVm5obWNUZDJjV1pOTDJJMVFUTlNhVEZtZVVwdE9XSjJhR1JIWVVwUk0ySXlkRFo1VFVGWlRpOXZiRlZoZW5OaFRDdDVlVVZ1T1Zkd2NrdEJVMDl6YUVsQmNrRnZlVnBzSzNSS1lXOTRNVEU0Wm1WemMyMVliakZvU1ZaM05ERnZaVkZoTVhZeGRtYzBSblkzTkhwUWJEWXZRV2hUY25jNVZUVndRMXBGZERSWGFUUjNVM1I2Tm1SVVdpOURURUZPZURoTVdtZ3hTamRSU2xacU1tWm9UWFJtVkVweU9YYzBlak13V2pJd09XWlBWVEJwVDAxNUszRmtkVUp0Y0haMldYVlNOMmhhVERaRWRYQnplbVp1ZHpCVGEyWjBhSE14T0dSSE9WcExZalU1VldoMmJXRlRSMXBTVm1KT1VYQnpaek5DV214MmFXUXdiRWxMVHpKa01YaHZlbU5zVDNwbmFsaFFXVzkyU2twSmRXeDBlbXROZFRNMGNWRmlPVk42TDNscGJISmlRMmRxT0QwaVhYMC5leUp1YjI1alpTSTZJa1o1TDFWNFNIcHBlVUZ6VDJGdE0zSTFiM0ZaU1dad1MycENVSFo1U2pWWWVqUmpjMWRRYjBZNU5VMDlJaXdpZEdsdFpYTjBZVzF3VFhNaU9qRTJPVEU1TkRBek5USXpOemtzSW1Gd2ExQmhZMnRoWjJWT1lXMWxJam9pWTI5dExtZHZiMmRzWlM1aGJtUnliMmxrTG1kdGN5SXNJbUZ3YTBScFoyVnpkRk5vWVRJMU5pSTZJblZXVTBsSlNWWlBVREZvVm5ScmFGTnpZVXhxZFhJdldXcDZZM28wUTJoQkswbFJWMVZXZURVNFMxazlJaXdpWTNSelVISnZabWxzWlUxaGRHTm9JanAwY25WbExDSmhjR3REWlhKMGFXWnBZMkYwWlVScFoyVnpkRk5vWVRJMU5pSTZXeUk0VURGelZ6QkZVRXBqYzJ4M04xVjZVbk5wV0V3Mk5IY3JUelV3UldRclVrSkpRM1JoZVRGbk1qUk5QU0pkTENKaVlYTnBZMGx1ZEdWbmNtbDBlU0k2ZEhKMVpTd2laWFpoYkhWaGRHbHZibFI1Y0dVaU9pSkNRVk5KUXl4SVFWSkVWMEZTUlY5Q1FVTkxSVVFpTENKa1pYQnlaV05oZEdsdmJrbHVabTl5YldGMGFXOXVJam9pVkdobElGTmhabVYwZVU1bGRDQkJkSFJsYzNSaGRHbHZiaUJCVUVrZ2FYTWdaR1Z3Y21WallYUmxaQzRnU1hRZ2FYTWdjbVZqYjIxdFpXNWtaV1FnZEc4Z2RYTmxJSFJvWlNCUWJHRjVJRWx1ZEdWbmNtbDBlU0JCVUVrNklHaDBkSEJ6T2k4dlp5NWpieTl3YkdGNUwzTmhabVYwZVc1bGRDMTBhVzFsYkdsdVpTNGlmUS5OdEkxVTZjeWtNcnNUUllWeWw3Y2VKam5nVGJLZEpNVUQtOUNscVhpQkp5LVhyTFIydlZyNXVtcVdhQzBlWmxhejFUTTNwWHBnZzZ4dG5aa01TWjRURnZNYkN5UDlhNFR5WEl0MU5XZWtXenBLQnN3NTUxQTB1QUQ5UjNsaV9WMmlQbFQwdV9vWTUxWlNqTGctSF9Pb2QxWVRhaGpGVXdGeGZZSGltOXVfUTU2X0ZBek5TR2IwRGZOeTlXWkp5azZSLXluaktXUktYN0F3NGFkUVF2cHlXaHd5LWc0WjVpbW9FbjgtTF9wX3k3QURGcFpvUnhFcThtNE5KNDdZMXhWM1JVa3lzcGFoTGY4dVJUQnJyREh1TU9jQ2d4aFV5T2hFOENUU3ZRU0xMbXdmQnFrRVNfZHVZRG1rd01TOVN4LUYzdE5wLXhjU3RISjZ0SzZVX25DWFFoYXV0aERhdGFYxeaUOqZ__grea8ztoioCdTYv_422QtK0ZXt4vwkEruQIRQAAAAC5P9lh8uZGL7EiggAiR954AEEBKA5H07Vi7LYY_9DGnNN7ORBu1J4-nuQDudU2T0Z3fdFiAWPKWv0-pcIGzkM3jD7-TS2hI6FbdJbAcRiAvW7kq6UBAgMmIAEhWCBqytyWfZXZfIDuf1-sK13bYt-vaFLxfV8V0tM14A6jdSJYIEr78H9RTt3ddGTZukZsIUmVW0x_jBnG_GMgGcwOlfQS"
          }
        }
        );

        let reg: webauthn_rs_proto::RegisterPublicKeyCredential =
            serde_json::from_value(json).expect("invalid inner json");

        assert!(is_android(&reg.response.client_data_json.0).expect("failed to check android"));

        let config = WebauthnConfig::android_config("onefootprint.com");

        let reg_state = serde_json::json!({
          "policy": "required",
          "exclude_credentials": [],
          "challenge": "ZGIZevi5N_JGGfzuzb3imDV1cx5Vn9jkCyn7h3RCEl8",
          "credential_algorithms": [
            "ES256",
            "RS256"
          ],
          "require_resident_key": false,
          "authenticator_attachment": "platform",
          "extensions": {},
          "experimental_allow_passkeys": true
        });

        let reg_state = serde_json::from_value(reg_state).unwrap();

        let cred = config
            .register_credential(&reg, &reg_state, None)
            .expect("reg failed");
        assert_eq!(
            cred.attestation_format,
            webauthn_rs_core::AttestationFormat::AndroidSafetyNet
        );

        let _ = verify_attestation_ca_chain(
            &cred.attestation.data,
            &AttestationCaList::apple_and_android(),
            true,
        )
        .expect("failed to verify ca chain");
    }

    #[test]
    fn test_windows_tpm() {
        let json = serde_json::json!(
                    {
          "rawId": "aWOpr9uLbtBACCnjzsjVyceFIr3Pc2I_ilIUXq1gJ_E",
          "id": "aWOpr9uLbtBACCnjzsjVyceFIr3Pc2I_ilIUXq1gJ_E",
          "type": "public-key",
          "response": {
            "clientDataJSON": "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiNUhlUi1UZHZia0VoQ2tteUFxZFFNaVJPb2tMQmpoNHRWQlQ3bVZuWjlYTSIsIm9yaWdpbiI6Imh0dHBzOi8vaGFuZG9mZi5vbmVmb290cHJpbnQuY29tIiwiY3Jvc3NPcmlnaW4iOmZhbHNlfQ",
            "attestationObject":"o2NmbXRjdHBtZ2F0dFN0bXSmY2FsZzn__mNzaWdZAQB3f-C5wCnYgriMBv6dxXEG_LjLo18LVb6CLr-GBk_wEGCX8EQQCaBqdX9xd3yPDJyxTjffACLYj2hUdJMpNAb6uT5fqYs7DUm5rpXxpnv5p_l20Uo0ZcteWH8lsEgXivSMfGiR4gXKHm9tpHroPgyzxzVcAF6RvOOkzKijtqrs6OIm801rVGxqlCH13jhWfSWHhGe4C5Be8jt40HvHlCvhU-YseSGijnPPZyFAycYF8X0ICKIAeCpCC41h4wLEW_Znn_r395cvAgmYCuKFP0MurRoKlvng1Lsu1WKzh4jL-S7YNebSJedjU8VjxdDR2P7C7ZfmyPmn26lgT-eiWKsoY3ZlcmMyLjBjeDVjglkFvTCCBbkwggOhoAMCAQICEAXMFNVjIkh0tJfo0-cttL4wDQYJKoZIhvcNAQELBQAwQjFAMD4GA1UEAxM3RVVTLUlOVEMtS0VZSUQtOUFBRjU5MUVFMjYzQ0FBRTEwRjU3QkEwNEZBOEQxREQ2NjEzRjlFQjAeFw0yNDAzMjAxODA5MDRaFw0yNzA2MDMxNzUwNTlaMAAwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDowoFLwtDUYjF09tFhbl7XJ0BJ8qBBSjD0QiorJC25Do0c8PyRpX8l9Q0JlZWGDNmZCj33iLjCb58jcnwjt2mgViLY9y_BGujjb5dFiL82h01yrXsUsQuoa6AZRd_6bJiGT0aN9B2ASX0GdpsLp_yU2SVyHJ2E-VS4prQsrwqq12UtMgLPzCVaUK0CTv03GlYutlCjSq19tp3gI3bO5M_69tW1q6DtW_xBG_vWD3FJOuydstGm14WSA0ZtJNNh0TSREJIuloKKtWQsBdYR-Y1FV3DdIqvV01qdivtWobPOqwicZRziP21xzp2gF0gozBSrN07zry4ZS8sxSb3h8345AgMBAAGjggHrMIIB5zAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0TAQH_BAIwADBtBgNVHSABAf8EYzBhMF8GCSsGAQQBgjcVHzBSMFAGCCsGAQUFBwICMEQeQgBUAEMAUABBACAAIABUAHIAdQBzAHQAZQBkACAAIABQAGwAYQB0AGYAbwByAG0AIAAgAEkAZABlAG4AdABpAHQAeTAQBgNVHSUECTAHBgVngQUIAzBQBgNVHREBAf8ERjBEpEIwQDEWMBQGBWeBBQIBDAtpZDo0OTRFNTQ0MzEOMAwGBWeBBQICDANDTUwxFjAUBgVngQUCAwwLaWQ6MDFGNDAwMEUwHwYDVR0jBBgwFoAUiQElTXxVj2J3CcqLQJlpTKr1GH8wHQYDVR0OBBYEFKXNaYbIHamces5kjCb7MKQHOxohMIGzBggrBgEFBQcBAQSBpjCBozCBoAYIKwYBBQUHMAKGgZNodHRwOi8vYXpjc3Byb2RldXNhaWtwdWJsaXNoLmJsb2IuY29yZS53aW5kb3dzLm5ldC9ldXMtaW50Yy1rZXlpZC05YWFmNTkxZWUyNjNjYWFlMTBmNTdiYTA0ZmE4ZDFkZDY2MTNmOWViLzkzNDE3YThmLWU1YWQtNGQzNy05YjUyLTQwMWI2MmJlZDQ1ZS5jZXIwDQYJKoZIhvcNAQELBQADggIBACoVVaoBFnrraVQZjABZZQjfgVbuHyf_beSWbx0hUnh11eGgzfyPoVFwc_frhmC57FiW_rayKtdk6T2hCEO-oMCJ5zt0fQWir76G4KPypzEn6ExwFgizgGQuscjOsp3RCIRoAywWxb06DxrBkfX5YypKCeWsV9jXWiwP29g9EFm4WV3WbUuthQN1njgRE5XmoUAVfyoeUyM06c0gKhiL3h3Q5Uz0KF_CHnIpkbSc--qYwQlVSHgnFYKaCunYtAbk7ObrgbLkh1hWGjgtfq1jVrhY5vPxuWMqianlU1K6kYQ19ZqXJlmYKjrpyE1_XiacqrId793EM-YohEgRZgj5sUyNxa-yfeM6EuM7H37-jZlx0kHTjXhKejsw1Ys0Uobx1AcZz9lv0rnccSEvR8h7J9ifsRSK_KxPhPXUZMU2lxGgoAbXaqw6hF0OmO9QVP4XG9wK-nMw2y-wN_Gu3sdeD0mYY6YTTsyzTnALIrTuCCb_VngipjfzWLrtwg6BiM1X4nGe70Wcj2aZ3aivptALhCp3QN3TFKRV14R6Y7rObaHmqF7___TyiRc1eAnNxS2MsjgIztRR0cyIckwqyUPsl7e-X8YHmlrXeqO0DMXLR02w_T2-qh0pi1EjsWh11_ocGOGsb-O4iIOcRP2zWLGJhUkug8AZ9XIMNhAIYev8TcrhWQbwMIIG7DCCBNSgAwIBAgITMwAAA8w4ZURKZqrhfgAAAAADzDANBgkqhkiG9w0BAQsFADCBjDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjE2MDQGA1UEAxMtTWljcm9zb2Z0IFRQTSBSb290IENlcnRpZmljYXRlIEF1dGhvcml0eSAyMDE0MB4XDTIxMDYwMzE3NTA1OVoXDTI3MDYwMzE3NTA1OVowQjFAMD4GA1UEAxM3RVVTLUlOVEMtS0VZSUQtOUFBRjU5MUVFMjYzQ0FBRTEwRjU3QkEwNEZBOEQxREQ2NjEzRjlFQjCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAIqmF4UjynTcAPsQYIH6gO0lluPZDZzIy2vmK05y3O3ego5e96nHq_xdsnfdve5qsenSfQn0Yjf5ctWJc3VNv2A2mHNqeDsiMcE7y3rpP1ThX_DSAIVjAY9BW_iIUcr3vqeERdHoVVa3lMM_3rR-jujTuDIw1uT7J_JyqrNUN3i1yf9MxM4QPPe9LGVWP_uF6R1bHLYPruFxyEYWdborFvftNPBbnhDE83CGUeMEYQjKYqUDYKNwfJThNn37JcipQgBlCpenTenlNlJcQVEZShfbDVxNVoWYdbDYM76fMtDM3OIcbi8TpGAKzeuYgwHZG9WCPCoQzG6t_1U3CIo9iOQG5XI0PYHH6ycAPJkmFVWDKAdwb1HBR-HekrwG4-QofRSVIXUT3f0-uouTDQD4VKzMdZ81_rfe7i5E8FE02K3dpviDQ95CKR7LHwSTln_RjTCyHXItGEAUuuJ6MZJAOv4tR7xyAowXgCmtTCKSYlrEdRXyXF48k8X9bqKwj0_cFRXbF-OWC5BlofN19h7mBazfEtscqI6yBKiJBZEzqjb3OrdmHh8xZv1rhQnKzINN7lyRKPgmBgXJhmZJPS3cOUv6Kz-hyZAr8IezqOYEDwBhgbGgLGGoKUKHmQxvdJihFPkMsgvvKsQkkGHQ_ZbVdh3OLJu83Xkh8dkahW2HpTETAgMBAAGjggGOMIIBijAOBgNVHQ8BAf8EBAMCAoQwGwYDVR0lBBQwEgYJKwYBBAGCNxUkBgVngQUIAzAWBgNVHSAEDzANMAsGCSsGAQQBgjcVHzASBgNVHRMBAf8ECDAGAQH_AgEAMB0GA1UdDgQWBBSJASVNfFWPYncJyotAmWlMqvUYfzAfBgNVHSMEGDAWgBR6jArOL0hiF-KU0a5VwVLscXSkVjBwBgNVHR8EaTBnMGWgY6Bhhl9odHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NybC9NaWNyb3NvZnQlMjBUUE0lMjBSb290JTIwQ2VydGlmaWNhdGUlMjBBdXRob3JpdHklMjAyMDE0LmNybDB9BggrBgEFBQcBAQRxMG8wbQYIKwYBBQUHMAKGYWh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMvTWljcm9zb2Z0JTIwVFBNJTIwUm9vdCUyMENlcnRpZmljYXRlJTIwQXV0aG9yaXR5JTIwMjAxNC5jcnQwDQYJKoZIhvcNAQELBQADggIBAEJs8h_mPG-8eagAECvLVCWcw60zpc0C3vON9ulR73r2I7Col3aXHhHCjjXSSiwBMC59dwPX-bIwpp2-MpsxO6PQZemGpmMJwZtRMKhRi5s8Zb2iwqk82pxnY8Dn3boWMPgIO1qraL1s4-dLeMj1sLZDYZMABDCwvUUAI7Y14pCbtBm8Zkl4AwnNqBlVHR4OJ8caDMB-f2GST_2NcMT-M8SucBJgSh3zb-jOcv9QobYNxju_zHhji-zwQG-qunQpxYIZWikeJRmDkk5FONHZj7eH5bT_tdZCubHBHdGHjI6-mj28PPbaJjFm6u5tMWQDudfd-o_YVB5j3TcjCITm4XW-cXQa30DTuv2Ch7xXTE70_YvsLuVVKlHgDuylzI0g7MJKyTGjtKGrC1fRYEGaS2uBeJgnXt3OvUlmFzoSuh8paN3MkBjNnim4xYqUm5_bfyH29MVmjZopjIbrSg_nOIlTvyDOQzDWtQrwdMmtNCWKDscZMRsTqJagn64nd4KLZ5HNv89CZ-bgIwfmT94MyRqcezfGarYHzDSqOVcBsqWZXfH6Jzw04s-igRNun4PjDqyM6fMTF8rkVM32AsWTbR80pwIOD_OJWXRBn0ZuFkr5UJEksKB6VJC331AeNPEyVQJ7v-voZ8N8EUAd1JFvYtHt4NJjAmYfaR861TYtm-sHZ3B1YkFyZWFYdgAjAAsABAByACCd_8vzbDg65pn7mGjcbcuJ1xU4hL4oA5IsEkFYv60irgAQABAAAwAQACDoxhXSF7CLrvMuEGNK8a9HULVlEzy-zw29T7snbzSYqgAgtz6OCLFUWo2CSTXoXyRxBsSb6t4F_UBZgdAQNuGuuoJoY2VydEluZm9Yof9UQ0eAFwAiAAvBWFWvNcBM-GdjynbXpun8ToptRPzDzFfEM3-YD6VX3AAU0ZULVppEQ-zj9DTQn9wnXGeXO04AAAAA4yPI1UDOPUqHfL9YAV22cc-ieKe9ACIAC_43EIwt2RUM9cZKdKIMccDfhr1E4VfjyC88giFWH3sHACIAC6xZA-u6c-gThXykRakV1AU1YNuRthGsviHtmZbJte_QaGF1dGhEYXRhWKTmlDqmf_4K3mvM7aIqAnU2L_-NtkLStGV7eL8JBK7kCEUAAAAACJhwWMrcS4G24TDeUNy-lgAgaWOpr9uLbtBACCnjzsjVyceFIr3Pc2I_ilIUXq1gJ_GlAQIDJiABIVgg6MYV0hewi67zLhBjSvGvR1C1ZRM8vs8NvU-7J280mKoiWCC3Po4IsVRajYJJNehfJHEGxJvq3gX9QFmB0BA24a66gg",
          }
        });

        let reg: webauthn_rs_proto::RegisterPublicKeyCredential =
            serde_json::from_value(json).expect("invalid inner json");

        let config = WebauthnCore::new_unsafe_experts_only(
            "Footprint",
            "onefootprint.com",
            vec![url::Url::parse("https://onefootprint.com").unwrap()],
            Some(120 * 1000),
            Some(true),
            Some(true),
        );

        let reg_state = serde_json::json!({
          "policy": "required",
          "exclude_credentials": [],
          "challenge": "5HeR-TdvbkEhCkmyAqdQMiROokLBjh4tVBT7mVnZ9XM",
          "credential_algorithms": [
            "ES256",
            "RS256",
            "INSECURE_RS1"
          ],
          "require_resident_key": false,
          "authenticator_attachment": "platform",
          "extensions": {},
          "experimental_allow_passkeys": true
        });

        let reg_state = serde_json::from_value(reg_state).unwrap();

        let _ = config
            .register_credential(&reg, &reg_state, None)
            .expect("reg failed");
    }
}
