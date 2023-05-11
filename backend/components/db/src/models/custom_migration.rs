use crate::schema::custom_migration;
use crate::{DbResult, PgConn, TxnPgConn};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
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
    #[tracing::instrument(skip_all)]
    pub fn did_run(version: String, conn: &mut TxnPgConn) -> DbResult<Self> {
        Ok(diesel::insert_into(custom_migration::table)
            .values(NewCustomMigration { version })
            .get_result(conn.conn())?)
    }

    #[tracing::instrument(skip_all)]
    pub fn get_run_by_version(conn: &mut PgConn, version: &str) -> DbResult<Option<Self>> {
        Ok(custom_migration::table
            .filter(custom_migration::version.eq(version))
            .get_result(conn)
            .optional()?)
    }
}
