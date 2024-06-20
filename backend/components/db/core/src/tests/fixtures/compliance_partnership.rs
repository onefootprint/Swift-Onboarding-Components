use crate::models::compliance_doc::NewComplianceDoc;
use crate::models::compliance_doc_assignment::NewComplianceDocAssignment;
use crate::models::compliance_doc_request::NewComplianceDocRequest;
use crate::models::compliance_doc_review::NewComplianceDocReview;
use crate::models::compliance_doc_submission::NewComplianceDocSubmission;
use crate::models::compliance_doc_template::ComplianceDocTemplate;
use crate::models::compliance_doc_template::NewComplianceDocTemplate;
use crate::models::compliance_doc_template_version::NewComplianceDocTemplateVersion;
use crate::models::partner_tenant::PartnerTenant;
use crate::models::tenant::Tenant;
use crate::models::tenant_compliance_partnership::NewTenantCompliancePartnership;
use crate::models::tenant_compliance_partnership::TenantCompliancePartnership;
use crate::models::tenant_user::TenantUser;
use crate::TxnPgConn;
use chrono::Utc;
use newtypes::ComplianceDocData;
use newtypes::ComplianceDocReviewDecision;
use newtypes::OrgMemberEmail;
use newtypes::PartnerTenantId;
use newtypes::S3Url;
use newtypes::SealedVaultDataKey;
use newtypes::TenantId;
use newtypes::TenantKind;
use std::collections::HashMap;
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

    // Create a user for each partner tenant.
    let pt_users: Vec<_> = partner_tenants
        .iter()
        .map(|t| {
            TenantUser::get_and_update_or_create(
                conn,
                OrgMemberEmail(format!("partnertenantuser.{}@onefootprint.com", t.id)),
                Some("Partner User".to_owned()),
                Some("Last".to_owned()),
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
                Some("Tenant User".to_owned()),
                Some("Last".to_owned()),
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

        let tv1 = ComplianceDocTemplate::create_new_version(
            conn,
            &t1,
            NewComplianceDocTemplateVersion {
                created_at: Utc::now(),
                created_by_partner_tenant_user_id: Some(&pt_user.id),
                template_id: &t1.id,
                name: "Privacy Policy",
                description: "The privacy policy",
            },
        )
        .unwrap();

        let t2 = NewComplianceDocTemplate {
            partner_tenant_id: &pt.id,
        }
        .create(conn)
        .unwrap();
        let tv2 = ComplianceDocTemplate::create_new_version(
            conn,
            &t2,
            NewComplianceDocTemplateVersion {
                created_at: Utc::now(),
                created_by_partner_tenant_user_id: Some(&pt_user.id),
                template_id: &t2.id,
                name: "Audited Financials",
                description: "The audited financials",
            },
        )
        .unwrap();

        let t3 = NewComplianceDocTemplate {
            partner_tenant_id: &pt.id,
        }
        .create(conn)
        .unwrap();
        let tv3 = ComplianceDocTemplate::create_new_version(
            conn,
            &t3,
            NewComplianceDocTemplateVersion {
                created_at: Utc::now(),
                created_by_partner_tenant_user_id: Some(&pt_user.id),
                template_id: &t3.id,
                name: "Information Security Policy",
                description: "The information security policy",
            },
        )
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

                let assignment = NewComplianceDocAssignment {
                    created_at: Utc::now(),
                    compliance_doc_id: &doc.id,
                    kind: TenantKind::Tenant,
                    assigned_to_tenant_user_id: Some(&tenant_user.id),
                    assigned_by_tenant_user_id: &tenant_user.id,
                }
                .create(conn, &doc)
                .unwrap();

                let req = NewComplianceDocRequest {
                    created_at: Utc::now(),
                    name: &tv.name,
                    description: &tv.description,
                    requested_by_partner_tenant_user_id: Some(&pt_user.id),
                    compliance_doc_id: &doc.id,
                }
                .create(conn, &doc)
                .unwrap();
                requests.push((req, assignment, doc));
            }

            // Create an ad-hoc request.
            let doc = NewComplianceDoc {
                tenant_compliance_partnership_id: &partnership.id,
                template_id: None,
            }
            .create(conn)
            .unwrap();
            let assignment = NewComplianceDocAssignment {
                created_at: Utc::now(),
                compliance_doc_id: &doc.id,
                kind: TenantKind::Tenant,
                assigned_to_tenant_user_id: Some(&tenant_user.id),
                assigned_by_tenant_user_id: &tenant_user.id,
            }
            .create(conn, &doc)
            .unwrap();
            let req = NewComplianceDocRequest {
                created_at: Utc::now(),
                name: "An ad-hoc request",
                description: "This is an ad-hoc request",
                requested_by_partner_tenant_user_id: Some(&pt_user.id),
                compliance_doc_id: &doc.id,
            }
            .create(conn, &doc)
            .unwrap();
            requests.push((req, assignment, doc));
        }

        // For each partnership, there will be a document in each of the following four states:
        // 1. Submitted and approved
        // 2. Submitted and rejected
        // 3. Submitted and not reviewed
        // 4. Not submitted

        // Submit docs in response to some of the request.
        assert_eq!(requests.len() % 4, 0);
        let subs: Vec<_> = requests
            .into_iter()
            .zip((0..=3).cycle())
            .map(|((req, assignment, doc), i)| {
                if i == 3 {
                    return None;
                }

                let sub = NewComplianceDocSubmission {
                    created_at: Utc::now(),

                    request_id: &req.id,
                    submitted_by_tenant_user_id: assignment.assigned_to_tenant_user_id.as_ref().unwrap(),
                    doc_data: &ComplianceDocData::SealedUpload {
                        filename: "example.pdf".to_owned(),
                        s3_url: S3Url::from("the url".to_owned()),
                        e_data_key: SealedVaultDataKey(vec![]),
                    },
                    compliance_doc_id: &doc.id,
                }
                .create(conn, &doc)
                .unwrap();

                Some((sub, doc))
            })
            .collect();

        // Review the first two docs for each partnership.
        assert_eq!(subs.len() % 4, 0);
        subs.into_iter()
            .zip(
                [
                    Some((ComplianceDocReviewDecision::Accepted, "accepting this")),
                    Some((ComplianceDocReviewDecision::Rejected, "rejecting this")),
                    None,
                    None,
                ]
                .iter()
                .cycle(),
            )
            .for_each(|(sub_and_doc, dn)| {
                if let Some((decision, note)) = dn {
                    let (sub, doc) = sub_and_doc.unwrap();
                    NewComplianceDocReview {
                        created_at: Utc::now(),
                        submission_id: &sub.id,
                        reviewed_by_partner_tenant_user_id: &pt_user.id,
                        decision: *decision,
                        note,
                        compliance_doc_id: &doc.id,
                    }
                    .create(conn, &doc)
                    .unwrap();
                }
            });
    }

    partnerships
}
