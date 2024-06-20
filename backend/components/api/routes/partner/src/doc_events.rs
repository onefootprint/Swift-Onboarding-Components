use crate::State;
use api_core::auth::tenant::CheckTenantGuard;
use api_core::auth::tenant::PartnerTenantGuard;
use api_core::auth::tenant::PartnerTenantSessionAuth;
use api_core::errors::ApiResult;
use api_core::errors::AssertionError;
use api_core::types::JsonApiListResponse;
use api_core::utils::db2api::TryDbToApi;
use api_core::ApiErrorKind;
use api_wire_types::ComplianceDocEvent;
use api_wire_types::ComplianceDocEventType;
use db::helpers::ComplianceDocSummary;
use itertools::Itertools;
use newtypes::ComplianceDocId;
use newtypes::TenantCompliancePartnershipId;
use newtypes::TenantKind;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};

#[api_v2_operation(
    description = "Returns a list of timeline events for the given document",
    tags(Compliance, Private)
)]
#[actix::get("/partner/partnerships/{partnership_id}/documents/{document_id}/events")]
pub async fn get(
    state: web::Data<State>,
    auth: PartnerTenantSessionAuth,
    args: web::Path<(TenantCompliancePartnershipId, ComplianceDocId)>,
) -> JsonApiListResponse<ComplianceDocEvent> {
    let auth = auth.check_guard(PartnerTenantGuard::Read)?;
    let pt = auth.partner_tenant();
    let pt_id = pt.id.clone();

    let (partnership_id, doc_id) = args.into_inner();

    let summary = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            let summary = ComplianceDocSummary::filter(conn, &pt_id, Some(&partnership_id), Some(&doc_id))?
                .into_values()
                .next()
                .ok_or(ApiErrorKind::ResourceNotFound)?;

            Ok(summary)
        })
        .await?;

    let mut events = vec![];

    // Collect assignment events.
    for assignment in summary.doc_assignments.values() {
        let org = match assignment.kind {
            TenantKind::Tenant => summary.tenant.name.clone(),
            TenantKind::PartnerTenant => summary.partner_tenant.name.clone(),
        };

        events.push(ComplianceDocEvent {
            timestamp: assignment.created_at,
            actor: Some(api_wire_types::LiteUserAndOrg {
                user: api_wire_types::LiteOrgMember::try_from_db((
                    &summary,
                    &assignment.assigned_by_tenant_user_id,
                ))?,
                org: org.clone(),
            }),
            event: ComplianceDocEventType::Assigned(api_wire_types::ComplianceDocEventAssigned {
                kind: assignment.kind,
                assigned_to: assignment
                    .assigned_to_tenant_user_id
                    .as_ref()
                    .map(|user_id| -> ApiResult<_> {
                        Ok(api_wire_types::LiteUserAndOrg {
                            user: api_wire_types::LiteOrgMember::try_from_db((&summary, user_id))?,
                            org,
                        })
                    })
                    .transpose()?,
            }),
        });
    }

    // Collect request events.
    for req in summary.doc_requests.values() {
        let doc = summary
            .docs
            .get(&req.compliance_doc_id)
            .ok_or(AssertionError("Missing document for request document ID"))?;

        events.push(ComplianceDocEvent {
            timestamp: req.created_at,
            actor: req
                .requested_by_partner_tenant_user_id
                .as_ref()
                .map(|user_id| -> ApiResult<_> {
                    Ok(api_wire_types::LiteUserAndOrg {
                        user: api_wire_types::LiteOrgMember::try_from_db((&summary, user_id))?,
                        org: summary.partner_tenant.name.clone(),
                    })
                })
                .transpose()?,
            event: ComplianceDocEventType::Requested(api_wire_types::ComplianceDocEventRequested {
                template_id: doc.template_id.clone(),
                name: req.name.clone(),
                description: req.description.clone(),
            }),
        });

        // Only create retraction events for manual retractions.
        if let (Some(deactivated_at), Some(user_id)) =
            (req.deactivated_at, &req.deactivated_by_partner_tenant_user_id)
        {
            events.push(ComplianceDocEvent {
                timestamp: deactivated_at,
                actor: Some(api_wire_types::LiteUserAndOrg {
                    user: api_wire_types::LiteOrgMember::try_from_db((&summary, &user_id))?,
                    org: summary.partner_tenant.name.clone(),
                }),
                event: ComplianceDocEventType::RequestRetracted {},
            });
        }
    }

    // Collect submission events.
    for sub in summary.doc_submissions.values() {
        events.push(ComplianceDocEvent {
            timestamp: sub.created_at,
            actor: Some(api_wire_types::LiteUserAndOrg {
                user: api_wire_types::LiteOrgMember::try_from_db((
                    &summary,
                    &sub.submitted_by_tenant_user_id,
                ))?,
                org: summary.tenant.name.clone(),
            }),
            event: ComplianceDocEventType::Submitted(api_wire_types::ComplianceDocEventSubmitted {
                submission_id: sub.id.clone(),
                kind: (&sub.doc_data).into(),
            }),
        });
    }

    // Collect review events.
    for rev in summary.doc_reviews.values() {
        events.push(ComplianceDocEvent {
            timestamp: rev.created_at,
            actor: Some(api_wire_types::LiteUserAndOrg {
                user: api_wire_types::LiteOrgMember::try_from_db((
                    &summary,
                    &rev.reviewed_by_partner_tenant_user_id,
                ))?,
                org: summary.partner_tenant.name.clone(),
            }),
            event: ComplianceDocEventType::Reviewed(api_wire_types::ComplianceDocEventReviewed {
                decision: rev.decision,
                note: rev.note.clone(),
            }),
        });
    }

    let events = events.into_iter().sorted_by_key(|e| e.timestamp).collect();
    Ok(events)
}
