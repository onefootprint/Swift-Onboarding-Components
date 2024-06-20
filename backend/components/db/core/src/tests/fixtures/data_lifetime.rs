use crate::models::data_lifetime::DataLifetime;
use crate::models::data_lifetime::NewDataLifetimeArgs;
use crate::tests::prelude::TestPgConn;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeSeqno;
use newtypes::DataLifetimeSource;
use newtypes::ScopedVaultId;
use newtypes::VaultId;

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
    let args = NewDataLifetimeArgs {
        kind: kind.into(),
        origin_id: None,
        source: DataLifetimeSource::LikelyHosted,
    };
    let mut lifetime = DataLifetime::bulk_create(conn, uv_id, su_id, vec![args], created_seqno, None)
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
