use newtypes::{OnboardingId, ScopedVaultId, VendorAPI};

use crate::{models::verification_request::VerificationRequest, PgConn};

pub fn bulk_create(
    conn: &mut PgConn,
    ob_id: &OnboardingId,
    su_id: &ScopedVaultId,
    vendor_apis: Vec<VendorAPI>,
) -> Vec<VerificationRequest> {
    VerificationRequest::bulk_create(conn, ob_id.clone(), su_id.clone(), vendor_apis).unwrap()
}
