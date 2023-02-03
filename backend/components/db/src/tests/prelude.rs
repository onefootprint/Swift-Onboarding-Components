use diesel::Connection;

use crate::test_helpers::test_db_conn;
use crate::PgConn;
use crate::TxnPgConn;

/// Wrapper around TxnPgConnection that is used only in tests. Operations run on these connections
/// occur inside of a DB transaction and are automatically rolled back at the end of the test.
pub struct TestPgConn<'a>(TxnPgConn<'a>);

impl<'a> std::ops::Deref for TestPgConn<'a> {
    type Target = TxnPgConn<'a>;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl<'a> std::ops::DerefMut for TestPgConn<'a> {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

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
pub fn run_test_txn<F>(f: F)
where
    F: FnOnce(&mut TestPgConn) + Send + 'static,
{
    run_test_txn_with_args(|conn, _| f(conn), ())
}

pub fn run_test_txn_with_args<F, TArgs, TRes>(f: F, args: TArgs) -> TRes
where
    F: FnOnce(&mut TestPgConn, TArgs) -> TRes + Send + 'static,
{
    let _ = dotenv::dotenv(); // Don't actually care if this succeeds since env is set in github actions

    let mut c = test_db_conn();
    let result = c.transaction(|conn| -> Result<(), Error<TRes>> {
        let mut conn = TestPgConn::new(TxnPgConn::new(conn));
        let result = f(&mut conn, args);
        // No matter what happens during the test execution, return an Err here to roll back the transaction.
        // Hide the actual result of calling f() inside the Err response so we can unpack it and return
        Err(Error::TransactionRollbackTest(result))
    });
    let Err(Error::TransactionRollbackTest(result)) = result else {
        // Anything other than an Error::TransactionRollbackTest is not expected
        panic!("Test transaction did not roll back with expected error")
    };
    result
}
