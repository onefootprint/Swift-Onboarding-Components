use crate::{
    test_helpers::{db_url, test_db_conn},
    DbError, MIGRATIONS,
};
use diesel::{Connection, PgConnection, RunQueryDsl};

/// An ephemeral database for use within a DB test
/// which helps avoid issues with conflicting uniqueness/etc.
pub struct TestContext {
    db_name: String,
    pub conn: PgConnection,
}

impl TestContext {
    fn new() -> Self {
        let mut conn = test_db_conn();

        let date = chrono::Utc::now().date_naive().format("%Y%m%d");
        let rand = crypto::random::gen_random_alphanumeric_code(8).to_lowercase();
        let db_name = format!("db{}_{}", date, rand);

        // Create a new database for the test
        let query = diesel::sql_query(format!("CREATE DATABASE {}", db_name).as_str());
        query
            .execute(&mut conn)
            .unwrap_or_else(|e| panic!("Error: {:?}. Could not create database {}", e, db_name));

        let db_url = db_url();
        let mut base_url_comp = db_url.split('/').collect::<Vec<&str>>();
        let _ = base_url_comp.pop();
        let base_url = base_url_comp.join("/");

        let mut conn = PgConnection::establish(&format!("{}/{}", base_url, db_name))
            .unwrap_or_else(|e| panic!("Cannot connect to {}/{} database: {:?}", base_url, db_name, e));

        use crate::diesel_migrations::MigrationHarness;
        conn.run_pending_migrations(MIGRATIONS)
            .map_err(DbError::MigrationFailed)
            .unwrap();

        Self { conn, db_name }
    }
}

impl Drop for TestContext {
    fn drop(&mut self) {
        let mut conn = test_db_conn();

        let disconnect_users = format!(
            "SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = '{}';",
            self.db_name
        );

        diesel::sql_query(disconnect_users.as_str())
            .execute(&mut conn)
            .unwrap();

        let query = diesel::sql_query(format!("DROP DATABASE {}", self.db_name).as_str());
        query
            .execute(&mut conn)
            .unwrap_or_else(|e| panic!("Couldn't drop database {}: {:?}", self.db_name, e));
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// This test shows an example of how to use the test context
    /// When dropping the context, the database is deleted
    /// this avoid conflicting data creation (like the same unique email row)
    #[test]
    fn test_test_context() {
        let create_unique_email = |_conn: &mut PgConnection| {
            // No longer works with new email create API, which requires txn
            /*
            let uv = test_user_vault(conn, true);
            let su_id = ScopedUserId::test_data("su_test".to_owned());
            let _ = Email::create(
                conn,
                uv.id,
                SealedVaultBytes::default(),
                Fingerprint::default(),
                newtypes::DataPriority::Primary,
                su_id,
            )
            .expect("create email");
            */
        };

        let mut c = TestContext::new();
        create_unique_email(&mut c.conn);
        std::mem::drop(c);

        let mut c = TestContext::new();
        create_unique_email(&mut c.conn);
        std::mem::drop(c);
    }
}
