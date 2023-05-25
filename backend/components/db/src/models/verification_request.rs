use crate::schema::{scoped_vault, vault, verification_request, verification_result};
use crate::DbResult;
use crate::PgConn;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::Insertable;
use newtypes::{
    DataLifetimeSeqno, DecisionIntentId, IdentityDocumentId, ScopedVaultId, Vendor, VendorAPI,
    VerificationRequestId,
};
use serde::{Deserialize, Serialize};

use super::data_lifetime::DataLifetime;
use super::vault::Vault;
use super::verification_result::VerificationResult;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Identifiable)]
#[diesel(table_name = verification_request)]
pub struct VerificationRequest {
    pub id: VerificationRequestId,
    pub vendor: Vendor,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub vendor_api: VendorAPI,
    // The current seqno when this VerificationRequest was created.
    // This is used to reconstruct the VaultWrapper at the time the request was sent.
    pub uvw_snapshot_seqno: DataLifetimeSeqno,
    // If we are verifying an identity document, we want to know exactly which one we were verifying since there
    // could be multiple in the vault, seqno doesn't help us
    pub identity_document_id: Option<IdentityDocumentId>,
    pub scoped_vault_id: ScopedVaultId,
    pub decision_intent_id: Option<DecisionIntentId>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = verification_request)]
struct NewVerificationRequestRow {
    vendor: Vendor,
    timestamp: DateTime<Utc>,
    vendor_api: VendorAPI,
    uvw_snapshot_seqno: DataLifetimeSeqno,
    identity_document_id: Option<IdentityDocumentId>,
    scoped_vault_id: ScopedVaultId,
    decision_intent_id: Option<DecisionIntentId>,
}
pub type RequestAndMaybeResult = (VerificationRequest, Option<VerificationResult>);
impl VerificationRequest {
    #[tracing::instrument(skip_all)]
    pub fn bulk_create(
        conn: &mut PgConn,
        scoped_vault_id: ScopedVaultId,
        vendor_apis: Vec<VendorAPI>,
        decision_intent_id: &DecisionIntentId,
    ) -> Result<Vec<Self>, crate::DbError> {
        let seqno = DataLifetime::get_current_seqno(conn)?;
        let requests: Vec<_> = vendor_apis
            .into_iter()
            .map(|vendor_api| NewVerificationRequestRow {
                vendor_api,
                vendor: Vendor::from(vendor_api),
                timestamp: Utc::now(),
                uvw_snapshot_seqno: seqno,
                identity_document_id: None,
                scoped_vault_id: scoped_vault_id.clone(),
                decision_intent_id: Some(decision_intent_id.clone()),
            })
            .collect();
        let result = diesel::insert_into(verification_request::table)
            .values(requests)
            .get_results(conn)?;
        Ok(result)
    }

    #[tracing::instrument(skip_all)]
    pub fn create(
        conn: &mut PgConn,
        scoped_vault_id: &ScopedVaultId,
        decision_intent_id: &DecisionIntentId,
        vendor_api: VendorAPI,
    ) -> DbResult<Self> {
        Self::bulk_create(
            conn,
            scoped_vault_id.clone(),
            vec![vendor_api],
            decision_intent_id,
        )?
        .pop()
        .ok_or(crate::DbError::ObjectNotFound)
    }

    pub fn get(conn: &mut PgConn, id: VerificationRequestId) -> DbResult<Self> {
        let res = verification_request::table
            .filter(verification_request::id.eq(id))
            .first(conn)?;

        Ok(res)
    }

    /// Based on VerificationRequests for the onboarding, get VerificationResults
    #[tracing::instrument(skip_all)]
    pub fn get_latest_requests_and_successful_results_for_scoped_user(
        conn: &mut PgConn,
        scoped_vault_id: ScopedVaultId,
    ) -> DbResult<Vec<RequestAndMaybeResult>> {
        let req_and_res: Vec<RequestAndMaybeResult> = verification_request::table
            .filter(verification_request::scoped_vault_id.eq(scoped_vault_id))
            .left_join(
                verification_result::table.on(verification_result::request_id.eq(verification_request::id)),
            )
            .filter(
                verification_result::id
                    .is_null()
                    .or(verification_result::is_error.eq(false)),
            )
            .order((
                verification_request::vendor_api,
                verification_request::uvw_snapshot_seqno.desc(),
            ))
            .distinct_on(verification_request::vendor_api)
            .get_results(conn)?;

        let (doc_scan_requests, kyc_requests): (Vec<RequestAndMaybeResult>, Vec<RequestAndMaybeResult>) =
            req_and_res
                .into_iter()
                .partition(|(req, _)| req.vendor_api.is_doc_scan_call());

        let max_kyc_seq_no = kyc_requests.iter().map(|(req, _)| req.uvw_snapshot_seqno).max();

        let (kyc_requests_with_max_seqno, kyc_requests_with_earlier_seqno): (
            Vec<RequestAndMaybeResult>,
            Vec<RequestAndMaybeResult>,
        ) = kyc_requests.into_iter().partition(|(req, _)| {
            max_kyc_seq_no
                .map(|seqno| req.uvw_snapshot_seqno == seqno)
                .unwrap_or_else(|| false)
        });

        if !kyc_requests_with_earlier_seqno.is_empty() {
            tracing::error!(kyc_requests_with_earlier_seqno=kyc_requests_with_earlier_seqno.iter().map(|(req, _)| format!("{:?}", req)).collect::<Vec<_>>().join(","), "get_latest_requests_and_results_for_onboarding: KYC vendor requests with unexpected earlier seqno");
        }
        if doc_scan_requests.len() > 1 {
            tracing::error!(
                doc_scan_requests = doc_scan_requests
                    .iter()
                    .map(|(req, _)| format!("{:?}", req))
                    .collect::<Vec<_>>()
                    .join(","),
                "get_latest_requests_and_results_for_onboarding: more than 1 doc scan request found"
            );
        }

        let ret: Vec<RequestAndMaybeResult> = kyc_requests_with_max_seqno
            .into_iter()
            .chain(doc_scan_requests.into_iter())
            .collect();
        Ok(ret)
    }

    #[tracing::instrument(skip_all)]
    pub fn create_document_verification_request(
        conn: &mut PgConn,
        vendor_api: VendorAPI,
        scoped_vault_id: ScopedVaultId,
        identity_document_id: IdentityDocumentId,
        decision_intent_id: &DecisionIntentId,
    ) -> DbResult<Self> {
        let seqno = DataLifetime::get_current_seqno(conn)?;
        let new_row = NewVerificationRequestRow {
            vendor_api,
            vendor: Vendor::from(vendor_api),
            timestamp: Utc::now(),
            uvw_snapshot_seqno: seqno,
            identity_document_id: Some(identity_document_id),
            scoped_vault_id,
            decision_intent_id: Some(decision_intent_id.clone()),
        };
        let result = diesel::insert_into(verification_request::table)
            .values(new_row)
            .get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument(skip_all)]
    pub fn get_user_vault(conn: &mut PgConn, id: VerificationRequestId) -> DbResult<Vault> {
        let res = verification_request::table
            .filter(verification_request::id.eq(id))
            .inner_join(scoped_vault::table.inner_join(vault::table))
            .select(vault::all_columns)
            .get_result(conn)?;

        Ok(res)
    }

    #[tracing::instrument(skip_all)]
    pub fn list_by_decision_intent(
        conn: &mut PgConn,
        decision_intent_id: &DecisionIntentId,
    ) -> DbResult<Vec<(VerificationRequest, Option<VerificationResult>)>> {
        let res = verification_request::table
            .left_join(
                verification_result::table.on(verification_result::request_id
                    .eq(verification_request::id)
                    .and(verification_result::is_error.eq(false))),
            )
            .filter(verification_request::decision_intent_id.eq(decision_intent_id))
            .get_results(conn)?;

        Ok(res)
    }
}
