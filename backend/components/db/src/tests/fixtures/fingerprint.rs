use crate::models::fingerprint::Fingerprint;
use crate::models::fingerprint::NewFingerprint;
use crate::tests::prelude::TestPgConn;
use newtypes::DataLifetimeId;
use newtypes::DataLifetimeKind;
use newtypes::Fingerprint as FingerprintData;
use newtypes::FingerprintScopeKind;
use newtypes::FingerprintVersion;

pub fn create(
    conn: &mut TestPgConn,
    lifetime_id: DataLifetimeId,
    sh_data: FingerprintData,
    kind: DataLifetimeKind,
    scope: FingerprintScopeKind,
) {
    let fingerprint = NewFingerprint {
        sh_data,
        kind,
        lifetime_id,
        is_unique: false,
        scope,
        version: FingerprintVersion::V1,
    };
    Fingerprint::bulk_create(conn, vec![fingerprint]).unwrap();
}
