use crate::models::verification_result::VerificationResult;
use crate::PgConn;
use newtypes::{
    PiiJsonValue,
    SealedVaultBytes,
    VerificationRequestId,
};
use serde_json::json;

pub fn create(conn: &mut PgConn, vreq_id: &VerificationRequestId, is_error: bool) -> VerificationResult {
    VerificationResult::create(
        conn,
        vreq_id.clone(),
        json!({}).into(),
        SealedVaultBytes(PiiJsonValue::from(json!({})).leak_to_vec().unwrap()),
        is_error,
    )
    .unwrap()
}
