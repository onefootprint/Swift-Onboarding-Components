use serde::{
    Deserialize,
    Serialize,
};

// For device attestations, we are sort of our own vendor and the there are 2 pieces of data we
// cultivate: (1) associated_vault_count which is a count based on a PG query we make when we write
// the device attestion (2) apple_device_attestation which is a serialization of the same
// AppleDeviceAttestation struct that we saved in postgres.     we store this is as a raw
// serde_json::Value instead of the Diesel type since we could make breaking changes to the Diesel
// type
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct FootprintDeviceAttestationData {
    pub associated_vault_count: Option<i64>,
    pub apple_device_attestation: Option<serde_json::Value>,
    pub google_device_attestation: Option<serde_json::Value>,
}
