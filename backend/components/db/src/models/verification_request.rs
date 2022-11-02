use crate::schema::{verification_request, verification_result};
use crate::DbResult;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, PgConnection};
use newtypes::{
    EmailId, IdentityDataId, IdentityDocumentId, OnboardingId, PhoneNumberId, Vendor, VendorAPI,
    VerificationRequestId,
};
use serde::{Deserialize, Serialize};

use super::verification_result::VerificationResult;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable)]
#[diesel(table_name = verification_request)]
pub struct VerificationRequest {
    pub id: VerificationRequestId,
    pub vendor: Vendor,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub email_id: Option<EmailId>,
    pub phone_number_id: Option<PhoneNumberId>,
    pub identity_data_id: Option<IdentityDataId>,
    pub onboarding_id: OnboardingId,
    pub identity_document_id: Option<IdentityDocumentId>,
    pub vendor_api: VendorAPI,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = verification_request)]
pub struct NewVerificationRequest {
    pub onboarding_id: OnboardingId,
    pub vendor: Vendor,
    pub timestamp: DateTime<Utc>,
    pub email_id: Option<EmailId>,
    pub phone_number_id: Option<PhoneNumberId>,
    pub identity_data_id: Option<IdentityDataId>,
    pub identity_document_id: Option<IdentityDocumentId>,
    pub vendor_api: VendorAPI,
}

impl VerificationRequest {
    pub fn bulk_save(
        conn: &mut PgConnection,
        requests: Vec<NewVerificationRequest>,
    ) -> Result<Vec<Self>, crate::DbError> {
        let result = diesel::insert_into(verification_request::table)
            .values(requests)
            .get_results(conn)?;
        Ok(result)
    }

    pub fn get_for_onboarding(conn: &mut PgConnection, onboarding_id: OnboardingId) -> DbResult<Vec<Self>> {
        let res = verification_request::table
            .filter(verification_request::onboarding_id.eq(onboarding_id))
            .get_results(conn)?;

        Ok(res)
    }
    /// Based on VerificationRequests for the onboarding, get VerificationResults
    pub fn get_requests_and_results_for_onboarding(
        conn: &mut PgConnection,
        onboarding_id: OnboardingId,
    ) -> DbResult<Vec<(VerificationRequest, Option<VerificationResult>)>> {
        let req_and_res: Vec<(VerificationRequest, Option<VerificationResult>)> = verification_request::table
            .filter(verification_request::onboarding_id.eq(onboarding_id))
            .left_join(verification_result::table)
            .get_results(conn)?;

        Ok(req_and_res)
    }
}
