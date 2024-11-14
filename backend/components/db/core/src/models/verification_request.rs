use super::data_lifetime::DataLifetime;
use super::vault::Vault;
use super::verification_result::VerificationResult;
use crate::DbResult;
use crate::PgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::decision_intent;
use db_schema::schema::scoped_vault;
use db_schema::schema::vault;
use db_schema::schema::verification_request;
use db_schema::schema::verification_result;
use diesel::prelude::*;
use diesel::Insertable;
use newtypes::DataLifetimeSeqno;
use newtypes::DecisionIntentId;
use newtypes::DocumentId;
use newtypes::ScopedVaultId;
use newtypes::Vendor;
use newtypes::VendorAPI;
use newtypes::VerificationRequestId;
use newtypes::WorkflowId;

#[derive(Debug, Clone, Queryable, Identifiable)]
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
    // If we are verifying an identity document, we want to know exactly which one we were verifying since
    // there could be multiple in the vault, seqno doesn't help us
    pub identity_document_id: Option<DocumentId>,
    pub scoped_vault_id: ScopedVaultId,
    pub decision_intent_id: DecisionIntentId,
}

#[derive(Debug, Clone, Insertable)]
#[diesel(table_name = verification_request)]
struct NewVerificationRequestRow {
    vendor: Vendor,
    timestamp: DateTime<Utc>,
    vendor_api: VendorAPI,
    uvw_snapshot_seqno: DataLifetimeSeqno,
    identity_document_id: Option<DocumentId>,
    scoped_vault_id: ScopedVaultId,
    decision_intent_id: DecisionIntentId,
}

#[derive(Clone)]
pub struct NewVerificationRequestArgs<'a> {
    pub scoped_vault_id: &'a ScopedVaultId,
    pub decision_intent_id: &'a DecisionIntentId,
    pub identity_document_id: Option<&'a DocumentId>,
    pub vendor_api: VendorAPI,
}

impl<'a> NewVerificationRequestArgs<'a> {
    pub fn new(
        scoped_vault_id: &'a ScopedVaultId,
        decision_intent_id: &'a DecisionIntentId,
        identity_document_id: Option<&'a DocumentId>,
        vendor_api: VendorAPI,
    ) -> Self {
        Self {
            scoped_vault_id,
            decision_intent_id,
            identity_document_id,
            vendor_api,
        }
    }
}

impl<'a> From<(&'a ScopedVaultId, &'a DecisionIntentId, VendorAPI)> for NewVerificationRequestArgs<'a> {
    fn from(value: (&'a ScopedVaultId, &'a DecisionIntentId, VendorAPI)) -> Self {
        let (scoped_vault_id, decision_intent_id, vendor_api) = value;
        NewVerificationRequestArgs {
            scoped_vault_id,
            decision_intent_id,
            vendor_api,
            identity_document_id: None,
        }
    }
}

impl<'a>
    From<(
        &'a ScopedVaultId,
        &'a DecisionIntentId,
        Option<&'a DocumentId>,
        VendorAPI,
    )> for NewVerificationRequestArgs<'a>
{
    fn from(
        value: (
            &'a ScopedVaultId,
            &'a DecisionIntentId,
            Option<&'a DocumentId>,
            VendorAPI,
        ),
    ) -> Self {
        let (scoped_vault_id, decision_intent_id, identity_document_id, vendor_api) = value;
        NewVerificationRequestArgs {
            scoped_vault_id,
            decision_intent_id,
            vendor_api,
            identity_document_id,
        }
    }
}

pub type RequestAndResult = (VerificationRequest, VerificationResult);
pub type RequestAndMaybeResult = (VerificationRequest, Option<VerificationResult>);

impl VerificationRequest {
    #[tracing::instrument("VerificationRequest::bulk_create", skip_all)]
    pub fn bulk_create(
        conn: &mut PgConn,
        scoped_vault_id: ScopedVaultId,
        vendor_apis: Vec<VendorAPI>,
        decision_intent_id: &DecisionIntentId,
        identity_document_id: Option<&DocumentId>,
    ) -> Result<Vec<Self>, crate::DbError> {
        let seqno = DataLifetime::get_next_seqno_no_ordering_guarantee(conn)?;
        let requests: Vec<_> = vendor_apis
            .into_iter()
            .map(|vendor_api| NewVerificationRequestRow {
                vendor_api,
                vendor: Vendor::from(vendor_api),
                timestamp: Utc::now(),
                uvw_snapshot_seqno: seqno,
                identity_document_id: identity_document_id.cloned(),
                scoped_vault_id: scoped_vault_id.clone(),
                decision_intent_id: decision_intent_id.clone(),
            })
            .collect();
        let result = diesel::insert_into(verification_request::table)
            .values(requests)
            .get_results(conn)?;
        Ok(result)
    }

    #[tracing::instrument("VerificationRequest::create", skip_all)]
    pub fn create(conn: &mut PgConn, args: NewVerificationRequestArgs) -> DbResult<Self> {
        let NewVerificationRequestArgs {
            scoped_vault_id,
            decision_intent_id,
            identity_document_id,
            vendor_api,
        } = args;
        Self::bulk_create(
            conn,
            scoped_vault_id.clone(),
            vec![vendor_api],
            decision_intent_id,
            identity_document_id,
        )?
        .pop()
        .ok_or(crate::DbError::ObjectNotFound)
    }

    #[tracing::instrument("VerificationRequest::get", skip_all)]
    pub fn get(conn: &mut PgConn, id: &VerificationRequestId) -> DbResult<Self> {
        let res = verification_request::table
            .filter(verification_request::id.eq(id))
            .first(conn)?;

        Ok(res)
    }

    /// Will return the latest Vres per vendor_api, ignoring vres's where is_error = true
    /// NOTE: if the latest vreq for some vendor_api has no vres, then that will be returned
    #[tracing::instrument(
        "VerificationRequest::get_latest_requests_and_successful_results_for_scoped_user",
        skip_all
    )]
    pub fn get_latest_requests_and_maybe_successful_results_for_scoped_user(
        conn: &mut PgConn,
        scoped_vault_id: ScopedVaultId,
    ) -> DbResult<Vec<RequestAndMaybeResult>> {
        let req_and_res: Vec<RequestAndMaybeResult> = verification_request::table
            .filter(verification_request::scoped_vault_id.eq(scoped_vault_id))
            .left_join(verification_result::table)
            .filter(
                verification_result::id
                    .is_null()
                    .or(verification_result::is_error.eq(false)),
            )
            .order((
                verification_request::vendor_api,
                verification_request::uvw_snapshot_seqno.desc(),
                verification_request::timestamp.desc(), // tie breaker if seq_no has a tie
            ))
            .distinct_on(verification_request::vendor_api)
            .get_results(conn)?;

        Ok(req_and_res)
    }

    /// Will return the latest Vres per vendor_api, ignoring vreq's without vres's and vres's where
    /// is_error = true
    #[tracing::instrument(
        "VerificationRequest::get_latest_requests_and_successful_results_for_scoped_user",
        skip_all
    )]
    pub fn get_latest_requests_and_successful_results_for_scoped_user(
        conn: &mut PgConn,
        scoped_vault_id: ScopedVaultId,
    ) -> DbResult<Vec<RequestAndResult>> {
        let req_and_res: Vec<RequestAndResult> = verification_request::table
            .filter(verification_request::scoped_vault_id.eq(scoped_vault_id))
            .inner_join(verification_result::table)
            .filter(verification_result::is_error.eq(false))
            .order((
                verification_request::vendor_api,
                verification_request::uvw_snapshot_seqno.desc(),
                verification_request::timestamp.desc(), // tie breaker if seq_no has a tie
            ))
            .distinct_on(verification_request::vendor_api)
            .get_results(conn)?;

        Ok(req_and_res)
    }

    #[tracing::instrument(
        "VerificationRequest::get_latest_request_and_successful_result_for_vendor_api",
        skip_all
    )]
    pub fn get_latest_request_and_successful_result_for_vendor_api(
        conn: &mut PgConn,
        id: VReqIdentifier,
        vendor_api: VendorAPI,
    ) -> DbResult<Option<RequestAndResult>> {
        let mut query = verification_request::table
            .filter(verification_request::vendor_api.eq(vendor_api))
            .inner_join(verification_result::table)
            .filter(verification_result::is_error.eq(false))
            .into_boxed();

        match id {
            VReqIdentifier::DiId(di_id) => {
                query = query.filter(verification_request::decision_intent_id.eq(di_id));
            }
            VReqIdentifier::WfId(wf_id) => {
                let di_ids = decision_intent::table
                    .filter(decision_intent::workflow_id.eq(wf_id))
                    .select(decision_intent::id);
                query = query.filter(verification_request::decision_intent_id.eq_any(di_ids));
            }
            VReqIdentifier::LatestForSv(sv_id) => {
                query = query.filter(verification_request::scoped_vault_id.eq(sv_id));
            }
            VReqIdentifier::Id(vreq_id) => {
                query = query.filter(verification_request::id.eq(vreq_id));
            }
            VReqIdentifier::DocumentId(doc_id) => {
                query = query.filter(verification_request::identity_document_id.eq(doc_id));
            }
        };

        let req_and_res = query
            .select((
                verification_request::all_columns,
                verification_result::all_columns,
            ))
            .order((
                verification_request::uvw_snapshot_seqno.desc(),
                verification_request::timestamp.desc(), // tie breaker if seq_no has a tie
            ))
            .first(conn)
            .optional()?;

        Ok(req_and_res)
    }

    #[tracing::instrument("VerificationRequest::get_latest_by_vendor_api_for_decision_intent", skip_all)]
    pub fn get_latest_by_vendor_api_for_decision_intent(
        conn: &mut PgConn,
        di_id: &DecisionIntentId,
    ) -> DbResult<Vec<RequestAndMaybeResult>> {
        let req_and_res: Vec<RequestAndMaybeResult> = verification_request::table
            .filter(verification_request::decision_intent_id.eq(di_id))
            .left_join(verification_result::table)
            .order((
                verification_request::vendor_api,
                verification_request::uvw_snapshot_seqno.desc(),
                verification_request::timestamp.desc(), // tie breaker if seq_no has a tie
            ))
            .distinct_on(verification_request::vendor_api)
            .get_results(conn)?;

        Ok(req_and_res)
    }

    #[tracing::instrument("VerificationRequest::create_document_verification_request", skip_all)]
    pub fn create_document_verification_request(
        conn: &mut PgConn,
        vendor_api: VendorAPI,
        scoped_vault_id: ScopedVaultId,
        identity_document_id: DocumentId,
        decision_intent_id: &DecisionIntentId,
    ) -> DbResult<Self> {
        let seqno = DataLifetime::get_next_seqno_no_ordering_guarantee(conn)?;
        let new_row = NewVerificationRequestRow {
            vendor_api,
            vendor: Vendor::from(vendor_api),
            timestamp: Utc::now(),
            uvw_snapshot_seqno: seqno,
            identity_document_id: Some(identity_document_id),
            scoped_vault_id,
            decision_intent_id: decision_intent_id.clone(),
        };
        let result = diesel::insert_into(verification_request::table)
            .values(new_row)
            .get_result(conn)?;
        Ok(result)
    }

    #[tracing::instrument("VerificationRequest::get_user_vault", skip_all)]
    pub fn get_user_vault(conn: &mut PgConn, id: VerificationRequestId) -> DbResult<Vault> {
        let res = verification_request::table
            .filter(verification_request::id.eq(id))
            .inner_join(scoped_vault::table.inner_join(vault::table))
            .select(vault::all_columns)
            .get_result(conn)?;

        Ok(res)
    }

    /// Get the list of VReqs for a given DI, including the VRes for each VReq if it exists
    #[tracing::instrument("VerificationRequest::list", skip_all)]
    pub fn list(
        conn: &mut PgConn,
        decision_intent_id: &DecisionIntentId,
    ) -> DbResult<Vec<(VerificationRequest, Option<VerificationResult>)>> {
        let res = verification_request::table
            .left_join(verification_result::table)
            .filter(verification_request::decision_intent_id.eq(decision_intent_id))
            .get_results(conn)?;

        Ok(res)
    }

    #[tracing::instrument("VerificationRequest::list_for_user_temp", skip_all)]
    pub fn list_for_user_temp(
        conn: &mut PgConn,
        sv_id: &ScopedVaultId,
    ) -> DbResult<Vec<(VerificationRequest, Option<VerificationResult>)>> {
        let res = verification_request::table
            .left_join(verification_result::table)
            .filter(verification_request::scoped_vault_id.eq(sv_id))
            .get_results(conn)?;

        Ok(res)
    }
}

#[derive(Debug, Clone)]
pub enum VReqIdentifier {
    DiId(DecisionIntentId),
    WfId(WorkflowId),
    LatestForSv(ScopedVaultId),
    Id(VerificationRequestId),
    DocumentId(DocumentId),
}
#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::decision_intent::DecisionIntent;
    use crate::test_helpers::assert_have_same_elements;
    use crate::tests::prelude::*;
    use macros::db_test_case;
    use newtypes::DecisionIntentKind;
    use newtypes::VerificationResultId;
    use std::str::FromStr;

    enum VresType {
        None,
        Error,
        Success,
    }

    #[db_test_case(vec![
        (VendorAPI::IdologyExpectId, vec![VresType::Success])
    ])]
    #[db_test_case(vec![
        (VendorAPI::IdologyExpectId, vec![VresType::Success, VresType::None])
    ])]
    #[db_test_case(vec![
        (VendorAPI::IdologyExpectId, vec![VresType::Error, VresType::Success])
    ])]
    #[db_test_case(vec![
        (VendorAPI::IdologyExpectId, vec![VresType::Error, VresType::Success]),
        (VendorAPI::ExperianPreciseId, vec![VresType::Success])
    ])]
    #[db_test_case(vec![
        (VendorAPI::IdologyExpectId, vec![VresType::Error, VresType::Success]),
        (VendorAPI::ExperianPreciseId, vec![VresType::Error, VresType::None, VresType::Success])
    ])]
    fn test_get_latest_by_vendor_api_for_decision_intent(
        conn: &mut TestPgConn,
        input: Vec<(VendorAPI, Vec<VresType>)>,
    ) {
        let sv_id = ScopedVaultId::from_str("sv123").unwrap();
        let di = DecisionIntent::create(conn, DecisionIntentKind::OnboardingKyc, &sv_id, None).unwrap();

        let mut created: Vec<_> = input
            .into_iter()
            .map(|(vendor_api, vres_types)| {
                (
                    vendor_api,
                    save_vreq_vres(conn, &sv_id, &di.id, vendor_api, vres_types),
                )
            })
            .collect();

        // expect last created (vreq, vres) per VendorAPI
        let expected: Vec<(VerificationRequest, Option<VerificationResult>)> =
            created.iter_mut().map(|(_, vrr)| vrr.pop().unwrap()).collect();

        let res: Vec<(VerificationRequest, Option<VerificationResult>)> =
            VerificationRequest::get_latest_by_vendor_api_for_decision_intent(conn, &di.id).unwrap();

        assert_same(expected, res);
    }

    fn save_vreq_vres(
        conn: &mut TestPgConn,
        sv_id: &ScopedVaultId,
        di_id: &DecisionIntentId,
        vendor_api: VendorAPI,
        vres_types: Vec<VresType>,
    ) -> Vec<(VerificationRequest, Option<VerificationResult>)> {
        vres_types
            .into_iter()
            .map(|vres_type| {
                let vreq = tests::fixtures::verification_request::create(conn, sv_id, di_id, vendor_api);
                let vres = match vres_type {
                    VresType::Success => Some(tests::fixtures::verification_result::create(
                        conn, &vreq.id, false,
                    )),
                    VresType::Error => {
                        Some(tests::fixtures::verification_result::create(conn, &vreq.id, true))
                    }
                    VresType::None => None,
                };
                (vreq, vres)
            })
            .collect()
    }

    fn assert_same(
        e: Vec<(VerificationRequest, Option<VerificationResult>)>,
        a: Vec<(VerificationRequest, Option<VerificationResult>)>,
    ) {
        assert_have_same_elements(extract_ids(e), extract_ids(a));
    }

    fn extract_ids(
        v: Vec<RequestAndMaybeResult>,
    ) -> Vec<(VerificationRequestId, Option<VerificationResultId>)> {
        v.iter()
            .map(|(req, res)| (req.id.clone(), res.as_ref().map(|r| r.id.clone())))
            .collect()
    }
}
