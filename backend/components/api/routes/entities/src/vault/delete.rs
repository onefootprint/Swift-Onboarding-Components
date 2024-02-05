use crate::{
    auth::tenant::{CheckTenantGuard, SecretTenantAuthContext, TenantGuard},
    errors::ApiResult,
    types::JsonApiResponse,
    utils::vault_wrapper::VaultWrapper,
    State,
};
use api_core::{
    types::ResponseData,
    utils::{
        fp_id_path::FpIdPath,
        headers::InsightHeaders,
        vault_wrapper::{Any, WriteableVw},
    },
};
use db::models::{
    access_event::NewAccessEventRow, audit_event::NewAuditEvent, insight_event::CreateInsightEvent,
    scoped_vault::ScopedVault,
};
use macros::route_alias;
use newtypes::{
    flat_api_object_map_type, AccessEventKind, AccessEventPurpose, AuditEventDetail, DataIdentifier, DbActor,
};
use paperclip::actix::{self, api_v2_operation, web, web::Json, Apiv2Schema};
use serde::Deserialize;
use std::collections::{HashMap, HashSet};

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
pub struct DeleteRequest {
    /// List of data identifiers to delete. For example, `id.first_name`, `id.ssn4`, `custom.bank_account`
    fields: Vec<DataIdentifier>,
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
    let DeleteRequest { fields } = request.into_inner();

    let auth = auth.check_guard(TenantGuard::WriteEntities)?;
    let actor = auth.actor();
    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();
    let requested_dis = fields.to_vec();

    let deleted_dis = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<HashSet<_>> {
            let scoped_vault = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let uvw: WriteableVw<Any> = VaultWrapper::lock_for_onboarding(conn, &scoped_vault.id)?;
            let dis = uvw.soft_delete_vault_data(conn, fields.to_vec())?;

            let insight_event_id = CreateInsightEvent::from(insight).insert_with_conn(conn)?.id;
            let actor: DbActor = actor.into();

            NewAccessEventRow {
                scoped_vault_id: scoped_vault.id.clone(),
                tenant_id: scoped_vault.tenant_id.clone(),
                is_live: scoped_vault.is_live,
                reason: None,
                principal: actor.clone(),
                insight_event_id: insight_event_id.clone(),
                kind: AccessEventKind::Delete,
                targets: dis.clone(),
                purpose: AccessEventPurpose::Api,
            }
            .create(conn)?;

            NewAuditEvent {
                tenant_id: scoped_vault.tenant_id,
                principal_actor: Some(actor),
                insight_event_id,
                detail: AuditEventDetail::DeleteUserData {
                    is_live: scoped_vault.is_live,
                    scoped_vault_id: scoped_vault.id,
                    deleted_fields: dis.clone(),
                },
            }
            .create(conn)?;

            Ok(HashSet::from_iter(dis.into_iter()))
        })
        .await?;

    let results = HashMap::from_iter(
        requested_dis
            .into_iter()
            .map(|di| (di.clone(), deleted_dis.contains(&di))),
    );
    let out = DeleteVaultResponse { map: results };

    ResponseData::ok(out).json()
}
