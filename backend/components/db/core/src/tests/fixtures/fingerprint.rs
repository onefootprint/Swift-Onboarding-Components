use crate::{
    models::fingerprint::{Fingerprint, NewFingerprintArgs},
    tests::prelude::TestPgConn,
};
use newtypes::{
    DataIdentifier, DataLifetimeId, Fingerprint as FingerprintData, FingerprintScopeKind, FingerprintVersion,
};

pub fn create(
    conn: &mut TestPgConn,
    lifetime_id: DataLifetimeId,
    sh_data: FingerprintData,
    kind: DataIdentifier,
    scope: FingerprintScopeKind,
) {
    let fingerprint = NewFingerprintArgs {
        sh_data,
        kind,
        lifetime_id,
        scope,
        version: FingerprintVersion::current(),
    };
    Fingerprint::bulk_create(conn, vec![fingerprint]).unwrap();
}
