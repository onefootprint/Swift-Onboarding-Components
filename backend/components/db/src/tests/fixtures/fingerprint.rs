use crate::models::fingerprint::Fingerprint;
use crate::models::fingerprint::NewFingerprint;
use crate::tests::prelude::TestPgConn;
use newtypes::DataLifetimeId;
use newtypes::DataLifetimeKind;
use newtypes::Fingerprint as FingerprintData;

pub fn create(
    conn: &mut TestPgConn,
    lifetime_id: DataLifetimeId,
    sh_data: FingerprintData,
    kind: DataLifetimeKind,
) {
    let fingerprint = NewFingerprint {
        sh_data,
        kind,
        lifetime_id,
        is_unique: false,
    };
    Fingerprint::bulk_create(conn, vec![fingerprint]).unwrap();
}
