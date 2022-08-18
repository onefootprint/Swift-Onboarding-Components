use crate::schema::{verification_request, verification_request_user_data};
use chrono::{DateTime, Utc};
use diesel::Insertable;
use newtypes::{ScopedUserId, Vendor, VerificationRequestId, VerificationRequestUserDataId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable)]
#[diesel(table_name = verification_request)]
pub struct VerificationRequest {
    pub id: VerificationRequestId,
    pub scoped_user_id: ScopedUserId,
    pub vendor: Vendor,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, Identifiable)]
#[diesel(table_name = verification_request_user_data)]
pub struct VerificationRequestUserData {
    pub id: VerificationRequestUserDataId,
    pub request_id: VerificationRequestId,
}
