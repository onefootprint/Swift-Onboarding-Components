use crate::models::task::Task;
use crate::TxnPgConn;
use chrono::Utc;
use newtypes::ScopedVaultId;
use newtypes::TaskData;
use newtypes::WatchlistCheckArgs;

pub fn create_watchlist_check(conn: &mut TxnPgConn, svid: &ScopedVaultId) -> Task {
    Task::create(
        conn,
        Utc::now(),
        TaskData::WatchlistCheck(WatchlistCheckArgs {
            scoped_vault_id: svid.clone(),
        }),
    )
    .unwrap()
}
