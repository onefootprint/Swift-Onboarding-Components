use crate::DbResult;
use crate::PgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::contact_info;
use diesel::prelude::*;
use diesel::Queryable;
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
    /// Not really read anywhere today. Either OTP verified or async email link verified
    pub is_verified: bool,
    pub priority: ContactInfoPriority,
    pub lifetime_id: DataLifetimeId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    /// Verified by entering an OTP sent to this contact info
    pub is_otp_verified: bool,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = contact_info)]
pub struct NewContactInfoArgs {
    pub is_verified: bool,
    pub is_otp_verified: bool,
    pub priority: ContactInfoPriority,
    pub lifetime_id: DataLifetimeId,
}

pub enum VerificationLevel {
    OtpVerified,
    NonOtpVerified,
}

#[derive(AsChangeset)]
#[diesel(table_name = contact_info)]
struct ContactInfoUpdate {
    is_verified: Option<bool>,
    is_otp_verified: Option<bool>,
}

impl From<VerificationLevel> for ContactInfoUpdate {
    fn from(value: VerificationLevel) -> Self {
        let is_otp_verified = matches!(value, VerificationLevel::OtpVerified).then(|| true);
        ContactInfoUpdate {
            is_verified: Some(true),
            is_otp_verified,
        }
    }
}

impl ContactInfo {
    #[tracing::instrument("ContactInfo::bulk_create", skip_all)]
    pub fn bulk_create(conn: &mut PgConn, new_rows: Vec<NewContactInfoArgs>) -> DbResult<Vec<Self>> {
        let results = diesel::insert_into(contact_info::table)
            .values(new_rows)
            .get_results(conn)?;
        Ok(results)
    }

    #[tracing::instrument("ContactInfo::mark_verified", skip_all)]
    pub fn mark_verified(conn: &mut PgConn, id: &ContactInfoId, level: VerificationLevel) -> DbResult<()> {
        diesel::update(contact_info::table)
            .filter(contact_info::id.eq(id))
            .set(ContactInfoUpdate::from(level))
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
}
