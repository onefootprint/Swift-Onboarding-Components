use crate::utils::db2api::DbToApi;
use db::models::watchlist_check::WatchlistCheck;

impl DbToApi<WatchlistCheck> for api_wire_types::WatchlistCheck {
    fn from_db(wc: WatchlistCheck) -> Self {
        let WatchlistCheck {
            id,
            status,
            reason_codes,
            ..
        } = wc;

        api_wire_types::WatchlistCheck {
            id,
            status,
            reason_codes,
        }
    }
}
