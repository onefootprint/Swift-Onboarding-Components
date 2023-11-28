use crate::auth::tenant::TenantGuard;
use crate::auth::tenant::{CheckTenantGuard, SecretTenantAuthContext};
use crate::errors::ApiResult;
use crate::types::JsonApiResponse;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::State;
use api_core::types::ResponseData;
use api_core::utils::fp_id_path::FpIdPath;
use api_core::utils::headers::InsightHeaders;
use api_core::utils::vault_wrapper::{Any, WriteableVw};
use db::models::access_event::NewAccessEvent;
use db::models::insight_event::CreateInsightEvent;
use db::models::scoped_vault::ScopedVault;
use macros::route_alias;
use newtypes::{flat_api_object_map_type, AccessEventKind, AccessEventPurpose, DataIdentifier};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{self, api_v2_operation, web, web::Json};
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
        tags(Businesses, Vault, Private)
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
            let scoped_user = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let uvw: WriteableVw<Any> = VaultWrapper::lock_for_onboarding(conn, &scoped_user.id)?;
            let dis = uvw.soft_delete_vault_data(conn, fields.to_vec())?;

            NewAccessEvent {
                scoped_vault_id: scoped_user.id,
                tenant_id: scoped_user.tenant_id,
                is_live: scoped_user.is_live,
                reason: None,
                principal: actor.into(),
                insight: CreateInsightEvent::from(insight),
                kind: AccessEventKind::Delete,
                targets: dis.clone(),
                purpose: AccessEventPurpose::Api,
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
