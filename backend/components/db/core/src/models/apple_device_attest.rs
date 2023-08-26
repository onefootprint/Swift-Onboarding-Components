use crate::DbResult;
use crate::PgConn;
use chrono::{DateTime, Utc};
use db_schema::schema::apple_device_attestation;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use diesel_as_jsonb::AsJsonb;
use newtypes::AppleAttestationReceiptType;
use newtypes::AppleDeviceAttestationId;
use newtypes::VaultId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = apple_device_attestation)]
pub struct AppleDeviceAttestation {
    pub id: AppleDeviceAttestationId,
    pub vault_id: VaultId,
    pub metadata: AppleDeviceMetadata,
    pub receipt: Vec<u8>,
    pub raw_attestation: Vec<u8>,

    pub webauthn_cred_public_key: Option<Vec<u8>>,

    pub is_development: bool,
    pub attested_key_id: Vec<u8>,
    pub attested_public_key: Vec<u8>,

    pub receipt_type: AppleAttestationReceiptType,
    pub receipt_risk_metric: Option<i32>,
    pub receipt_expiration: DateTime<Utc>,
    pub receipt_creation: DateTime<Utc>,
    pub receipt_not_before: Option<DateTime<Utc>>,

    pub dc_token: Option<String>,
    pub dc_bit0: Option<bool>,
    pub dc_bit1: Option<bool>,
    pub dc_last_updated: Option<String>,

    pub created_at: DateTime<Utc>,
}

/// This is a custom metadata object that comes from the device
#[derive(Debug, Clone, Serialize, Deserialize, AsJsonb, Eq, PartialEq, Hash, Default)]
#[serde(rename_all = "snake_case")]
pub struct AppleDeviceMetadata {
    pub model: Option<String>,
    pub os: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = apple_device_attestation)]
pub struct NewAppleDeviceAttestation {
    pub vault_id: VaultId,
    pub metadata: AppleDeviceMetadata,
    pub receipt: Vec<u8>,
    pub raw_attestation: Vec<u8>,

    pub webauthn_cred_public_key: Option<Vec<u8>>,

    pub is_development: bool,
    pub attested_key_id: Vec<u8>,
    pub attested_public_key: Vec<u8>,

    pub receipt_type: AppleAttestationReceiptType,
    pub receipt_risk_metric: Option<i32>,
    pub receipt_expiration: DateTime<Utc>,
    pub receipt_creation: DateTime<Utc>,
    pub receipt_not_before: Option<DateTime<Utc>>,

    pub dc_token: Option<String>,
    pub dc_bit0: Option<bool>,
    pub dc_bit1: Option<bool>,
    pub dc_last_updated: Option<String>,
}

impl NewAppleDeviceAttestation {
    #[tracing::instrument("NewAppleDeviceAttestation::create", skip_all)]
    pub fn create(self, conn: &mut PgConn) -> DbResult<AppleDeviceAttestation> {
        let res = diesel::insert_into(apple_device_attestation::table)
            .values(self)
            .get_result(conn)?;

        Ok(res)
    }
}
