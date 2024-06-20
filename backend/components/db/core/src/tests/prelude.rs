pub use super::fixtures;
use crate::test_helpers::test_db_conn;
use crate::PgConn;
use crate::TxnPgConn;
use diesel::Connection;

/// Wrapper around TxnPgConnection that is used only in tests. Operations run on these connections
/// occur inside of a DB transaction and are automatically rolled back at the end of the test.
#[derive(derive_more::Deref, derive_more::DerefMut)]
pub struct TestPgConn<'a>(TxnPgConn<'a>);

impl<'a> TestPgConn<'a> {
    pub fn new(conn: TxnPgConn<'a>) -> Self {
        Self(conn)
    }

    #[allow(unused)]
    pub fn conn(&mut self) -> &mut PgConn {
        self.0.conn()
    }
}

#[derive(Debug, thiserror::Error)]
enum Error<T> {
    // Any error type from conn.transaction() needs to implement From<diesel::result::Error>
    DbError(#[from] diesel::result::Error),
    TransactionRollbackTest(T),
}

/// Util to run a single function inside of a test transaction
pub fn run_test_txn<F, TRes>(f: F, retain: bool) -> TRes
where
    F: FnOnce(&mut TestPgConn) -> TRes + Send + 'static,
{
    run_test_txn_with_args(|conn, _| f(conn), (), retain)
}

pub fn run_test_txn_with_args<F, TArgs, TRes>(f: F, args: TArgs, retain: bool) -> TRes
where
    F: FnOnce(&mut TestPgConn, TArgs) -> TRes + Send + 'static,
{
    let _ = dotenv::dotenv(); // Don't actually care if this succeeds since env is set in github actions

    let mut c = test_db_conn();
    let result = c.transaction(|conn| -> Result<(), Error<TRes>> {
        let mut conn = TestPgConn::new(TxnPgConn::new(conn));
        let result = f(&mut conn, args);
        if retain {
            // Manual flag provided to not rollback the transaction to allow debugging in DB shell
            Ok(())
        } else {
            // Unless the retain flag has been passed, return an Err here to roll back the transaction
            // no matter what happens during the test execution.
            // Hide the actual result of calling f() inside the Err response so we can unpack it and return
            Err(Error::TransactionRollbackTest(result))
        }
    });
    if retain {
        panic!("Test transaction did not roll back since you requested to retain data. You may now inspect your local DB shell to see the side-effects of the test")
    }
    let Err(Error::TransactionRollbackTest(result)) = result else {
        // Anything other than an Error::TransactionRollbackTest is not expected
        panic!("Test transaction did not roll back with expected error")
    };
    result
}
