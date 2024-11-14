use crate::models::compliance_doc::ComplianceDoc;
use crate::models::compliance_doc_assignment::ComplianceDocAssignment;
use crate::models::compliance_doc_request::ComplianceDocRequest;
use crate::models::compliance_doc_review::ComplianceDocReview;
use crate::models::compliance_doc_submission::ComplianceDocSubmission;
use crate::models::partner_tenant::PartnerTenant;
use crate::models::tenant::Tenant;
use crate::models::tenant_compliance_partnership::TenantCompliancePartnership;
use crate::models::tenant_user::TenantUser;
use crate::DbError;
use crate::DbResult;
use crate::PgConn;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::compliance_doc;
use db_schema::schema::compliance_doc_assignment;
use db_schema::schema::compliance_doc_request;
use db_schema::schema::compliance_doc_review;
use db_schema::schema::compliance_doc_submission;
use db_schema::schema::partner_tenant;
use db_schema::schema::tenant;
use db_schema::schema::tenant_compliance_partnership;
use diesel::prelude::*;
use itertools::chain;
use newtypes::ComplianceDocAssignmentId;
use newtypes::ComplianceDocId;
use newtypes::ComplianceDocRequestId;
use newtypes::ComplianceDocReviewDecision;
use newtypes::ComplianceDocReviewId;
use newtypes::ComplianceDocStatus;
use newtypes::ComplianceDocSubmissionId;
use newtypes::OrgIdentifierRef;
use newtypes::TenantCompliancePartnershipId;
use newtypes::TenantKind;
use newtypes::TenantUserId;
use std::collections::HashMap;
use std::collections::HashSet;

#[derive(Debug, Clone)]
pub struct ComplianceDocSummary {
    pub partnership: TenantCompliancePartnership,
    pub tenant: Tenant,
    pub partner_tenant: PartnerTenant,
    pub docs: HashMap<ComplianceDocId, ComplianceDoc>,
    pub doc_requests: HashMap<ComplianceDocRequestId, ComplianceDocRequest>,
    pub doc_submissions: HashMap<ComplianceDocSubmissionId, ComplianceDocSubmission>,
    pub doc_reviews: HashMap<ComplianceDocReviewId, ComplianceDocReview>,
    pub doc_assignments: HashMap<ComplianceDocAssignmentId, ComplianceDocAssignment>,
    pub users: HashMap<TenantUserId, TenantUser>,
}

pub struct ActiveDocResources<'a> {
    pub request: Option<&'a ComplianceDocRequest>,
    pub submission: Option<&'a ComplianceDocSubmission>,
    pub review: Option<&'a ComplianceDocReview>,
    pub partner_tenant_assignment: Option<&'a ComplianceDocAssignment>,
    pub tenant_assignment: Option<&'a ComplianceDocAssignment>,
}

impl ComplianceDocSummary {
    pub fn filter<'a>(
        conn: &mut PgConn,
        org_id: impl Into<OrgIdentifierRef<'a>>,
        p_id: Option<&TenantCompliancePartnershipId>,
        doc_id: Option<&ComplianceDocId>,
    ) -> DbResult<HashMap<TenantCompliancePartnershipId, ComplianceDocSummary>> {
        let org_id: OrgIdentifierRef<'a> = org_id.into();

        let mut query = tenant_compliance_partnership::table
            .inner_join(tenant::table)
            .inner_join(partner_tenant::table)
            .into_boxed();
        if let Some(p_id) = p_id {
            query = query.filter(tenant_compliance_partnership::id.eq(p_id));
        }
        match org_id {
            OrgIdentifierRef::TenantId(ref id) => {
                query = query.filter(tenant_compliance_partnership::tenant_id.eq(id))
            }
            OrgIdentifierRef::PartnerTenantId(ref id) => {
                query = query.filter(tenant_compliance_partnership::partner_tenant_id.eq(id))
            }
        }
        let partnerships: Vec<(TenantCompliancePartnership, Tenant, PartnerTenant)> = query.load(conn)?;

        let mut summaries = HashMap::new();
        for (partnership, tenant, partner_tenant) in partnerships.into_iter() {
            let mut docs_query = compliance_doc::table
                .filter(compliance_doc::tenant_compliance_partnership_id.eq(&partnership.id))
                .into_boxed();

            if let Some(doc_id) = doc_id.as_ref() {
                docs_query = docs_query.filter(compliance_doc::id.eq(doc_id));
            }

            let docs: Vec<ComplianceDoc> = docs_query.select(ComplianceDoc::as_select()).load(conn)?;
            let docs: HashMap<_, _> = docs.into_iter().map(|r| (r.id.clone(), r)).collect();

            let doc_requests: Vec<ComplianceDocRequest> = compliance_doc_request::table
                .filter(compliance_doc_request::compliance_doc_id.eq_any(docs.keys()))
                .select(ComplianceDocRequest::as_select())
                .load(conn)?;
            let doc_requests: HashMap<_, _> = doc_requests.into_iter().map(|r| (r.id.clone(), r)).collect();

            let doc_submissions: Vec<ComplianceDocSubmission> = compliance_doc_submission::table
                .filter(compliance_doc_submission::request_id.eq_any(doc_requests.keys()))
                .select(ComplianceDocSubmission::as_select())
                .load(conn)?;
            let doc_submissions: HashMap<_, _> =
                doc_submissions.into_iter().map(|s| (s.id.clone(), s)).collect();

            let doc_reviews: Vec<ComplianceDocReview> = compliance_doc_review::table
                .filter(compliance_doc_review::submission_id.eq_any(doc_submissions.keys()))
                .select(ComplianceDocReview::as_select())
                .load(conn)?;
            let doc_reviews: HashMap<_, _> = doc_reviews.into_iter().map(|r| (r.id.clone(), r)).collect();

            let doc_assignments: Vec<ComplianceDocAssignment> = compliance_doc_assignment::table
                .filter(compliance_doc_assignment::compliance_doc_id.eq_any(docs.keys()))
                .select(ComplianceDocAssignment::as_select())
                .load(conn)?;
            let doc_assignments: HashMap<_, _> =
                doc_assignments.into_iter().map(|r| (r.id.clone(), r)).collect();

            let user_ids: HashSet<&TenantUserId> = chain!(
                doc_requests
                    .values()
                    .flat_map(|r| &r.requested_by_partner_tenant_user_id,),
                doc_submissions.values().map(|s| &s.submitted_by_tenant_user_id,),
                doc_reviews
                    .values()
                    .map(|r| &r.reviewed_by_partner_tenant_user_id),
                doc_assignments
                    .values()
                    .flat_map(
                        |a| chain!(&a.assigned_to_tenant_user_id, Some(&a.assigned_by_tenant_user_id),)
                    ),
            )
            .collect();
            let users = TenantUser::get_bulk(conn, user_ids.into_iter().collect())?;

            let summary = ComplianceDocSummary {
                partnership,
                tenant,
                partner_tenant,
                docs,
                doc_requests,
                doc_submissions,
                doc_reviews,
                doc_assignments,
                users,
            };
            summaries.insert(summary.partnership.id.clone(), summary);
        }

        Ok(summaries)
    }

    pub fn active_request_for_doc(&self, doc_id: &ComplianceDocId) -> Option<&ComplianceDocRequest> {
        self.doc_requests
            .values()
            .filter(|r| r.compliance_doc_id == *doc_id)
            .find(|r| r.deactivated_at.is_none())
    }

    // The newest request may be deactivated.
    pub fn newest_request_for_doc(&self, doc_id: &ComplianceDocId) -> DbResult<&ComplianceDocRequest> {
        let req = self
            .doc_requests
            .values()
            .filter(|r| r.compliance_doc_id == *doc_id)
            .max_by_key(|r| r.created_at);

        let Some(req) = req else {
            return Err(DbError::AssertionError(
                "invalid state: no request for document".to_owned(),
            ));
        };
        Ok(req)
    }

    pub fn active_submission_for_request(
        &self,
        request_id: &ComplianceDocRequestId,
    ) -> Option<&ComplianceDocSubmission> {
        self.doc_submissions
            .values()
            .filter(|s| s.request_id == *request_id)
            .find(|s| s.deactivated_at.is_none())
    }

    pub fn active_review_for_submission(
        &self,
        submission_id: &ComplianceDocSubmissionId,
    ) -> Option<&ComplianceDocReview> {
        self.doc_reviews
            .values()
            .filter(|r| r.submission_id == *submission_id)
            .find(|r| r.deactivated_at.is_none())
    }

    pub fn active_partner_tenant_assignment_for_doc(
        &self,
        doc_id: &ComplianceDocId,
    ) -> Option<&ComplianceDocAssignment> {
        self.doc_assignments
            .values()
            .filter(|a| a.compliance_doc_id == *doc_id)
            .filter(|a| a.kind == TenantKind::PartnerTenant)
            .find(|a| a.deactivated_at.is_none())
    }

    pub fn active_tenant_assignment_for_doc(
        &self,
        doc_id: &ComplianceDocId,
    ) -> Option<&ComplianceDocAssignment> {
        self.doc_assignments
            .values()
            .filter(|a| a.compliance_doc_id == *doc_id)
            .filter(|a| a.kind == TenantKind::Tenant)
            .find(|a| a.deactivated_at.is_none())
    }

    pub fn num_controls_complete(&self) -> DbResult<i64> {
        let mut count = 0;
        for doc_id in self.docs.keys() {
            let status = self.status_for_doc(doc_id)?;
            if status == ComplianceDocStatus::Accepted {
                count += 1;
            }
        }
        Ok(count)
    }

    pub fn num_controls_total(&self) -> DbResult<i64> {
        let mut count = 0;
        for doc_id in self.docs.keys() {
            let status = self.status_for_doc(doc_id)?;
            if status != ComplianceDocStatus::NotRequested {
                count += 1;
            }
        }
        Ok(count)
    }

    pub fn active_resources_for_doc<'a>(
        &'a self,
        doc_id: &ComplianceDocId,
    ) -> DbResult<ActiveDocResources<'a>> {
        let request = self.active_request_for_doc(doc_id);
        let submission = request.and_then(|r| self.active_submission_for_request(&r.id));
        let review = submission.and_then(|s| self.active_review_for_submission(&s.id));
        let partner_tenant_assignment = self.active_partner_tenant_assignment_for_doc(doc_id);
        let tenant_assignment = self.active_tenant_assignment_for_doc(doc_id);

        Ok(ActiveDocResources {
            request,
            submission,
            review,
            partner_tenant_assignment,
            tenant_assignment,
        })
    }

    pub fn status_for_doc(&self, doc_id: &ComplianceDocId) -> DbResult<ComplianceDocStatus> {
        let ActiveDocResources {
            request,
            submission,
            review,
            ..
        } = self.active_resources_for_doc(doc_id)?;

        if request.is_none() {
            return Ok(ComplianceDocStatus::NotRequested);
        }

        if submission.is_none() {
            return Ok(ComplianceDocStatus::WaitingForUpload);
        }

        let Some(review) = review else {
            return Ok(ComplianceDocStatus::WaitingForReview);
        };

        Ok(match review.decision {
            ComplianceDocReviewDecision::Accepted => ComplianceDocStatus::Accepted,
            ComplianceDocReviewDecision::Rejected => ComplianceDocStatus::Rejected,
        })
    }

    pub fn last_updated(&self, doc_id: &ComplianceDocId) -> DbResult<Option<DateTime<Utc>>> {
        let newest_req = self.newest_request_for_doc(doc_id)?;
        let ActiveDocResources {
            request,
            submission,
            review,
            partner_tenant_assignment,
            tenant_assignment,
        } = self.active_resources_for_doc(doc_id)?;

        let dates = [
            Some(newest_req.created_at),
            newest_req.deactivated_at,
            request.map(|r| r.created_at),
            submission.map(|s| s.created_at),
            review.map(|r| r.created_at),
            partner_tenant_assignment.map(|a| a.created_at),
            tenant_assignment.map(|a| a.created_at),
        ];

        Ok(dates.iter().flatten().max().copied())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::partner_tenant::NewPartnerTenant;
    use crate::models::partner_tenant::PartnerTenant;
    use crate::models::tenant::Tenant;
    use crate::tests::fixtures;
    use crate::tests::prelude::*;
    use macros::db_test;
    use newtypes::EncryptedVaultPrivateKey;
    use newtypes::VaultPublicKey;

    #[db_test]
    fn test_compliance_doc_summary(conn: &mut TestPgConn) {
        // Create some tenants.
        let tenant1 = fixtures::tenant::create(conn);
        let tenant2 = fixtures::tenant::create(conn);
        let tenant3 = fixtures::tenant::create(conn);
        let tenants = [&tenant1, &tenant2, &tenant3];

        // Create partner tenants and partner with each of the tenants.
        let pt1 = PartnerTenant::create(
            conn,
            NewPartnerTenant {
                name: "Bank".to_string(),
                public_key: VaultPublicKey::unvalidated(vec![]),
                e_private_key: EncryptedVaultPrivateKey(vec![]),
                supported_auth_methods: None,
                domains: vec!["example bank dot com".to_owned()],
                allow_domain_access: false,
                logo_url: None,
                website_url: None,
            },
        )
        .unwrap();
        let pt2 = PartnerTenant::create(
            conn,
            NewPartnerTenant {
                name: "Bank".to_string(),
                public_key: VaultPublicKey::unvalidated(vec![]),
                e_private_key: EncryptedVaultPrivateKey(vec![]),
                supported_auth_methods: None,
                domains: vec!["example bank dot com".to_owned()],
                allow_domain_access: false,
                logo_url: None,
                website_url: None,
            },
        )
        .unwrap();
        let pts = [&pt1, &pt2];

        let partnerships = fixtures::compliance_partnership::create_resources(conn, &tenants, &pts);

        // Check partner tenant-scoped summaries.
        for pt in pts.iter() {
            let summaries = ComplianceDocSummary::filter(conn, &pt.id, None, None).unwrap();
            // All tenants are partnered with both partner tenants.
            assert_eq!(summaries.len(), tenants.len());

            for tenant in tenants.iter() {
                let partnership = partnerships.get(&(&tenant.id, &pt.id)).unwrap();
                let summary = summaries.get(&partnership.id).unwrap();
                check_summary(summary, tenant, pt);
            }
        }

        // Check tenant-scoped summaries.
        for tenant in tenants.iter() {
            let summaries = ComplianceDocSummary::filter(conn, &tenant.id, None, None).unwrap();
            // All tenants are partnered with both partner tenants.
            assert_eq!(summaries.len(), pts.len());

            for pt in pts.iter() {
                let partnership = partnerships.get(&(&tenant.id, &pt.id)).unwrap();
                let summary = summaries.get(&partnership.id).unwrap();
                check_summary(summary, tenant, pt);
            }
        }
    }

    fn check_summary(summary: &ComplianceDocSummary, tenant: &Tenant, pt: &PartnerTenant) {
        assert_eq!(summary.partnership.partner_tenant_id, pt.id);
        assert_eq!(summary.partnership.tenant_id, tenant.id);
        assert_eq!(summary.partner_tenant.id, pt.id);
        assert_eq!(summary.tenant.id, tenant.id);

        assert_eq!(summary.docs.len(), 4);

        assert_eq!(summary.doc_requests.len(), 4);
        assert!(summary
            .doc_requests
            .values()
            .all(|r| summary.docs.contains_key(&r.compliance_doc_id)));

        assert_eq!(summary.doc_submissions.len(), 3);
        assert!(summary
            .doc_submissions
            .values()
            .all(|r| summary.doc_requests.contains_key(&r.request_id)));

        assert_eq!(summary.doc_reviews.len(), 2);
        assert!(summary
            .doc_reviews
            .values()
            .all(|r| summary.doc_submissions.contains_key(&r.submission_id)));

        // Partner tenant user and tenant user.
        assert_eq!(summary.users.len(), 2);
    }
}
