use crate::DbResult;
use crate::PgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::contact_info;
use diesel::prelude::*;
use diesel::Queryable;
use itertools::Itertools;
use newtypes::ContactInfoId;
use newtypes::ContactInfoPriority;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeId;
use newtypes::VaultId;

#[derive(Debug, Clone, Queryable)]
#[diesel(table_name = contact_info)]
/// Contains supplemental information for contact information stored inside the vault_data table
pub struct ContactInfo {
    pub id: ContactInfoId,
    /// DEPRECATED. Not really read anywhere today. Either OTP verified or async email link verified
    #[allow(unused)]
    is_verified: bool,
    /// DEPRECATED
    #[allow(unused)]
    priority: ContactInfoPriority,
    pub lifetime_id: DataLifetimeId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    /// Verified by entering an OTP sent to this contact info. Should not be read directly.
    is_otp_verified: bool,
    /// Indicates whether the OTP verification status of this contact info was inherited from the
    /// _previous_ value of this contact info. For all intents and purposes, CI that
    /// `is_tenant_verified` behaves the same as CI that `is_otp_verified`. Only
    /// certain tenants have the ability to add new contact info that is marked as
    /// `is_tenant_verified`.
    pub is_tenant_verified: bool,
}

#[derive(Debug, Clone)]
pub struct NewContactInfoArgs<TIdentifier> {
    pub is_otp_verified: bool,
    pub is_tenant_verified: bool,
    pub identifier: TIdentifier,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = contact_info)]
struct NewContactInfoRow {
    lifetime_id: DataLifetimeId,
    is_otp_verified: bool,
    is_tenant_verified: bool,
    is_verified: bool,
    priority: ContactInfoPriority,
}

impl ContactInfo {
    #[tracing::instrument("ContactInfo::bulk_create", skip_all)]
    pub fn bulk_create(
        conn: &mut PgConn,
        new_rows: Vec<NewContactInfoArgs<DataLifetimeId>>,
    ) -> DbResult<Vec<Self>> {
        let new_rows = new_rows
            .into_iter()
            .map(|r| NewContactInfoRow {
                lifetime_id: r.identifier,
                is_otp_verified: r.is_otp_verified,
                is_tenant_verified: r.is_tenant_verified,
                // These two fields aren't really used
                is_verified: false,
                priority: ContactInfoPriority::Primary,
            })
            .collect_vec();
        let results = diesel::insert_into(contact_info::table)
            .values(new_rows)
            .get_results(conn)?;
        Ok(results)
    }

    #[tracing::instrument("ContactInfo::mark_otp_verified", skip_all)]
    pub fn mark_otp_verified(conn: &mut PgConn, id: &ContactInfoId) -> DbResult<()> {
        diesel::update(contact_info::table)
            .filter(contact_info::id.eq(id))
            .set(contact_info::is_otp_verified.eq(true))
            .execute(conn)?;
        Ok(())
    }

    #[tracing::instrument("ContactInfo::get", skip_all)]
    pub fn get(conn: &mut PgConn, lifetime_id: &DataLifetimeId) -> DbResult<Self> {
        let result = contact_info::table
            .filter(contact_info::lifetime_id.eq(lifetime_id))
            .get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument("ContactInfo::list", skip_all)]
    pub fn list(conn: &mut PgConn, vault_id: &VaultId, kinds: Vec<DataIdentifier>) -> DbResult<Vec<Self>> {
        use db_schema::schema::data_lifetime;
        let result = contact_info::table
            .inner_join(data_lifetime::table)
            .filter(data_lifetime::vault_id.eq(vault_id))
            .filter(data_lifetime::kind.eq_any(kinds))
            .select(contact_info::all_columns)
            .get_results::<Self>(conn)?;
        Ok(result)
    }

    /// Returns whether the piece of contact info should be considered as OTP verified.
    /// Certain tenants have the ability to write CI that is considered to be verified even though
    /// it was never verified with Footprint
    pub fn is_otp_verified(&self) -> bool {
        self.is_otp_verified || self.is_tenant_verified
    }

    pub fn replacement_ci<T>(self, identifier: T) -> NewContactInfoArgs<T> {
        NewContactInfoArgs {
            is_otp_verified: self.is_otp_verified,
            is_tenant_verified: self.is_tenant_verified,
            identifier,
        }
    }
}
