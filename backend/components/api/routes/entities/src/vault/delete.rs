use crate::auth::tenant::CheckTenantGuard;
use crate::auth::tenant::TenantApiKey;
use crate::auth::tenant::TenantGuard;
use crate::types::ApiResponse;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::FpResult;
use crate::State;
use api_core::errors::ValidationError;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::headers::InsightHeaders;
use api_core::utils::vault_wrapper::Any;
use api_core::utils::vault_wrapper::WriteableVw;
use db::models::access_event::NewAccessEventRow;
use db::models::audit_event::NewAuditEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use macros::route_alias;
use newtypes::impl_map_apiv2_schema;
use newtypes::impl_response_type;
use newtypes::AccessEventKind;
use newtypes::AccessEventPurpose;
use newtypes::AuditEventDetail;
use newtypes::AuditEventId;
use newtypes::BusinessDataIdentifier;
use newtypes::DataIdentifier;
use newtypes::DbActor;
use newtypes::UserDataIdentifier;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::web::Json;
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{
    self,
};
use serde::Deserialize;
use std::collections::HashMap;
use std::collections::HashSet;

#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
pub struct DeleteRequest {
    /// List of data identifiers to delete. For example, `id.first_name`, `id.ssn4`,
    /// `custom.account_id`
    #[openapi(example = r#"["id.first_name", "id.last_name"]"#)]
    #[openapi(serialize_as = "Option<Vec<UserDataIdentifier>>")]
    fields: Option<Vec<DataIdentifier>>,
    /// When true, deletes all data in the vault.
    #[openapi(example = "null")]
    delete_all: Option<bool>,
}


#[derive(Debug, Clone, Deserialize, Apiv2Schema)]
pub struct BusinessDeleteRequest {
    /// List of data identifiers to delete. For example, `business.name`, `business.website`,
    /// `custom.account_id`
    #[openapi(example = r#"["business.name", "business.website"]"#)]
    #[openapi(serialize_as = "Option<Vec<BusinessDataIdentifier>>")]
    fields: Option<Vec<DataIdentifier>>,
    /// When true, deletes all data in the vault.
    #[openapi(example = "null")]
    delete_all: Option<bool>,
}

#[derive(Debug, Clone, serde::Serialize, macros::JsonResponder)]
pub struct UserDeleteResponse(HashMap<DataIdentifier, bool>);
impl_map_apiv2_schema!(
    UserDeleteResponse<UserDataIdentifier, bool>,
    "A key-value map of identifier to whether the identifier was successfully deleted in the vault",
    {"id.first_name": true, "id.last_name": false}
);
impl_response_type!(UserDeleteResponse);

#[derive(Debug, Clone, serde::Serialize, macros::JsonResponder)]
pub struct BusinessDeleteResponse(HashMap<DataIdentifier, bool>);
impl_map_apiv2_schema!(
    BusinessDeleteResponse<BusinessDataIdentifier, bool>,
    "A key-value map of identifier to whether the identifier was successfully deleted in the business vault",
    {"business.name": true, "custom.account_id": false}
);
impl_response_type!(BusinessDeleteResponse);

#[route_alias(actix::delete(
    "/users/{fp_id}/vault",
    description = "Deletes the provided fields from the provided user vault.",
    tags(Users, Vault, PublicApi)
))]
#[api_v2_operation(
    description = "Works for either person or business entities. Deletes the provided fields from the provide vault.",
    tags(Vault, Entities, Private)
)]
#[actix::delete("/entities/{fp_id}/vault")]
pub async fn delete(
    state: web::Data<State>,
    path: FpIdPath,
    request: Json<DeleteRequest>,
    auth: TenantApiKey,
    insight: InsightHeaders,
) -> ApiResponse<UserDeleteResponse> {
    let DeleteRequest { delete_all, fields } = request.into_inner();
    let result = delete_inner(state, path, delete_all, fields, auth, insight).await?;
    Ok(UserDeleteResponse(result))
}

#[api_v2_operation(
    description = "Deletes the provided fields from the provided business vault.",
    tags(Businesses, Vault, PublicApi)
)]
#[actix::delete("/businesses/{fp_bid}/vault")]
pub async fn delete_business(
    state: web::Data<State>,
    path: FpIdPath,
    request: Json<BusinessDeleteRequest>,
    auth: TenantApiKey,
    insight: InsightHeaders,
) -> ApiResponse<BusinessDeleteResponse> {
    let BusinessDeleteRequest { delete_all, fields } = request.into_inner();
    let result = delete_inner(state, path, delete_all, fields, auth, insight).await?;
    Ok(BusinessDeleteResponse(result))
}

async fn delete_inner(
    state: web::Data<State>,
    path: FpIdPath,
    delete_all: Option<bool>,
    fields: Option<Vec<DataIdentifier>>,
    auth: TenantApiKey,
    insight: InsightHeaders,
) -> ApiResponse<HashMap<DataIdentifier, bool>> {
    let fp_id = path.into_inner();
    let delete_all = delete_all.unwrap_or_default();

    let auth = auth.check_guard(TenantGuard::WriteEntities)?;
    let actor = auth.actor();
    let is_live = auth.is_live()?;
    let tenant_id = auth.tenant().id.clone();

    let (requested_fields_to_delete, deleted_dis) = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
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
    Ok(results)
}
