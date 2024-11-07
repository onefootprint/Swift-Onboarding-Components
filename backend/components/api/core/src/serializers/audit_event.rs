use crate::errors::AssertionError;
use crate::utils::db2api::DbToApi;
use crate::utils::db2api::TryDbToApi;
use crate::FpResult;
use api_wire_types::Actor;
use api_wire_types::AuditEvent;
use api_wire_types::AuditEventDetail;
use api_wire_types::InsightEvent;
use db::models::audit_event::AuditEventBulkSecondaryData;
use db::models::audit_event::JoinedAuditEvent;
use newtypes::AuditEventMetadata;
use newtypes::AuditEventName;

impl<'a> TryDbToApi<(JoinedAuditEvent, &'a AuditEventBulkSecondaryData)> for AuditEvent {
    fn try_from_db(
        (event, secondary_data): (JoinedAuditEvent, &AuditEventBulkSecondaryData),
    ) -> FpResult<Self> {
        let JoinedAuditEvent {
            audit_event,
            tenant,
            saturated_actor,
            insight_event,
            scoped_vault,
            ob_configuration: _,
            document_data: _,
            tenant_api_key: _,
            tenant_user,
            tenant_role,
            list_entry_creation,
            list_entry,
            list,
        } = event;

        if audit_event.name != AuditEventName::from(&audit_event.metadata) {
            return Err(AssertionError("audit event name does not match metadata kind").into());
        }

        let tenant_role2 = tenant_role.clone();

        let detail: AuditEventDetail = match audit_event.metadata {
            AuditEventMetadata::CreateUser { fields } => AuditEventDetail::CreateUser {
                fp_id: scoped_vault
                    .ok_or(AssertionError("scoped vault is not available for this event"))?
                    .fp_id,
                created_fields: fields,
            },
            AuditEventMetadata::UpdateUserData { fields } => AuditEventDetail::UpdateUserData {
                fp_id: scoped_vault
                    .ok_or(AssertionError("scoped vault is not available for this event"))?
                    .fp_id,
                updated_fields: fields,
            },
            AuditEventMetadata::DeleteUserData { fields } => AuditEventDetail::DeleteUserData {
                fp_id: scoped_vault
                    .ok_or(AssertionError("scoped vault is not available for this event"))?
                    .fp_id,
                deleted_fields: fields,
            },
            AuditEventMetadata::DecryptUserData {
                reason,
                context,
                fields,
            } => AuditEventDetail::DecryptUserData {
                fp_id: scoped_vault
                    .ok_or(AssertionError("scoped vault is not available for this event"))?
                    .fp_id,
                reason,
                context,
                decrypted_fields: fields,
            },
            AuditEventMetadata::DeleteUser => AuditEventDetail::DeleteUser {
                fp_id: scoped_vault
                    .ok_or(AssertionError("scoped vault is not available for this event"))?
                    .fp_id,
            },
            AuditEventMetadata::CreateUserAnnotation => AuditEventDetail::CreateUserAnnotation,
            AuditEventMetadata::CompleteUserCheckLiveness => AuditEventDetail::CompleteUserCheckLiveness,
            AuditEventMetadata::CompleteUserCheckWatchlist => AuditEventDetail::CompleteUserCheckWatchlist,
            AuditEventMetadata::RequestUserData => AuditEventDetail::RequestUserData,
            AuditEventMetadata::StartUserVerification => AuditEventDetail::StartUserVerification,
            AuditEventMetadata::CompleteUserVerification => AuditEventDetail::CompleteUserVerification,
            AuditEventMetadata::CollectUserDocument => AuditEventDetail::CollectUserDocument,
            AuditEventMetadata::CreateOrgApiKey => AuditEventDetail::CreateOrgApiKey,
            AuditEventMetadata::DecryptOrgApiKey => AuditEventDetail::DecryptOrgApiKey,
            AuditEventMetadata::UpdateOrgApiKey => AuditEventDetail::UpdateOrgApiKey,
            AuditEventMetadata::InviteOrgMember {
                email,
                first_name,
                last_name,
            } => {
                let tr = tenant_role.ok_or(AssertionError("tenant role is not available for this event"))?;
                AuditEventDetail::InviteOrgMember {
                    email,
                    first_name,
                    last_name,
                    tenant_name: tenant.name,
                    tenant_role_id: tr.id,
                    tenant_role_name: tr.name,
                    scopes: tr.scopes,
                }
            }
            AuditEventMetadata::UpdateOrgMember { old_tenant_role_id } => {
                let new_tr =
                    tenant_role.ok_or(AssertionError("new tenant role is not available for this event"))?;
                let old_tr = (secondary_data.tenant_roles)
                    .get(&old_tenant_role_id)
                    .ok_or(AssertionError("old tenant role is not available for this event"))?;
                let tu = tenant_user.ok_or(AssertionError("tenant user is not available for this event"))?;
                AuditEventDetail::UpdateOrgMember {
                    first_name: tu.first_name,
                    last_name: tu.last_name,
                    tenant_user_id: tu.id,
                    new_role: api_wire_types::OrganizationRole::from_db(new_tr),
                    old_role: api_wire_types::OrganizationRole::from_db(old_tr.clone()),
                }
            }
            AuditEventMetadata::LoginOrgMember => AuditEventDetail::LoginOrgMember,
            AuditEventMetadata::RemoveOrgMember => AuditEventDetail::RemoveOrgMember,
            AuditEventMetadata::CreateOrg => AuditEventDetail::CreateOrg,
            AuditEventMetadata::UpdateOrgSettings => AuditEventDetail::UpdateOrgSettings,
            AuditEventMetadata::CreateOrgRole { scopes } => {
                let tr = tenant_role2.ok_or(AssertionError("tenant role is not available for this event"))?;
                AuditEventDetail::CreateOrgRole {
                    role_name: tr.name,
                    scopes,
                    tenant_role_id: tr.id,
                }
            }
            AuditEventMetadata::DeactivateOrgRole => {
                let tr = tenant_role.ok_or(AssertionError("tenant role is not available for this event"))?;
                AuditEventDetail::DeactivateOrgRole {
                    tenant_role_id: tr.id,
                    scopes: tr.scopes,
                    role_name: tr.name,
                }
            }
            AuditEventMetadata::UpdateOrgRole {
                prev_scopes,
                new_scopes,
            } => {
                let tr = tenant_role2.ok_or(AssertionError("tenant role is not available for this event"))?;
                AuditEventDetail::UpdateOrgRole {
                    prev_scopes,
                    new_scopes,
                    tenant_role_id: tr.id,
                    role_name: tr.name,
                }
            }
            AuditEventMetadata::CreateListEntry => AuditEventDetail::CreateListEntry {
                list_id: list
                    .ok_or(AssertionError("list is not available for this event"))?
                    .id,
                list_entry_creation_id: list_entry_creation
                    .ok_or(AssertionError(
                        "list_entry_creation is not available for this event",
                    ))?
                    .id,
            },
            AuditEventMetadata::DeleteListEntry => AuditEventDetail::DeleteListEntry {
                list_id: list
                    .ok_or(AssertionError("list is not available for this event"))?
                    .id,
                list_entry_id: list_entry
                    .ok_or(AssertionError("list_entry is not available for this event"))?
                    .id,
            },
            AuditEventMetadata::CreatePlaybook => AuditEventDetail::CreatePlaybook,
            AuditEventMetadata::EditPlaybook => AuditEventDetail::EditPlaybook,
            AuditEventMetadata::DisablePlaybook => AuditEventDetail::DisablePlaybook,
            AuditEventMetadata::ManuallyReviewEntity => AuditEventDetail::ManuallyReviewEntity,
        };

        Ok(api_wire_types::AuditEvent {
            id: audit_event.id,
            timestamp: audit_event.timestamp,
            tenant_id: audit_event.tenant_id,
            name: audit_event.name,
            principal: saturated_actor.map(Actor::from_db),
            insight_event: insight_event.map(InsightEvent::from_db),
            detail,
        })
    }
}
