use crate::schema::contact_info;
use crate::DbResult;
use crate::PgConn;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::Queryable;
use newtypes::ContactInfoPriority;
use newtypes::{ContactInfoId, DataLifetimeId};

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = contact_info)]
/// Contains supplemental information for contact information stored inside the vault_data table
pub struct ContactInfo {
    // TODO backfill this with existing EmailId in order to maintain backwards compatibility with existing email validation tokens that were sent out
    // TODO test this with an email link before + after
    pub id: ContactInfoId,
    pub is_verified: bool,
    pub priority: ContactInfoPriority,
    pub lifetime_id: DataLifetimeId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = contact_info)]
pub struct NewContactInfoArgs {
    pub is_verified: bool,
    pub priority: ContactInfoPriority,
    pub lifetime_id: DataLifetimeId,
}

impl ContactInfo {
    pub fn bulk_create(conn: &mut PgConn, new_rows: Vec<NewContactInfoArgs>) -> DbResult<Vec<Self>> {
        let results = diesel::insert_into(contact_info::table)
            .values(new_rows)
            .get_results(conn)?;
        Ok(results)
    }

    #[tracing::instrument(skip_all)]
    pub fn mark_verified(conn: &mut PgConn, id: &ContactInfoId) -> DbResult<()> {
        diesel::update(contact_info::table)
            .filter(contact_info::id.eq(id))
            .set(contact_info::is_verified.eq(true))
            .execute(conn)?;
        Ok(())
    }
}
