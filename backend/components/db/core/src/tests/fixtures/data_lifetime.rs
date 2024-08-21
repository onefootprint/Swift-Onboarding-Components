use crate::models::data_lifetime::DataLifetime;
use crate::models::data_lifetime::NewDataLifetimeArgs;
use crate::models::scoped_vault::ScopedVault;
use crate::tests::prelude::TestPgConn;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeSeqno;
use newtypes::DataLifetimeSource;
use newtypes::Locked;
use newtypes::VaultId;

/// Util function to create multiple DataLifetimes with the provided info
pub fn build<T: Into<DataIdentifier>>(
    conn: &mut TestPgConn,
    uv_id: &VaultId,
    scoped_vault: &Locked<ScopedVault>,
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
    let (mut lifetime, _) =
        DataLifetime::bulk_create(conn, uv_id, scoped_vault, vec![args], created_seqno, None).unwrap();
    let mut lifetime = lifetime.pop().unwrap();
    if let Some(portablized_seqno) = portablized_seqno {
        lifetime = DataLifetime::portablize(conn, &lifetime.id, portablized_seqno).unwrap();
    }
    if let Some(deactivated_seqno) = deactivated_seqno {
        let (mut dls, _) =
            DataLifetime::bulk_deactivate(conn, scoped_vault, vec![lifetime.id], deactivated_seqno).unwrap();
        lifetime = dls.pop().unwrap();
    }
    lifetime
}
