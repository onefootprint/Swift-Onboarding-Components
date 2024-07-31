use crate::models::task::Task;
use crate::TxnPgConn;
use chrono::Utc;
use newtypes::ScopedVaultId;
use newtypes::WatchlistCheckArgs;

pub fn create_watchlist_check(conn: &mut TxnPgConn, svid: &ScopedVaultId) -> Task {
    let task_data = WatchlistCheckArgs {
        scoped_vault_id: svid.clone(),
    };
    Task::create(conn, Utc::now(), task_data).unwrap()
}
