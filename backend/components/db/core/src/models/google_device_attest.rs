use crate::DbResult;
use crate::PgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::google_device_attestation;
use db_schema::schema::scoped_vault;
use db_schema::schema::vault;
use diesel::prelude::*;
use diesel::Insertable;
use diesel::Queryable;
use diesel_as_jsonb::AsJsonb;
use newtypes::AndroidAppLicense;
use newtypes::AndroidAppRecognition;
use newtypes::AndroidDeviceIntegrityLevel;
use newtypes::GoogleDeviceAttestationId;
use newtypes::ScopedVaultId;
use newtypes::VaultId;
use newtypes::WebauthnCredentialId;
use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Serialize, Clone, Queryable)]
#[diesel(table_name = google_device_attestation)]
pub struct GoogleDeviceAttestation {
    pub id: GoogleDeviceAttestationId,
    pub vault_id: VaultId,
    pub metadata: GoogleDeviceMetadata,
    pub created_at: DateTime<Utc>,
    pub raw_token: String,
    pub raw_claims: serde_json::Value,

    pub package_name: String,
    pub app_version: Option<String>,

    pub webauthn_credential_id: Option<WebauthnCredentialId>,

    // ids and metadata for matching devices
    pub widevine_id: Option<String>,
    pub widevine_security_level: Option<String>,
    pub android_id: Option<String>,

    // summary of verdicts
    pub is_trustworthy_device: bool,
    pub is_evaluated_device: bool,

    // detail verdicts
    pub license_verdict: AndroidAppLicense,
    pub recognition_verdict: AndroidAppRecognition,
    pub integrity_level: AndroidDeviceIntegrityLevel,

    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, AsJsonb, Eq, PartialEq, Hash, Default)]
#[serde(rename_all = "snake_case")]
pub struct GoogleDeviceMetadata {
    pub model: Option<String>,
    pub os: Option<String>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = google_device_attestation)]
pub struct NewGoogleDeviceAttestation {
    pub vault_id: VaultId,
    pub metadata: GoogleDeviceMetadata,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub raw_token: String,
    pub raw_claims: serde_json::Value,

    pub package_name: String,
    pub app_version: Option<String>,

    pub webauthn_credential_id: Option<WebauthnCredentialId>,

    // ids and metadata for matching devices
    pub widevine_id: Option<String>,
    pub widevine_security_level: Option<String>,
    pub android_id: Option<String>,

    // summary of verdicts
    pub is_trustworthy_device: bool,
    pub is_evaluated_device: bool,

    // detail verdicts
    pub license_verdict: AndroidAppLicense,
    pub recognition_verdict: AndroidAppRecognition,
    pub integrity_level: AndroidDeviceIntegrityLevel,
}

impl NewGoogleDeviceAttestation {
    #[tracing::instrument("NewGoogleDeviceAttestation::create", skip_all)]
    pub fn create(self, conn: &mut PgConn) -> DbResult<GoogleDeviceAttestation> {
        let res = diesel::insert_into(google_device_attestation::table)
            .values(self)
            .get_result(conn)?;

        Ok(res)
    }
}

impl GoogleDeviceAttestation {
    #[tracing::instrument("GoogleDeviceAttestation::list", skip_all)]
    pub fn list(conn: &mut PgConn, sv_id: &ScopedVaultId) -> DbResult<Vec<Self>> {
        let attestations: Vec<Self> = google_device_attestation::table
            .inner_join(vault::table)
            .inner_join(scoped_vault::table.on(scoped_vault::vault_id.eq(vault::id)))
            .filter(scoped_vault::id.eq(sv_id))
            .select(google_device_attestation::all_columns)
            .load(conn)?;

        Ok(attestations)
    }

    pub fn count_associated_vaults(&self, conn: &mut PgConn, is_live: bool) -> DbResult<i64> {
        Ok(google_device_attestation::table
            .filter(google_device_attestation::widevine_id.eq(&self.widevine_id))
            .filter(google_device_attestation::widevine_security_level.eq("L1")) // only get the high sec level IDs
            .inner_join(vault::table)
            .filter(vault::is_live.eq(is_live))
            .select(google_device_attestation::vault_id)
            .distinct()
            .count()
            .get_result(conn)?)
    }
}
