use crate::auth::tenant::{
    CheckTenantGuard,
    SecretTenantAuthContext,
    TenantGuard,
};
use crate::errors::ApiResult;
use crate::types::JsonApiResponse;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::errors::ValidationError;
use api_core::types::ResponseData;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::headers::InsightHeaders;
use api_core::utils::vault_wrapper::{
    Any,
    WriteableVw,
};
use db::models::access_event::NewAccessEventRow;
use db::models::audit_event::NewAuditEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use macros::route_alias;
use newtypes::{
    flat_api_object_map_type,
    AccessEventKind,
    AccessEventPurpose,
    AuditEventDetail,
    AuditEventId,
    DataIdentifier,
    DbActor,
};
use paperclip::actix::web::Json;
use paperclip::actix::{
    self,
    api_v2_operation,
    web,
    Apiv2Schema,
};
use serde::Deserialize;
use std::collections::{
    HashMap,
    HashSet,
};

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
pub struct DeleteRequest {
    /// List of data identifiers to delete. For example, `id.first_name`, `id.ssn4`,
    /// `custom.bank_account`
    fields: Option<Vec<DataIdentifier>>,
    /// When true, deletes all data in the vault.
    delete_all: Option<bool>,
}

flat_api_object_map_type!(
    DeleteVaultResponse<DataIdentifier, bool>,
    description="A key-value map of identifier to whether the identifier was successfully deleted in the vault",
    example=r#"{ "id.last_name": true, "id.ssn9": true, "custom.credit_card": true, "id.dob": false }"#
);

#[route_alias(
    actix::delete(
        "/users/{fp_id}/vault",
        description = "Deletes data in a user vault.",
        tags(Users, Vault, PublicApi)
    ),
    actix::delete(
        "/businesses/{fp_bid}/vault",
        description = "Deletes data in a business vault.",
        tags(Businesses, Vault, PublicApi)
    )
)]
#[api_v2_operation(
    description = "Works for either person or business entities. Deletes data in a vault.",
    tags(Vault, Entities, Private)
)]
#[actix::delete("/entities/{fp_id}/vault")]
pub async fn delete(
    state: web::Data<State>,
    path: FpIdPath,
    request: Json<DeleteRequest>,
    auth: SecretTenantAuthContext,
    insight: InsightHeaders,
) -> JsonApiResponse<DeleteVaultResponse> {
    let fp_id = path.into_inner();
    let DeleteRequest { fields, delete_all } = request.into_inner();
    let delete_all = delete_all.unwrap_or_default();

    let auth = auth.check_guard(TenantGuard::WriteEntities)?;
    let actor = auth.actor();
    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();

    let (requested_fields_to_delete, deleted_dis) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            let scoped_vault = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let uvw: WriteableVw<Any> = VaultWrapper::lock_for_onboarding(conn, &scoped_vault.id)?;
            let requested_fields_to_delete = match (delete_all, fields) {
                (true, None) => uvw.populated_dis(),
                (false, Some(fields)) => fields,
                _ => return ValidationError("Must provide only one of `delete_all` and `fields`").into(),
            };
            let deleted_dis = uvw.soft_delete_vault_data(conn, requested_fields_to_delete.clone())?;

            let insight_event_id = CreateInsightEvent::from(insight).insert_with_conn(conn)?.id;
            let actor: DbActor = actor.into();

            let aeid = AuditEventId::generate();
            NewAccessEventRow {
                id: aeid.clone().into_correlated_access_event_id(),
                scoped_vault_id: scoped_vault.id.clone(),
                tenant_id: scoped_vault.tenant_id.clone(),
                is_live: scoped_vault.is_live,
                reason: None,
                principal: actor.clone(),
                insight_event_id: insight_event_id.clone(),
                kind: AccessEventKind::Delete,
                targets: deleted_dis.clone(),
                purpose: AccessEventPurpose::Api,
            }
            .create(conn)?;

            NewAuditEvent {
                id: aeid,
                tenant_id: scoped_vault.tenant_id,
                principal_actor: actor,
                insight_event_id,
                detail: AuditEventDetail::DeleteUserData {
                    is_live: scoped_vault.is_live,
                    scoped_vault_id: scoped_vault.id,
                    deleted_fields: deleted_dis.clone(),
                },
            }
            .create(conn)?;

            Ok((requested_fields_to_delete, deleted_dis))
        })
        .await?;

    let deleted_dis: HashSet<_> = deleted_dis.into_iter().collect();
    let results = HashMap::from_iter(
        requested_fields_to_delete
            .into_iter()
            .map(|di| (di.clone(), deleted_dis.contains(&di))),
    );
    let out = DeleteVaultResponse { map: results };

    ResponseData::ok(out).json()
}
