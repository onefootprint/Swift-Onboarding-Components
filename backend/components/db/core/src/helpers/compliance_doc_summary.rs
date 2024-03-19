use crate::{
    models::{
        compliance_doc::ComplianceDoc, compliance_doc_request::ComplianceDocRequest,
        compliance_doc_review::ComplianceDocReview, compliance_doc_submission::ComplianceDocSubmission,
        compliance_doc_template::ComplianceDocTemplate,
        compliance_doc_template_version::ComplianceDocTemplateVersion, partner_tenant::PartnerTenant,
        tenant::Tenant, tenant_compliance_partnership::TenantCompliancePartnership,
    },
    DbResult, TxnPgConn,
};
use db_schema::schema::{
    compliance_doc, compliance_doc_request, compliance_doc_review, compliance_doc_submission,
    compliance_doc_template, compliance_doc_template_version, partner_tenant, tenant,
    tenant_compliance_partnership,
};
use diesel::prelude::*;
use newtypes::{
    ComplianceDocId, ComplianceDocRequestId, ComplianceDocReviewId, ComplianceDocSubmissionId,
    ComplianceDocTemplateId, ComplianceDocTemplateVersionId, TenantCompliancePartnershipId,
    TenantOrPartnerTenantId,
};
use std::collections::HashMap;

#[derive(Debug)]
pub struct ComplianceDocSummary {
    pub partnership: TenantCompliancePartnership,
    pub tenant: Tenant,
    pub partner_tenant: PartnerTenant,
    pub docs: HashMap<ComplianceDocId, ComplianceDoc>,
    pub doc_templates: HashMap<ComplianceDocTemplateId, ComplianceDocTemplate>,
    pub doc_template_versions: HashMap<ComplianceDocTemplateVersionId, ComplianceDocTemplateVersion>,
    pub doc_requests: HashMap<ComplianceDocRequestId, ComplianceDocRequest>,
    pub doc_submissions: HashMap<ComplianceDocSubmissionId, ComplianceDocSubmission>,
    pub doc_reviews: HashMap<ComplianceDocReviewId, ComplianceDocReview>,
}

impl ComplianceDocSummary {
    pub fn filter<'a>(
        conn: &mut TxnPgConn,
        t_pt_id: impl Into<TenantOrPartnerTenantId<'a>>,
        p_id: Option<TenantCompliancePartnershipId>,
        doc_id: Option<ComplianceDocId>,
    ) -> DbResult<HashMap<TenantCompliancePartnershipId, ComplianceDocSummary>> {
        let t_pt_id: TenantOrPartnerTenantId<'a> = t_pt_id.into();

        let mut query = tenant_compliance_partnership::table
            .inner_join(tenant::table)
            .inner_join(partner_tenant::table)
            .into_boxed();
        if let Some(p_id) = p_id {
            query = query.filter(tenant_compliance_partnership::id.eq(p_id));
        }
        match t_pt_id {
            TenantOrPartnerTenantId::TenantId(ref id) => {
                query = query.filter(tenant_compliance_partnership::tenant_id.eq(id))
            }
            TenantOrPartnerTenantId::PartnerTenantId(ref id) => {
                query = query.filter(tenant_compliance_partnership::partner_tenant_id.eq(id))
            }
        }
        let partnerships: Vec<(TenantCompliancePartnership, Tenant, PartnerTenant)> =
            query.load(conn.conn())?;

        let mut summaries = HashMap::new();
        for (partnership, tenant, partner_tenant) in partnerships.into_iter() {
            let mut docs_query = compliance_doc::table
                .filter(compliance_doc::tenant_compliance_partnership_id.eq(&partnership.id))
                .into_boxed();

            if let Some(doc_id) = doc_id.as_ref() {
                docs_query = docs_query.filter(compliance_doc::id.eq(doc_id));
            }

            let docs: Vec<ComplianceDoc> = docs_query.select(ComplianceDoc::as_select()).load(conn.conn())?;
            let docs: HashMap<_, _> = docs.into_iter().map(|r| (r.id.clone(), r)).collect();

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
                .filter(compliance_doc_request::compliance_doc_id.eq_any(docs.keys()))
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

            let summary = ComplianceDocSummary {
                partnership,
                tenant,
                partner_tenant,
                docs,
                doc_templates,
                doc_template_versions,
                doc_requests,
                doc_submissions,
                doc_reviews,
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
            partner_tenant::{NewPartnerTenant, PartnerTenant},
            tenant::Tenant,
        },
        tests::{fixtures, prelude::*},
    };
    use macros::db_test;
    use newtypes::{EncryptedVaultPrivateKey, VaultPublicKey};

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

        assert_eq!(summary.doc_templates.len(), 3);
        assert_eq!(summary.doc_template_versions.len(), 3);

        assert_eq!(summary.doc_requests.len(), 4);
        assert!(summary
            .doc_requests
            .values()
            .all(|r| summary.docs.contains_key(&r.compliance_doc_id)));

        assert_eq!(summary.doc_submissions.len(), 4);
        assert!(summary
            .doc_submissions
            .values()
            .all(|r| summary.doc_requests.contains_key(&r.request_id)));

        assert_eq!(summary.doc_reviews.len(), 4);
        assert!(summary
            .doc_reviews
            .values()
            .all(|r| summary.doc_submissions.contains_key(&r.submission_id)));
    }
}
