use crate::{
    run_migrations,
    DbPool,
    PgConn,
    TxnPgConn,
};
use diesel::Connection;
use std::sync::Once;
use std::time::Duration;

/// Common DB test helpers for this crate and others
static INIT: Once = Once::new();

pub(crate) fn run_migrations_once(db_url: String) {
    INIT.call_once(move || {
        // Run migrations on this DB if they haven't been run yet
        run_migrations(&db_url).expect("couldn't run migrations on DB");
    });
}

pub(crate) fn db_url() -> String {
    std::env::var("DATABASE_URL").unwrap_or_else(|_| "postgresql://localhost/footprint_db".to_string())
}
pub fn test_db_conn() -> PgConn {
    let _ = dotenv::dotenv(); // Don't actually care if this succeeds since env is set in github actions
    let db_url = db_url();

    run_migrations_once(db_url.clone());
    PgConn::establish(&db_url).expect("failed to open test db connection")
}

pub fn test_db_pool() -> DbPool {
    let db_url = db_url();

    crate::init(&db_url, Duration::from_secs(30), 5).unwrap()
}

pub fn have_same_elements<T>(l: Vec<T>, r: Vec<T>) -> bool
where
    T: Eq,
{
    l.iter().all(|i| r.contains(i)) && r.iter().all(|i| l.contains(i)) && l.len() == r.len()
}

#[track_caller]
pub fn assert_have_same_elements<T>(l: Vec<T>, r: Vec<T>)
where
    T: Eq + std::fmt::Debug + Clone,
{
    if !(l.iter().all(|i| r.contains(i)) && r.iter().all(|i| l.contains(i)) && l.len() == r.len()) {
        panic!(
            "{}",
            format!("\nleft={:?} does not equal\nright={:?}\n", l.to_vec(), r.to_vec())
        )
    }
}
