use crate::PgConn;
use crate::TxnPgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::custom_migration;
use diesel::prelude::*;
use diesel::Insertable;
use diesel::Queryable;
#[derive(Debug, Clone, Insertable, Queryable)]
#[diesel(table_name = custom_migration)]
pub struct CustomMigration {
    pub version: String,
    pub run_on: DateTime<Utc>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = custom_migration)]
struct NewCustomMigration {
    version: String,
}

impl CustomMigration {
    #[tracing::instrument("CustomMigration::did_run", skip_all)]
    pub fn did_run(version: String, conn: &mut TxnPgConn) -> FpResult<Self> {
        Ok(diesel::insert_into(custom_migration::table)
            .values(NewCustomMigration { version })
            .get_result(conn.conn())?)
    }

    #[tracing::instrument("CustomMigration::get_run_by_version", skip_all)]
    pub fn get_run_by_version(conn: &mut PgConn, version: &str) -> FpResult<Option<Self>> {
        Ok(custom_migration::table
            .filter(custom_migration::version.eq(version))
            .get_result(conn)
            .optional()?)
    }
}
