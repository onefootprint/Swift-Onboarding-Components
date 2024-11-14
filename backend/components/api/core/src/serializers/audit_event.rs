use crate::utils::db2api::DbToApi;
use crate::utils::db2api::TryDbToApi;
use crate::FpResult;
use api_errors::ServerErr;
use api_errors::ServerErrInto;
use api_wire_types::Actor;
use api_wire_types::AuditEvent;
use api_wire_types::AuditEventDetail;
use api_wire_types::InsightEvent;
use api_wire_types::OrganizationRole;
use db::models::audit_event::AuditEventBulkSecondaryData;
use db::models::audit_event::JoinedAuditEvent;
use db::models::tenant_api_key::TenantApiKey;
use db::models::tenant_role::TenantRole;
use db::models::tenant_user::TenantUser;
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
            tenant_api_key,
            tenant_user,
            tenant_role,
            list_entry_creation,
            list_entry,
            list,
        } = event;

        if audit_event.name != AuditEventName::from(&audit_event.metadata) {
            return ServerErrInto("audit event name does not match metadata kind");
        }

        let tenant_role2 = tenant_role.clone();

        let detail: AuditEventDetail = match audit_event.metadata {
            AuditEventMetadata::CreateUser { fields } => AuditEventDetail::CreateUser {
                fp_id: scoped_vault
                    .ok_or(ServerErr("scoped vault is not available for this event"))?
                    .fp_id,
                created_fields: fields,
            },
            AuditEventMetadata::UpdateUserData { fields } => AuditEventDetail::UpdateUserData {
                fp_id: scoped_vault
                    .ok_or(ServerErr("scoped vault is not available for this event"))?
                    .fp_id,
                updated_fields: fields,
            },
            AuditEventMetadata::DeleteUserData { fields } => AuditEventDetail::DeleteUserData {
                fp_id: scoped_vault
                    .ok_or(ServerErr("scoped vault is not available for this event"))?
                    .fp_id,
                deleted_fields: fields,
            },
            AuditEventMetadata::DecryptUserData {
                reason,
                context,
                fields,
            } => AuditEventDetail::DecryptUserData {
                fp_id: scoped_vault
                    .ok_or(ServerErr("scoped vault is not available for this event"))?
                    .fp_id,
                reason,
                context,
                decrypted_fields: fields,
            },
            AuditEventMetadata::DeleteUser => AuditEventDetail::DeleteUser {
                fp_id: scoped_vault
                    .ok_or(ServerErr("scoped vault is not available for this event"))?
                    .fp_id,
            },
            AuditEventMetadata::CreateUserAnnotation => AuditEventDetail::CreateUserAnnotation,
            AuditEventMetadata::CompleteUserCheckLiveness => AuditEventDetail::CompleteUserCheckLiveness,
            AuditEventMetadata::CompleteUserCheckWatchlist => AuditEventDetail::CompleteUserCheckWatchlist,
            AuditEventMetadata::RequestUserData => AuditEventDetail::RequestUserData,
            AuditEventMetadata::StartUserVerification => AuditEventDetail::StartUserVerification,
            AuditEventMetadata::CompleteUserVerification => AuditEventDetail::CompleteUserVerification,
            AuditEventMetadata::CollectUserDocument => AuditEventDetail::CollectUserDocument,
            AuditEventMetadata::CreateOrgApiKey => {
                let tenant_api_key =
                    tenant_api_key.ok_or(ServerErr("tenant api key is not available for this event"))?;
                let current_api_key_role = (secondary_data.tenant_roles)
                    .get(&tenant_api_key.role_id)
                    .ok_or(ServerErr("tenant role is not available for this event"))?;
                AuditEventDetail::CreateOrgApiKey {
                    api_key: api_wire_types::AuditEventApiKey::from_db((
                        tenant_api_key,
                        current_api_key_role.to_owned(),
                    )),
                }
            }
            AuditEventMetadata::DecryptOrgApiKey => {
                let tenant_api_key =
                    tenant_api_key.ok_or(ServerErr("tenant api key is not available for this event"))?;
                let tenant_role = (secondary_data.tenant_roles)
                    .get(&tenant_api_key.role_id)
                    .ok_or(ServerErr("tenant role is not available for this event"))?;
                AuditEventDetail::DecryptOrgApiKey {
                    api_key: api_wire_types::AuditEventApiKey::from_db((
                        tenant_api_key,
                        tenant_role.to_owned(),
                    )),
                }
            }
            AuditEventMetadata::UpdateOrgApiKeyRole { old_tenant_role_id } => {
                let tenant_api_key =
                    tenant_api_key.ok_or(ServerErr("tenant api key is not available for this event"))?;
                let old_tr = (secondary_data.tenant_roles)
                    .get(&old_tenant_role_id)
                    .ok_or(ServerErr("old tenant role is not available for this event"))?;
                let new_tenant_role =
                    tenant_role.ok_or(ServerErr("tenant role is not available for this event"))?;
                let current_role = (secondary_data.tenant_roles)
                    .get(&tenant_api_key.role_id)
                    .ok_or(ServerErr("current api key role is not available for this event"))?;
                AuditEventDetail::UpdateOrgApiKeyRole {
                    old_role: api_wire_types::OrganizationRole::from_db(old_tr.clone()),
                    new_role: api_wire_types::OrganizationRole::from_db(new_tenant_role.to_owned()),
                    api_key: api_wire_types::AuditEventApiKey::from_db((
                        tenant_api_key,
                        current_role.to_owned(),
                    )),
                }
            }
            AuditEventMetadata::InviteOrgMember => {
                let tr = tenant_role.ok_or(ServerErr("tenant role is not available for this event"))?;
                let tu = tenant_user.ok_or(ServerErr("tenant user is not available for this event"))?;
                AuditEventDetail::InviteOrgMember {
                    email: tu.email,
                    tenant_name: tenant.name,
                    first_name: tu.first_name,
                    last_name: tu.last_name,
                    tenant_role_id: tr.id,
                    tenant_role_name: tr.name,
                    scopes: tr.scopes,
                }
            }
            AuditEventMetadata::UpdateOrgMember { old_tenant_role_id } => {
                let new_tr =
                    tenant_role.ok_or(ServerErr("new tenant role is not available for this event"))?;
                let old_tr = (secondary_data.tenant_roles)
                    .get(&old_tenant_role_id)
                    .ok_or(ServerErr("old tenant role is not available for this event"))?;
                let tu = tenant_user.ok_or(ServerErr("tenant user is not available for this event"))?;
                AuditEventDetail::UpdateOrgMember {
                    first_name: tu.first_name,
                    last_name: tu.last_name,
                    tenant_user_id: tu.id,
                    new_role: api_wire_types::OrganizationRole::from_db(new_tr),
                    old_role: api_wire_types::OrganizationRole::from_db(old_tr.clone()),
                }
            }
            AuditEventMetadata::LoginOrgMember => AuditEventDetail::LoginOrgMember,
            AuditEventMetadata::RemoveOrgMember => AuditEventDetail::RemoveOrgMember {
                member: api_wire_types::AuditEventOrgMember::from_db(
                    tenant_user.ok_or(ServerErr("tenant user is not available for this event"))?,
                ),
            },
            AuditEventMetadata::CreateOrg => AuditEventDetail::CreateOrg,
            AuditEventMetadata::UpdateOrgSettings => AuditEventDetail::UpdateOrgSettings,
            AuditEventMetadata::CreateOrgRole { scopes } => {
                let tr = tenant_role2.ok_or(ServerErr("tenant role is not available for this event"))?;
                AuditEventDetail::CreateOrgRole {
                    role_name: tr.name,
                    scopes,
                    tenant_role_id: tr.id,
                }
            }
            AuditEventMetadata::DeactivateOrgRole => {
                let tr = tenant_role.ok_or(ServerErr("tenant role is not available for this event"))?;
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
                let tr = tenant_role2.ok_or(ServerErr("tenant role is not available for this event"))?;
                AuditEventDetail::UpdateOrgRole {
                    prev_scopes,
                    new_scopes,
                    tenant_role_id: tr.id,
                    role_name: tr.name,
                }
            }
            AuditEventMetadata::CreateListEntry => AuditEventDetail::CreateListEntry {
                list_id: list.ok_or(ServerErr("list is not available for this event"))?.id,
                list_entry_creation_id: list_entry_creation
                    .ok_or(ServerErr("list_entry_creation is not available for this event"))?
                    .id,
            },
            AuditEventMetadata::DeleteListEntry => AuditEventDetail::DeleteListEntry {
                list_id: list.ok_or(ServerErr("list is not available for this event"))?.id,
                list_entry_id: list_entry
                    .ok_or(ServerErr("list_entry is not available for this event"))?
                    .id,
            },
            AuditEventMetadata::CreatePlaybook => AuditEventDetail::CreatePlaybook,
            AuditEventMetadata::EditPlaybook => AuditEventDetail::EditPlaybook,
            AuditEventMetadata::DisablePlaybook => AuditEventDetail::DisablePlaybook,
            AuditEventMetadata::ManuallyReviewEntity => AuditEventDetail::ManuallyReviewEntity,
            AuditEventMetadata::OrgMemberJoined => {
                let tr = tenant_role2.ok_or(ServerErr("tenant role is not available for this event"))?;
                let tu = tenant_user.ok_or(ServerErr("tenant user is not available for this event"))?;
                AuditEventDetail::OrgMemberJoined {
                    tenant_role: api_wire_types::OrganizationRole::from_db(tr),
                    first_name: tu.first_name,
                    last_name: tu.last_name,
                    email: tu.email,
                }
            }
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


impl DbToApi<(TenantApiKey, TenantRole)> for api_wire_types::AuditEventApiKey {
    fn from_db((api_key, role): (TenantApiKey, TenantRole)) -> Self {
        api_wire_types::AuditEventApiKey {
            id: api_key.id,
            name: api_key.name,
            role: OrganizationRole::from_db(role),
        }
    }
}

impl DbToApi<TenantUser> for api_wire_types::AuditEventOrgMember {
    fn from_db(tu: TenantUser) -> Self {
        api_wire_types::AuditEventOrgMember {
            id: tu.id,
            first_name: tu.first_name,
            last_name: tu.last_name,
            email: tu.email,
        }
    }
}
