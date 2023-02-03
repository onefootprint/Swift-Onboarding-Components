use diesel::Connection;

use crate::test_helpers::test_db_conn;
use crate::DbError;
use crate::DbResult;
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

/// Util to run a single function inside of a test transaction
pub fn run_test_txn<F>(f: F)
where
    F: FnOnce(&mut TestPgConn) + Send + 'static,
{
    let _ = dotenv::dotenv(); // Don't actually care if this succeeds since env is set in github actions

    let mut c = test_db_conn();
    let result = c.transaction(|conn| -> DbResult<()> {
        let mut conn = TestPgConn::new(TxnPgConn::new(conn));
        f(&mut conn);
        // No matter what happens during the test execution, roll back the transaction
        Err(DbError::TransactionRollbackTest)
    });
    match result {
        Err(DbError::TransactionRollbackTest) => Ok(()),
        // Anything other than a TransactionRollbackTest error is not expected
        Err(e) => Err(e),
        Ok(_) => Err(DbError::TransactionRollbackTest),
    }
    .expect("Test transaction did not roll back with expected error");
}
