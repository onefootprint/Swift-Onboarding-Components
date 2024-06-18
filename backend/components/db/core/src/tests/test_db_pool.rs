use crate::diesel::{
    Connection,
    RunQueryDsl,
};
use crate::test_helpers::db_url;
use crate::{
    DbPool,
    DbResult,
};
use diesel::PgConnection;
use macros::test_db_pool;
use std::ops::Deref;
use std::time::Duration;

pub struct TestDbPool {
    db_pool: DbPool,
    test_db_name: String,
    retain: bool,
}

impl Deref for TestDbPool {
    type Target = DbPool;

    fn deref(&self) -> &Self::Target {
        &self.db_pool
    }
}

static CREATE_TEST_DB_ONCE: std::sync::Once = std::sync::Once::new();
static RUN_MIGRATIONS_ONCE: std::sync::Once = std::sync::Once::new();
const TEST_DB_TEMPLATE_NAME: &str = "test_template_footprintdb1";

impl TestDbPool {
    fn base_db_url() -> String {
        let db_url = db_url();
        let i = db_url.rfind('/').unwrap();
        db_url[..i].to_owned()
    }

    fn create_test_db_template(conn: &mut PgConnection) {
        let create = diesel::sql_query(format!("CREATE DATABASE {}", TEST_DB_TEMPLATE_NAME)).execute(conn);

        if let Some(e) = create.err() {
            if !(matches!(e, diesel::result::Error::DatabaseError(_, _))
                && e.to_string().as_str() == format!("database \"{}\" already exists", TEST_DB_TEMPLATE_NAME))
            {
                panic!("{e:?}");
            }
        }
    }

    fn run_migrations_test_db_template() {
        let test_db_template_url = format!("{}/{}", Self::base_db_url(), TEST_DB_TEMPLATE_NAME);
        crate::run_migrations(test_db_template_url.as_str()).unwrap();
    }

    fn init_test_db_template_once(conn: &mut PgConnection) {
        CREATE_TEST_DB_ONCE.call_once(|| Self::create_test_db_template(conn));
        RUN_MIGRATIONS_ONCE.call_once(Self::run_migrations_test_db_template);
    }

    fn create_test_db(conn: &mut PgConnection) -> String {
        let test_db_name = format!("test_db_{}", uuid::Uuid::new_v4().to_string().replace('-', ""));
        diesel::sql_query(format!(
            "CREATE DATABASE {} TEMPLATE {}",
            test_db_name, TEST_DB_TEMPLATE_NAME
        ))
        .execute(conn)
        .expect("failed to create test db from template");

        test_db_name
    }

    fn delete_test_db(test_db_name: &String) {
        let mut conn = PgConnection::establish(&db_url()).unwrap();
        diesel::sql_query(format!(
            "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '{}'",
            test_db_name
        ))
        .execute(&mut conn)
        .expect("failed to terminate proccesses using test db");
        diesel::sql_query(format!("DROP DATABASE {} WITH (FORCE)", test_db_name))
            .execute(&mut conn)
            .expect("failed to drop test db");
    }

    pub fn new(retain: bool) -> Self {
        let mut conn = PgConnection::establish(&db_url()).unwrap();

        Self::init_test_db_template_once(&mut conn);
        let test_db_name = Self::create_test_db(&mut conn);
        let test_db_url = format!("{}/{}", Self::base_db_url(), test_db_name);
        println!("CREATED TEST DB: {}", test_db_name);
        let pool = crate::init(test_db_url.as_str(), Duration::from_secs(30), 5).unwrap();
        Self {
            db_pool: pool,
            test_db_name,
            retain,
        }
    }
}

impl Drop for TestDbPool {
    fn drop(&mut self) {
        if self.retain {
            println!("RETAINING TEST DB: {}", self.test_db_name);
        } else {
            println!("DROPPING TEST DB: {}", self.test_db_name);
            Self::delete_test_db(&self.test_db_name);
        }
    }
}

// A new test db will be created, and a new Tenant written to it but then the new test db will be
// dropped
#[test_db_pool]
async fn example_test(db_pool: TestDbPool) {
    let _tenant = db_pool
        .db_transaction(|conn| -> DbResult<_> { Ok(crate::tests::fixtures::tenant::create(conn)) })
        .await
        .unwrap();
}

// A new test db will be created, and a new Tenant written to it, and the test database will be
// retained (won't be dropped)
#[ignore]
#[test_db_pool(retain)]
async fn example_test_retain_test_db(db_pool: TestDbPool) {
    let _tenant = db_pool
        .db_transaction(|conn| -> DbResult<_> { Ok(crate::tests::fixtures::tenant::create(conn)) })
        .await
        .unwrap();
}
