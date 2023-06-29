use chrono::Utc;
use newtypes::{ScopedVaultId, TaskData, WatchlistCheckArgs};

use crate::{models::task::Task, TxnPgConn};

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
