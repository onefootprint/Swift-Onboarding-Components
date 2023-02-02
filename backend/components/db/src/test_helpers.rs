use crate::PgConnection;
use crate::{run_migrations, DbPool, TxnPgConnection};
use diesel::Connection;
use std::sync::Once;

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
pub fn test_db_conn() -> PgConnection {
    let _ = dotenv::dotenv(); // Don't actually care if this succeeds since env is set in github actions
    let db_url = db_url();

    run_migrations_once(db_url.clone());
    PgConnection::establish(&db_url).expect("failed to open test db connection")
}

pub fn test_db_pool() -> DbPool {
    let db_url = db_url();

    crate::init(&db_url).unwrap()
}
