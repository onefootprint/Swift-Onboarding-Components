use std::collections::HashMap;

use crate::{
    models::{
        compliance_doc::NewComplianceDoc,
        compliance_doc_request::NewComplianceDocRequest,
        compliance_doc_review::NewComplianceDocReview,
        compliance_doc_submission::NewComplianceDocSubmission,
        compliance_doc_template::NewComplianceDocTemplate,
        compliance_doc_template_version::NewComplianceDocTemplateVersion,
        partner_tenant::PartnerTenant,
        tenant::Tenant,
        tenant_compliance_partnership::{NewTenantCompliancePartnership, TenantCompliancePartnership},
        tenant_user::TenantUser,
    },
    TxnPgConn,
};
use chrono::Utc;
use newtypes::{
    ComplianceDocData, ComplianceDocReviewDecision, OrgMemberEmail, PartnerTenantId, S3Url,
    SealedVaultDataKey, TenantId,
};
use std::iter::zip;

pub fn create_resources<'a>(
    conn: &mut TxnPgConn,
    tenants: &'a [&'a Tenant],
    partner_tenants: &'a [&'a PartnerTenant],
) -> HashMap<(&'a TenantId, &'a PartnerTenantId), TenantCompliancePartnership> {
    let mut partnerships = HashMap::new();
    for tenant in tenants.iter() {
        for pt in partner_tenants.iter() {
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
    for (pt, pt_user) in zip(partner_tenants.iter(), pt_users.iter()) {
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
                let doc = NewComplianceDoc {
                    tenant_compliance_partnership_id: &partnership.id,
                    template_id: Some(&tv.template_id),
                }
                .create(conn)
                .unwrap();

                let req = NewComplianceDocRequest {
                    created_at: Utc::now(),
                    name: &tv.name,
                    description: &tv.description,
                    requested_by_partner_tenant_user_id: &pt_user.id,
                    assigned_to_tenant_user_id: Some(&tenant_user.id),
                    compliance_doc_id: &doc.id,
                }
                .create(conn)
                .unwrap();
                requests.push(req);
            }

            // Create an ad-hoc request.
            let doc = NewComplianceDoc {
                tenant_compliance_partnership_id: &partnership.id,
                template_id: None,
            }
            .create(conn)
            .unwrap();
            let req = NewComplianceDocRequest {
                created_at: Utc::now(),
                name: "An ad-hoc request",
                description: "This is a ad-hoc request",
                requested_by_partner_tenant_user_id: &pt_user.id,
                assigned_to_tenant_user_id: Some(&tenant_user.id),
                compliance_doc_id: &doc.id,
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

    partnerships
}
