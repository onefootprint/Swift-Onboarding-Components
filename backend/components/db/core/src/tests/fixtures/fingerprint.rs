use crate::models::fingerprint::{
    Fingerprint,
    NewFingerprintArgs,
};
use crate::models::scoped_vault::ScopedVault;
use crate::tests::prelude::TestPgConn;
use newtypes::{
    DataIdentifier,
    DataLifetimeId,
    Fingerprint as FingerprintData,
    FingerprintScope,
    FingerprintVersion,
};

pub fn create(
    conn: &mut TestPgConn,
    lifetime_id: &DataLifetimeId,
    sh_data: FingerprintData,
    kind: DataIdentifier,
    scope: FingerprintScope,
    sv: &ScopedVault,
) {
    let fingerprint = NewFingerprintArgs {
        data: sh_data.into(),
        kind: kind.into(),
        lifetime_ids: vec![lifetime_id],
        scope,
        version: FingerprintVersion::current(),
        scoped_vault_id: &sv.id,
        vault_id: &sv.vault_id,
        tenant_id: &sv.tenant_id,
        is_live: sv.is_live,
    };
    Fingerprint::bulk_create(conn, vec![fingerprint]).unwrap();
}
