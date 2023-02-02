use crate::schema::{onboarding, scoped_user, user_vault, verification_request, verification_result};
use crate::DbResult;
use crate::PgConn;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::Insertable;
use newtypes::{
    DataLifetimeSeqno, IdentityDocumentId, OnboardingId, Vendor, VendorAPI, VerificationRequestId,
};
use serde::{Deserialize, Serialize};

use super::data_lifetime::DataLifetime;
use super::user_vault::UserVault;
use super::verification_result::VerificationResult;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable)]
#[diesel(table_name = verification_request)]
pub struct VerificationRequest {
    pub id: VerificationRequestId,
    pub vendor: Vendor,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub onboarding_id: OnboardingId,
    pub vendor_api: VendorAPI,
    // The current seqno when this VerificationRequest was created.
    // This is used to reconstruct the UserVaultWrapper at the time the request was sent.
    pub uvw_snapshot_seqno: DataLifetimeSeqno,
    // If we are verifying an identity document, we want to know exactly which one we were verifying since there
    // could be multiple in the vault, seqno doesn't help us
    pub identity_document_id: Option<IdentityDocumentId>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = verification_request)]
struct NewVerificationRequestRow {
    onboarding_id: OnboardingId,
    vendor: Vendor,
    timestamp: DateTime<Utc>,
    vendor_api: VendorAPI,
    uvw_snapshot_seqno: DataLifetimeSeqno,
    identity_document_id: Option<IdentityDocumentId>,
}
pub type RequestAndMaybeResult = (VerificationRequest, Option<VerificationResult>);
impl VerificationRequest {
    pub fn bulk_create(
        conn: &mut PgConn,
        onboarding_id: OnboardingId,
        vendor_apis: Vec<VendorAPI>,
    ) -> Result<Vec<Self>, crate::DbError> {
        let seqno = DataLifetime::get_current_seqno(conn)?;
        let requests: Vec<_> = vendor_apis
            .into_iter()
            .map(|vendor_api| NewVerificationRequestRow {
                onboarding_id: onboarding_id.clone(),
                vendor_api,
                vendor: Vendor::from(vendor_api),
                timestamp: Utc::now(),
                uvw_snapshot_seqno: seqno,
                identity_document_id: None,
            })
            .collect();
        let result = diesel::insert_into(verification_request::table)
            .values(requests)
            .get_results(conn)?;
        Ok(result)
    }

    pub fn get_for_onboarding(conn: &mut PgConn, onboarding_id: OnboardingId) -> DbResult<Vec<Self>> {
        let res = verification_request::table
            .filter(verification_request::onboarding_id.eq(onboarding_id))
            .get_results(conn)?;

        Ok(res)
    }
    /// Based on VerificationRequests for the onboarding, get VerificationResults
    pub fn get_requests_and_results_for_onboarding(
        conn: &mut PgConn,
        onboarding_id: OnboardingId,
    ) -> DbResult<Vec<RequestAndMaybeResult>> {
        let req_and_res: Vec<(VerificationRequest, Option<VerificationResult>)> = verification_request::table
            .filter(verification_request::onboarding_id.eq(onboarding_id))
            .left_join(verification_result::table)
            .get_results(conn)?;

        Ok(req_and_res)
    }

    pub fn create_document_verification_request(
        conn: &mut PgConn,
        vendor_api: VendorAPI,
        onboarding_id: OnboardingId,
        identity_document_id: IdentityDocumentId,
    ) -> DbResult<Self> {
        let seqno = DataLifetime::get_current_seqno(conn)?;
        let new_row = NewVerificationRequestRow {
            onboarding_id,
            vendor_api,
            vendor: Vendor::from(vendor_api),
            timestamp: Utc::now(),
            uvw_snapshot_seqno: seqno,
            identity_document_id: Some(identity_document_id),
        };
        let result = diesel::insert_into(verification_request::table)
            .values(new_row)
            .get_result(conn)?;
        Ok(result)
    }

    pub fn get_user_vault(conn: &mut PgConn, id: VerificationRequestId) -> DbResult<UserVault> {
        let res = verification_request::table
            .filter(verification_request::id.eq(id))
            .inner_join(onboarding::table.inner_join(scoped_user::table.inner_join(user_vault::table)))
            .select(user_vault::all_columns)
            .get_result(conn)?;

        Ok(res)
    }
}
