use newtypes::{OnboardingId, VendorAPI};

use crate::{models::verification_request::VerificationRequest, PgConn};

pub fn bulk_create(
    conn: &mut PgConn,
    ob_id: &OnboardingId,
    vendor_apis: Vec<VendorAPI>,
) -> Vec<VerificationRequest> {
    VerificationRequest::bulk_create(conn, ob_id.clone(), vendor_apis).unwrap()
}
