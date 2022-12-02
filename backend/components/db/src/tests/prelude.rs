use diesel::PgConnection;

use crate::{test_helpers::test_db_conn, DbError, DbResult, TxnPgConnection};

/// Wrapper around TxnPgConnection that is used only in tests
pub struct TestPgConnection<'a>(TxnPgConnection<'a>);

impl<'a> std::ops::Deref for TestPgConnection<'a> {
    type Target = TxnPgConnection<'a>;
    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl<'a> std::ops::DerefMut for TestPgConnection<'a> {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

impl<'a> TestPgConnection<'a> {
    pub fn new(conn: TxnPgConnection<'a>) -> Self {
        Self(conn)
    }

    #[allow(unused)]
    pub fn conn(&mut self) -> &mut PgConnection {
        self.0.conn()
    }
}

/// Util to run a single function inside of a test transaction
pub(crate) fn run_test_txn<F>(f: F)
where
    F: FnOnce(&mut TestPgConnection) + Send + 'static,
{
    let _ = dotenv::dotenv(); // Don't actually care if this succeeds since env is set in github actions

    let mut c = test_db_conn();
    let result = c.build_transaction().run(|conn| -> DbResult<()> {
        let mut conn = TestPgConnection::new(TxnPgConnection::new(conn));
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

// TODO turn this into an attribute-style macro, derive the fn name from the test name
macro_rules! db_test {
    ($name: ident, $test_fn: ident) => {
        #[test]
        fn $name() {
            run_test_txn($test_fn);
        }
    };
}

pub(super) use db_test;
