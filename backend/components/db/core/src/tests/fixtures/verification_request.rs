use newtypes::{DecisionIntentId, ScopedVaultId, VendorAPI};

use crate::{models::verification_request::VerificationRequest, PgConn};

pub fn bulk_create(
    conn: &mut PgConn,
    su_id: &ScopedVaultId,
    vendor_apis: Vec<VendorAPI>,
    decision_intent_id: &DecisionIntentId,
) -> Vec<VerificationRequest> {
    VerificationRequest::bulk_create(conn, su_id.clone(), vendor_apis, decision_intent_id).unwrap()
}
