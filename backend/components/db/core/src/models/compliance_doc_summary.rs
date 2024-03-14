use crate::{
    models::{
        compliance_doc_request::ComplianceDocRequest, compliance_doc_review::ComplianceDocReview,
        compliance_doc_submission::ComplianceDocSubmission, compliance_doc_template::ComplianceDocTemplate,
        compliance_doc_template_version::ComplianceDocTemplateVersion, partner_tenant::PartnerTenant,
        tenant::Tenant, tenant_compliance_partnership::TenantCompliancePartnership, tenant_user::TenantUser,
    },
    DbResult, TxnPgConn,
};
use db_schema::schema::{
    compliance_doc_request, compliance_doc_review, compliance_doc_submission, compliance_doc_template,
    compliance_doc_template_version, partner_tenant, tenant, tenant_compliance_partnership,
};
use diesel::prelude::*;
use itertools::chain;
use newtypes::{
    ComplianceDocRequestId, ComplianceDocReviewId, ComplianceDocSubmissionId, ComplianceDocTemplateId,
    ComplianceDocTemplateVersionId, TenantCompliancePartnershipId, TenantOrPartnerTenantId, TenantUserId,
};
use std::collections::{HashMap, HashSet};

#[derive(Debug)]
pub struct ComplianceDocSummary {
    pub partnership: TenantCompliancePartnership,
    pub tenant: Tenant,
    pub partner_tenant: PartnerTenant,
    pub doc_templates: HashMap<ComplianceDocTemplateId, ComplianceDocTemplate>,
    pub doc_template_versions: HashMap<ComplianceDocTemplateVersionId, ComplianceDocTemplateVersion>,
    pub doc_requests: HashMap<ComplianceDocRequestId, ComplianceDocRequest>,
    pub doc_submissions: HashMap<ComplianceDocSubmissionId, ComplianceDocSubmission>,
    pub doc_reviews: HashMap<ComplianceDocReviewId, ComplianceDocReview>,
    pub users: HashMap<TenantUserId, TenantUser>,
}

impl ComplianceDocSummary {
    pub fn filter<'a>(
        conn: &mut TxnPgConn,
        id: impl Into<TenantOrPartnerTenantId<'a>>,
    ) -> DbResult<HashMap<TenantCompliancePartnershipId, ComplianceDocSummary>> {
        let id: TenantOrPartnerTenantId<'a> = id.into();

        let partnerships_join = tenant_compliance_partnership::table
            .inner_join(tenant::table)
            .inner_join(partner_tenant::table)
            .into_boxed();
        let partnerships: Vec<(TenantCompliancePartnership, Tenant, PartnerTenant)> = match id {
            TenantOrPartnerTenantId::TenantId(ref id) => {
                partnerships_join.filter(tenant_compliance_partnership::tenant_id.eq(id))
            }
            TenantOrPartnerTenantId::PartnerTenantId(ref id) => {
                partnerships_join.filter(tenant_compliance_partnership::partner_tenant_id.eq(id))
            }
        }
        .load(conn.conn())?;

        let mut summaries = HashMap::new();
        for (partnership, tenant, partner_tenant) in partnerships.into_iter() {
            let doc_templates: Vec<ComplianceDocTemplate> = compliance_doc_template::table
                .filter(compliance_doc_template::partner_tenant_id.eq(&partnership.partner_tenant_id))
                .select(ComplianceDocTemplate::as_select())
                .load(conn.conn())?;
            let doc_templates: HashMap<_, _> = doc_templates.into_iter().map(|r| (r.id.clone(), r)).collect();

            let doc_template_versions: Vec<ComplianceDocTemplateVersion> =
                compliance_doc_template_version::table
                    .filter(compliance_doc_template_version::template_id.eq_any(doc_templates.keys()))
                    .select(ComplianceDocTemplateVersion::as_select())
                    .load(conn.conn())?;
            let doc_template_versions: HashMap<_, _> = doc_template_versions
                .into_iter()
                .map(|r| (r.id.clone(), r))
                .collect();

            let doc_requests: Vec<ComplianceDocRequest> = compliance_doc_request::table
                .filter(compliance_doc_request::tenant_compliance_partnership_id.eq(&partnership.id))
                .select(ComplianceDocRequest::as_select())
                .load(conn.conn())?;
            let doc_requests: HashMap<_, _> = doc_requests.into_iter().map(|r| (r.id.clone(), r)).collect();

            let doc_submissions: Vec<ComplianceDocSubmission> = compliance_doc_submission::table
                .filter(compliance_doc_submission::request_id.eq_any(doc_requests.keys()))
                .select(ComplianceDocSubmission::as_select())
                .load(conn.conn())?;
            let doc_submissions: HashMap<_, _> =
                doc_submissions.into_iter().map(|s| (s.id.clone(), s)).collect();

            let doc_reviews: Vec<ComplianceDocReview> = compliance_doc_review::table
                .filter(compliance_doc_review::submission_id.eq_any(doc_submissions.keys()))
                .select(ComplianceDocReview::as_select())
                .load(conn.conn())?;
            let doc_reviews: HashMap<_, _> = doc_reviews.into_iter().map(|r| (r.id.clone(), r)).collect();

            let user_ids: HashSet<&TenantUserId> = chain!(
                doc_requests.values().flat_map(|r| chain!(
                    Some(&r.requested_by_partner_tenant_user_id),
                    r.assigned_to_tenant_user_id.as_ref(),
                )),
                doc_submissions.values().flat_map(|s| chain!(
                    Some(&s.submitted_by_tenant_user_id),
                    s.assigned_to_partner_tenant_user_id.as_ref(),
                )),
                doc_reviews
                    .values()
                    .map(|r| &r.reviewed_by_partner_tenant_user_id),
            )
            .collect();

            let users = TenantUser::get_bulk(conn, user_ids.into_iter().collect())?;

            let summary = ComplianceDocSummary {
                partnership,
                tenant,
                partner_tenant,
                doc_templates,
                doc_template_versions,
                doc_requests,
                doc_submissions,
                doc_reviews,
                users,
            };
            summaries.insert(summary.partnership.id.clone(), summary);
        }

        Ok(summaries)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        models::{
            compliance_doc_request::NewComplianceDocRequest, compliance_doc_review::NewComplianceDocReview,
            compliance_doc_submission::NewComplianceDocSubmission,
            compliance_doc_template::NewComplianceDocTemplate,
            compliance_doc_template_version::NewComplianceDocTemplateVersion,
            partner_tenant::NewPartnerTenant, tenant_compliance_partnership::NewTenantCompliancePartnership,
        },
        tests::{fixtures, prelude::*},
    };
    use chrono::Utc;
    use macros::db_test;
    use newtypes::{
        ComplianceDocData, ComplianceDocReviewDecision, EncryptedVaultPrivateKey, OrgMemberEmail, S3Url,
        SealedVaultDataKey, VaultPublicKey,
    };
    use std::iter::zip;

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
            },
        )
        .unwrap();
        let pts = [&pt1, &pt2];

        let mut partnerships = HashMap::new();
        for tenant in tenants.iter() {
            for pt in pts.iter() {
                let (partnership, _) = NewTenantCompliancePartnership {
                    tenant_id: &tenant.id,
                    partner_tenant_id: &pt.id,
                }
                .get_or_create(conn)
                .unwrap();
                partnerships.insert((&tenant.id, &pt.id), partnership);
            }
        }

        // Create a user for the partner tenant.
        let pt_users: Vec<_> = tenants
            .iter()
            .map(|t| {
                TenantUser::get_and_update_or_create(
                    conn,
                    OrgMemberEmail(format!("partnertenantuser.{}@onefootprint.com", t.id)),
                    None,
                    None,
                )
                .unwrap()
            })
            .collect();

        // Create users for each tenant.
        let tenant_users: Vec<_> = tenants
            .iter()
            .map(|t| {
                TenantUser::get_and_update_or_create(
                    conn,
                    OrgMemberEmail(format!("tenantuser.{}@onefootprint.com", t.id)),
                    None,
                    None,
                )
                .unwrap()
            })
            .collect();

        // Create some compliance doc templates.
        for (pt, pt_user) in zip(pts, pt_users.iter()) {
            let t1 = NewComplianceDocTemplate {
                partner_tenant_id: &pt.id,
            }
            .create(conn)
            .unwrap();
            let tv1 = NewComplianceDocTemplateVersion {
                created_at: Utc::now(),
                created_by_partner_tenant_user_id: &pt_user.id,
                template_id: &t1.id,
                name: "Privacy Policy",
                description: "The privacy policy",
            }
            .create(conn)
            .unwrap();

            let t2 = NewComplianceDocTemplate {
                partner_tenant_id: &pt.id,
            }
            .create(conn)
            .unwrap();
            let tv2 = NewComplianceDocTemplateVersion {
                created_at: Utc::now(),
                created_by_partner_tenant_user_id: &pt_user.id,
                template_id: &t2.id,
                name: "Audited Financials",
                description: "The audited financials",
            }
            .create(conn)
            .unwrap();

            let t3 = NewComplianceDocTemplate {
                partner_tenant_id: &pt.id,
            }
            .create(conn)
            .unwrap();
            let tv3 = NewComplianceDocTemplateVersion {
                created_at: Utc::now(),
                created_by_partner_tenant_user_id: &pt_user.id,
                template_id: &t3.id,
                name: "Information Security Policy",
                description: "The information security policy",
            }
            .create(conn)
            .unwrap();
            let tvs = [&tv1, &tv2, &tv3];

            // Request each of the docs from each of the tenants.
            let mut requests = vec![];
            for (tenant, tenant_user) in tenants.iter().zip(tenant_users.iter()) {
                let partnership = partnerships.get(&(&tenant.id, &pt.id)).unwrap();

                // Create some requests from templates.
                for tv in tvs.iter() {
                    let req = NewComplianceDocRequest {
                        created_at: Utc::now(),
                        name: &tv.name,
                        description: &tv.description,
                        template_version_id: Some(&tv.id),
                        tenant_compliance_partnership_id: &partnership.id,
                        requested_by_partner_tenant_user_id: &pt_user.id,
                        assigned_to_tenant_user_id: Some(&tenant_user.id),
                    }
                    .create(conn)
                    .unwrap();
                    requests.push(req);
                }

                // Create an ad-hoc request.
                let req = NewComplianceDocRequest {
                    created_at: Utc::now(),
                    name: "An ad-hoc request",
                    description: "This is a ad-hoc request",
                    template_version_id: None,
                    tenant_compliance_partnership_id: &partnership.id,
                    requested_by_partner_tenant_user_id: &pt_user.id,
                    assigned_to_tenant_user_id: Some(&tenant_user.id),
                }
                .create(conn)
                .unwrap();
                requests.push(req);
            }

            // Submit docs in response to each request.
            let subs: Vec<_> = requests
                .iter()
                .map(|req| {
                    NewComplianceDocSubmission {
                        created_at: Utc::now(),

                        request_id: &req.id,
                        submitted_by_tenant_user_id: req.assigned_to_tenant_user_id.as_ref().unwrap(),
                        assigned_to_partner_tenant_user_id: Some(&req.requested_by_partner_tenant_user_id),
                        doc_data: &ComplianceDocData::SealedUpload {
                            s3_url: S3Url::from("the url".to_owned()),
                            e_data_key: SealedVaultDataKey(vec![]),
                        },
                    }
                    .create(conn)
                    .unwrap()
                })
                .collect();

            // Review each doc.
            subs.iter()
                .zip(
                    [
                        (ComplianceDocReviewDecision::Accepted, "accepting this"),
                        (ComplianceDocReviewDecision::Rejected, "rejecting this"),
                        (
                            ComplianceDocReviewDecision::Rejected,
                            "rejecting for a different reason",
                        ),
                    ]
                    .iter()
                    .cycle(),
                )
                .for_each(|(sub, (decision, note))| {
                    NewComplianceDocReview {
                        created_at: Utc::now(),
                        submission_id: &sub.id,
                        reviewed_by_partner_tenant_user_id: &pt_user.id,
                        decision: *decision,
                        note,
                    }
                    .create(conn)
                    .unwrap();
                });
        }

        // Check partner tenant-scoped summaries.
        for pt in pts.iter() {
            let summaries = ComplianceDocSummary::filter(conn, &pt.id).unwrap();
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
            let summaries = ComplianceDocSummary::filter(conn, &tenant.id).unwrap();
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

        assert_eq!(summary.doc_templates.len(), 3);
        assert_eq!(summary.doc_template_versions.len(), 3);

        assert_eq!(summary.doc_requests.len(), 4);
        assert!(summary
            .doc_requests
            .values()
            .all(|r| r.tenant_compliance_partnership_id == summary.partnership.id));

        assert_eq!(summary.doc_submissions.len(), 4);
        assert!(summary
            .doc_submissions
            .values()
            .all(|r| summary.doc_requests.get(&r.request_id).is_some()));

        assert_eq!(summary.doc_reviews.len(), 4);
        assert!(summary
            .doc_reviews
            .values()
            .all(|r| summary.doc_submissions.get(&r.submission_id).is_some()));

        // Partner tenant user and tenant user.
        assert_eq!(summary.users.len(), 2);
    }
}
