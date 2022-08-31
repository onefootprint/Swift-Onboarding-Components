use crate::schema::verification_request;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, PgConnection};
use newtypes::{EmailId, IdentityDataId, PhoneNumberId, ScopedUserId, Vendor, VerificationRequestId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable)]
#[diesel(table_name = verification_request)]
pub struct VerificationRequest {
    pub id: VerificationRequestId,
    pub scoped_user_id: ScopedUserId,
    pub vendor: Vendor,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub email_id: Option<EmailId>,
    pub phone_number_id: Option<PhoneNumberId>,
    pub identity_data_id: Option<IdentityDataId>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = verification_request)]
pub struct NewVerificationRequest {
    pub scoped_user_id: ScopedUserId,
    pub vendor: Vendor,
    pub timestamp: DateTime<Utc>,
    pub email_id: Option<EmailId>,
    pub phone_number_id: Option<PhoneNumberId>,
    pub identity_data_id: Option<IdentityDataId>,
}

impl NewVerificationRequest {
    pub fn save(&self, conn: &mut PgConnection) -> Result<VerificationRequest, crate::DbError> {
        let result = diesel::insert_into(verification_request::table)
            .values(self)
            .get_result(conn)?;
        Ok(result)
    }
}
