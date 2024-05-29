use crate::models::apple_device_attest::{
    AppleDeviceAttestation,
    AppleDeviceMetadata,
    NewAppleDeviceAttestation,
};
use crate::TxnPgConn;
use chrono::Utc;
use newtypes::{
    AppleAttestationReceiptType,
    VaultId,
};

pub fn create(conn: &mut TxnPgConn, vault_id: &VaultId) -> AppleDeviceAttestation {
    NewAppleDeviceAttestation {
        vault_id: vault_id.clone(),
        metadata: AppleDeviceMetadata {
            model: Some("iPhone 15".to_owned()),
            os: Some("iOS".to_owned()),
        },
        receipt: vec![],
        raw_attestation: vec![],
        is_development: false,
        attested_key_id: vec![],
        attested_public_key: vec![],
        receipt_type: AppleAttestationReceiptType::Attest,
        receipt_risk_metric: None,
        receipt_expiration: Utc::now(),
        receipt_creation: Utc::now(),
        receipt_not_before: None,
        dc_token: None,
        dc_bit0: Some(true),
        dc_bit1: None,
        dc_last_updated: None,
        bundle_id: "abc".to_owned(),
        webauthn_credential_id: None,
    }
    .create(conn)
    .unwrap()
}
