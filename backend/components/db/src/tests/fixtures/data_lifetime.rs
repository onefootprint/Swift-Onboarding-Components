use crate::models::data_lifetime::DataLifetime;
use crate::tests::prelude::TestPgConn;
use newtypes::{DataIdentifier, DataLifetimeSeqno, ScopedVaultId, VaultId};

/// Util function to create multiple DataLifetimes with the provided info
pub fn build<T: Into<DataIdentifier>>(
    conn: &mut TestPgConn,
    uv_id: &VaultId,
    su_id: &ScopedVaultId,
    created_seqno: DataLifetimeSeqno,
    portablized_seqno: Option<DataLifetimeSeqno>,
    deactivated_seqno: Option<DataLifetimeSeqno>,
    kind: T,
) -> DataLifetime {
    let mut lifetime = DataLifetime::bulk_create(conn, uv_id, su_id, vec![kind.into()], created_seqno)
        .unwrap()
        .pop()
        .unwrap();
    if let Some(portablized_seqno) = portablized_seqno {
        lifetime = DataLifetime::portablize(conn, &lifetime.id, portablized_seqno).unwrap();
    }
    if let Some(deactivated_seqno) = deactivated_seqno {
        lifetime = DataLifetime::bulk_deactivate(conn, vec![lifetime.id], deactivated_seqno)
            .unwrap()
            .pop()
            .unwrap();
    }
    lifetime
}
